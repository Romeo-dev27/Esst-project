const Storage = (() => {
  const DATA_KEY = 'justeprix-dz-data-v1';
  const THEME_KEY = 'justeprix-dz-theme';
  const SUGGESTIONS_KEY = 'justeprix-dz-suggestions-v1';

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function getData() {
    try {
      const saved = localStorage.getItem(DATA_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn('Lecture localStorage impossible :', error);
    }
    const initial = clone(DEMO_DATA);
    saveData(initial);
    return initial;
  }

  function saveData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  function resetData() {
    const initial = clone(DEMO_DATA);
    saveData(initial);
    return initial;
  }

  function getSuggestions() {
    try { return JSON.parse(localStorage.getItem(SUGGESTIONS_KEY)) || []; } catch (error) { return []; }
  }

  function saveSuggestion(suggestion) {
    const entries = getSuggestions();
    entries.unshift({ id: `suggestion-${Date.now()}`, createdAt: new Date().toISOString(), ...suggestion });
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(entries));
  }

  return { getData, saveData, resetData, getSuggestions, saveSuggestion, getTheme: () => localStorage.getItem(THEME_KEY), setTheme: (theme) => localStorage.setItem(THEME_KEY, theme) };
})();

const PriceService = (() => {
  const normalize = (value = '') => value.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokenise = (value) => normalize(value).replace(/iphone\s*(\d+)/g, 'iphone $1').split(' ').filter(Boolean);
  const toDate = (value) => new Date(`${value}T12:00:00`);
  const dateDistance = (value) => Math.floor((new Date().setHours(0, 0, 0, 0) - toDate(value).setHours(0, 0, 0, 0)) / 86400000);

  function getServices() { return Storage.getData().services; }
  function getRepairers() { return Storage.getData().repairers; }
  function getObservations() { return Storage.getData().observations; }
  function getService(id) { return getServices().find((service) => service.id === id); }
  function getRepairer(id) { return getRepairers().find((repairer) => repairer.id === id); }
  function getObservationsForService(serviceId) { return getObservations().filter((observation) => observation.serviceId === serviceId); }

  function searchServices(query) {
    const tokens = tokenise(query);
    if (!tokens.length) return getServices();
    return getServices().map((service) => {
      const haystack = normalize(`${service.name} ${service.category} ${service.device} ${service.description}`);
      const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      return { service, score };
    }).filter((entry) => entry.score === tokens.length).sort((a, b) => b.score - a.score || a.service.name.localeCompare(b.service.name, 'fr')).map((entry) => entry.service);
  }

  function calculatePriceStats(observations) {
    const prices = observations.map((observation) => Number(observation.price)).filter(Number.isFinite);
    if (!prices.length) return { count: 0, min: 0, max: 0, avg: 0, latest: null };
    const latest = observations.reduce((current, observation) => !current || toDate(observation.dateVerified) > toDate(current.dateVerified) ? observation : current, null);
    return { count: prices.length, min: Math.min(...prices), max: Math.max(...prices), avg: Math.round(prices.reduce((total, price) => total + price, 0) / prices.length), latest: latest.dateVerified };
  }

  function freshness(dateVerified) {
    const days = dateDistance(dateVerified);
    if (days <= 0) return { tone: 'success', label: "Vérifié aujourd'hui", shortLabel: "Aujourd'hui", description: 'Prix vérifié très récemment.' };
    if (days <= 7) return { tone: 'warning', label: 'Vérifié cette semaine', shortLabel: 'Cette semaine', description: 'Prix relativement récent.' };
    return { tone: 'muted', label: 'Ancienne donnée', shortLabel: 'Ancienne donnée', description: 'Prix pouvant ne plus être à jour.' };
  }

  function filterObservations(observations, filters = {}) {
    const rangeMap = { under10: [0, 9999], '10to20': [10000, 20000], '20to30': [20001, 30000], over30: [30001, Infinity] };
    return observations.filter((observation) => {
      const repairer = getRepairer(observation.repairerId);
      if (filters.wilaya && filters.wilaya !== 'all' && repairer?.wilaya !== filters.wilaya) return false;
      if (filters.price && filters.price !== 'all') {
        const [min, max] = rangeMap[filters.price];
        if (observation.price < min || observation.price > max) return false;
      }
      const age = dateDistance(observation.dateVerified);
      if (filters.freshness === 'today' && age > 0) return false;
      if (filters.freshness === 'week' && age > 7) return false;
      if (filters.freshness === 'month' && age > 30) return false;
      return true;
    });
  }

  function sortObservations(observations, sort = 'recent') {
    return [...observations].sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      return toDate(b.dateVerified) - toDate(a.dateVerified);
    });
  }

  function getZoneStats(observations) {
    const groups = observations.reduce((all, observation) => {
      const repairer = getRepairer(observation.repairerId);
      const zone = repairer ? repairer.commune : observation.commune;
      (all[zone] ||= []).push(observation);
      return all;
    }, {});
    return Object.entries(groups).map(([zone, prices]) => ({ zone, ...calculatePriceStats(prices) })).sort((a, b) => a.zone.localeCompare(b.zone, 'fr'));
  }

  function getHistory(observations) {
    const monthNames = ['Jan.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.'];
    const reference = new Date();
    return [3, 2, 1, 0].map((offset) => {
      const date = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const priceSamples = observations.filter((item) => item.dateVerified.startsWith(key));
      const fallBack = calculatePriceStats(observations).avg;
      return { label: monthNames[date.getMonth()], value: priceSamples.length ? calculatePriceStats(priceSamples).avg : fallBack };
    });
  }

  return { normalize, getServices, getRepairers, getObservations, getService, getRepairer, getObservationsForService, searchServices, calculatePriceStats, freshness, filterObservations, sortObservations, getZoneStats, getHistory };
})();

const formatDA = (value) => `${new Intl.NumberFormat('fr-DZ').format(Math.round(value))} DA`;
const formatDate = (value) => new Intl.DateTimeFormat('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);

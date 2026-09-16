const UI = (() => {
  const categoryMeta = {
    'Téléphones': { icon: '⌁', description: 'Écrans, batteries, connecteurs et logiciels.' },
    'Informatique': { icon: '▣', description: 'PC portables, composants et dépannage.' },
    'Gaming': { icon: '◉', description: 'Consoles, manettes et connectiques.' },
    'Autres': { icon: '▤', description: 'Imprimantes et services numériques.' }
  };

  function toast(message) {
    const element = document.getElementById('toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('is-visible');
    window.setTimeout(() => element.classList.remove('is-visible'), 3200);
  }

  function initTheme() {
    const saved = Storage.getTheme();
    const theme = saved || 'light';
    document.documentElement.dataset.theme = theme;
    updateThemeButtons(theme);
  }

  function initDemoBanners() {
    const isDemo = Storage.getData().isDemo !== false;
    document.querySelectorAll('.demo-banner').forEach((banner) => { banner.hidden = !isDemo; });
  }

  function updateThemeButtons(theme) {
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.querySelector('.theme-label').textContent = theme === 'dark' ? 'Clair' : 'Sombre';
      button.querySelector('[aria-hidden="true"]').textContent = theme === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
    });
  }

  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    Storage.setTheme(theme);
    updateThemeButtons(theme);
  }

  function initNavigation() {
    document.querySelector('.nav-toggle')?.addEventListener('click', (event) => {
      const toggle = event.currentTarget;
      const menu = document.getElementById(toggle.getAttribute('aria-controls'));
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu?.classList.toggle('is-open', !open);
    });
    document.querySelectorAll('.theme-toggle').forEach((button) => button.addEventListener('click', toggleTheme));
  }

  function renderCategoryGrid() {
    const root = document.getElementById('category-grid');
    if (!root) return;
    const services = PriceService.getServices();
    root.innerHTML = Object.entries(categoryMeta).map(([name, meta]) => {
      const subset = services.filter((service) => service.category === name);
      return `<article class="category-card"><div class="category-icon" aria-hidden="true">${meta.icon}</div><div><h3>${name}</h3><p>${meta.description}</p><ul>${subset.slice(0, 5).map((service) => `<li>${escapeHtml(shortServiceName(service.name))}</li>`).join('')}</ul></div><a class="card-link" href="results.html?category=${encodeURIComponent(name)}">Voir les prix <span>→</span></a></article>`;
    }).join('');
  }

  function shortServiceName(name) {
    return name.replace('Changement ', '').replace('Réparation ', '').replace(' PC', '');
  }

  function renderResultsPage(query = '', category = '') {
    const root = document.getElementById('results-root');
    if (!root) return;
    const services = category ? PriceService.getServices().filter((service) => service.category === category) : PriceService.searchServices(query);
    const input = document.querySelector('#results-search');
    if (input) input.value = query;
    if (!services.length) {
      root.innerHTML = renderEmptyState(query);
      return;
    }
    if (services.length === 1) {
      renderServiceDetail(services[0]);
      return;
    }
    root.innerHTML = `<div class="result-intro"><p class="eyebrow">${category ? escapeHtml(category) : 'Recherche'}</p><h1>${category ? `Réparations ${escapeHtml(category.toLowerCase())}` : `Résultats pour « ${escapeHtml(query)} »`}</h1><p>${services.length} prestation${services.length > 1 ? 's' : ''} disponible${services.length > 1 ? 's' : ''}. Choisissez celle qui correspond à votre besoin.</p></div><div class="service-result-grid">${services.map(renderServiceResultCard).join('')}</div>`;
  }

  function renderServiceResultCard(service) {
    const stats = PriceService.calculatePriceStats(PriceService.getObservationsForService(service.id));
    return `<article class="service-result-card"><span class="category-tag">${escapeHtml(service.category)}</span><h2>${escapeHtml(service.name)}</h2><p>${escapeHtml(service.description)}</p><div class="result-card-price"><b>${formatDA(stats.min)} – ${formatDA(stats.max)}</b><span>${stats.count} prix observés</span></div><a class="btn btn-secondary" href="results.html?service=${encodeURIComponent(service.id)}">Voir les détails</a></article>`;
  }

  function renderServiceDetail(service) {
    const root = document.getElementById('results-root');
    const allObservations = PriceService.getObservationsForService(service.id);
    const stats = PriceService.calculatePriceStats(allObservations);
    document.title = `${service.name} — JustePrix DZ`;
    root.innerHTML = `<div class="detail-heading"><div><a class="back-link" href="results.html?category=${encodeURIComponent(service.category)}">← ${escapeHtml(service.category)}</a><p class="eyebrow">${escapeHtml(service.category)} · ${escapeHtml(service.device)}</p><h1>${escapeHtml(service.name)}</h1><p>${escapeHtml(service.description)}</p></div><div class="duration"><span>Durée indicative</span><b>${escapeHtml(service.typicalDuration)}</b></div></div>
      <section class="estimate-card" aria-label="Estimation des prix"><div class="estimate-main"><p>Estimation actuelle à Alger</p><strong>${formatDA(stats.min)} – ${formatDA(stats.max)}</strong><span>Fourchette calculée à partir des prix observés</span></div><div class="estimate-stat"><span>Prix moyen observé</span><b>${formatDA(stats.avg)}</b></div><div class="estimate-stat"><span>Prix vérifiés</span><b>🟢 ${stats.count}</b></div><div class="estimate-stat"><span>Dernière vérification</span><b>${stats.latest ? PriceService.freshness(stats.latest).shortLabel.toLowerCase() : '—'}</b></div></section>
      <div class="detail-layout"><div class="detail-content"><section class="price-list-section"><div class="section-title-row"><div><h2>Prix observés</h2><p id="observation-count">${stats.count} prix disponibles</p></div><div class="freshness-key"><span class="fresh-dot success"></span>Aujourd'hui <span class="fresh-dot warning"></span>Semaine <span class="fresh-dot muted"></span>Ancien</div></div>${renderFilters()}<div id="observations-list">${renderObservationList(allObservations, 'recent')}</div></section>
      <section class="data-disclaimer"><strong>Prix observés, pas un devis.</strong><p>Les prix affichés peuvent varier selon le réparateur, la qualité des pièces et l'état de l'appareil. JustePrix DZ ne garantit pas qu'un réparateur appliquera exactement le prix indiqué.</p></section></div>
      <aside class="detail-aside"><section class="info-card"><h2>Pourquoi les prix varient ?</h2><ul>${service.factors.map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul></section><section class="info-card"><h2>Prix par zone</h2><div class="zone-list">${renderZoneStats(allObservations)}</div></section><section class="info-card"><h2>Évolution du prix</h2><p class="muted-text">Moyenne des relevés disponibles</p>${renderHistory(allObservations)}</section></aside></div>`;
  }

  function renderFilters() {
    return `<form class="filters" id="price-filters"><div><label for="filter-wilaya">Wilaya</label><select id="filter-wilaya" name="wilaya"><option value="all">Toutes</option><option>Alger</option><option>Blida</option><option>Oran</option><option>Constantine</option></select></div><div><label for="filter-price">Prix</label><select id="filter-price" name="price"><option value="all">Tous les prix</option><option value="under10">Moins de 10 000 DA</option><option value="10to20">10 000–20 000 DA</option><option value="20to30">20 000–30 000 DA</option><option value="over30">Plus de 30 000 DA</option></select></div><div><label for="filter-freshness">Fraîcheur</label><select id="filter-freshness" name="freshness"><option value="all">Toutes les dates</option><option value="today">Aujourd'hui</option><option value="week">Cette semaine</option><option value="month">Ce mois-ci</option></select></div><div><label for="filter-sort">Trier par</label><select id="filter-sort" name="sort"><option value="recent">Plus récent</option><option value="low">Moins cher</option><option value="high">Plus cher</option></select></div></form>`;
  }

  function renderObservationList(observations, sort) {
    const sorted = PriceService.sortObservations(observations, sort);
    if (!sorted.length) return `<div class="no-observations"><p>Aucun prix ne correspond à ces filtres.</p><button class="text-button" type="button" data-reset-filters>Réinitialiser les filtres</button></div>`;
    return `<div class="observation-table" role="table"><div class="observation-head" role="row"><span>Réparateur</span><span>Prix</span><span>Localisation</span><span>Vérifié</span><span></span></div>${sorted.map(renderObservationRow).join('')}</div>`;
  }

  function renderObservationRow(observation) {
    const repairer = PriceService.getRepairer(observation.repairerId);
    const fresh = PriceService.freshness(observation.dateVerified);
    return `<article class="observation-row" role="row"><div class="repairer-cell"><b>${escapeHtml(repairer?.name || 'Réparateur inconnu')}</b><small>${escapeHtml(observation.notes || '')}</small></div><div class="price-cell" data-label="Prix"><b>${formatDA(observation.price)}</b></div><div class="location-cell" data-label="Localisation">⌖ ${escapeHtml(repairer?.commune || observation.commune)}, ${escapeHtml(repairer?.wilaya || observation.wilaya)}</div><div data-label="Vérifié"><span class="freshness-badge ${fresh.tone}"><i></i>${fresh.label}</span></div><button class="view-repairer" type="button" data-repairer-id="${escapeHtml(observation.repairerId)}" aria-label="Voir ${escapeHtml(repairer?.name || 'le réparateur')}">Voir</button></article>`;
  }

  function renderZoneStats(observations) {
    return PriceService.getZoneStats(observations).map((zone) => `<div class="zone-row"><span>${escapeHtml(zone.zone)}</span><b>${formatDA(zone.min)}–${formatDA(zone.max)}</b></div>`).join('');
  }

  function renderHistory(observations) {
    const history = PriceService.getHistory(observations);
    const max = Math.max(...history.map((item) => item.value), 1);
    return `<div class="history-chart" aria-label="Évolution du prix">${history.map((item) => `<div class="history-item"><div class="history-value">${formatDA(item.value)}</div><div class="history-track"><i style="height:${Math.max(16, Math.round(item.value / max * 100))}%"></i></div><span>${item.label}</span></div>`).join('')}</div>`;
  }

  function renderEmptyState(query) {
    return `<div class="empty-state"><div class="empty-icon">⌕</div><p class="eyebrow">Recherche</p><h1>Nous n'avons pas encore cette réparation.</h1><p>Cette information n'est pas encore disponible dans notre base${query ? ` pour « ${escapeHtml(query)} »` : ''}.</p><button class="btn btn-primary" type="button" data-open-suggestion>Suggérer une réparation</button></div>`;
  }

  function openSuggestionModal() {
    openModal('Suggérer une réparation', `<p class="modal-intro">Votre demande est enregistrée localement pour cette V1.</p><form id="suggestion-form" class="form-grid"><div><label for="suggestion-repair">Réparation recherchée</label><input id="suggestion-repair" name="repair" required placeholder="Ex : changement écran"></div><div><label for="suggestion-device">Appareil</label><input id="suggestion-device" name="device" required placeholder="Ex : Xiaomi Redmi Note 13"></div><div><label for="suggestion-wilaya">Wilaya</label><input id="suggestion-wilaya" name="wilaya" required placeholder="Ex : Alger"></div><div><label for="suggestion-commune">Commune</label><input id="suggestion-commune" name="commune" required placeholder="Ex : El Biar"></div><button class="btn btn-primary" type="submit">Envoyer la demande</button></form>`);
    document.getElementById('suggestion-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      Storage.saveSuggestion(Object.fromEntries(form.entries()));
      closeModal();
      toast('Merci, votre suggestion est enregistrée localement.');
    });
  }

  function openRepairerModal(repairerId) {
    const repairer = PriceService.getRepairer(repairerId);
    if (!repairer) return;
    openModal(repairer.name, `<div class="repairer-modal"><p><strong>⌖ ${escapeHtml(repairer.commune)}, ${escapeHtml(repairer.wilaya)}</strong></p><p>${escapeHtml(repairer.address)}</p><p><a href="tel:${escapeHtml(repairer.phone.replace(/\s/g, ''))}">${escapeHtml(repairer.phone)}</a></p><p class="muted-text">Informations fictives de démonstration — aucun contact réel.</p></div>`);
  }

  function openModal(title, content) {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-heading"><h2 id="modal-title">${escapeHtml(title)}</h2><button class="modal-close" type="button" data-close-modal aria-label="Fermer">×</button></div>${content}</section></div>`;
    root.querySelector('.modal-close')?.focus();
  }

  function closeModal() { const root = document.getElementById('modal-root'); if (root) root.innerHTML = ''; }

  return { initTheme, initDemoBanners, initNavigation, renderCategoryGrid, renderResultsPage, renderServiceDetail, renderObservationList, toast, openSuggestionModal, openRepairerModal, closeModal };
})();

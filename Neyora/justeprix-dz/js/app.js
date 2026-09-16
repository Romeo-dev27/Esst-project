(() => {
  let currentService = null;

  function getResultParams() {
    const params = new URLSearchParams(window.location.search);
    return { serviceId: params.get('service') || '', query: params.get('q') || '', category: params.get('category') || '' };
  }

  function showResults() {
    const { serviceId, query, category } = getResultParams();
    if (serviceId) {
      currentService = PriceService.getService(serviceId);
      if (currentService) {
        UI.renderServiceDetail(currentService);
        bindFilters();
        return;
      }
    }
    currentService = null;
    UI.renderResultsPage(query, category);
  }

  function bindFilters() {
    const filters = document.getElementById('price-filters');
    if (!filters || !currentService) return;
    filters.addEventListener('change', () => updateFilteredObservations(filters));
  }

  function updateFilteredObservations(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const observations = PriceService.filterObservations(PriceService.getObservationsForService(currentService.id), values);
    const list = document.getElementById('observations-list');
    const count = document.getElementById('observation-count');
    if (list) list.innerHTML = UI.renderObservationList(observations, values.sort);
    if (count) count.textContent = `${observations.length} prix disponible${observations.length > 1 ? 's' : ''}`;
  }

  function submitSearch(form) {
    const query = form.querySelector('input[name="q"]').value.trim();
    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
  }

  function initSearch() {
    document.querySelectorAll('[data-search-form]').forEach((form) => form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitSearch(event.currentTarget);
    }));
    document.querySelectorAll('[data-example]').forEach((button) => button.addEventListener('click', () => {
      window.location.href = `results.html?q=${encodeURIComponent(button.dataset.example)}`;
    }));
  }

  function initDelegatedActions() {
    document.addEventListener('click', (event) => {
      const suggestion = event.target.closest('[data-open-suggestion]');
      const repairer = event.target.closest('[data-repairer-id]');
      const close = event.target.closest('[data-close-modal]');
      const reset = event.target.closest('[data-reset-filters]');
      if (suggestion) UI.openSuggestionModal();
      if (repairer) UI.openRepairerModal(repairer.dataset.repairerId);
      if (close && (event.target === close || close.classList.contains('modal-close'))) UI.closeModal();
      if (reset) {
        const filters = document.getElementById('price-filters');
        if (filters) { filters.reset(); updateFilteredObservations(filters); }
      }
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') UI.closeModal(); });
  }

  function init() {
    UI.initTheme();
    UI.initDemoBanners();
    UI.initNavigation();
    initSearch();
    initDelegatedActions();
    if (document.body.dataset.page === 'home') UI.renderCategoryGrid();
    if (document.body.dataset.page === 'results') showResults();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

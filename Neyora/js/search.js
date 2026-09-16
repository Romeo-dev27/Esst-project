(function () {
  "use strict";
  const U = () => TDZUtils;
  const state = { query: "", wilaya: "", category: "", organization: "", publicationStart: "", publicationEnd: "", deadline: "", status: "", sort: "deadline-asc", page: 1, perPage: 7 };
  let filteredItems = [];
  function optionList(values, selected, emptyLabel) { return `<option value="">${emptyLabel}</option>${values.map((value) => `<option value="${U().escapeHTML(value)}" ${value === selected ? "selected" : ""}>${U().escapeHTML(value)}</option>`).join("")}`; }
  function filterMarkup() {
    const current = TDZTenders.published();
    const organizations = [...new Set(current.map((item) => item.organization))].sort();
    const availableCategories = [...new Set([...TDZData.categories, ...current.map((item) => item.category)])].sort();
    return `<div class="filter-heading"><h2>Filtres</h2><button id="reset-filters" class="text-button" type="button">Réinitialiser</button></div>
      <div class="filter-group"><label for="filter-wilaya">Wilaya</label><select id="filter-wilaya">${optionList(TDZData.wilayas, state.wilaya, "Toutes les wilayas")}</select></div>
      <div class="filter-group"><label for="filter-category">Catégorie</label><select id="filter-category">${optionList(availableCategories, state.category, "Toutes les catégories")}</select></div>
      <div class="filter-group"><label for="filter-organization">Organisme</label><select id="filter-organization">${optionList(organizations, state.organization, "Tous les organismes")}</select></div>
      <div class="filter-group"><label>Date de publication</label><div class="filter-date-row"><input id="filter-publication-start" type="date" aria-label="Publication à partir du" value="${state.publicationStart}"><input id="filter-publication-end" type="date" aria-label="Publication jusqu'au" value="${state.publicationEnd}"></div></div>
      <div class="filter-group"><label for="filter-deadline">Deadline</label><select id="filter-deadline"><option value="" ${!state.deadline ? "selected" : ""}>Toutes les échéances</option><option value="today" ${state.deadline === "today" ? "selected" : ""}>Aujourd'hui</option><option value="3days" ${state.deadline === "3days" ? "selected" : ""}>Dans 3 jours</option><option value="week" ${state.deadline === "week" ? "selected" : ""}>Cette semaine</option><option value="later" ${state.deadline === "later" ? "selected" : ""}>Plus de 7 jours</option><option value="expired" ${state.deadline === "expired" ? "selected" : ""}>Expirées</option></select></div>
      <div class="filter-group"><label for="filter-status">Statut</label><select id="filter-status"><option value="" ${!state.status ? "selected" : ""}>Tous les statuts</option><option value="active" ${state.status === "active" ? "selected" : ""}>Actifs</option><option value="expired" ${state.status === "expired" ? "selected" : ""}>Expirés</option></select></div>`;
  }
  function renderFilter() {
    const panel = document.getElementById("filter-panel"); if (!panel) return;
    panel.innerHTML = filterMarkup();
    const map = { "filter-wilaya": "wilaya", "filter-category": "category", "filter-organization": "organization", "filter-publication-start": "publicationStart", "filter-publication-end": "publicationEnd", "filter-deadline": "deadline", "filter-status": "status" };
    Object.entries(map).forEach(([id, key]) => panel.querySelector(`#${id}`).addEventListener("change", (event) => { state[key] = event.target.value; state.page = 1; render(); }));
    panel.querySelector("#reset-filters").addEventListener("click", reset);
  }
  function matchesDeadline(tender) {
    if (!state.deadline) return true;
    const diff = U().dayDiff(tender.deadline);
    if (state.deadline === "today") return diff === 0;
    if (state.deadline === "3days") return diff >= 0 && diff <= 3;
    if (state.deadline === "week") return diff >= 0 && diff <= 7;
    if (state.deadline === "later") return diff > 7;
    return diff < 0;
  }
  function filtered() {
    const query = U().normalize(state.query);
    return TDZTenders.published().filter((tender) => {
      const haystack = U().normalize([tender.title, tender.organization, tender.description, tender.requirements, tender.category, tender.wilaya].join(" "));
      if (query && !haystack.includes(query)) return false;
      if (state.wilaya && tender.wilaya !== state.wilaya) return false;
      if (state.category && tender.category !== state.category) return false;
      if (state.organization && tender.organization !== state.organization) return false;
      if (state.publicationStart && tender.publicationDate < state.publicationStart) return false;
      if (state.publicationEnd && tender.publicationDate > state.publicationEnd) return false;
      if (!matchesDeadline(tender)) return false;
      const expired = U().dayDiff(tender.deadline) < 0;
      if (state.status === "active" && expired) return false;
      if (state.status === "expired" && !expired) return false;
      return true;
    }).sort((a, b) => {
      if (state.sort === "publication-desc") return b.publicationDate.localeCompare(a.publicationDate);
      if (state.sort === "publication-asc") return a.publicationDate.localeCompare(b.publicationDate);
      if (state.sort === "title") return a.title.localeCompare(b.title, "fr");
      return a.deadline.localeCompare(b.deadline);
    });
  }
  function renderPagination(total) {
    const root = document.getElementById("pagination"); if (!root) return;
    const totalPages = Math.ceil(total / state.perPage); if (totalPages <= 1) { root.innerHTML = ""; return; }
    const buttons = [`<button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Page précédente">‹</button>`];
    for (let i = 1; i <= totalPages; i += 1) buttons.push(`<button type="button" data-page="${i}" class="${i === state.page ? "active" : ""}" aria-label="Page ${i}" ${i === state.page ? 'aria-current="page"' : ""}>${i}</button>`);
    buttons.push(`<button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Page suivante">›</button>`);
    root.innerHTML = buttons.join(""); root.querySelectorAll("button[data-page]").forEach((button) => button.addEventListener("click", () => { state.page = Number(button.dataset.page); render(); document.getElementById("tenders-app").scrollIntoView({ behavior: "smooth", block: "start" }); }));
  }
  function render() {
    filteredItems = filtered(); const start = (state.page - 1) * state.perPage; const displayed = filteredItems.slice(start, start + state.perPage);
    const count = document.getElementById("result-count"); if (count) count.textContent = `${filteredItems.length} appel${filteredItems.length !== 1 ? "s" : ""} d'offre trouvé${filteredItems.length !== 1 ? "s" : ""}`;
    TDZTenders.renderCards(displayed, document.getElementById("tender-results")); renderPagination(filteredItems.length);
  }
  function reset() { Object.assign(state, { query: "", wilaya: "", category: "", organization: "", publicationStart: "", publicationEnd: "", deadline: "", status: "", sort: "deadline-asc", page: 1 }); const input = document.getElementById("search-input"); const select = document.getElementById("sort-select"); if (input) input.value = ""; if (select) select.value = state.sort; renderFilter(); render(); }
  function init() {
    if (!document.getElementById("tenders-app")) return;
    renderFilter(); render();
    const search = document.getElementById("search-input"); let timer;
    search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { state.query = search.value; state.page = 1; render(); }, 130); });
    document.getElementById("sort-select").addEventListener("change", (event) => { state.sort = event.target.value; state.page = 1; render(); });
    document.getElementById("mobile-filter-button").addEventListener("click", () => { const panel = document.getElementById("filter-panel"); panel.classList.toggle("show-mobile"); });
  }
  window.TDZSearch = { init, render, reset, getFiltered: () => filteredItems };
})();

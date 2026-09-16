(function () {
  "use strict";
  const U = () => window.TDZUtils;
  function all() { return TDZData.getTenders(); }
  function published() { return all().filter((tender) => tender.status === "published"); }
  function find(id) { return all().find((tender) => tender.id === id); }
  function save(items) { TDZData.saveTenders(items); }
  function getStatusBadge(tender) {
    if (tender.status !== "published") return `<span class="badge badge-draft">Brouillon</span>`;
    const info = U().deadlineInfo(tender.deadline);
    return `<span class="badge ${info.className}">${info.label}</span>`;
  }
  function publicUrl(id) { return `${U().pagePath("tender")}?id=${encodeURIComponent(id)}`; }
  function card(tender, options = {}) {
    const favorite = window.TDZFavorites && TDZFavorites.isFavorite(tender.id);
    const match = U().matchScore(tender);
    return `<article class="tender-card" data-tender-id="${U().escapeHTML(tender.id)}">
      <div><span class="badge badge-neutral">${U().escapeHTML(tender.category)}</span>
        <h2><a href="${publicUrl(tender.id)}">${U().escapeHTML(tender.title)}</a></h2>
        <p class="organization">${U().escapeHTML(tender.organization)}</p>
        <div class="tender-meta"><span>⌖ ${U().escapeHTML(tender.wilaya)}</span><span>▤ Réf. ${U().escapeHTML(tender.reference)}</span><span>◷ Publié le ${U().formatDate(tender.publicationDate)}</span></div>
        <div class="card-bottom">${getStatusBadge(tender)}${match ? `<span class="badge badge-match">${match}% compatible</span>` : ""}</div>
      </div>
      <div class="tender-actions"><button class="favorite-button ${favorite ? "active" : ""}" type="button" data-favorite="${U().escapeHTML(tender.id)}" aria-label="${favorite ? "Retirer des" : "Ajouter aux"} favoris" aria-pressed="${favorite}">${favorite ? "★" : "☆"}</button><a class="btn btn-outline btn-small" href="${publicUrl(tender.id)}">Voir</a></div>
    </article>`;
  }
  function renderCards(items, container, options = {}) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><h2>${options.emptyTitle || "Aucun appel d'offre trouvé"}</h2><p>${options.emptyText || "Modifiez votre recherche ou vos filtres pour élargir les résultats."}</p>${options.emptyAction || ""}</div>`;
      return;
    }
    container.innerHTML = items.map((item) => card(item, options)).join("");
  }
  function renderDetail() {
    const root = document.getElementById("tender-detail"); if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const tender = find(id);
    if (!tender || (tender.status !== "published" && (TDZAuth.getUser() || {}).role !== "ADMIN")) {
      root.innerHTML = `<div class="empty-state"><div class="empty-icon">!</div><h2>Appel d'offre introuvable</h2><p>Cette annonce n'existe pas ou n'est pas publiée.</p><a class="btn btn-primary" href="${U().pagePath("tenders")}">Voir les appels d'offres</a></div>`; return;
    }
    const isFavorite = TDZFavorites.isFavorite(tender.id); const deadline = U().deadlineInfo(tender.deadline);
    const similar = published().filter((item) => item.id !== tender.id && (item.category === tender.category || item.wilaya === tender.wilaya)).slice(0, 3);
    document.title = `${tender.title} | TenderDZ`;
    root.innerHTML = `<div class="breadcrumbs"><a href="${U().homePath()}">Accueil</a><span>/</span><a href="${U().pagePath("tenders")}">Appels d'offres</a><span>/</span><span>${U().escapeHTML(tender.reference)}</span></div>
      <div class="tender-detail-grid"><article class="detail-main card"><div class="detail-header-row"><div><span class="badge badge-neutral">${U().escapeHTML(tender.category)}</span><h1>${U().escapeHTML(tender.title)}</h1><p class="detail-organization">${U().escapeHTML(tender.organization)} · ${U().escapeHTML(tender.location)}, ${U().escapeHTML(tender.wilaya)}</p></div><button class="favorite-button ${isFavorite ? "active" : ""}" data-favorite="${U().escapeHTML(tender.id)}" aria-label="Ajouter aux favoris" aria-pressed="${isFavorite}">${isFavorite ? "★" : "☆"}</button></div>
      <div class="detail-summary"><div><span>Référence</span><strong>${U().escapeHTML(tender.reference)}</strong></div><div><span>Publication</span><strong>${U().formatDate(tender.publicationDate)}</strong></div><div><span>Date limite</span><strong>${U().formatDate(tender.deadline)}</strong></div></div>
      <section class="detail-section"><h2>Description</h2><p>${U().escapeHTML(tender.description)}</p></section><section class="detail-section"><h2>Matériel / services demandés</h2><p>${U().escapeHTML(tender.requirements)}</p></section><section class="detail-section"><h2>Conditions et informations importantes</h2><p>${U().escapeHTML(tender.conditions || "Les conditions précises sont décrites dans le cahier des charges.")}</p><ul><li>Les offres doivent respecter les modalités de dépôt du cahier des charges.</li><li>La référence de l'appel doit être indiquée sur tous les documents.</li><li>Vérifiez la date et l'heure de clôture avant de déposer votre dossier.</li></ul></section></article>
      <aside class="detail-side"><section class="deadline-card"><p>Date limite de dépôt</p><strong>${U().formatDate(tender.deadline)}</strong><span class="badge ${deadline.className}">${deadline.label}</span></section><section class="metadata-card card"><h2>Source de l'annonce</h2><dl class="metadata-list"><div><span>Source</span><dd>${U().escapeHTML(tender.source)}</dd></div><div><span>Journal</span><dd>${U().escapeHTML(tender.newspaper)}</dd></div><div><span>Édition</span><dd>${U().escapeHTML(tender.newspaperEdition)}</dd></div><div><span>Date du journal</span><dd>${U().formatDate(tender.newspaperDate)}</dd></div><div><span>Page source</span><dd>Page ${U().escapeHTML(tender.newspaperPage)}</dd></div></dl></section><button id="share-tender" class="btn btn-outline" type="button">↗ Partager l'appel</button></aside></div>
      <section class="similar-section"><h2>Appels d'offres similaires</h2><div id="similar-tenders" class="tender-list"></div></section>`;
    renderCards(similar, document.getElementById("similar-tenders"), { emptyTitle: "Aucun appel similaire", emptyText: "D'autres opportunités seront bientôt proposées." });
    document.getElementById("share-tender").addEventListener("click", async () => { const url = location.href; try { if (navigator.clipboard) await navigator.clipboard.writeText(url); U().showToast("Lien copié dans le presse-papiers."); } catch (error) { U().showToast("Copiez l'URL depuis la barre d'adresse.", "error"); } });
  }
  function initFavoriteButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-favorite]"); if (!button) return;
      const active = TDZFavorites.toggle(button.dataset.favorite);
      if (!TDZAuth.getUser()) return;
      button.classList.toggle("active", active); button.textContent = active ? "★" : "☆"; button.setAttribute("aria-pressed", String(active)); button.setAttribute("aria-label", active ? "Retirer des favoris" : "Ajouter aux favoris");
      if (document.body.dataset.page === "favorites" && window.TDZDashboard) TDZDashboard.render("favorites");
    });
  }
  function create(tender) { const items = all(); items.unshift(tender); save(items); return tender; }
  function update(id, values) { const items = all(); const index = items.findIndex((item) => item.id === id); if (index < 0) return null; items[index] = { ...items[index], ...values, updatedAt: new Date().toISOString() }; save(items); return items[index]; }
  function remove(id) { const items = all().filter((item) => item.id !== id); save(items); }
  window.TDZTenders = { all, published, find, save, card, renderCards, renderDetail, initFavoriteButtons, create, update, remove, getStatusBadge };
})();

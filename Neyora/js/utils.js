(function () {
  "use strict";
  const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  function escapeHTML(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => escapeMap[char]); }
  function normalize(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " "); }
  function parseDate(date) { return new Date(`${date}T12:00:00`); }
  function dayDiff(date) {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    return Math.round((parseDate(date) - today) / 86400000);
  }
  function formatDate(date) { return parseDate(date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" }); }
  function deadlineInfo(date) {
    const diff = dayDiff(date);
    if (diff < 0) return { label: "Expiré", className: "badge-expired", diff };
    if (diff === 0) return { label: "Aujourd'hui", className: "badge-today", diff };
    if (diff === 1) return { label: "Demain", className: "badge-tomorrow", diff };
    if (diff <= 3) return { label: "3 jours", className: "badge-3days", diff };
    if (diff <= 7) return { label: "Cette semaine", className: "badge-week", diff };
    return { label: "Plus de 7 jours", className: "badge-later", diff };
  }
  function pagePath(page) { return location.pathname.toLowerCase().includes("/pages/") ? `${page}.html` : `pages/${page}.html`; }
  function homePath() { return location.pathname.toLowerCase().includes("/pages/") ? "../index.html" : "index.html"; }
  function currentPage() { return document.body.dataset.page || ""; }
  function initials(name) { return String(name || "TD").split(/\s+/).slice(0, 2).map((item) => item[0]).join("").toUpperCase(); }
  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message; toast.className = `toast ${type} show`;
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { toast.className = "toast"; }, 3200);
  }
  function openModal(title, text, actions = []) {
    const root = document.getElementById("modal-root"); if (!root) return;
    root.innerHTML = `<div class="modal show" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-card"><h2 id="modal-title">${escapeHTML(title)}</h2><p>${escapeHTML(text)}</p><div class="modal-actions">${actions.map((action, index) => `<button class="btn ${action.className || "btn-outline"}" data-modal-action="${index}">${escapeHTML(action.label)}</button>`).join("")}<button class="btn btn-outline" data-modal-close>Fermer</button></div></div></div>`;
    document.body.classList.add("modal-open");
    root.querySelector(".modal").addEventListener("click", (event) => { if (event.target.classList.contains("modal")) closeModal(); });
    root.querySelectorAll("[data-modal-action]").forEach((button) => button.addEventListener("click", () => { const action = actions[Number(button.dataset.modalAction)]; if (action && action.onClick) action.onClick(); closeModal(); }));
    root.querySelector("[data-modal-close]").focus();
  }
  function closeModal() { const root = document.getElementById("modal-root"); if (root) root.innerHTML = ""; document.body.classList.remove("modal-open"); }
  function getProfile() {
    const user = window.TDZAuth && window.TDZAuth.getUser();
    const id = user ? user.email : "visitor";
    try { return JSON.parse(localStorage.getItem(`tenderdz_profile_${id}`) || "null") || { company: "", sector: "", wilaya: "", description: "", keywords: "" }; }
    catch (error) { return { company: "", sector: "", wilaya: "", description: "", keywords: "" }; }
  }
  function saveProfile(profile) { const user = window.TDZAuth && window.TDZAuth.getUser(); localStorage.setItem(`tenderdz_profile_${user ? user.email : "visitor"}`, JSON.stringify(profile)); }
  function matchScore(tender, profile = getProfile()) {
    const keywords = normalize(profile.keywords).split(",").map((word) => word.trim()).filter(Boolean);
    if (!keywords.length) return 0;
    const text = normalize([tender.title, tender.description, tender.category, tender.requirements, tender.organization, tender.wilaya].join(" "));
    const matches = keywords.filter((keyword) => text.includes(keyword)).length;
    if (!matches) return 0;
    const sectorBonus = normalize(profile.sector) && normalize(tender.category).includes(normalize(profile.sector)) ? 1 : 0;
    const wilayaBonus = normalize(profile.wilaya) && normalize(tender.wilaya) === normalize(profile.wilaya) ? 1 : 0;
    return Math.min(98, Math.round(((matches + sectorBonus + wilayaBonus) / (keywords.length + 2)) * 100));
  }
  window.TDZUtils = { escapeHTML, normalize, parseDate, dayDiff, formatDate, deadlineInfo, pagePath, homePath, currentPage, initials, showToast, openModal, closeModal, getProfile, saveProfile, matchScore };
})();

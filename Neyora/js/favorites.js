(function () {
  "use strict";
  function key() { const user = TDZAuth.getUser(); return user ? `tenderdz_favorites_${user.email}` : null; }
  function list() { const storageKey = key(); if (!storageKey) return []; try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch (error) { return []; } }
  function save(items) { const storageKey = key(); if (storageKey) localStorage.setItem(storageKey, JSON.stringify(items)); }
  function isFavorite(id) { return list().includes(id); }
  function toggle(id) {
    if (!TDZAuth.getUser()) { TDZUtils.showToast("Connectez-vous pour enregistrer des favoris.", "error"); setTimeout(() => { window.location.href = TDZUtils.pagePath("login"); }, 750); return false; }
    const items = list(); const index = items.indexOf(id);
    if (index >= 0) { items.splice(index, 1); TDZUtils.showToast("Retiré de vos favoris."); } else { items.push(id); TDZUtils.showToast("Ajouté à vos favoris."); }
    save(items); return index < 0;
  }
  window.TDZFavorites = { list, isFavorite, toggle };
})();

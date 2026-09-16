/* Frontend demo only: passwords and session data in localStorage are NOT secure.
 * Replace this entire module with a server-side authentication flow before production. */
(function () {
  "use strict";
  const USERS_KEY = "tenderdz_users_v1";
  const SESSION_KEY = "tenderdz_session_v1";
  const initialUsers = [{ id: "admin-demo", name: "Administrateur TenderDZ", email: "admin@tenderdz.dz", password: "admin12345", role: "ADMIN", createdAt: new Date().toISOString() }];
  function users() { try { const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "null"); return Array.isArray(parsed) && parsed.length ? parsed : initialUsers; } catch (error) { return initialUsers; } }
  function saveUsers(items) { localStorage.setItem(USERS_KEY, JSON.stringify(items)); }
  function getUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (error) { return null; } }
  function setUser(user) { localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })); }
  function logout() { localStorage.removeItem(SESSION_KEY); window.location.href = TDZUtils.homePath(); }
  function login(email, password) {
    const user = users().find((item) => TDZUtils.normalize(item.email) === TDZUtils.normalize(email) && item.password === password);
    if (!user) return { ok: false, message: "Adresse e-mail ou mot de passe incorrect." };
    setUser(user); return { ok: true, user };
  }
  function register(name, email, password) {
    const list = users();
    if (list.some((item) => TDZUtils.normalize(item.email) === TDZUtils.normalize(email))) return { ok: false, message: "Cette adresse e-mail est déjà utilisée." };
    const user = { id: `user-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, role: "USER", createdAt: new Date().toISOString() };
    list.push(user); saveUsers(list); setUser(user); return { ok: true, user };
  }
  function requireUser() { const user = getUser(); if (!user) { window.location.href = TDZUtils.pagePath("login"); return null; } return user; }
  function requireAdmin() { const user = requireUser(); if (!user) return null; if (user.role !== "ADMIN") { window.location.href = TDZUtils.pagePath("dashboard"); return null; } return user; }
  function initForms() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(loginForm); const error = document.getElementById("auth-error"); const result = login(form.get("email"), form.get("password")); if (!result.ok) { error.textContent = result.message; error.classList.add("show"); return; } window.location.href = TDZUtils.pagePath(result.user.role === "ADMIN" ? "admin" : "dashboard"); });
    const registerForm = document.getElementById("register-form");
    if (registerForm) registerForm.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(registerForm); const error = document.getElementById("auth-error"); if (!registerForm.checkValidity()) { error.textContent = "Veuillez remplir tous les champs et accepter la mention de démonstration."; error.classList.add("show"); return; } const result = register(form.get("name"), form.get("email"), form.get("password")); if (!result.ok) { error.textContent = result.message; error.classList.add("show"); return; } window.location.href = TDZUtils.pagePath("dashboard"); });
  }
  window.TDZAuth = { getUser, login, register, logout, requireUser, requireAdmin, users, initForms };
})();

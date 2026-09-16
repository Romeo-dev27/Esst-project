(function () {
  "use strict";
  const U = () => TDZUtils;
  const faqs = [
    ["Qu'est-ce que TenderDZ ?", "TenderDZ est une plateforme de veille des appels d'offres en Algérie. Elle centralise les opportunités, aide à les rechercher et permet de suivre leurs dates limites."],
    ["Les données sont-elles officielles ?", "Dans le MVP, les données sont fictives et servent à tester les fonctionnalités. En production, chaque publication devra être contrôlée et reliée à sa source avant diffusion."],
    ["Puis-je sauvegarder un appel d'offre ?", "Oui. Après vous être connecté, utilisez l'icône étoile pour enregistrer une opportunité dans vos favoris. Le prototype les conserve dans le stockage local de votre navigateur."],
    ["Comment sont calculées les deadlines ?", "Les badges sont calculés en JavaScript à partir de la date limite de chaque appel : expiré, aujourd'hui, demain, dans 3 jours, cette semaine ou plus de 7 jours."],
    ["Les alertes envoient-elles des notifications ?", "Pas encore. Cette version permet de définir et sauvegarder vos critères localement. L'envoi e-mail, WhatsApp ou Telegram nécessitera un backend et sera ajouté ultérieurement."],
    ["Puis-je payer un abonnement maintenant ?", "Non. Les offres sont présentées pour simuler le futur produit SaaS ; aucun paiement réel n'est traité dans ce prototype frontend."],
    ["Cette authentification est-elle sécurisée ?", "Non. Les comptes et mots de passe de démonstration sont stockés localement. Une authentification serveur sécurisée est indispensable avant toute mise en production."]
  ];
  const plans = [
    { label: "FREE", name: "Découverte", price: "0 DA", description: "Pour explorer la plateforme et les opportunités.", features: ["Consultation limitée", "Recherche simple", "Accès aux informations clés"] },
    { label: "PRO", name: "Veille professionnelle", price: "2 900 DA", description: "Pour suivre efficacement les appels pertinents.", features: ["Accès complet", "Recherche avancée", "Favoris et alertes", "Matching de profil"], featured: true },
    { label: "BUSINESS", name: "Équipes & entreprises", price: "Sur devis", description: "Pour coordonner la veille de plusieurs équipes.", features: ["Fonctionnalités avancées", "Plusieurs utilisateurs", "Outils professionnels", "Accompagnement dédié"] }
  ];
  function pricingCards() { return plans.map((plan) => `<article class="pricing-card ${plan.featured ? "featured" : ""}">${plan.featured ? '<span class="badge badge-later" style="width:fit-content;margin-bottom:10px">Le plus choisi</span>' : ""}<p class="plan-label">${plan.label}</p><h3>${plan.name}</h3><p style="color:var(--muted);font-size:13px;min-height:40px">${plan.description}</p><div class="price">${plan.price}${plan.label !== "FREE" && plan.label !== "BUSINESS" ? " <small>/ mois</small>" : ""}</div><ul>${plan.features.map((feature) => `<li>${feature}</li>`).join("")}</ul><button class="btn ${plan.featured ? "btn-primary" : "btn-outline"} btn-block" data-pricing-modal data-plan="${plan.label}">${plan.label === "FREE" ? "Commencer gratuitement" : "Choisir cette offre"}</button></article>`).join(""); }
  function renderFaq(root, count) { if (root) root.innerHTML = faqs.slice(0, count || faqs.length).map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join(""); }
  function publicHeader() {
    const header = document.getElementById("site-header"); if (!header) return;
    const user = TDZAuth.getUser(); const page = U().currentPage(); const tendersActive = page === "tenders" || page === "tender";
    const nav = [
      [U().homePath(), "Accueil", page === "home"],
      [U().pagePath("tenders"), "Appels d'offres", tendersActive],
      [U().pagePath("pricing"), "Tarifs", page === "pricing"],
      [U().pagePath("about"), "À propos", page === "about"],
      [U().pagePath("faq"), "FAQ", page === "faq"]
    ];
    const action = user ? userControl(user) : `<a class="btn btn-outline btn-small" href="${U().pagePath("login")}">Connexion</a><a class="btn btn-primary btn-small" href="${U().pagePath("register")}">Créer un compte</a>`;
    header.innerHTML = `<div class="topbar"><div class="container"><span>Plateforme de veille des appels d'offres</span><a href="${U().pagePath("faq")}">Besoin d'aide ?</a></div></div><header class="site-header"><nav class="navbar container" aria-label="Navigation principale"><a class="brand" href="${U().homePath()}" aria-label="TenderDZ, accueil"><span class="brand-mark">T</span><span>TenderDZ<small>Veille des appels d'offres</small></span></a><button id="nav-toggle" class="nav-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false">☰</button><div id="main-nav" class="main-nav">${nav.map(([href, label, active]) => `<a href="${href}" class="${active ? "active" : ""}">${label}</a>`).join("")}</div><div class="nav-actions">${action}</div></nav></header>`;
    bindHeader();
  }
  function userControl(user) { const primary = user.role === "ADMIN" ? U().pagePath("admin") : U().pagePath("dashboard"); return `<div class="user-menu"><button class="user-trigger" id="user-trigger" type="button" aria-expanded="false"><span class="avatar">${U().initials(user.name)}</span><span style="font-size:12px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U().escapeHTML(user.name)}</span><span aria-hidden="true">⌄</span></button><div class="user-dropdown" role="menu"><a href="${primary}" role="menuitem">${user.role === "ADMIN" ? "Administration" : "Mon dashboard"}</a>${user.role === "USER" ? `<a href="${U().pagePath("favorites")}" role="menuitem">Mes favoris</a><a href="${U().pagePath("profile")}" role="menuitem">Mon profil</a>` : ""}<button type="button" data-logout role="menuitem">Déconnexion</button></div></div>`; }
  function footer() { const root = document.getElementById("site-footer"); if (!root) return; root.innerHTML = `<footer class="site-footer"><div class="container footer-grid"><div><a class="brand" href="${U().homePath()}"><span class="brand-mark">T</span><span>TenderDZ<small style="color:#99b5c9">Veille des appels d'offres</small></span></a><p class="footer-intro">La plateforme de veille qui aide les professionnels à suivre les appels d'offres en Algérie.</p></div><div><h3>Explorer</h3><a href="${U().pagePath("tenders")}">Appels d'offres</a><a href="${U().pagePath("pricing")}">Tarifs</a><a href="${U().pagePath("about")}">À propos</a></div><div><h3>Ressources</h3><a href="${U().pagePath("faq")}">FAQ</a><a href="${U().pagePath("login")}">Connexion</a><a href="${U().pagePath("register")}">Créer un compte</a></div><div><h3>Prototype MVP</h3><a href="${U().pagePath("about")}">Architecture future</a><a href="${U().pagePath("admin")}">Espace admin</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} TenderDZ. Tous droits réservés.</span><span>Fait pour la veille professionnelle en Algérie.</span></div></footer>`; }
  function bindHeader() {
    const toggle = document.getElementById("nav-toggle"); if (toggle) toggle.addEventListener("click", () => { const nav = document.getElementById("main-nav"); const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
    const trigger = document.getElementById("user-trigger"); if (trigger) trigger.addEventListener("click", () => { const box = trigger.closest(".user-menu"); const open = box.classList.toggle("open"); trigger.setAttribute("aria-expanded", String(open)); });
    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", TDZAuth.logout));
  }
  function sidebarLink(icon, href, label, active, count = "") { return `<a class="sidebar-link ${active ? "active" : ""}" href="${href}"><span class="sidebar-icon">${icon}</span>${label}${count ? `<span class="nav-count">${count}</span>` : ""}</a>`; }
  function appShell(user, page) {
    const root = document.getElementById("app-root"); if (!root) return;
    const isAdmin = page === "admin"; const adminView = isAdmin ? TDZAdmin.view() : "";
    const userLinks = isAdmin ? `${sidebarLink("▦", `${U().pagePath("admin")}?view=dashboard`, "Vue d'ensemble", adminView === "dashboard")}${sidebarLink("▤", `${U().pagePath("admin")}?view=tenders`, "Appels d'offres", adminView === "tenders")}${sidebarLink("+", `${U().pagePath("admin")}?view=add`, "Ajouter un appel", adminView === "add")}${sidebarLink("◫", `${U().pagePath("admin")}?view=categories`, "Catégories", adminView === "categories")}${sidebarLink("♙", `${U().pagePath("admin")}?view=users`, "Utilisateurs", adminView === "users")}` : `${sidebarLink("▦", U().pagePath("dashboard"), "Vue d'ensemble", page === "dashboard")}${sidebarLink("☆", U().pagePath("favorites"), "Mes favoris", page === "favorites", TDZFavorites.list().length)}${sidebarLink("◌", U().pagePath("alerts"), "Mes alertes", page === "alerts")}${sidebarLink("◉", U().pagePath("profile"), "Mon profil", page === "profile")}${sidebarLink("◆", U().pagePath("subscription"), "Mon abonnement", page === "subscription")}`;
    const titleMap = { dashboard: "Mon espace", favorites: "Mes favoris", alerts: "Mes alertes", profile: "Mon profil", subscription: "Mon abonnement", admin: "Administration" };
    root.innerHTML = `<div class="app-shell"><aside id="app-sidebar" class="app-sidebar"><a class="sidebar-brand" href="${U().homePath()}"><span class="brand-mark">T</span><span>TenderDZ</span></a><p class="sidebar-label">${isAdmin ? "Administration" : "Mon espace"}</p>${userLinks}<p class="sidebar-label">Accès rapide</p>${sidebarLink("⌕", U().pagePath("tenders"), "Explorer les appels", false)}${isAdmin ? sidebarLink("↗", U().pagePath("dashboard"), "Espace utilisateur", false) : ""}<div style="position:absolute;left:13px;right:13px;bottom:18px"><button class="sidebar-link" style="width:100%;border:0;background:transparent" data-logout><span class="sidebar-icon">↪</span>Déconnexion</button></div></aside><section class="app-main"><header class="app-topbar"><div style="display:flex;align-items:center;gap:10px"><button id="app-menu-toggle" class="nav-toggle app-menu-toggle" style="display:none" type="button" aria-label="Ouvrir le menu">☰</button><h1>${titleMap[page]}</h1></div><div class="app-topbar-right"><span style="color:var(--muted);font-size:12px">${U().escapeHTML(user.name)}</span><span class="avatar">${U().initials(user.name)}</span></div></header><main id="app-page-content" class="app-content"></main></section></div>`;
    root.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", TDZAuth.logout)); const toggle = root.querySelector("#app-menu-toggle"); if (toggle) toggle.addEventListener("click", () => document.getElementById("app-sidebar").classList.toggle("open"));
    if (isAdmin) TDZAdmin.render(); else TDZDashboard.render(page);
  }
  function bindGlobalActions() {
    document.addEventListener("click", (event) => { const button = event.target.closest("[data-pricing-modal]"); if (!button) return; const plan = button.dataset.plan || "PRO"; U().openModal(`Offre ${plan}`, "Le paiement sera disponible prochainement. Cette version MVP ne traite aucune transaction.", [{ label: "Voir les appels", className: "btn-primary", onClick: () => { window.location.href = U().pagePath("tenders"); } }]); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") U().closeModal(); });
  }
  function init() {
    const page = U().currentPage();
    TDZAuth.initForms(); TDZTenders.initFavoriteButtons(); bindGlobalActions();
    if (["dashboard", "favorites", "alerts", "profile", "subscription", "admin"].includes(page)) { const user = page === "admin" ? TDZAuth.requireAdmin() : TDZAuth.requireUser(); if (user) appShell(user, page); return; }
    publicHeader(); footer();
    if (page === "home") { document.getElementById("pricing-preview").innerHTML = pricingCards(); renderFaq(document.getElementById("home-faq"), 4); }
    if (page === "pricing") document.getElementById("pricing-page").innerHTML = pricingCards();
    if (page === "faq") renderFaq(document.getElementById("faq-page"));
    if (page === "tenders") TDZSearch.init();
    if (page === "tender") TDZTenders.renderDetail();
  }
  document.addEventListener("DOMContentLoaded", init);
})();

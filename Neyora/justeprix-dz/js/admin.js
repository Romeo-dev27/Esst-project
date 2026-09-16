(() => {
  const labels = { service: 'prestation', repairer: 'réparateur', observation: 'observation' };
  const entityConfig = {
    service: { collection: 'services', form: 'service-form', list: 'services-admin-list', total: 'services-total' },
    repairer: { collection: 'repairers', form: 'repairer-form', list: 'repairers-admin-list', total: 'repairers-total' },
    observation: { collection: 'observations', form: 'observation-form', list: 'observations-admin-list', total: 'observations-total' }
  };

  function idFor(type) { return `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`; }
  function getQuery() { return PriceService.normalize(document.getElementById('admin-query')?.value || ''); }
  function matchesQuery(item, extra = '') { return !getQuery() || PriceService.normalize(`${Object.values(item).join(' ')} ${extra}`).includes(getQuery()); }

  function fillObservationChoices() {
    const serviceSelect = document.getElementById('observation-service');
    const repairerSelect = document.getElementById('observation-repairer');
    if (!serviceSelect || !repairerSelect) return;
    const selectedService = serviceSelect.value;
    const selectedRepairer = repairerSelect.value;
    serviceSelect.innerHTML = PriceService.getServices().map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
    repairerSelect.innerHTML = PriceService.getRepairers().map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} — ${escapeHtml(item.commune)}</option>`).join('');
    serviceSelect.value = selectedService;
    repairerSelect.value = selectedRepairer;
  }

  function render() {
    if (document.body.dataset.page !== 'admin') return;
    fillObservationChoices();
    renderServices();
    renderRepairers();
    renderObservations();
  }

  function renderServices() {
    const services = PriceService.getServices().filter((item) => matchesQuery(item));
    document.getElementById('services-total').textContent = `${services.length} / ${PriceService.getServices().length}`;
    document.getElementById('services-admin-list').innerHTML = services.map((item) => `<article class="admin-item"><div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.category)} · ${escapeHtml(item.device)}</span></div><div class="item-actions"><button type="button" class="icon-action" data-edit="service" data-id="${escapeHtml(item.id)}">Modifier</button><button type="button" class="icon-action danger" data-delete="service" data-id="${escapeHtml(item.id)}">Supprimer</button></div></article>`).join('') || '<p class="list-empty">Aucune prestation trouvée.</p>';
  }

  function renderRepairers() {
    const repairers = PriceService.getRepairers().filter((item) => matchesQuery(item));
    document.getElementById('repairers-total').textContent = `${repairers.length} / ${PriceService.getRepairers().length}`;
    document.getElementById('repairers-admin-list').innerHTML = repairers.map((item) => `<article class="admin-item"><div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.commune)}, ${escapeHtml(item.wilaya)} · ${escapeHtml(item.phone)}</span></div><div class="item-actions"><button type="button" class="icon-action" data-edit="repairer" data-id="${escapeHtml(item.id)}">Modifier</button><button type="button" class="icon-action danger" data-delete="repairer" data-id="${escapeHtml(item.id)}">Supprimer</button></div></article>`).join('') || '<p class="list-empty">Aucun réparateur trouvé.</p>';
  }

  function renderObservations() {
    const wilaya = document.getElementById('admin-wilaya-filter')?.value || 'all';
    const observations = PriceService.getObservations().filter((item) => {
      const repairer = PriceService.getRepairer(item.repairerId);
      return matchesQuery(item, `${repairer?.name || ''} ${PriceService.getService(item.serviceId)?.name || ''}`) && (wilaya === 'all' || repairer?.wilaya === wilaya);
    });
    document.getElementById('observations-total').textContent = `${observations.length} / ${PriceService.getObservations().length}`;
    document.getElementById('observations-admin-list').innerHTML = observations.map((item) => {
      const service = PriceService.getService(item.serviceId); const repairer = PriceService.getRepairer(item.repairerId);
      return `<article class="admin-item observation-item"><div><b>${formatDA(item.price)} · ${escapeHtml(service?.name || 'Prestation supprimée')}</b><span>${escapeHtml(repairer?.name || 'Réparateur supprimé')} · ${escapeHtml(repairer?.commune || '')} · ${formatDate(item.dateVerified)}</span></div><div class="item-actions"><button type="button" class="icon-action" data-edit="observation" data-id="${escapeHtml(item.id)}">Modifier</button><button type="button" class="icon-action danger" data-delete="observation" data-id="${escapeHtml(item.id)}">Supprimer</button></div></article>`;
    }).join('') || '<p class="list-empty">Aucune observation trouvée.</p>';
  }

  function submitEntity(type, form) {
    const config = entityConfig[type];
    const values = Object.fromEntries(new FormData(form).entries());
    const data = Storage.getData();
    let item;
    if (type === 'service') {
      item = { id: values.id || idFor('service'), name: values.name.trim(), category: values.category, device: values.device.trim(), description: values.description.trim(), typicalDuration: values.typicalDuration.trim(), factors: values.factors.split('\n').map((factor) => factor.trim()).filter(Boolean) };
    } else if (type === 'repairer') {
      item = { id: values.id || idFor('repairer'), name: values.name.trim(), wilaya: values.wilaya, commune: values.commune.trim(), address: values.address.trim(), phone: values.phone.trim(), latitude: null, longitude: null };
    } else {
      const repairer = data.repairers.find((entry) => entry.id === values.repairerId);
      item = { id: values.id || idFor('observation'), serviceId: values.serviceId, repairerId: values.repairerId, price: Number(values.price), wilaya: repairer?.wilaya || '', commune: repairer?.commune || '', dateVerified: values.dateVerified, verificationMethod: values.verificationMethod, notes: values.notes.trim() };
    }
    const index = data[config.collection].findIndex((entry) => entry.id === item.id);
    if (index >= 0) data[config.collection][index] = item; else data[config.collection].unshift(item);
    Storage.saveData(data);
    resetForm(form);
    render();
    UI.toast(`${labels[type][0].toUpperCase() + labels[type].slice(1)} ${index >= 0 ? 'mise à jour' : 'ajoutée'} localement.`);
  }

  function editEntity(type, id) {
    const config = entityConfig[type];
    const item = Storage.getData()[config.collection].find((entry) => entry.id === id);
    const form = document.getElementById(config.form);
    if (!item || !form) return;
    Object.entries(item).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = Array.isArray(value) ? value.join('\n') : value;
    });
    form.querySelector('button[type="submit"]').textContent = `Enregistrer la modification`;
    form.querySelector('.cancel-edit').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.querySelector('input:not([type="hidden"]), select, textarea')?.focus();
  }

  function resetForm(form) {
    form.reset();
    form.elements.namedItem('id').value = '';
    form.querySelector('button[type="submit"]').textContent = `Ajouter ${form.id === 'service-form' ? 'la prestation' : form.id === 'repairer-form' ? 'le réparateur' : "l'observation"}`;
    form.querySelector('.cancel-edit').hidden = true;
  }

  function deleteEntity(type, id) {
    const config = entityConfig[type];
    const data = Storage.getData();
    if (!window.confirm(`Supprimer cette ${labels[type]} ?`)) return;
    data[config.collection] = data[config.collection].filter((item) => item.id !== id);
    if (type === 'service') data.observations = data.observations.filter((item) => item.serviceId !== id);
    if (type === 'repairer') data.observations = data.observations.filter((item) => item.repairerId !== id);
    Storage.saveData(data);
    render();
    UI.toast(`${labels[type][0].toUpperCase() + labels[type].slice(1)} supprimée.`);
  }

  function init() {
    if (document.body.dataset.page !== 'admin') return;
    document.getElementById('service-form').addEventListener('submit', (event) => { event.preventDefault(); submitEntity('service', event.currentTarget); });
    document.getElementById('repairer-form').addEventListener('submit', (event) => { event.preventDefault(); submitEntity('repairer', event.currentTarget); });
    document.getElementById('observation-form').addEventListener('submit', (event) => { event.preventDefault(); submitEntity('observation', event.currentTarget); });
    document.getElementById('admin-query').addEventListener('input', render);
    document.getElementById('admin-wilaya-filter').addEventListener('change', render);
    document.getElementById('reset-demo').addEventListener('click', () => { if (window.confirm('Réinitialiser toutes les données locales de JustePrix DZ ? Les ajouts et modifications seront perdus.')) { Storage.resetData(); render(); UI.toast('Les données de démonstration ont été réinitialisées.'); } });
    document.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-edit]'); const remove = event.target.closest('[data-delete]'); const cancel = event.target.closest('.cancel-edit');
      if (edit) editEntity(edit.dataset.edit, edit.dataset.id);
      if (remove) deleteEntity(remove.dataset.delete, remove.dataset.id);
      if (cancel) resetForm(document.getElementById(cancel.dataset.form));
    });
    render();
  }
  document.addEventListener('DOMContentLoaded', init);
})();

export function resolveSelection(ids, catalog) {
  if (!Array.isArray(ids)) throw new Error('Module IDs must be an array.');
  const byId = new Map(catalog.map(item => [item.id, item]));
  const selected = new Set();
  const visiting = new Set();
  function visit(id) {
    if (!byId.has(id)) throw new Error(`Unknown module: ${id}`);
    if (visiting.has(id)) throw new Error('Circular dependency.');
    if (selected.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependencies) visit(dependency);
    visiting.delete(id);
    selected.add(id);
  }
  for (const item of catalog.filter(item => item.category === 'foundation')) visit(item.id);
  ids.forEach(visit);
  return catalog.filter(item => selected.has(item.id)).map(item => item.id);
}
export function calculate(ids, catalog) {
  const selectedIds = resolveSelection(ids, catalog);
  const modules = catalog.filter(item => selectedIds.includes(item.id));
  return { selectedIds, modules, total: modules.reduce((sum, item) => sum + item.price, 0), provisional: modules.some(item => item.provisional) };
}
export function removalImpact(id, ids, catalog) {
  if (catalog.find(item => item.id === id)?.category === 'foundation') return [];
  return resolveSelection(ids, catalog).filter(selected => selected === id || resolveSelection([selected], catalog).includes(id));
}

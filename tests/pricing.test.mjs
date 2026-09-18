import { describe, it, expect } from 'vitest';
import { catalog } from '../netlify/functions/lib/catalog.mjs';
import { calculate } from '../shared/dependencies.mjs';
describe('authoritative pricing', () => {
 it('calculates all launch modules', () => expect(calculate(catalog.filter(x=>x.category!=='addition').map(x=>x.id),catalog).total).toBe(460000));
 it('calculates all possible additions with dependencies', () => expect(calculate(catalog.map(x=>x.id),catalog).total).toBe(755000));
 it('includes only foundation when empty', () => expect(calculate([],catalog).total).toBe(145000));
 it('uses integer provisional accounting amount', () => { const result=calculate(['accounting'],catalog); expect(result.total).toBe(190000);expect(result.provisional).toBe(true); });
 it('deduplicates IDs and includes foundation once', () => expect(calculate(['catalogue','catalogue','foundation'],catalog).total).toBe(190000));
 it('rejects unknown IDs', () => expect(()=>calculate(['unknown'],catalog)).toThrow('Unknown'));
 it('has complete inclusions and unique IDs', () => {expect(new Set(catalog.map(x=>x.id)).size).toBe(16);expect(catalog.every(x=>x.inclusions.length>=2)).toBe(true);});
});

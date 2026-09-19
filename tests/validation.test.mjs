import { it, expect } from 'vitest';
import { validateSelection } from '../netlify/functions/lib/validation.mjs';
import { catalog } from '../netlify/functions/lib/catalog.mjs';
it('preserves explicit selection for automatic dependency attribution',()=>expect(validateSelection({selectedIds:['basket','basket']},catalog)).toEqual(['basket']));
it.each([{selectedIds:['unknown']},{selectedIds:'basket'},{selectedIds:[1]},{selectedIds:[],website:'bot'}])('rejects invalid selection %j',data=>expect(()=>validateSelection(data,catalog)).toThrow());
it('ignores prices, titles, totals and dependency results from browser',()=>expect(validateSelection({selectedIds:['basket'],total:0,modules:[{title:'Fake',price:0}],automaticIds:[]},catalog)).toEqual(['basket']));

import { it, expect } from 'vitest';
import { validateSubmission, escapeHtml } from '../netlify/functions/lib/validation.mjs';
import { catalog } from '../netlify/functions/lib/catalog.mjs';
const good={name:'Ada Example',role:'Management',email:'ada@example.com',note:'',confirm:true,website:'',selectedIds:['basket']};
it('validates details and resolves IDs',()=>expect(validateSubmission(good,catalog).selectedIds).toEqual(['foundation','catalogue','basket']));
it.each(['name','role','email'])('requires valid %s',key=>expect(()=>validateSubmission({...good,[key]:''},catalog)).toThrow());
it.each([{email:'a@bad'}, {note:'x'.repeat(2001)}, {confirm:false}, {website:'spam'}, {selectedIds:['missing']}, {selectedIds:'basket'}, {name:'a\u0000b'}])('rejects invalid fields %j',change=>expect(()=>validateSubmission({...good,...change},catalog)).toThrow());
it('ignores browser-supplied names, prices and total',()=>expect(validateSubmission({...good,total:1,price:1,modules:[{title:'Fake',price:0}]},catalog)).toEqual(validateSubmission(good,catalog)));
it('escapes HTML special characters',()=>expect(escapeHtml('<script a="x">&\'</script>')).toBe('&lt;script a=&quot;x&quot;&gt;&amp;&#39;&lt;/script&gt;'));

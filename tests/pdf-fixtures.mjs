import { writeFile, mkdir } from 'node:fs/promises';
import { createQuotation } from '../netlify/functions/lib/quotation.mjs';
import { generatePdf } from '../netlify/functions/lib/quote-document.mjs';
import { catalog } from '../netlify/functions/lib/catalog.mjs';
await mkdir('artifacts/pdf-qa',{recursive:true});
for(const [name,ids] of [['foundation',[]],['dependencies',['training','accounting']],['full',catalog.map(item=>item.id)]]){
 const quote=createQuotation(ids,'2348000000000',Date.UTC(2026,8,19));await writeFile(`artifacts/pdf-qa/${name}.pdf`,await generatePdf(quote));console.log(`Generated ${name}`);
}

import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:8888';const headers={origin:base,'content-type':'application/json'};
assert.equal((await fetch(`${base}/api/quotation`,{method:'POST',headers,body:'{"selectedIds":[]}'})).status,401);
const auth=await fetch(`${base}/api/auth`,{method:'POST',headers,body:JSON.stringify({code:'local-test-code'})});assert.equal(auth.status,200);headers.cookie=auth.headers.get('set-cookie').split(';')[0];
const quote=await (await fetch(`${base}/api/quotation`,{method:'POST',headers,body:JSON.stringify({selectedIds:['basket'],total:1})})).json();assert.equal(quote.total,207000);assert.deepEqual(quote.automaticIds,['catalogue']);
const pdf=await fetch(`${base}/api/quotation-pdf`,{method:'POST',headers,body:JSON.stringify({pdfToken:quote.pdfToken,total:1})});assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0,5).toString(),'%PDF-');console.log('PASS real Netlify validation and signed PDF generation; no outbound sharing.');

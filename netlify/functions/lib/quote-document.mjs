import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const A4 = [595.28, 841.89];
const MARGIN = 48;
const WIDTH = A4[0] - MARGIN * 2;
const green = rgb(.114, .318, .204);
const ink = rgb(.067, .071, .059);
const muted = rgb(.32, .35, .30);
const rule = rgb(.81, .80, .74);
const printable = value => String(value).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014\u2011]/g, '-');

export async function generatePdf(quote) {
  const document = await PDFDocument.create();
  document.setTitle(`Zadok Farm - Project Scope Selection - ${quote.reference}`);
  document.setAuthor('Zadok Farm');
  document.setCreationDate(new Date(quote.timestamp));
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let page, y;
  function draw(value, x, at, size = 10, font = regular, color = ink) {
    page.drawText(printable(value), { x, y: at, size, font, color });
  }
  function newPage() {
    page = document.addPage(A4); y = 735;
    draw('ZADOK FARM', MARGIN, 793, 16, bold, green);
    draw('PROJECT SCOPE SELECTION', MARGIN, 773, 8, bold, muted);
    page.drawLine({ start: { x: MARGIN, y: 758 }, end: { x: A4[0] - MARGIN, y: 758 }, thickness: .7, color: rule });
  }
  function wrap(value, size = 10, font = regular, width = WIDTH) {
    const lines = []; let current = '';
    for (const word of printable(value).split(/\s+/)) {
      if (font.widthOfTextAtSize(current ? `${current} ${word}` : word, size) > width && current) {
        lines.push(current); current = word;
      } else current = current ? `${current} ${word}` : word;
    }
    if (current) lines.push(current);
    return lines;
  }
  function ensure(height) { if (y - height < 65) newPage(); }
  function paragraph(value, { size = 10, font = regular, color = ink, gap = 8 } = {}) {
    for (const part of wrap(value, size, font)) { ensure(size * 1.45); draw(part, MARGIN, y, size, font, color); y -= size * 1.45; }
    y -= gap;
  }
  function heading(value) { ensure(65); y -= 8; paragraph(value, { size: 12, font: bold, color: green, gap: 12 }); }
  const money = value => `NGN ${new Intl.NumberFormat('en-NG').format(value)}`;
  newPage();
  paragraph('Project Scope Selection', { size: 25, font: bold, gap: 15 });
  paragraph(`Quotation reference: ${quote.reference}`, { font: bold });
  paragraph(`Generated: ${quote.timestamp.replace('T', ' ').slice(0, 19)} UTC`, { size: 9, color: muted, gap: 5 });
  paragraph(`Valid for ${quote.validityDays} days - until ${quote.validUntil.slice(0, 10)} (UTC)`, { size: 9, color: muted, gap: 15 });
  paragraph('Selected scope for the Zadok Farm website and operational platform. Prepared for review; nothing is communicated to the recipient by this website.', { color: muted });
  for (const [category, label] of [['foundation', 'Required foundation'], ['launch', 'Selected launch modules'], ['addition', 'Selected possible additions']]) {
    const items = quote.modules.filter(item => item.category === category);
    if (!items.length) { heading(label); paragraph('None selected.', { color: muted }); continue; }
    for (const [itemIndex, item] of items.entries()) {
      const titles = wrap(item.title, 11, bold, 345);
      const reason = quote.automaticIds.includes(item.id)
        ? `Automatically included for: ${quote.modules.filter(other => other.dependencies.includes(item.id)).map(other => other.title).join('; ')}.`
        : category === 'foundation' ? 'Required foundation - always included.' : '';
      const rows = [{ value: item.value, size: 10 }, { value: reason, size: 9 }, { value: `Includes: ${item.inclusions.join('; ')}.`, size: 9 }, { value: item.warning, size: 9 }].filter(row => row.value);
      const height = titles.length * 16 + rows.reduce((sum, row) => sum + wrap(row.value, row.size).length * row.size * 1.45 + 8, 0) + 23;
      ensure(Math.min(height + (itemIndex === 0 ? 45 : 0), 660));
      if (itemIndex === 0) heading(label);
      titles.forEach((title, index) => draw(title, MARGIN, y - index * 16, 11, bold));
      const price = `${item.provisional ? 'From ' : ''}${money(item.price)}`;
      draw(price, A4[0] - MARGIN - bold.widthOfTextAtSize(price, 10), y, 10, bold, green);
      y -= titles.length * 16 + 5;
      for (const row of rows) paragraph(row.value, { size: row.size, color: row.value === reason ? green : muted });
      page.drawLine({ start: { x: MARGIN, y: y + 1 }, end: { x: A4[0] - MARGIN, y: y + 1 }, thickness: .5, color: rule }); y -= 17;
    }
  }
  ensure(130); heading('Final project total');
  paragraph(money(quote.total), { size: 25, font: bold, color: green, gap: 12 });
  if (quote.provisional) paragraph('Includes the provisional accounting-platform starting amount. Final scope and price depend on the selected provider and available API.', { size: 9, color: muted });
  ensure(185); heading('Optional modules not selected');
  paragraph('These modules are excluded from this quotation and its total.', { size: 9, color: muted });
  for (const [category, label] of [['launch', 'Launch modules'], ['addition', 'Possible additions']]) {
    const items = quote.unselectedModules.filter(item => item.category === category);
    ensure(65); paragraph(label, { font: bold, gap: 5 });
    paragraph(items.length ? items.map(item => item.title).join('; ') + '.' : 'None; all modules in this category are selected.', { size: 9, color: muted, gap: 12 });
  }
  ensure(64); paragraph('Acknowledgement', { size: 11, font: bold, color: green, gap: 6 });
  paragraph(quote.acknowledgement, { font: bold, gap: 5 });
  paragraph('This document is not proof of payment.', { size: 9, color: muted, gap: 0 });
  for (const [index, leaf] of document.getPages().entries()) {
    leaf.drawLine({ start: { x: MARGIN, y: 47 }, end: { x: A4[0] - MARGIN, y: 47 }, thickness: .5, color: rule });
    leaf.drawText(quote.reference, { x: MARGIN, y: 31, size: 8, font: regular, color: muted });
    const number = `${index + 1} / ${document.getPageCount()}`;
    leaf.drawText(number, { x: A4[0] - MARGIN - regular.widthOfTextAtSize(number, 8), y: 31, size: 8, font: regular, color: muted });
  }
  return document.save();
}

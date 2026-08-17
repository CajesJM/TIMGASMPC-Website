// Generates public/application-form.pdf — a printable membership application
// form. Dependency-free: builds a minimal valid PDF with computed xref offsets.
// Run with: node scripts/generate_application_form.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "application-form.pdf",
);

const W = 612; // US Letter
const H = 792;
const ML = 50;
const MR = 50;
const RIGHT = W - MR;
const top = (t) => (H - t).toFixed(2);
const esc = (text) =>
  text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const stream = [];
const text = (str, { size = 10, x = ML, y, color = "0.14 0.20 0.18", bold = false } = {}) => {
  stream.push(`${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${top(y)} Td (${esc(str)}) Tj ET`);
};
const rule = (x1, y, x2 = x1) => stream.push(`${x1} ${top(y)} m ${x2} ${top(y)} l S`);
const field = (caption, y, { size = 8.5 } = {}) => {
  text(caption, { size, y, color: "0.37 0.43 0.40" });
  rule(ML, y + 12, RIGHT);
};
const captioned = (caption, y, cols) => {
  text(caption, { size: 8.5, y, color: "0.37 0.43 0.40" });
  for (const [x1, x2] of cols) rule(x1, y + 12, x2);
};
const checkbox = (x, y, label) => {
  stream.push(`${x} ${(H - y - 9).toFixed(2)} 9 9 re S`);
  text(label, { size: 10, x: x + 16, y: y - 2 });
};

// --- Header ---------------------------------------------------------------
text("TIMGAS MULTI-PURPOSE COOPERATIVE", { size: 16, y: 60, color: "0.07 0.25 0.18", bold: true });
text("Membership Application Form", { size: 12, y: 82, color: "0.64 0.55 0.15" });
text("Purok 5, Poblacion, Trinidad, Bohol, Philippines  |  timgascooperative@gmail.com  |  +63 938 224 2376", { size: 8.5, y: 100, color: "0.37 0.43 0.40" });
rule(ML, 112, RIGHT);

// --- Personal information --------------------------------------------------
text("1. PERSONAL INFORMATION", { size: 11, y: 138, color: "0.07 0.25 0.18", bold: true });
captioned("Full name (Last name, First name, Middle initial)", 156, [[ML, 250], [250, 420], [420, RIGHT]]);
captioned("Birth date", 196, [[ML, 210]]);
captioned("Sex", 196, [[220, 320]]);
captioned("Age", 196, [[330, 400]]);
field("Complete home address", 236);
captioned("Mobile number", 276, [[ML, 300]]);
captioned("Email address (optional)", 276, [[310, RIGHT]]);
captioned("Occupation or livelihood", 316, [[ML, 300]]);
captioned("Source of income", 316, [[310, RIGHT]]);

// --- Application type ------------------------------------------------------
text("2. APPLICATION TYPE", { size: 11, y: 362, color: "0.07 0.25 0.18", bold: true });
checkbox(ML, 382, "Membership");
checkbox(200, 382, "Farm assistance");
checkbox(360, 382, "Loan inquiry");
text("Tick the box that best describes your application. You may write a short message at the back of this form if needed.", { size: 8.5, y: 412, color: "0.37 0.43 0.40" });

// --- Declaration -----------------------------------------------------------
text("3. DECLARATION", { size: 11, y: 446, color: "0.07 0.25 0.18", bold: true });
text("I declare that the information I have provided in this application is true and correct, and I agree to abide", { size: 8.5, y: 468, color: "0.14 0.20 0.18" });
text("by the bylaws, policies, and decisions of the TIMGAS Multi-Purpose Cooperative.", { size: 8.5, y: 482, color: "0.14 0.20 0.18" });
captioned("Signature over printed name", 530, [[ML, 330]]);
captioned("Date", 530, [[350, 470]]);

// --- Footer ----------------------------------------------------------------
rule(ML, 620, RIGHT);
text("Submit this form together with the required documents at the cooperative office. Office hours: Monday to Saturday, 8:00 AM to 5:00 PM.", { size: 8.5, y: 638, color: "0.37 0.43 0.40" });
text("For office use only: received by ____________ on ____________  |  application no. ____________", { size: 8.5, y: 656, color: "0.37 0.43 0.40" });

const content = stream.join("\n");
const objects = {
  1: "<< /Type /Catalog /Pages 2 0 R >>",
  2: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  3: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
  4: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  5: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  6: `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
};

let body = "%PDF-1.4\n";
const offsets = [0];
for (const num of [1, 2, 3, 4, 5, 6]) {
  offsets[num] = body.length;
  body += `${num} 0 obj\n${objects[num]}\nendobj\n`;
}
const xrefOffset = body.length;
let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
for (let i = 1; i < offsets.length; i++) {
  xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
const pdf = body + xref + trailer;
writeFileSync(OUT, pdf, "latin1");

// --- Self-check: every object must start at its declared xref offset --------
const written = readFileSync(OUT, "latin1");
const lines = written.split("\n");
let ok = true;
for (let i = 1; i < offsets.length; i++) {
  const at = written.slice(offsets[i], offsets[i] + 7);
  if (at !== `${i} 0 obj`) {
    ok = false;
    console.error(`Object ${i} not found at offset ${offsets[i]} (got "${at}")`);
  }
}
if (!written.startsWith("%PDF-1.4") || !written.trimEnd().endsWith("%%EOF")) {
  ok = false;
  console.error("PDF header/footer markers missing");
}
if (!ok) process.exit(1);
console.log(`Wrote ${OUT} (${written.length} bytes, ${lines.length} lines)`);

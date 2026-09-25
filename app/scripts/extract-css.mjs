// Trích CSS đã khóa từ bản mẫu sang app thật, bỏ phần chỉ dành cho bản mẫu.
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../../prototype/ban-mau-dam-hieu.html', import.meta.url), 'utf8');
const s = src.indexOf('<style>\n:root{'), e = src.indexOf('</style>', s);
let css = src.slice(s + 7, e);
const dropPrefixes = ['.proto', '.proto-ctl', '.seg', '.pbtn', '.codes', '.code', '.stage', '.phone-frame', '.desk-frame', '.proto-panel', '.pp-row', '#admMap', '@media (max-width:760px){.proto'];
// So khớp đúng tên lớp: bỏ .seg nhưng giữ .segin
const isDropped = l => {
  const t = l.trim();
  return dropPrefixes.some(p => t.startsWith(p) && !/[\w-]/.test(t.charAt(p.length)));
};
css = css.split('\n').filter(l => !isDropped(l)).join('\n');
css = css.replace('/* ---------- Prototype toolbar ---------- */', '');
const base = `/* Nguồn: prototype/ban-mau-dam-hieu.html (LOCK_PRODUCT_EXPERIENCE). Không sửa token nếu chưa hủy khóa trải nghiệm. */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Noto+Serif:wght@500;600&display=swap');
html,body,#root{height:100%;margin:0}
[hidden]{display:none!important}
img{max-width:100%}
a.btn{text-decoration:none;color:inherit}
a.btn.primary{color:var(--primary-ink)}

`;
fs.mkdirSync(new URL('../src/styles/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../src/styles/app.css', import.meta.url), base + css);
console.log('CSS lines:', (base + css).split('\n').length);

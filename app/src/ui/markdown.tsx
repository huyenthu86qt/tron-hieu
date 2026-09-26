// Hiển thị nội dung bài viết Góc bình an: định dạng gọn, an toàn (không chèn HTML).
// Hỗ trợ: đoạn văn, “## Tiêu đề”, “### Tiêu đề nhỏ”, danh sách “- …”, **đậm**, *nghiêng*.
import { Fragment, type ReactNode } from 'react';

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(m[1] !== undefined ? <b key={i++}>{m[1]}</b> : <i key={i++}>{m[2]}</i>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return (
    <div className="article-body">
      {blocks.map((b, k) => {
        if (b.startsWith('### ')) return <h3 key={k}>{inline(b.slice(4))}</h3>;
        if (b.startsWith('## ')) return <h2 key={k}>{inline(b.slice(3))}</h2>;
        const lines = b.split('\n');
        if (lines.every(l => /^\s*[-•]\s+/.test(l))) return <ul key={k}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>)}</ul>;
        return <p key={k}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

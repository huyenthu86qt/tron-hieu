// Tên tệp bấm được để mở (tệp đã lưu trên máy chủ). Tệp chỉ ghi tên (bản chạy thử) hiện chữ thường.
import { useState } from 'react';
import { openStored, type Bucket } from '../repo/files';
import { useApp } from './common';

export function FileName({ name, path, bucket = 'case-files' }: { name: string; path?: string; bucket?: Bucket }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  if (!path) return <>{name}</>;
  return (
    <button type="button" className="file-link" disabled={busy} title="Mở tệp"
      onClick={async e => {
        e.stopPropagation();
        setBusy(true);
        try { await openStored(bucket, path); } catch (err) { toast((err as Error).message); } finally { setBusy(false); }
      }}>{name}</button>
  );
}

/** Tải tệp lên kèm thông báo đang tải / lỗi; trả về null nếu lỗi */
export function useUploader() {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setBusy(true);
    toast('Đang tải tệp lên…');
    try { return await fn(); } catch (err) { toast((err as Error).message); return null; } finally { setBusy(false); }
  };
  return { busy, run };
}

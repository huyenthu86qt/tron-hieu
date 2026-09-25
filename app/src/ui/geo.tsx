// Tìm vị trí từ địa chỉ (Phase 3b) — dịch vụ tìm địa chỉ miễn phí Photon (dữ liệu OpenStreetMap), giới hạn trong Việt Nam.
// (Nominatim bị chặn ở một số mạng tại Việt Nam nên không dùng.)
// Chỉ gửi đúng chuỗi địa chỉ người dùng nhập, khi người dùng bấm tìm; không gửi tên người, số điện thoại.
import { useState } from 'react';
import type { GeoPoint } from '../domain/types';
import { Icon } from './Icon';

interface Place { label: string; geo: GeoPoint }

async function searchAddress(q: string): Promise<Place[]> {
  const url = `https://photon.komoot.io/api/?limit=5&lang=default&bbox=102.1,8.2,109.5,23.4&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('Dịch vụ tìm địa chỉ đang bận. Thử lại sau ít phút, hoặc dùng vị trí hiện tại.');
  type P = { name?: string; housenumber?: string; street?: string; locality?: string; district?: string; city?: string; county?: string; state?: string; countrycode?: string };
  const j = (await r.json()) as { features: { properties: P; geometry: { coordinates: [number, number] } }[] };
  return j.features
    .filter(f => !f.properties.countrycode || f.properties.countrycode === 'VN')
    .map(({ properties: p, geometry: { coordinates: [lng, lat] } }) => {
      const street = [p.housenumber, p.street].filter(Boolean).join(' ');
      const parts = [p.name, street, p.locality, p.district, p.city ?? p.county, p.state].filter((x, i, a): x is string => !!x && a.indexOf(x) === i);
      return { label: parts.join(', '), geo: { lat, lng } };
    });
}

/** Nút “Tìm vị trí từ địa chỉ”: hiện tối đa 5 kết quả để chọn đúng chỗ */
export function AddressFinder({ address, onPick }: { address: string; onPick: (g: GeoPoint, label: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Place[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const find = async () => {
    const q = address.trim();
    if (q.length < 6) { setErr('Nhập địa chỉ đầy đủ hơn (đường, phường/xã, quận/huyện, tỉnh) rồi tìm.'); return; }
    setBusy(true); setErr(null); setList(null);
    try {
      let r = await searchAddress(q);
      // Không thấy thì bỏ bớt phần đầu (số nhà, ngõ) và tìm lại
      if (!r.length && q.includes(',')) r = await searchAddress(q.split(',').slice(1).join(','));
      if (!r.length) setErr('Không tìm thấy địa chỉ này. Thử ghi rõ phường/xã, quận/huyện, tỉnh — hoặc dùng vị trí hiện tại.');
      setList(r);
    } catch (e) {
      setErr((e as Error).message === 'Failed to fetch' ? 'Mất kết nối mạng. Kiểm tra mạng rồi thử lại.' : (e as Error).message);
    } finally { setBusy(false); }
  };
  return (
    <div className="stack" style={{ gap: 6 }}>
      <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={find} disabled={busy}><Icon n="search" c="sm" />{busy ? 'Đang tìm…' : 'Tìm vị trí từ địa chỉ'}</button>
      {err && <p className="muted" style={{ color: 'var(--danger)' }}>{err}</p>}
      {list && list.length > 0 && (
        <div className="list" style={{ border: '1px solid var(--border)', borderRadius: 10 }} role="listbox" aria-label="Kết quả tìm địa chỉ">
          {list.map((p, i) => (
            <button type="button" key={i} className="row" style={{ textAlign: 'left' }} onClick={() => { onPick(p.geo, p.label); setList(null); }}>
              <Icon n="pin" c="sm" /><span className="grow" style={{ fontSize: 14 }}>{p.label}</span>
            </button>
          ))}
        </div>
      )}
      <p className="note">Chọn đúng kết quả gần nhất. Tìm bằng dữ liệu bản đồ mở OpenStreetMap (Photon).</p>
    </div>
  );
}

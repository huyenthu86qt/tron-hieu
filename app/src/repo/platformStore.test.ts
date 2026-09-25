import { beforeAll, describe, expect, it } from 'vitest';

// Kho trên máy dùng localStorage — giả lập cho môi trường test
beforeAll(() => {
  const m = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: k => m.get(k) ?? null, setItem: (k, v) => void m.set(k, String(v)), removeItem: k => void m.delete(k), clear: () => m.clear(), key: i => [...m.keys()][i] ?? null, get length() { return m.size; },
  } as Storage;
});

describe('Tài khoản trên máy (Phase 2)', () => {
  it('đăng ký cần OTP đúng; trùng số thì từ chối; đăng nhập, khóa tạm, lấy lại mật khẩu, đăng xuất mọi thiết bị', async () => {
    const S = await import('./platformStore');
    expect(S.sendOtp('0123', 'register').error).toBeTruthy();
    expect(S.sendOtp('0912 345 678', 'register').phone).toBe('0912345678');
    expect(await S.register('Nguyễn Minh Tuấn', '0912345678', 'matkhau123', '000000')).toMatch(/Mã chưa đúng|Mã/);
    expect(await S.register('Nguyễn Minh Tuấn', '0912345678', 'matkhau123', S.devOtpCode())).toBeNull();
    expect(S.currentUser()?.name).toBe('Nguyễn Minh Tuấn');
    expect(S.sendOtp('0912345678', 'register').error).toContain('đã đăng ký');

    S.logout();
    expect(S.currentUser()).toBeNull();
    expect(await S.login('0912345678', 'saimatkhau')).toContain('Còn 4 lần');
    for (let i = 0; i < 3; i++) await S.login('0912345678', 'saimatkhau');
    expect(await S.login('0912345678', 'saimatkhau')).toContain('tạm khóa');
    expect(await S.login('0912345678', 'matkhau123')).toContain('Thử lại sau');

    expect(S.sendOtp('0912345678', 'reset').phone).toBe('0912345678');
    expect(await S.resetPassword('0912345678', S.devOtpCode(), 'matkhaumoi1')).toBeNull();
    expect(S.currentUser()).not.toBeNull();
    S.logoutAll();
    expect(S.currentUser()).toBeNull();
    expect(await S.login('0912345678', 'matkhaumoi1')).toBeNull();
    expect(S.getPlatform().users[0].passHash).not.toContain('matkhau');
  });

  it('đặt đơn, giả lập ngân hàng báo đúng tiền thì đơn đã thanh toán; đơn chờ không tạo trùng', async () => {
    const S = await import('./platformStore');
    const r = await S.placeOrder('pre', { kind: 'pre', id: 'cb1', name: 'Hồ sơ' });
    expect(r.order?.status).toBe('pending');
    expect((await S.placeOrder('pre', { kind: 'pre', id: 'cb1', name: 'Hồ sơ' })).order?.code).toBe(r.order!.code);
    const tx = await S.simulateBankTx({ providerTxId: 'T1', amount: r.order!.amount, content: 'CK ' + r.order!.code });
    expect(tx.tx.status).toBe('matched');
    expect(S.getPlatform().orders.find(o => o.code === r.order!.code)!.status).toBe('paid');
    const again = await S.simulateBankTx({ providerTxId: 'T1', amount: r.order!.amount, content: r.order!.code });
    expect(again.duplicate).toBe(true);
    expect(S.getPlatform().audit.some(a => a.action === 'Khớp giao dịch')).toBe(true);
  });
});

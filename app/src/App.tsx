import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppFrame } from './ui/common';
import { FORCED_LOCAL, HAS_SERVER } from './repo/backend';
import { Ent01, Ent02, Ent03 } from './pages/EntryPages';
import { LinkPage, NotFound } from './pages/OtherPages';
import { ForgotPage, LoginPage, RegisterPage, RequireAuth } from './pages/AuthPages';
import { AccountPage, HomePage, NotificationsPage } from './pages/AccountPages';
import { CheckoutPage, OrderPage } from './pages/CheckoutPages';
import { PrivacyPage, TermsPage } from './pages/LegalPages';
import {
  PreActivatePage, PreBudgetPage, PreContactsPage, PreDocsPage, PreInfoPage, PreListPage, PreNewPage, PreOverviewPage, PreSharePage, PreWishPage,
} from './pages/PrePages';
import {
  AdminAccessPage, AdminAuditPage, AdminHomePage, AdminLoginPage, AdminOrdersPage, AdminProductsPage, AdminSepayPage, AdminUnmatchedPage,
  AdminUserPage, AdminUsersPage, AdminVendorCandidatesPage, AdminVendorEditPage, AdminVendorsPage,
} from './pages/AdminPages';
import { CaseLayout } from './case/CaseLayout';
import { NowPage } from './case/pages/NowPage';
import { MapPage } from './case/pages/MapPage';
import { TaskPage } from './case/pages/TaskPage';
import { ChangePage, DecisionHistoryPage, DecisionPage, DecisionsPage } from './case/pages/DecisionPages';
import { TeamPage } from './case/pages/TeamPage';
import { ProfilePage } from './case/pages/ProfilePage';
import { Paywall } from './case/Paywall';
import { SuggestPage, VendorDetailPage, VendorsPage } from './case/pages/VendorPages';
import { BudgetPage, DebtsPage, ExpensesPage, FinancePage, LedgerPage, ReconcilePage } from './case/pages/FinancePages';
import { ComposePage, GuestListPage, GuestsPage, PublicPage, ShiftPage } from './case/pages/GuestPages';
import { AfterPage, ClosePage, MilestonePage, MilestonesPage, ProceduresPage, ThanksPage } from './case/pages/AfterPages';
import { DocsPage, HistoryPage, IntakePage, MyTasksPage, SettingsPage } from './case/pages/MiscPages';

// Trang dựng dữ liệu mẫu: có khi chạy thử trên máy, hoặc bản xem thử online bật VITE_DEMO=1. Bản thật cho khách không có.
const DemoPage = import.meta.env.DEV || import.meta.env.VITE_DEMO === '1' ? lazy(() => import('./dev/DemoPage')) : null;

const A = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;
const AD = (el: ReactNode) => <RequireAuth admin>{el}</RequireAuth>;

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        {HAS_SERVER && FORCED_LOCAL && <div role="status" className="demo-bar">Đang xem dữ liệu mẫu trên trình duyệt này (không phải tài khoản thật). <a href="/mau">Thoát chế độ xem mẫu</a></div>}
        <Routes>
          {/* Lối vào — không cần đăng nhập */}
          <Route path="/" element={<Ent01 />} />
          <Route path="/bat-dau/hoan-canh" element={<Ent02 />} />
          <Route path="/bat-dau/viec-ngay" element={<Ent03 />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPage />} />
          <Route path="/dieu-khoan" element={<TermsPage />} />
          <Route path="/bao-mat" element={<PrivacyPage />} />
          <Route path="/l/:token" element={<LinkPage />} />
          <Route path="/t/:slug" element={<PublicPage />} />
          {DemoPage && <Route path="/mau" element={<Suspense fallback={null}><DemoPage /></Suspense>} />}

          {/* Không gian của tôi */}
          <Route path="/app" element={A(<HomePage />)} />
          <Route path="/thong-bao" element={A(<NotificationsPage />)} />
          <Route path="/tai-khoan" element={A(<AccountPage />)} />
          <Route path="/checkout" element={A(<CheckoutPage />)} />
          <Route path="/checkout/don/:code" element={A(<OrderPage />)} />
          <Route path="/chuan-bi" element={A(<PreListPage />)} />
          <Route path="/chuan-bi/moi" element={A(<PreNewPage />)} />
          <Route path="/chuan-bi/:pid" element={A(<PreOverviewPage />)} />
          <Route path="/chuan-bi/:pid/thong-tin" element={A(<PreInfoPage />)} />
          <Route path="/chuan-bi/:pid/nguyen-vong" element={A(<PreWishPage />)} />
          <Route path="/chuan-bi/:pid/lien-he" element={A(<PreContactsPage />)} />
          <Route path="/chuan-bi/:pid/giay-to" element={A(<PreDocsPage />)} />
          <Route path="/chuan-bi/:pid/ngan-sach" element={A(<PreBudgetPage />)} />
          <Route path="/chuan-bi/:pid/chia-se" element={A(<PreSharePage />)} />
          <Route path="/chuan-bi/:pid/kich-hoat" element={A(<PreActivatePage />)} />

          {/* Đám hiếu */}
          <Route path="/dh/:id" element={A(<CaseLayout />)}>
            <Route index element={<NowPage />} />
            <Route path="ho-so" element={<ProfilePage />} />
            <Route path="tiep-nhan" element={<IntakePage />} />
            <Route path="viec-cua-toi" element={<MyTasksPage />} />
            <Route path="ban-do" element={<MapPage />} />
            <Route path="viec/:tid" element={<TaskPage />} />
            <Route path="can-quyet" element={<DecisionsPage />} />
            <Route path="quyet-dinh" element={<DecisionHistoryPage />} />
            <Route path="quyet-dinh/:did" element={<DecisionPage />} />
            <Route path="quyet-dinh/:did/thay-doi" element={<ChangePage />} />
            <Route path="doi" element={<TeamPage />} />
            <Route path="doi/mo-day-du" element={<Paywall module="Đội đám hiếu" />} />
            <Route path="nha-cung-cap" element={<VendorsPage />} />
            <Route path="nha-cung-cap/goi-y/:hm" element={<SuggestPage />} />
            <Route path="nha-cung-cap/:vid" element={<VendorDetailPage />} />
            <Route path="tai-chinh" element={<FinancePage />} />
            <Route path="tai-chinh/ngan-sach" element={<BudgetPage />} />
            <Route path="tai-chinh/khoan-chi" element={<ExpensesPage />} />
            <Route path="tai-chinh/cong-no" element={<DebtsPage />} />
            <Route path="tai-chinh/phung-vieng" element={<LedgerPage />} />
            <Route path="tai-chinh/doi-soat" element={<ReconcilePage />} />
            <Route path="khach-vieng" element={<GuestsPage />} />
            <Route path="khach-vieng/trang-tin" element={<ComposePage />} />
            <Route path="khach-vieng/danh-sach" element={<GuestListPage />} />
            <Route path="khach-vieng/ban-giao" element={<ShiftPage />} />
            <Route path="hau-tang" element={<AfterPage />} />
            <Route path="hau-tang/thu-tuc" element={<ProceduresPage />} />
            <Route path="hau-tang/moc" element={<MilestonesPage />} />
            <Route path="hau-tang/moc/:mid" element={<MilestonePage />} />
            <Route path="hau-tang/cam-on" element={<ThanksPage />} />
            <Route path="hau-tang/khep-vong" element={<ClosePage />} />
            <Route path="tai-lieu" element={<DocsPage />} />
            <Route path="lich-su" element={<HistoryPage />} />
            <Route path="cai-dat" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Quản trị */}
          <Route path="/admin/dang-nhap" element={<AdminLoginPage />} />
          <Route path="/admin" element={AD(<AdminHomePage />)} />
          <Route path="/admin/nguoi-dung" element={AD(<AdminUsersPage />)} />
          <Route path="/admin/nguoi-dung/:uid" element={AD(<AdminUserPage />)} />
          <Route path="/admin/don-hang" element={AD(<AdminOrdersPage />)} />
          <Route path="/admin/quyen" element={AD(<AdminAccessPage />)} />
          <Route path="/admin/goi-gia" element={AD(<AdminProductsPage />)} />
          <Route path="/admin/sepay" element={AD(<AdminSepayPage />)} />
          <Route path="/admin/chua-khop" element={AD(<AdminUnmatchedPage />)} />
          <Route path="/admin/nha-cung-cap" element={AD(<AdminVendorsPage />)} />
          <Route path="/admin/nha-cung-cap/de-xuat" element={AD(<AdminVendorCandidatesPage />)} />
          <Route path="/admin/nha-cung-cap/:vid" element={AD(<AdminVendorEditPage />)} />
          <Route path="/admin/nhat-ky" element={AD(<AdminAuditPage />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}

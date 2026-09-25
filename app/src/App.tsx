import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppFrame } from './ui/common';
import { Ent01, Ent02, Ent03 } from './pages/EntryPages';
import { HomePage, LaterPage, LinkPage, NotFound } from './pages/OtherPages';
import { CaseLayout } from './case/CaseLayout';
import { NowPage } from './case/pages/NowPage';
import { MapPage } from './case/pages/MapPage';
import { TaskPage } from './case/pages/TaskPage';
import { ChangePage, DecisionPage, DecisionsPage } from './case/pages/DecisionPages';
import { TeamPage } from './case/pages/TeamPage';
import { ProfilePage } from './case/pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<Ent01 />} />
          <Route path="/bat-dau/hoan-canh" element={<Ent02 />} />
          <Route path="/bat-dau/viec-ngay" element={<Ent03 />} />
          <Route path="/app" element={<HomePage />} />
          <Route path="/l/:token" element={<LinkPage />} />
          <Route path="/dh/:id" element={<CaseLayout />}>
            <Route index element={<NowPage />} />
            <Route path="ho-so" element={<ProfilePage />} />
            <Route path="ban-do" element={<MapPage />} />
            <Route path="viec/:tid" element={<TaskPage />} />
            <Route path="can-quyet" element={<DecisionsPage />} />
            <Route path="quyet-dinh/:did" element={<DecisionPage />} />
            <Route path="quyet-dinh/:did/thay-doi" element={<ChangePage />} />
            <Route path="doi" element={<TeamPage />} />
            <Route path="nha-cung-cap/*" element={<LaterPage title="Nhà cung cấp" phase={2} />} />
            <Route path="tai-chinh/*" element={<LaterPage title="Tài chính" phase={2} />} />
            <Route path="khach-vieng/*" element={<LaterPage title="Khách viếng" phase={2} />} />
            <Route path="hau-tang/*" element={<LaterPage title="Hậu tang" phase={2} />} />
            <Route path="*" element={<LaterPage title="Trang này" phase={2} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}

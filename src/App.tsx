import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import GeneratePage from './pages/GeneratePage';
import LibraryPage from './pages/LibraryPage';
import PromptDetailPage from './pages/PromptDetailPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<GeneratePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:id" element={<PromptDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

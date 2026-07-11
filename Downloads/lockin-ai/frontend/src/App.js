import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Shell from '@/components/Shell';
import Dashboard from '@/pages/Dashboard';
import Resume from '@/pages/Resume';
import Settings from '@/pages/Settings';
import Mock from '@/pages/Mock';
import Coding from '@/pages/Coding';
import Files from '@/pages/Files';
import { StealthProvider } from '@/components/StealthProvider';
import StealthOverlay from '@/components/StealthOverlay';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <StealthProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/mock" element={<Mock />} />
            <Route path="/coding" element={<Coding />} />
            <Route path="/files" element={<Files />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <StealthOverlay />
        <Toaster theme="dark" position="top-center" />
      </StealthProvider>
    </BrowserRouter>
  );
}

export default App;

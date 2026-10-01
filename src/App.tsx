import { Navigate, Route, Routes } from 'react-router-dom';
import { Toast } from './components/Toast';
import { StoreProvider } from './store/StoreProvider';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { Placeholder } from './screens/Placeholder';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={<Navigate to="/onboarding" replace />} />
        <Route path="/legal/:slug" element={<Placeholder title="약관" />} />
        <Route path="/home" element={<Placeholder title="홈" />} />
        <Route path="/explore" element={<Placeholder title="탐색" />} />
        <Route path="/me" element={<Placeholder title="마이" />} />
        <Route path="/create" element={<Placeholder title="만들기" />} />
        <Route path="/sets" element={<Navigate to="/explore" replace />} />
        <Route path="/quiz" element={<Placeholder title="퀴즈" />} />
        <Route path="/watch" element={<Placeholder title="시청" />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toast />
    </StoreProvider>
  );
}

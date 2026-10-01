import { Navigate, Route, Routes } from 'react-router-dom';
import { Toast } from './components/Toast';
import { StoreProvider } from './store/StoreProvider';
import { ExploreScreen } from './screens/ExploreScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { StudyHomeScreen } from './screens/StudyHomeScreen';
import { WatchScreen } from './screens/WatchScreen';
import { Placeholder } from './screens/Placeholder';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={<Navigate to="/onboarding" replace />} />
        <Route path="/legal/:slug" element={<Placeholder title="약관" />} />
        <Route path="/home" element={<StudyHomeScreen />} />
        <Route path="/explore" element={<ExploreScreen />} />
        <Route path="/me" element={<Placeholder title="마이" />} />
        <Route path="/create" element={<Placeholder title="만들기" />} />
        <Route path="/sets" element={<Navigate to="/explore" replace />} />
        <Route path="/quiz" element={<Placeholder title="퀴즈" />} />
        <Route path="/watch" element={<WatchScreen />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toast />
    </StoreProvider>
  );
}

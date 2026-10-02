import { Navigate, Route, Routes } from 'react-router-dom';
import { Toast } from './components/Toast';
import { AuthProvider } from './store/auth';
import { StoreProvider } from './store/StoreProvider';
import { CreateShortsScreen } from './screens/CreateShortsScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { LegalScreen } from './screens/LegalScreen';
import { MeScreen } from './screens/MeScreen';
import { OAuthCallbackScreen } from './screens/OAuthCallbackScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { QuizScreen } from './screens/QuizScreen';
import { StudyHomeScreen } from './screens/StudyHomeScreen';
import { WatchScreen } from './screens/WatchScreen';

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          {/* OAuth 돌아오는 길 — 백엔드가 ?key=<교환 토큰> 을 붙여 보낸다 */}
          <Route path="/oauth/callback" element={<OAuthCallbackScreen />} />
          <Route path="/login" element={<Navigate to="/onboarding" replace />} />
          <Route path="/legal/:slug" element={<LegalScreen />} />
          <Route path="/home" element={<StudyHomeScreen />} />
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/me" element={<MeScreen />} />
          <Route path="/create" element={<CreateShortsScreen />} />
          <Route path="/sets" element={<Navigate to="/explore" replace />} />
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/watch" element={<WatchScreen />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
      <Toast />
    </StoreProvider>
  );
}
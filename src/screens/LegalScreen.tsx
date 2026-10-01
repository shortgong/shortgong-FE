import { Navigate, useParams } from 'react-router-dom';
import { LegalBody } from '../components/LegalBody';
import { TopBar } from '../components/TopBar';
import { LEGAL_DOCS, isLegalSlug } from '../data/legal';
import './LegalScreen.css';

export function LegalScreen() {
  const { slug } = useParams();
  /* 없는 문서는 온보딩으로 돌려보낸다 */
  if (!isLegalSlug(slug)) return <Navigate to="/onboarding" replace />;

  const doc = LEGAL_DOCS[slug];

  return (
    <div className="screen legal">
      <TopBar title={doc.title} />
      <div className="legal__scroll">
        <LegalBody doc={doc} />
      </div>
    </div>
  );
}

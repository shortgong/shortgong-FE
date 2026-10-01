import type { LegalDoc } from '../data/legal';

/** 약관 본문. `LegalDoc` 을 받아 조항 목록을 문단으로 렌더한다 */
export function LegalBody({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <p className="legal__effective">시행 {doc.effective}</p>
      <p className="legal__intro">{doc.intro}</p>

      {doc.sections.map((s) => (
        <section key={s.heading} className="legal__section">
          <h2 className="legal__heading">{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p} className="legal__para">
              {p}
            </p>
          ))}
        </section>
      ))}

      <p className="legal__foot">여기에 문서 끝 표기를 넣으세요</p>
    </>
  );
}

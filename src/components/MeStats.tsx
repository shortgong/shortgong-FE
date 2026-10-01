export type MeStat = { k: string; v: string };

/** 마이 상단 3칸 요약. 값은 목데이터이므로 포맷만 통일한다 */
export function MeStats({ stats }: { stats: readonly MeStat[] }) {
  return (
    <ul className="stats">
      {stats.map((s) => (
        <li className="stat" key={s.k}>
          <span className="stat__v t-title">{s.v}</span>
          <span className="stat__k t-caption-plain muted">{s.k}</span>
        </li>
      ))}
    </ul>
  );
}

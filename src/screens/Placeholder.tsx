import { TopBar } from '../components/TopBar';

type Props = {
  title: string;
};

/** 페이지가 아직 붙지 않은 경로의 임시 화면 */
export function Placeholder({ title }: Props) {
  return (
    <div className="screen">
      <TopBar title={title} back={false} />
      <div className="screen__body" />
    </div>
  );
}

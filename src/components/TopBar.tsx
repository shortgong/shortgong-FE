import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import './TopBar.css';

type Props = {
  title: string;
  /** 좌측에 뒤로가기 대신 커스텀 요소 */
  leading?: ReactNode;
  trailing?: ReactNode;
  /** true면 뒤로가기, false면 균형용 빈 공간 */
  back?: boolean;
  center?: boolean;
  onBack?: () => void;
};

export function TopBar({ title, leading, trailing, back = true, center = true, onBack }: Props) {
  const navigate = useNavigate();
  const go = () => (onBack ? onBack() : navigate(-1));

  return (
    <header className={`topbar ${center ? 'topbar--center' : ''}`}>
      <div className="topbar__slot topbar__slot--lead">
        {leading ??
          (back ? (
            <button type="button" className="topbar__icon" onClick={go} aria-label="뒤로 가기">
              <Icon name="back" size={23} />
            </button>
          ) : null)}
      </div>
      <h1 className="t-title topbar__title">{title}</h1>
      <div className="topbar__slot topbar__slot--trail">{trailing}</div>
    </header>
  );
}

type IconBtnProps = { icon: IconName; label: string; onClick?: () => void; tone?: 'plain' | 'brand' };

export function TopBarIcon({ icon, label, onClick, tone = 'plain' }: IconBtnProps) {
  return (
    <button type="button" className={`topbar__icon ${tone === 'brand' ? 'is-brand' : ''}`} onClick={onClick} aria-label={label}>
      <Icon name={icon} size={22} />
    </button>
  );
}

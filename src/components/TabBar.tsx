import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import './TabBar.css';

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/home', label: '홈', icon: 'nav-home' },
  { to: '/explore', label: '탐색', icon: 'nav-compass' },
  { to: '/me', label: '마이', icon: 'nav-user' },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/home'}
          className={({ isActive }) => `tabbar__item ${isActive ? 'is-active' : ''}`}
        >
          <span className="tabbar__icon" aria-hidden="true">
            <Icon name={t.icon} size={23} />
          </span>
          <span className="tabbar__label t-caption">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
  trailing?: ReactNode;
  full?: boolean;
  size?: 'md' | 'sm';
};

export function Button({
  variant = 'primary',
  icon,
  trailing,
  full = true,
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      <span className="btn__label">{children}</span>
      {trailing}
    </button>
  );
}

import { useState } from 'react';
import { Icon } from './Icon';

type Props = {
  name: string;
  /** 백엔드가 준 프로필 이미지. 없으면 이니셜로 대체한다 */
  imageUrl?: string | null;
};

export function MeProfile({ name, imageUrl }: Props) {
  /* 이미지가 404 면 깨진 아이콘이 얼굴 자리에 뜬다 — 실패를 기억해 아이콘으로 물러난다 */
  const [broken, setBroken] = useState(false);
  const initial = name.trim().slice(0, 1) || '?';

  return (
    <section className="profile">
      {imageUrl && !broken ? (
        <img className="profile__avatar" src={imageUrl} alt="" onError={() => setBroken(true)} decoding="async" />
      ) : (
        <span className="profile__avatar" aria-hidden="true">
          {imageUrl ? <Icon name="user" size={30} /> : initial}
        </span>
      )}
      <h2 className="t-title profile__name">{name}</h2>
    </section>
  );
}
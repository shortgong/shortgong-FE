import { Icon } from './Icon';

type Props = {
  name: string;
  tagline: string;
  onEdit: () => void;
};

export function MeProfile({ name, tagline, onEdit }: Props) {
  return (
    <section className="profile">
      <span className="profile__avatar" aria-hidden="true">
        <Icon name="user" size={30} />
      </span>
      <div className="profile__text">
        <h2 className="t-title profile__name">{name}</h2>
        <p className="t-caption-plain muted">{tagline}</p>
      </div>
      <button type="button" className="profile__edit t-label-plain" onClick={onEdit}>
        편집
      </button>
    </section>
  );
}

import { useStore } from '../store/context';
import './Toast.css';

export function Toast() {
  const { state, clearToast } = useStore();
  const toast = state.toast;
  if (!toast) return null;

  return (
    /* 노출/유지는 CSS 애니메이션이 담당하고, 끝나면 스토어에서 지운다.
       (setState 를 effect 에서 부르지 않음) */
    <div className="toast" role="status" aria-live="polite" key={toast.id} onAnimationEnd={clearToast}>
      {toast.text}
    </div>
  );
}

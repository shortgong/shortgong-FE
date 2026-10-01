import { useRef } from 'react';
import { Icon } from './Icon';

type Props = {
  file: string | null;
  disabled?: boolean;
  onPick: (name: string) => void;
  onClear: () => void;
};

const ACCEPT = 'image/*,.pdf,.txt';

/** 참고 자료 한 개. 첨부 전에는 업로드 버튼, 이후에는 파일명 행 */
export function CreateAttach({ file, disabled, onPick, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {file ? (
        <div className="attach">
          <span className="attach__thumb" aria-hidden="true">
            <Icon name="check" size={18} />
          </span>
          <span className="attach__name t-body">{file}</span>
          <button type="button" className="attach__x" aria-label="자료 삭제" onClick={onClear}>
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : (
        <button type="button" className="upload" onClick={() => fileRef.current?.click()} disabled={disabled}>
          <Icon name="upload" size={20} />
          <span className="t-label">자료 업로드</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f.name);
          e.target.value = '';
        }}
      />
    </>
  );
}

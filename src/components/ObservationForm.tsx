import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ObservationDraft } from '../types/plantDiary';

interface ObservationFormProps {
  onSubmit: (draft: ObservationDraft) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function ObservationForm({ onSubmit }: ObservationFormProps) {
  const photoReadId = useRef(0);
  const [date, setDate] = useState(today);
  const [heightCm, setHeightCm] = useState('5');
  const [note, setNote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [photoName, setPhotoName] = useState('');
  const [photoError, setPhotoError] = useState('');

  const parsedHeightCm = Number(heightCm);

  const canSubmit = useMemo(
    () =>
      date.length > 0 &&
      heightCm.trim().length > 0 &&
      Number.isFinite(parsedHeightCm) &&
      parsedHeightCm >= 0 &&
      note.trim().length > 0,
    [date, heightCm, note, parsedHeightCm]
  );

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const readId = photoReadId.current + 1;
    photoReadId.current = readId;
    setPhotoError('');

    if (!file) {
      setPhotoDataUrl(undefined);
      setPhotoName('');
      return;
    }

    setPhotoDataUrl(undefined);
    setPhotoName(file.name);

    try {
      const dataUrl = await readFileAsDataUrl(file);

      if (photoReadId.current !== readId) {
        return;
      }

      setPhotoDataUrl(dataUrl);
      setPhotoName(file.name);
    } catch {
      if (photoReadId.current !== readId) {
        return;
      }

      setPhotoDataUrl(undefined);
      setPhotoName('');
      setPhotoError('사진을 읽지 못했어요.');
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    photoReadId.current += 1;

    onSubmit({
      date,
      heightCm: Number(heightCm),
      note,
      photoDataUrl
    });

    setNote('');
    setPhotoDataUrl(undefined);
    setPhotoName('');
  };

  return (
    <form className="observation-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>관찰 날짜</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>
        <label>
          <span>식물의 키(cm)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={heightCm}
            onChange={(event) => setHeightCm(event.target.value)}
            required
          />
        </label>
      </div>
      <label>
        <span>관찰 내용</span>
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="잎, 줄기, 색깔, 흙의 상태를 자세히 적어 보세요."
          required
        />
      </label>
      <label className="photo-picker">
        <span>사진 추가</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        <small aria-live="polite">
          {photoError || photoName || '사진은 선택 사항입니다.'}
        </small>
      </label>
      <button type="submit" disabled={!canSubmit}>
        기록 저장
      </button>
    </form>
  );
}

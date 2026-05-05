import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import GrowthChart from './components/GrowthChart';
import ObservationForm from './components/ObservationForm';
import ObservationTimeline from './components/ObservationTimeline';
import {
  createObservation,
  exportObservationBackup,
  loadObservations,
  parseObservationBackup,
  saveObservations
} from './lib/observationStorage';
import type { ObservationDraft, PlantObservation } from './types/plantDiary';

const readTextFile = (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('file read failed'));
    reader.readAsText(file);
  });
};

export default function App() {
  const hasSkippedInitialSave = useRef(false);
  const [observations, setObservations] = useState<PlantObservation[]>(() =>
    loadObservations()
  );
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!hasSkippedInitialSave.current) {
      hasSkippedInitialSave.current = true;
      return;
    }

    saveObservations(observations);
  }, [observations]);

  const addObservation = (draft: ObservationDraft) => {
    setObservations((current) => [...current, createObservation(draft)]);
    setStatusMessage('관찰 기록을 저장했어요.');
  };

  const deleteObservation = (id: string) => {
    setObservations((current) => current.filter((item) => item.id !== id));
    setStatusMessage('관찰 기록을 삭제했어요.');
  };

  const exportBackup = () => {
    const backup = exportObservationBackup(observations);
    const blob = new Blob([backup], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = `plant-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(objectUrl);
    setStatusMessage('백업 파일을 저장했어요.');
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const importedObservations = parseObservationBackup(await readTextFile(file));
      setObservations(importedObservations);
      setStatusMessage('백업 기록을 불러왔어요.');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : '백업 파일을 읽지 못했어요.'
      );
    } finally {
      event.target.value = '';
    }
  };

  return (
    <main className="app-shell">
      <header className="app-hero">
        <p className="eyebrow">3~4학년 과학 · 식물의 한살이</p>
        <h1>초록 쑥쑥! 우리 반 식물 관찰 일기</h1>
        <p>
          날짜, 키, 관찰 내용을 차곡차곡 기록하며 식물이 언제 크게 자라는지
          그래프로 확인해요.
        </p>
      </header>

      <GrowthChart observations={observations} />

      <section className="workspace" aria-label="식물 관찰 입력과 기록">
        <div className="control-stack">
          <ObservationForm onSubmit={addObservation} />
          <section className="backup-panel" aria-label="관찰 기록 백업">
            <div className="section-heading">
              <p className="eyebrow">백업</p>
              <h2>기록 저장과 복원</h2>
            </div>
            <div className="backup-actions">
              <button
                type="button"
                disabled={observations.length === 0}
                onClick={exportBackup}
              >
                백업 저장
              </button>
              <label className="backup-import">
                <span>백업 불러오기</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  aria-label="백업 불러오기"
                  onChange={importBackup}
                />
              </label>
            </div>
            <p className="backup-copy">
              장기 관찰 전후에는 JSON 파일로 기록을 보관해요.
            </p>
          </section>
        </div>
        <ObservationTimeline
          observations={observations}
          onDelete={deleteObservation}
        />
        <p className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </p>
      </section>
    </main>
  );
}

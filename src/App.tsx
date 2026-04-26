import { useEffect, useRef, useState } from 'react';
import GrowthChart from './components/GrowthChart';
import ObservationForm from './components/ObservationForm';
import ObservationTimeline from './components/ObservationTimeline';
import {
  createObservation,
  loadObservations,
  saveObservations
} from './lib/observationStorage';
import type { ObservationDraft, PlantObservation } from './types/plantDiary';

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
        <ObservationForm onSubmit={addObservation} />
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

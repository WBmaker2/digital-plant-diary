import { useEffect, useState } from 'react';
import ObservationForm from './components/ObservationForm';
import {
  createObservation,
  loadObservations,
  saveObservations
} from './lib/observationStorage';
import type { ObservationDraft, PlantObservation } from './types/plantDiary';

export default function App() {
  const [observations, setObservations] = useState<PlantObservation[]>(() =>
    loadObservations()
  );

  useEffect(() => {
    saveObservations(observations);
  }, [observations]);

  const addObservation = (draft: ObservationDraft) => {
    setObservations((current) => [...current, createObservation(draft)]);
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

      <section className="workspace" aria-label="식물 관찰 입력과 기록">
        <ObservationForm onSubmit={addObservation} />
        <section aria-label="식물 관찰 타임라인">
          {observations.map((item) => (
            <article className="note-card" key={item.id}>
              <time dateTime={item.date}>{item.date}</time>
              <strong>{item.heightCm}cm</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

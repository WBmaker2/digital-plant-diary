import {
  createObservation,
  loadObservations,
  saveObservations,
  clearObservations
} from './observationStorage';

describe('observationStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an observation with a stable id and ISO createdAt value', () => {
    const observation = createObservation({
      date: '2026-04-26',
      heightCm: 12.5,
      note: '잎이 두 장 더 자랐어요.',
      photoDataUrl: 'data:image/png;base64,abc'
    });

    expect(observation.id).toMatch(/^plant-/);
    expect(observation.date).toBe('2026-04-26');
    expect(observation.heightCm).toBe(12.5);
    expect(observation.note).toBe('잎이 두 장 더 자랐어요.');
    expect(observation.photoDataUrl).toBe('data:image/png;base64,abc');
    expect(new Date(observation.createdAt).toString()).not.toBe('Invalid Date');
  });

  it('saves and loads observations sorted by date', () => {
    const later = createObservation({
      date: '2026-04-28',
      heightCm: 15,
      note: '줄기가 곧아졌어요.'
    });
    const earlier = createObservation({
      date: '2026-04-26',
      heightCm: 11,
      note: '떡잎이 보였어요.'
    });

    saveObservations([later, earlier]);

    expect(loadObservations().map((item) => item.date)).toEqual([
      '2026-04-26',
      '2026-04-28'
    ]);
  });

  it('returns an empty array when stored JSON is broken', () => {
    localStorage.setItem('digital-plant-diary:observations', '{broken json');

    expect(loadObservations()).toEqual([]);
  });

  it('clears saved observations', () => {
    saveObservations([
      createObservation({
        date: '2026-04-26',
        heightCm: 10,
        note: '처음 심었어요.'
      })
    ]);

    clearObservations();

    expect(loadObservations()).toEqual([]);
  });
});

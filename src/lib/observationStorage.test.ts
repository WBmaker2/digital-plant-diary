import {
  OBSERVATION_STORAGE_KEY,
  createObservation,
  loadObservations,
  saveObservations,
  clearObservations
} from './observationStorage';

describe('observationStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it.each([
    [Number.NaN, 0],
    [Infinity, 0],
    [-Infinity, 0],
    [-4, 0],
    [8.25, 8.25]
  ])('normalizes heightCm from %s to %s', (heightCm, expectedHeightCm) => {
    const observation = createObservation({
      date: '2026-04-26',
      heightCm,
      note: '키를 확인했어요.'
    });

    expect(observation.heightCm).toBe(expectedHeightCm);
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
    localStorage.setItem(OBSERVATION_STORAGE_KEY, '{broken json');

    expect(loadObservations()).toEqual([]);
  });

  it('returns an empty array when reading from storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(loadObservations()).toEqual([]);
  });

  it('does not throw when saving to storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => {
      saveObservations([
        createObservation({
          date: '2026-04-26',
          heightCm: 10,
          note: '처음 심었어요.'
        })
      ]);
    }).not.toThrow();
  });

  it('does not throw when clearing storage fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => {
      clearObservations();
    }).not.toThrow();
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

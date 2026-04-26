import type { ObservationDraft, PlantObservation } from '../types/plantDiary';

export const OBSERVATION_STORAGE_KEY = 'digital-plant-diary:observations';

const isObservation = (value: unknown): value is PlantObservation => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as PlantObservation;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    Number.isFinite(candidate.heightCm) &&
    typeof candidate.note === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.photoDataUrl === undefined ||
      typeof candidate.photoDataUrl === 'string')
  );
};

export const sortObservations = (
  observations: PlantObservation[]
): PlantObservation[] =>
  [...observations].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    return dateCompare === 0 ? a.createdAt.localeCompare(b.createdAt) : dateCompare;
  });

export const createObservation = (
  draft: ObservationDraft,
  now = new Date()
): PlantObservation => ({
  id: `plant-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
  date: draft.date,
  heightCm: Math.max(0, Number(draft.heightCm)),
  note: draft.note.trim(),
  photoDataUrl: draft.photoDataUrl,
  createdAt: now.toISOString()
});

export const loadObservations = (): PlantObservation[] => {
  const raw = localStorage.getItem(OBSERVATION_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortObservations(parsed.filter(isObservation)) : [];
  } catch {
    return [];
  }
};

export const saveObservations = (observations: PlantObservation[]) => {
  localStorage.setItem(
    OBSERVATION_STORAGE_KEY,
    JSON.stringify(sortObservations(observations))
  );
};

export const clearObservations = () => {
  localStorage.removeItem(OBSERVATION_STORAGE_KEY);
};

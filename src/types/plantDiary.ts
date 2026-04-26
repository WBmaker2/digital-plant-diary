export interface PlantObservation {
  id: string;
  date: string;
  heightCm: number;
  note: string;
  photoDataUrl?: string;
  createdAt: string;
}

export interface ObservationDraft {
  date: string;
  heightCm: number;
  note: string;
  photoDataUrl?: string;
}

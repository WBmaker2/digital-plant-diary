import type { PlantObservation } from '../types/plantDiary';
import { sortObservations } from './observationStorage';

export interface GrowthChartData {
  labels: string[];
  values: number[];
}

export interface FastestGrowth {
  from: string;
  to: string;
  growthCm: number;
}

export interface GrowthSummary {
  totalGrowthCm: number;
  fastestGrowth: FastestGrowth | null;
}

const formatDateLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
};

export const buildGrowthChartData = (
  observations: PlantObservation[]
): GrowthChartData => {
  const sorted = sortObservations(observations);

  return {
    labels: sorted.map((item) => formatDateLabel(item.date)),
    values: sorted.map((item) => item.heightCm)
  };
};

export const getLatestObservation = (
  observations: PlantObservation[]
): PlantObservation | null => {
  const sorted = sortObservations(observations);
  return sorted.length > 0 ? sorted[sorted.length - 1] : null;
};

export const getGrowthSummary = (
  observations: PlantObservation[]
): GrowthSummary => {
  const sorted = sortObservations(observations);

  if (sorted.length < 2) {
    return {
      totalGrowthCm: 0,
      fastestGrowth: null
    };
  }

  const latest = sorted[sorted.length - 1];
  const totalGrowthCm = Number(
    (latest.heightCm - sorted[0].heightCm).toFixed(1)
  );

  const fastestGrowth = sorted.slice(1).reduce<FastestGrowth | null>(
    (best, current, index) => {
      const previous = sorted[index];
      const growthCm = Number((current.heightCm - previous.heightCm).toFixed(1));

      if (!best || growthCm > best.growthCm) {
        return {
          from: previous.date,
          to: current.date,
          growthCm
        };
      }

      return best;
    },
    null
  );

  return {
    totalGrowthCm,
    fastestGrowth
  };
};

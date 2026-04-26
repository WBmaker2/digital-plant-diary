import type { PlantObservation } from '../types/plantDiary';
import {
  buildGrowthChartData,
  getGrowthSummary,
  getLatestObservation
} from './plantMetrics';

const observation = (
  date: string,
  heightCm: number,
  note = '관찰 기록'
): PlantObservation => ({
  id: `id-${date}`,
  date,
  heightCm,
  note,
  createdAt: `${date}T00:00:00.000Z`
});

describe('plantMetrics', () => {
  it('builds date labels and height values for Chart.js', () => {
    const data = buildGrowthChartData([
      observation('2026-04-28', 15),
      observation('2026-04-26', 10)
    ]);

    expect(data.labels).toEqual(['4/26', '4/28']);
    expect(data.values).toEqual([10, 15]);
  });

  it('finds the latest observation by date', () => {
    expect(
      getLatestObservation([
        observation('2026-04-26', 10),
        observation('2026-04-30', 18)
      ])?.heightCm
    ).toBe(18);
  });

  it('summarizes total growth and fastest interval', () => {
    const summary = getGrowthSummary([
      observation('2026-04-26', 8),
      observation('2026-04-28', 12),
      observation('2026-05-01', 13)
    ]);

    expect(summary.totalGrowthCm).toBe(5);
    expect(summary.fastestGrowth).toEqual({
      from: '2026-04-26',
      to: '2026-04-28',
      growthCm: 4
    });
  });

  it('returns zero summary when there are not enough observations', () => {
    expect(getGrowthSummary([observation('2026-04-26', 8)])).toEqual({
      totalGrowthCm: 0,
      fastestGrowth: null
    });
  });
});

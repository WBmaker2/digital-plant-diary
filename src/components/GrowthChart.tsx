import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { buildGrowthChartData, getGrowthSummary } from '../lib/plantMetrics';
import type { PlantObservation } from '../types/plantDiary';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  observations: PlantObservation[];
}

export default function GrowthChart({ observations }: GrowthChartProps) {
  const chartData = buildGrowthChartData(observations);
  const summary = getGrowthSummary(observations);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: '식물의 키(cm)',
        data: chartData.values,
        borderColor: '#287a46',
        backgroundColor: 'rgba(66, 170, 104, 0.18)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f4c542',
        pointBorderColor: '#17452a',
        pointRadius: 5
      }
    ]
  };

  return (
    <section className="growth-panel" aria-label="식물 성장 그래프">
      <div className="section-heading">
        <p className="eyebrow">키(cm) 데이터</p>
        <h2>성장 그래프</h2>
      </div>
      {observations.length === 0 ? (
        <p className="empty-copy">첫 기록을 저장하면 그래프가 나타나요.</p>
      ) : (
        <>
          <div className="chart-frame">
            <Line
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y}cm`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: '키(cm)'
                    }
                  }
                }
              }}
            />
          </div>
          <p className="growth-summary">
            지금까지 {summary.totalGrowthCm}cm 자랐어요.
          </p>
        </>
      )}
    </section>
  );
}

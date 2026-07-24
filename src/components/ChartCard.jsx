import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartCard = ({ title, data, labels, height = 300 }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: data,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#94a3b8'
      }
    },
    scales: {
      x: {
        grid: {
          color: '#334155'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: '#334155'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ChartCard;
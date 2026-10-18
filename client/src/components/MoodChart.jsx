import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MoodChart({ entries }) {
  const data = {
    labels: entries.map((e) => new Date(`${e.entry_date}T00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" })),
    datasets: [
      { label: "Mood", data: entries.map((e) => e.mood), borderColor: "#9b7cbb", backgroundColor: "#9b7cbb", tension: 0.3 },
      { label: "Stress", data: entries.map((e) => e.stress), borderColor: "#b39c57", backgroundColor: "#b39c57", tension: 0.3 },
      { label: "Energy", data: entries.map((e) => e.energy), borderColor: "#7c9ba4", backgroundColor: "#7c9ba4", tension: 0.3 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
    plugins: { legend: { position: "bottom" } },
  };

  return (
    <div style={{ height: "260px" }}>
      <Line data={data} options={options} />
    </div>
  );
}


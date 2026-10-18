import PageIntro from "../components/PageIntro.jsx";
const helplines = [
  { name: "Tele-MANAS (Government of India)", number: "14416 or 1-800-891-4416", note: "Free, 24 hours, many Indian languages" },
  { name: "Emergency services", number: "112", note: "If you or someone else is in immediate danger" },
];

export default function Help() {
  return (
    <div className="container py-5" style={{ maxWidth: "46rem" }}>
      <PageIntro eyebrow="SUPPORT WHEN YOU NEED IT" title={<>Get help</>} />
      <p className="lead text-secondary mb-4">
        If you're struggling, you don't have to work it out alone. Talking to someone trained can help,
        even if you're not sure what to say.
      </p>

      <div className="d-grid gap-3 mb-5">
        {helplines.map((h) => (
          <div className="cc-panel" key={h.name}>
            <div className="fw-bold">{h.name}</div>
            <div className="fs-4">{h.number}</div>
            <div className="text-secondary">{h.note}</div>
          </div>
        ))}
      </div>

      <h2 className="h4 mb-3">Reach out to someone soon if you</h2>
      <ul>
        <li>have felt low or hopeless for more than two weeks</li>
        <li>can't sleep, eat or study the way you normally do</li>
        <li>are thinking about hurting yourself</li>
        <li>are using alcohol or other substances to cope</li>
      </ul>
      <p className="text-secondary">
        Your college counselling cell is also a good place to start. Talking to them is confidential.
      </p>
    </div>
  );
}


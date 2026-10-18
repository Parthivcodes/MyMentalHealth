export default function PageIntro({ eyebrow, title, children }) {
  return (
    <header className="cc-page-intro">
      <div className="cc-page-intro-copy">
        <p className="cc-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </div>
      <img src="/images/wellness-sculpture.png" className="cc-page-sculpture" alt="" aria-hidden="true" />
      <span className="cc-intro-index" aria-hidden="true">CALM / CONNECT</span>
    </header>
  );
}

import PageIntro from "../components/PageIntro.jsx";
export default function Privacy() {
  return (
    <div className="container py-5" style={{ maxWidth: "46rem" }}>
      <PageIntro eyebrow="BUILT AROUND YOUR TRUST" title={<>Privacy and terms</>} />
      <p className="text-secondary mb-5">
        CalmConnect is a college project. This page explains, in plain words, what we store and how we protect it.
      </p>

      <h2 className="h5">What we store</h2>
      <ul className="mb-4">
        <li>Your name, email and a hashed password. We never store the password itself.</li>
        <li>Your mood entries, journal entries and check-in results. Only you can see them.</li>
        <li>Community posts and replies, shown under your pen name.</li>
        <li>For helpers: the details you gave when applying, which an admin checks.</li>
      </ul>

      <h2 className="h5">Your pen name</h2>
      <p className="mb-4">
        Other users only ever see your pen name, never your real name or email. Our admins can link a pen name
        to an account, but only to deal with reports of abuse.
      </p>

      <h2 className="h5">Private chats with helpers</h2>
      <p className="mb-4">
        Chats are end-to-end encrypted in your browser before they are sent. Our server only stores scrambled
        text, so nobody at CalmConnect can read them. If you report a chat, only the messages you choose are
        shared with an admin. If you forget your password, your old chats can't be recovered.
      </p>

      <h2 className="h5">The AI assistant</h2>
      <p className="mb-4">
        Messages to the AI assistant are sent to Google Gemini to get a reply. They are not end-to-end encrypted
        and we don't save them. Avoid sharing your name or other personal details there.
      </p>

      <h2 className="h5">Terms of use</h2>
      <ul className="mb-4">
        <li>CalmConnect is a self-help tool. It does not diagnose and does not replace a doctor or therapist.</li>
        <li>Be kind in the community. Posts that harass, shame or threaten others will be removed.</li>
        <li>Helpers must be honest about their qualifications. False details lead to removal.</li>
        <li>In an emergency, don't wait for a reply here. Call 112, or Tele-MANAS on 14416.</li>
      </ul>

      <h2 className="h5">Deleting your data</h2>
      <p className="mb-0">
        You can delete your own posts and journal entries at any time. To delete your whole account, contact
        the project team.
      </p>
    </div>
  );
}


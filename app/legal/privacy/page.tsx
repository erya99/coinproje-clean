export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>
        ShillVote values your privacy and collects the minimum data required to
        operate the platform.
      </p>

      <h2>Data We Collect</h2>
      <ul>
        <li>
          Information you provide when submitting votes or coin requests (coin
          name, symbol, chain, etc.).
        </li>
        <li>
          Basic analytics and logging data for performance and security
          purposes.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We may use cookies to improve your experience and prevent abuse. You can
        manage cookies in your browser settings.
      </p>

      <h2>Third Parties</h2>
      <p>
        Limited data may be shared with third-party analytics or advertising
        providers. Their policies apply independently from ShillVote.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy-related inquiries, please reach out via our{" "}
        <a href="/legal/contact">Contact page</a>.
      </p>

      <p className="text-xs text-muted-foreground">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  );
}

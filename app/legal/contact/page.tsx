export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1>Contact</h1>
      <p>
        For feedback, business inquiries, or legal matters, please reach out to
        us using the following contact information:
      </p>
      <ul>
        <li>
          Email:{" "}
          <a href="mailto:hello@shillvote.com">hello@shillvote.com</a>
        </li>
        {/* You can add Telegram/Twitter links here if you want */}
      </ul>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1>Terms of Use</h1>
      <p>
        By using this website, you agree to the following terms and conditions.
      </p>

      <h2>Use of Service</h2>
      <ul>
        <li>
          You agree to use the platform in compliance with applicable laws and
          regulations.
        </li>
        <li>Automated or fraudulent voting is strictly prohibited.</li>
        <li>
          The service is provided “as is” without guarantees of availability or
          error-free operation.
        </li>
      </ul>

      <h2>User Content</h2>
      <p>
        Users are responsible for the content they submit. ShillVote reserves
        the right to remove inappropriate content and restrict access in case of
        violations.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        ShillVote shall not be held liable for any losses, damages, or claims
        arising from the use of the platform.
      </p>

      <p className="text-xs text-muted-foreground">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  );
}

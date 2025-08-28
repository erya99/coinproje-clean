export const dynamic = 'force-dynamic';

export default function DisclaimerPage() {
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1>Disclaimer</h1>
      <p>
        <strong>ShillVote</strong> is not a financial advisor. The data and user
        votes displayed on this platform are for informational purposes only and
        do not constitute investment advice.
      </p>

      <h2>Risk Warning</h2>
      <p>
        Cryptocurrencies are highly volatile assets. Do not make investment
        decisions without conducting your own research. All profits and losses
        are solely your responsibility.
      </p>

      <h2>Accuracy</h2>
      <p>
        Projects, logos, and external links may come from third parties.
        ShillVote does not guarantee their accuracy or reliability.
      </p>

      <p className="text-xs text-muted-foreground">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  );
}

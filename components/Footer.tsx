// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-12 text-xs text-muted-foreground">
      © {new Date().getFullYear()} ShillVote — not financial advice.
    </footer>
  );
}

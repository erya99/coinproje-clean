// components/CopyButton.tsx
'use client';

export default function CopyButton({ text }: { text: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error(e);
      alert('Copy failed');
    }
  }
  return (
    <button onClick={copy} className="underline text-xs">
      Copy
    </button>
  );
}

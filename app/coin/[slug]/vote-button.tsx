'use client';

type Props = { coinId: string };

export default function VoteButton({ coinId }: Props) {
  const vote = async () => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinId }),
    });
    if (!res.ok) alert('Oy gönderilirken hata!');
    else alert('Oyun kaydedildi, teşekkürler!');
  };

  return (
    <button
      onClick={vote}
      className="inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 hover:opacity-90"
    >
      Bugün Oy Ver
    </button>
  );
}

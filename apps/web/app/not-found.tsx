import Link from "next/link";

export default function NotFound() {
  return (
    <main className="screen center text-center">
      <p className="font-serif text-2xl text-ink mb-3">여긴 팔자에 없는 길이네요.</p>
      <p className="text-ink-muted mb-6">주소를 다시 확인해 주세요.</p>
      <Link href="/" className="tap inline-block rounded-card bg-ink text-hanji px-6 py-3">
        처음으로
      </Link>
    </main>
  );
}

"use client";

/** 전역 에러 바운더리 (§12.2 폴리시). 겁주지 않는 톤. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="screen center text-center">
      <p className="font-serif text-2xl text-ink mb-3">잠시 흐름이 엉켰어요.</p>
      <p className="text-ink-muted mb-6">잠깐 뒤 다시 시도하면 대개 풀립니다.</p>
      <button onClick={reset} className="tap rounded-card bg-ink text-hanji px-6 py-3">
        다시 시도
      </button>
    </main>
  );
}

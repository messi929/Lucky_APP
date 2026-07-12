/**
 * 디자인 프리미티브 (design-spec-v1.2.html 시안 공통 요소).
 * 낙관 스탬프·페이저 dots·먹 원(円) — 화면 재스킨의 공용 부품.
 */

/** 낙관 스탬프 (화면당 1개, 한자 어휘: 命眞問答運緣福吉曉) */
export function Stamp({ char, size = 36 }: { char: string; size?: 36 | 40 | 64 }) {
  return <span className={`stamp s${size}`}>{char}</span>;
}

/** 카드 진행 페이저 (0-indexed active) */
export function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="dots">
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i === active ? "on" : ""} />
      ))}
    </div>
  );
}

/** 먹 원 안에 큰 한자 (타입 카드·궁합) */
export function InkCircle({
  char,
  size = 220,
  bg = "var(--ink)",
}: {
  char: string;
  size?: number;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--serif)",
          fontWeight: 900,
          fontSize: size * 0.5,
          color: "var(--paper)",
        }}
      >
        {char}
      </span>
    </div>
  );
}

// 관계 유형 표시 미러 (단일 소스는 core RELATION_LABEL). 클라이언트 번들 경량화.
export const RELATIONS: { code: string; label: string; emoji: string }[] = [
  { code: "lover", label: "연인", emoji: "💞" },
  { code: "crush", label: "썸", emoji: "🌙" },
  { code: "friend", label: "친구", emoji: "🤝" },
  { code: "work", label: "직장", emoji: "🏢" },
  { code: "parent_child", label: "부모–자녀", emoji: "👪" },
  { code: "couple", label: "부부", emoji: "🏠" },
  { code: "sibling", label: "형제", emoji: "👫" },
];

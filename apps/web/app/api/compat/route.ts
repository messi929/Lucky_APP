import {
  computeCompat,
  computeSaju,
  dayMasterByStemIdx,
  RELATION_LABEL,
  type RelationType,
  type SajuInput,
} from "@lucky/core";
import { record } from "@/lib/events";
import {
  createCompat,
  createInvite,
  getCompat,
  getInput,
  getInvite,
} from "@/lib/store";

export const runtime = "nodejs";

type Body =
  | { action: "invite"; token: string; relation: RelationType }
  | { action: "solve"; inviteToken: string; birth: SajuInput }
  | { action: "invite_info"; inviteToken: string }
  | { action: "result"; compatToken: string };

/** POST /api/compat — 초대 생성 / 궁합 풀이 (§8.1) */
export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (body.action === "invite") {
    if (!(await getInput(body.token))) return Response.json({ error: "원본 없음" }, { status: 404 });
    const inviteToken = await createInvite(body.token, body.relation);
    record("compat_invite_created", { relation: body.relation });
    return Response.json({ inviteToken });
  }

  if (body.action === "solve") {
    const invite = await getInvite(body.inviteToken);
    if (!invite) return Response.json({ error: "초대를 찾을 수 없어요" }, { status: 404 });
    const aInput = await getInput(invite.ownerToken);
    if (!aInput) return Response.json({ error: "상대 원본 없음" }, { status: 404 });

    const result = computeCompat(
      computeSaju(aInput),
      computeSaju(body.birth),
      invite.relation,
    );
    const compatToken = await createCompat(invite.ownerToken, body.birth, invite.relation);
    record("compat_completed", { relation: invite.relation, grade: result.grade });
    return Response.json({ compatToken, result });
  }

  // 앱용 조회: 초대 정보(A 타입) — 수신자 랜딩
  if (body.action === "invite_info") {
    const invite = await getInvite(body.inviteToken);
    const aInput = invite ? await getInput(invite.ownerToken) : null;
    if (!invite || !aInput) return Response.json({ error: "초대를 찾을 수 없어요" }, { status: 404 });
    const chart = computeSaju(aInput);
    const ch = dayMasterByStemIdx(chart.saju.pillarDetails.day.stemIdx);
    return Response.json({
      ownerType: ch.name,
      ownerHanja: chart.saju.dayStem,
      relationLabel: RELATION_LABEL[invite.relation],
    });
  }

  // 앱용 조회: 궁합 결과 재계산 — 결과 화면
  if (body.action === "result") {
    const data = await getCompat(body.compatToken);
    const aInput = data ? await getInput(data.aToken) : null;
    if (!data || !aInput) return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
    const result = computeCompat(computeSaju(aInput), computeSaju(data.bInput), data.relation);
    return Response.json({
      result,
      aHanja: computeSaju(aInput).saju.dayStem,
      bHanja: computeSaju(data.bInput).saju.dayStem,
    });
  }

  return Response.json({ error: "알 수 없는 action" }, { status: 400 });
}

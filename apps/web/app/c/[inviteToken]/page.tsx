import { computeSaju, dayMasterByStemIdx, RELATION_LABEL } from "@lucky/core";
import Link from "next/link";
import { InviteLanding } from "@/components/InviteLanding";
import { record } from "@/lib/events";
import { getInput, getInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

/** /c/{inviteToken} — 궁합 초대 수신 (무조건 웹, 설치 요구 금지: 원칙 6) */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteToken: string }>;
}) {
  const { inviteToken } = await params;
  const invite = await getInvite(inviteToken);
  const aInput = invite ? await getInput(invite.ownerToken) : null;

  if (!invite || !aInput) {
    return (
      <main className="screen center text-center">
        <p className="font-serif text-2xl text-ink mb-4">초대를 찾지 못했어요.</p>
        <Link href="/" className="tap inline-block rounded-card bg-ink text-hanji px-6 py-3">
          내 사주 보러 가기
        </Link>
      </main>
    );
  }

  record("compat_invite_opened", { relation: invite.relation });
  const chart = computeSaju(aInput);
  const character = dayMasterByStemIdx(chart.saju.pillarDetails.day.stemIdx);

  return (
    <InviteLanding
      inviteToken={inviteToken}
      ownerType={character.name}
      ownerHanja={chart.saju.dayStem}
      relationLabel={RELATION_LABEL[invite.relation]}
    />
  );
}

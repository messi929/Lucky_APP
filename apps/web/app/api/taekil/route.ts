import { computeSaju, computeTaekil, type TaekilPurpose } from "@lucky/core";
import { record } from "@/lib/events";
import { getInput, isPaid } from "@/lib/store";

export const runtime = "nodejs";

/** POST /api/taekil — 택일 (유료 SKU). 순수 계산, LLM 0 (§3, §7.4) */
export async function POST(req: Request): Promise<Response> {
  let body: { token: string; purpose: TaekilPurpose; startDate: string; endDate: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const input = await getInput(body.token);
  if (!input) return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  if (!(await isPaid(body.token))) {
    return Response.json({ error: "택일 리포트는 결제 후 열려요." }, { status: 402 });
  }

  try {
    const result = computeTaekil({
      chart: computeSaju(input),
      purpose: body.purpose,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    record("taekil_computed", { purpose: body.purpose });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

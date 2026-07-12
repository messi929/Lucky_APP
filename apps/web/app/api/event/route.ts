import { record, recent } from "@/lib/events";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const { name, props } = (await req.json()) as { name: string; props?: Record<string, unknown> };
    if (typeof name === "string") record(name, props);
  } catch {
    /* noop */
  }
  return Response.json({ ok: true });
}

/** 디버그: 최근 이벤트 조회 */
export async function GET(): Promise<Response> {
  return Response.json({ events: recent() });
}

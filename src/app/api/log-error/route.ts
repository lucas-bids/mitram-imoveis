import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 8000;

type ClientErrorPayload = {
  message: string;
  stack?: string;
  digest?: string;
  scope: string;
  url?: string;
};

function isValidPayload(body: unknown): body is ClientErrorPayload {
  if (typeof body !== "object" || body === null) return false;
  const payload = body as Record<string, unknown>;
  return typeof payload.message === "string" && typeof payload.scope === "string";
}

function truncate(value: string | undefined) {
  if (!value) return value;
  return value.length > MAX_FIELD_LENGTH ? value.slice(0, MAX_FIELD_LENGTH) : value;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  logError(`client/${body.scope}`, new Error(truncate(body.message) as string), {
    digest: body.digest,
    clientStack: truncate(body.stack),
    url: body.url,
  });

  return NextResponse.json({ ok: true });
}

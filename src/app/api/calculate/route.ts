import { NextResponse } from "next/server";
import { calculateForMvp } from "@/application/calculate";
import { calculationInputSchema } from "@/domain/deadlines/schema";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 16_384) {
    return NextResponse.json(
      { error: "Requisição muito grande." },
      { status: 413 },
    );
  }
  try {
    const reader = request.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "Corpo JSON obrigatório." },
        { status: 400 },
      );
    const decoder = new TextDecoder();
    let size = 0;
    let text = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16_384) {
          await reader.cancel();
          return NextResponse.json(
            { error: "Requisição muito grande." },
            { status: 413 },
          );
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    const input = calculationInputSchema.safeParse(JSON.parse(text));
    if (!input.success)
      return NextResponse.json(
        {
          error: "Revise os dados informados.",
          issues: input.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    return NextResponse.json(calculateForMvp(input.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler a solicitação. Envie um JSON válido." },
      { status: 400 },
    );
  }
}

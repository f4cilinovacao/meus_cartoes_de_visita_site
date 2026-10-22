import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OCR não configurado" }, { status: 503 });

  const formData = await req.formData();
  const file = formData.get("imagem") as File | null;
  if (!file) return NextResponse.json({ error: "Imagem não enviada" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ image: { content: base64 }, features: [{ type: "TEXT_DETECTION" }] }],
      }),
    }
  );

  const visionData = await visionRes.json();
  const texto = visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";

  const dados = extrairDados(texto);
  return NextResponse.json(dados);
}

function extrairDados(texto: string) {
  const linhas = texto.split("\n").map((l: string) => l.trim()).filter(Boolean);

  const emailMatch = texto.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const telefoneMatch = texto.match(/(\+?[\d\s\-().]{8,18})/);
  const siteMatch = texto.match(/(https?:\/\/|www\.)[^\s]+/i);

  return {
    nome: linhas[0] ?? "",
    empresa: linhas[1] ?? "",
    cargo: linhas[2] ?? "",
    email: emailMatch?.[0] ?? "",
    telefone: telefoneMatch?.[0]?.trim() ?? "",
    site: siteMatch?.[0] ?? "",
    texto_completo: texto,
  };
}

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

  if (!visionRes.ok || visionData.error) {
    const msg = visionData.error?.message ?? `HTTP ${visionRes.status}`;
    console.error("[OCR] Google Vision error:", msg);
    return NextResponse.json({ error: `Google Vision: ${msg}` }, { status: 502 });
  }

  const texto = visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";
  console.log("[OCR] texto extraído:", texto.slice(0, 200));

  const dados = extrairDados(texto);
  return NextResponse.json(dados);
}

function extrairDados(texto: string) {
  const linhas = texto.split("\n").map((l: string) => l.trim()).filter(Boolean);

  // Email
  const emailMatch = texto.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const email = emailMatch?.[0] ?? "";

  // Telefone: com DDD "(11) 99999-0000" ou sem DDD "2204-2194" / "99855-2909"
  const telMatch = texto.match(/(\+?55[\s-]?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]\d{4}/);
  const telefone = telMatch?.[0]?.trim() ?? "";

  // Site
  const siteMatch = texto.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
  const site = siteMatch?.[0] ?? "";

  // Instagram: @handle que NÃO é parte de um email (não precedido por \w)
  // e não contém extensão de domínio (.com, .br, etc.)
  const igMatch = texto.match(/(?<![.\w])@([\w.]{2,30})(?!\.[a-z]{2,})/i);
  const igRaw = igMatch ? `@${igMatch[1]}` : "";
  // Descarta se o handle capturado for igual ao domínio do email detectado
  const emailDomain = emailMatch?.[0]?.split("@")[1] ?? "";
  const instagram = igRaw && igRaw.slice(1) !== emailDomain ? igRaw : "";

  // Remove linhas que são email, telefone, site ou instagram (sobram nome/empresa/cargo)
  const TOKENS_REMOVIDOS = new Set([email, telefone, site, instagram].filter(Boolean));
  const linhastexto = linhas.filter((l) => {
    if (!l) return false;
    // Remove linhas que contêm apenas dados já capturados
    if (email && l.includes(email)) return false;
    if (site && l.includes(site)) return false;
    if (instagram && l === instagram) return false;
    // Remove linhas que parecem só número/telefone
    if (/^[\d\s().+\-]{6,}$/.test(l)) return false;
    // Remove linhas muito curtas (siglas, CEP, etc)
    if (l.length < 3) return false;
    return !TOKENS_REMOVIDOS.has(l);
  });

  // Heurística: linha com todas as palavras capitalizadas e sem verbos = nome ou empresa
  // Cargo costuma ter palavras como Gerente, Diretor, Sócio, CEO, Vendedor, etc.
  const CARGOS = /gerente|diretor|sócio|socio|ceo|cto|cfo|vendedor|representante|analista|coordenador|supervisor|consultor|proprietário|proprietario|fundador|assistente|técnico|tecnico|engenheiro|advogado|contador|designer/i;

  let nome = "";
  let empresa = "";
  let cargo = "";

  for (const linha of linhastexto) {
    if (!cargo && CARGOS.test(linha)) {
      cargo = linha;
      continue;
    }
    // Empresa: costuma ter Ltda, ME, EIRELI, S/A, Comércio, Confecções, etc.
    const EMPRESA = /ltda|me\b|eireli|s\/a|s\.a\.|comércio|comercio|confecções|confeccoes|serviços|servicos|industria|indústria|associação|associacao|grupo|store|shop|&/i;
    if (!empresa && EMPRESA.test(linha)) {
      empresa = linha;
      continue;
    }
    // Primeira linha restante provavelmente é o nome
    if (!nome) {
      nome = linha;
      continue;
    }
    // Segunda linha restante provavelmente é empresa (se não detectada)
    if (!empresa) {
      empresa = linha;
    }
  }

  // Endereço: linha com Rua, Av, Avenida, Al, número + cidade/estado
  const ENDERECO = /\b(rua|av\.?|avenida|al\.|alameda|trav\.?|travessa|rod\.?|rodovia|estrada)\b/i;
  const endereco = linhastexto.find((l) => ENDERECO.test(l)) ?? "";

  return {
    nome,
    empresa,
    cargo,
    email,
    telefone,
    site,
    instagram,
    endereco,
    texto_completo: texto,
  };
}

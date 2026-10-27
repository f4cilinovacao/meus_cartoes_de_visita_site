import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  console.log("[compartilhar] user:", user.id, "cartao:", id, "email:", emailNorm);

  if (emailNorm === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Você não pode compartilhar consigo mesmo" }, { status: 400 });
  }

  // Verifica se o cartão pertence ao usuário
  const { data: cartao, error: errCartao } = await supabase
    .from("cartoes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (errCartao || !cartao) {
    console.error("[compartilhar] cartao não encontrado:", errCartao?.message);
    return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
  }

  // Verifica se já foi compartilhado com esse email
  const { data: existing, error: errExisting } = await supabase
    .from("cartoes_compartilhados")
    .select("id")
    .eq("cartao_id", id)
    .eq("shared_with_email", emailNorm)
    .maybeSingle();

  if (errExisting) console.error("[compartilhar] check existing error:", errExisting.message);

  if (existing) {
    return NextResponse.json({ error: "Já compartilhado com esse email" }, { status: 409 });
  }

  const { data: inserted, error: errInsert } = await supabase
    .from("cartoes_compartilhados")
    .insert({
      cartao_id: id,
      owner_id: user.id,
      shared_with_id: null,
      shared_with_email: emailNorm,
    })
    .select("id")
    .single();

  if (errInsert) {
    console.error("[compartilhar] insert error:", JSON.stringify(errInsert));
    return NextResponse.json({ error: errInsert.message }, { status: 500 });
  }

  console.log("[compartilhar] sucesso, id:", inserted?.id);
  return NextResponse.json({ ok: true, id: inserted?.id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { compartilhamento_id } = await request.json();

  const { error } = await supabase
    .from("cartoes_compartilhados")
    .delete()
    .eq("id", compartilhamento_id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data } = await supabase
    .from("cartoes_compartilhados")
    .select("id, shared_with_email, created_at")
    .eq("cartao_id", id)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

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

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  if (emailNorm === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Você não pode compartilhar consigo mesmo" }, { status: 400 });
  }

  // Verifica se o cartão pertence ao usuário
  const { data: cartao } = await supabase
    .from("cartoes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!cartao) return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });

  // Verifica se já foi compartilhado com esse email
  const { data: existing } = await supabase
    .from("cartoes_compartilhados")
    .select("id")
    .eq("cartao_id", id)
    .eq("shared_with_email", emailNorm)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Já compartilhado com esse email" }, { status: 409 });
  }

  // Tenta resolver o user_id pelo email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", emailNorm)
    .single();

  const { error } = await supabase.from("cartoes_compartilhados").insert({
    cartao_id: id,
    owner_id: user.id,
    shared_with_id: profile?.id ?? null,
    shared_with_email: emailNorm,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
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

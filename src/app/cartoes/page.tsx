import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, UserCircle } from "lucide-react";
import CartoesClient from "./CartoesClient";
import OnboardingWizard from "@/components/OnboardingWizard";

export const instant = false;

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const avatar = user.user_metadata?.avatar_url ?? null;

  // Busca meus cartões, compartilhamentos, grupos e conexões em paralelo
  const [{ data: meus }, { data: partilhasRecebidas }, { data: partilhasFeitas }, { data: grupos }, { data: conexoesBruto }] = await Promise.all([
    supabase
      .from("cartoes")
      .select("id, nome, empresa, cargo, email, telefone, foto_url, tags, visibilidade, cartoes_grupos(grupo_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Cartões compartilhados COMIGO
    supabase
      .from("cartoes_compartilhados")
      .select("cartao_id")
      .or(`shared_with_id.eq.${user.id},shared_with_email.eq.${user.email}`),
    // Cartões que EU compartilhei (agrupado por cartao_id)
    supabase
      .from("cartoes_compartilhados")
      .select("cartao_id, shared_with_email")
      .eq("owner_id", user.id),
    // Grupos do usuário
    supabase
      .from("grupos")
      .select("id, nome, cor")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    // Conexões (pendentes e aceitas)
    supabase
      .from("conexoes")
      .select("id, status, solicitante_id, destinatario_id, created_at")
      .or(`solicitante_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
  ]);

  // Busca os cartões recebidos (RLS permite via policy recipients_select_shared)
  const idsRecebidos = partilhasRecebidas?.map((p) => p.cartao_id) ?? [];
  const { data: recebidosRaw } = idsRecebidos.length > 0
    ? await supabase
        .from("cartoes")
        .select("id, nome, empresa, cargo, email, telefone, foto_url")
        .in("id", idsRecebidos)
    : { data: [] };

  const recebidos = (recebidosRaw ?? []).map((c) => ({
    ...c,
    owner_email: null as string | null,
    owner_nome: null as string | null,
  }));

  // Monta mapa cartao_id → lista de destinatários (para "cartões que compartilhei")
  const compartilheiMap: Record<string, string[]> = {};
  for (const p of partilhasFeitas ?? []) {
    if (!compartilheiMap[p.cartao_id]) compartilheiMap[p.cartao_id] = [];
    compartilheiMap[p.cartao_id].push(p.shared_with_email);
  }

  // Busca perfis dos usuários conectados para mostrar nome/foto
  const conexoes = conexoesBruto ?? [];
  const outrosIds = conexoes.map((cx) => cx.solicitante_id === user.id ? cx.destinatario_id : cx.solicitante_id);
  const { data: perfisConexoes } = outrosIds.length > 0
    ? await supabase.from("perfis_publicos").select("id, username, nome, foto_url").in("id", outrosIds)
    : { data: [] };
  const perfilMap: Record<string, { username: string; nome: string | null; foto_url: string | null }> = {};
  for (const p of perfisConexoes ?? []) perfilMap[p.id] = p;

  const conexoesComPerfil = conexoes.map((cx) => {
    const outroId = cx.solicitante_id === user.id ? cx.destinatario_id : cx.solicitante_id;
    return { ...cx, outro: perfilMap[outroId] ?? null, souSolicitante: cx.solicitante_id === user.id };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image src="/logo.svg" alt="Meus Cartões de Visita" width={200} height={50} className="w-36 sm:w-52" />
          <div className="flex items-center gap-2">
            <Link href="/explorar" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl">
              🔍 Explorar
            </Link>
            <Link href="/perfil" className="hover:opacity-80 transition">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Perfil"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-8 h-8 border border-gray-200"
                />
              ) : (
                <UserCircle size={28} className="text-gray-400 hover:text-indigo-600 transition" />
              )}
            </Link>
            <form action="/api/auth/signout" method="post">
              <button className="text-gray-400 hover:text-red-500 transition p-1">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Onboarding: aparece só para quem ainda não tem cartões */}
      {(meus ?? []).length === 0 && <OnboardingWizard />}

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <CartoesClient
          meus={meus ?? []}
          recebidos={recebidos}
          compartilheiMap={compartilheiMap}
          grupos={grupos ?? []}
          conexoes={conexoesComPerfil}
          meuUserId={user.id}
        />
      </main>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, UserCircle } from "lucide-react";
import CartoesClient from "./CartoesClient";

export const instant = false;

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const avatar = user.user_metadata?.avatar_url ?? null;

  // Busca meus cartões e compartilhamentos em paralelo
  const [{ data: meus }, { data: partilhas }] = await Promise.all([
    supabase
      .from("cartoes")
      .select("id, nome, empresa, cargo, email, telefone, foto_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("cartoes_compartilhados")
      .select("cartao_id, owner_id")
      .or(`shared_with_id.eq.${user.id},shared_with_email.eq.${user.email}`),
  ]);

  // Busca os cartões compartilhados comigo (RLS permite via policy recipients_select_shared)
  const cartaoIds = partilhas?.map((p) => p.cartao_id) ?? [];
  const { data: recebidosRaw } = cartaoIds.length > 0
    ? await supabase
        .from("cartoes")
        .select("id, nome, empresa, cargo, email, telefone, foto_url")
        .in("id", cartaoIds)
    : { data: [] };

  const recebidos = (recebidosRaw ?? []).map((c) => ({
    ...c,
    owner_email: null as string | null,
    owner_nome: null as string | null,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image src="/logo.svg" alt="Meus Cartões de Visita" width={200} height={50} className="w-36 sm:w-52" />
          <div className="flex items-center gap-2">
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

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <CartoesClient
          meus={meus ?? []}
          recebidos={recebidos ?? []}
        />
      </main>
    </div>
  );
}

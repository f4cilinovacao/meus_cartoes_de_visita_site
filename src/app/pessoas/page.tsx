import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PessoasClient from "./PessoasClient";

export const instant = false;

export default async function PessoasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Busca perfis públicos (exceto o próprio)
  const { data: perfis } = await supabase
    .from("perfis_publicos")
    .select("id, username, nome, cargo, empresa, foto_url, bio")
    .eq("ativo", true)
    .neq("id", user.id)
    .order("nome");

  // Busca conexões existentes do usuário
  const { data: conexoes } = await supabase
    .from("conexoes")
    .select("id, status, solicitante_id, destinatario_id")
    .or(`solicitante_id.eq.${user.id},destinatario_id.eq.${user.id}`);

  // Monta mapa userId → {id, status, souSolicitante}
  const conexaoMap: Record<string, { id: string; status: string; souSolicitante: boolean }> = {};
  for (const cx of conexoes ?? []) {
    const outroId = cx.solicitante_id === user.id ? cx.destinatario_id : cx.solicitante_id;
    conexaoMap[outroId] = { id: cx.id, status: cx.status, souSolicitante: cx.solicitante_id === user.id };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/cartoes" className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-bold text-gray-900">Encontrar pessoas</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <PessoasClient perfis={perfis ?? []} conexaoMap={conexaoMap} meuUserId={user.id} />
      </div>
    </div>
  );
}

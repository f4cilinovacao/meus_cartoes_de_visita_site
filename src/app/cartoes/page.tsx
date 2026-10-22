import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cartoes } = await supabase
    .from("cartoes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Meus Cartões</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-red-500 hover:underline">Sair</button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{cartoes?.length ?? 0} cartões salvos</p>
          <Link
            href="/cartoes/novo"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            Adicionar cartão
          </Link>
        </div>

        {!cartoes || cartoes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nenhum cartão ainda.</p>
            <p className="text-sm mt-1">Clique em "Adicionar cartão" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartoes.map((cartao) => (
              <Link
                key={cartao.id}
                href={`/cartoes/${cartao.id}`}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-900">{cartao.nome || "Sem nome"}</p>
                {cartao.empresa && <p className="text-sm text-indigo-600">{cartao.empresa}</p>}
                {cartao.cargo && <p className="text-sm text-gray-500">{cartao.cargo}</p>}
                {cartao.email && <p className="text-sm text-gray-400 mt-2">{cartao.email}</p>}
                {cartao.telefone && <p className="text-sm text-gray-400">{cartao.telefone}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

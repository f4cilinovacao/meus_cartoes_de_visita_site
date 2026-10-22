import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CreditCard, LogOut } from "lucide-react";

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cartoes } = await supabase
    .from("cartoes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-600" />
            <span className="font-bold text-gray-900">Meus Cartões</span>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition py-2 px-1">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {!cartoes || cartoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-indigo-50 rounded-full p-5 mb-4">
              <CreditCard size={32} className="text-indigo-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">Nenhum cartão ainda</p>
            <p className="text-sm text-gray-400 mb-6">Adicione o primeiro cartão que você recebeu</p>
            <Link
              href="/cartoes/novo"
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
            >
              <Plus size={18} />
              Adicionar cartão
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{cartoes.length} cartão{cartoes.length !== 1 ? "s" : ""}</p>
            <div className="flex flex-col gap-3">
              {cartoes.map((cartao) => (
                <Link
                  key={cartao.id}
                  href={`/cartoes/${cartao.id}`}
                  className="bg-white rounded-2xl border px-4 py-4 flex items-start gap-4 hover:shadow-sm active:bg-gray-50 transition"
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {(cartao.nome ?? cartao.empresa ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{cartao.nome || "Sem nome"}</p>
                    {cartao.empresa && <p className="text-sm text-indigo-600 truncate">{cartao.empresa}</p>}
                    {cartao.cargo && <p className="text-sm text-gray-400 truncate">{cartao.cargo}</p>}
                    {(cartao.email || cartao.telefone) && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {cartao.email || cartao.telefone}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FAB mobile */}
      {cartoes && cartoes.length > 0 && (
        <div className="fixed bottom-6 right-4">
          <Link
            href="/cartoes/novo"
            className="flex items-center gap-2 bg-indigo-600 text-white pl-4 pr-5 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-700 active:scale-95 transition"
          >
            <Plus size={20} />
            <span>Adicionar</span>
          </Link>
        </div>
      )}
    </div>
  );
}

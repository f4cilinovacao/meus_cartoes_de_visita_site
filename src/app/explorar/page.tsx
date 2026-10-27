import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Search, Building2, MapPin, ArrowRight } from "lucide-react";

export const instant = false;

type Cartao = {
  id: string;
  nome: string | null;
  empresa: string | null;
  cargo: string | null;
  foto_url: string | null;
  tags: string[] | null;
};

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("cartoes")
    .select("id, nome, empresa, cargo, foto_url, tags")
    .eq("visibilidade", "publico")
    .order("created_at", { ascending: false })
    .limit(48);

  if (q?.trim()) {
    query = query.or(
      `nome.ilike.%${q}%,empresa.ilike.%${q}%,cargo.ilike.%${q}%`
    );
  }

  const { data: cartoes } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <Image src="/logo.svg" alt="Meus Cartões de Visita" width={120} height={30} />
          </Link>
          <Link href="/cartoes" className="text-xs text-indigo-600 font-medium shrink-0 hover:underline">
            Meus cartões →
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explorar cartões</h1>
          <p className="text-sm text-gray-500 mt-1">Encontre profissionais e empresas</p>
        </div>

        {/* Busca */}
        <form method="GET" className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome, empresa ou cargo..."
            className="w-full pl-11 pr-4 py-3 bg-white border rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </form>

        {q && (
          <p className="text-sm text-gray-500">
            {cartoes?.length ?? 0} resultado{cartoes?.length !== 1 ? "s" : ""} para &ldquo;{q}&rdquo;
          </p>
        )}

        {/* Grade de cartões */}
        {cartoes && cartoes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cartoes.map((c: Cartao) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border p-4 flex flex-col gap-2 shadow-sm"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
                  {c.foto_url ? (
                    <Image
                      src={c.foto_url}
                      alt={c.nome ?? ""}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-indigo-600 font-bold text-lg">
                      {(c.nome ?? c.empresa ?? "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.nome || "—"}</p>
                  {c.cargo && (
                    <p className="text-xs text-indigo-600 truncate">{c.cargo}</p>
                  )}
                  {c.empresa && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 truncate mt-0.5">
                      <Building2 size={11} className="shrink-0" />
                      <span className="truncate">{c.empresa}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum cartão público encontrado</p>
            {q && <p className="text-sm mt-1">Tente outra busca</p>}
          </div>
        )}

        {/* CTA para criar */}
        <div className="bg-indigo-50 rounded-2xl p-5 flex items-center justify-between gap-4 mt-2">
          <div>
            <p className="font-semibold text-indigo-900 text-sm">Tem seu próprio cartão?</p>
            <p className="text-xs text-indigo-600 mt-0.5">Torne-o público e apareça aqui</p>
          </div>
          <Link
            href="/perfil"
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition shrink-0"
          >
            Configurar <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

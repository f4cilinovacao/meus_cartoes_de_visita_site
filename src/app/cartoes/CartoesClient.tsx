"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Share2, Users } from "lucide-react";
import dynamic from "next/dynamic";

const CompartilharModal = dynamic(() => import("@/components/CompartilharModal"), { ssr: false });

interface Cartao {
  id: string;
  nome: string | null;
  empresa: string | null;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
}

interface CartaoRecebido extends Cartao {
  owner_email: string | null;
  owner_nome: string | null;
}

interface Props {
  meus: Cartao[];
  recebidos: CartaoRecebido[];
}

function CardItem({ cartao, badge }: { cartao: Cartao; badge?: React.ReactNode }) {
  const inicial = (cartao.nome ?? cartao.empresa ?? "?")[0].toUpperCase();
  return (
    <Link
      href={`/cartoes/${cartao.id}`}
      className="bg-white rounded-2xl border px-4 py-4 flex items-start gap-4 hover:shadow-sm active:bg-gray-50 transition"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
        {inicial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 truncate">{cartao.nome || "Sem nome"}</p>
          {badge}
        </div>
        {cartao.empresa && <p className="text-sm text-indigo-600 truncate">{cartao.empresa}</p>}
        {cartao.cargo && <p className="text-sm text-gray-400 truncate">{cartao.cargo}</p>}
        {(cartao.email || cartao.telefone) && (
          <p className="text-xs text-gray-400 mt-1 truncate">{cartao.email || cartao.telefone}</p>
        )}
      </div>
    </Link>
  );
}

export default function CartoesClient({ meus, recebidos }: Props) {
  const [aba, setAba] = useState<"meus" | "recebidos">("meus");
  const [compartilhandoId, setCompartilhandoId] = useState<string | null>(null);

  const cartaoCompartilhando = compartilhandoId
    ? meus.find((c) => c.id === compartilhandoId)
    : null;

  const listaAtual = aba === "meus" ? meus : recebidos;

  return (
    <>
      {cartaoCompartilhando && (
        <CompartilharModal
          cartaoId={cartaoCompartilhando.id}
          cartaoNome={cartaoCompartilhando.nome || cartaoCompartilhando.empresa || "Cartão"}
          onClose={() => setCompartilhandoId(null)}
        />
      )}

      {/* Abas */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
        <button
          onClick={() => setAba("meus")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
            aba === "meus" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
          }`}
        >
          Meus cartões
          {meus.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${aba === "meus" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"}`}>
              {meus.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAba("recebidos")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
            aba === "recebidos" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <Users size={14} />
          Compartilhados
          {recebidos.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${aba === "recebidos" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"}`}>
              {recebidos.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista */}
      {listaAtual.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {aba === "meus" ? (
            <>
              <p className="text-gray-700 font-medium mb-1">Nenhum cartão ainda</p>
              <p className="text-sm text-gray-400 mb-6">Adicione o primeiro cartão que você recebeu</p>
              <Link
                href="/cartoes/novo"
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
              >
                <Plus size={18} />
                Adicionar cartão
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1">Nenhum cartão compartilhado</p>
              <p className="text-sm text-gray-400">Quando alguém compartilhar um cartão com você, ele aparece aqui</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {aba === "meus"
            ? (meus as Cartao[]).map((cartao) => (
                <div key={cartao.id} className="relative group">
                  <CardItem cartao={cartao} />
                  <button
                    onClick={(e) => { e.preventDefault(); setCompartilhandoId(cartao.id); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-indigo-500 transition opacity-0 group-hover:opacity-100 active:opacity-100"
                    title="Compartilhar"
                  >
                    <Share2 size={17} />
                  </button>
                </div>
              ))
            : (recebidos as CartaoRecebido[]).map((cartao) => (
                <CardItem
                  key={cartao.id}
                  cartao={cartao}
                  badge={
                    <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                      {cartao.owner_nome || cartao.owner_email || "Alguém"}
                    </span>
                  }
                />
              ))}
        </div>
      )}

      {/* FAB */}
      {(aba === "meus" && meus.length > 0) && (
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
    </>
  );
}

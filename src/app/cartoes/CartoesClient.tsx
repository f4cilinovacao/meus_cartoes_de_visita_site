"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  foto_url: string | null;
}

interface CartaoRecebido extends Cartao {
  owner_email: string | null;
  owner_nome: string | null;
}

interface Props {
  meus: Cartao[];
  recebidos: CartaoRecebido[];
}

function CartaoCard({ cartao, onShare, ownerLabel }: {
  cartao: Cartao;
  onShare?: () => void;
  ownerLabel?: string;
}) {
  const inicial = (cartao.nome ?? cartao.empresa ?? "?")[0].toUpperCase();

  return (
    <div className="relative group">
      <Link href={`/cartoes/${cartao.id}`} className="block">
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition aspect-[16/9] relative">
          {cartao.foto_url ? (
            <Image
              src={cartao.foto_url}
              alt={cartao.nome ?? "Cartão"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            /* Placeholder estilo cartão */
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 flex flex-col justify-between p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {inicial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-900 truncate leading-tight">
                    {cartao.nome || "Sem nome"}
                  </p>
                  {cartao.empresa && (
                    <p className="text-[10px] text-indigo-600 truncate">{cartao.empresa}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {cartao.cargo && (
                  <p className="text-[10px] text-indigo-500 truncate">{cartao.cargo}</p>
                )}
                {cartao.telefone && (
                  <p className="text-[10px] text-indigo-400 truncate">{cartao.telefone}</p>
                )}
                {cartao.email && (
                  <p className="text-[10px] text-indigo-400 truncate">{cartao.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Overlay com nome ao passar o mouse / sempre em cartões com foto */}
          {cartao.foto_url && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-2">
              <p className="text-white text-xs font-semibold truncate">{cartao.nome || cartao.empresa || "Cartão"}</p>
              {cartao.empresa && cartao.nome && (
                <p className="text-white/70 text-[10px] truncate">{cartao.empresa}</p>
              )}
            </div>
          )}

          {/* Badge de quem compartilhou */}
          {ownerLabel && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[80%]">
              {ownerLabel}
            </div>
          )}
        </div>
      </Link>

      {/* Botão compartilhar */}
      {onShare && (
        <button
          onClick={onShare}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-indigo-500 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 active:opacity-100 transition"
          title="Compartilhar"
        >
          <Share2 size={14} />
        </button>
      )}
    </div>
  );
}

export default function CartoesClient({ meus, recebidos }: Props) {
  const [aba, setAba] = useState<"meus" | "recebidos">("meus");
  const [compartilhandoId, setCompartilhandoId] = useState<string | null>(null);

  const cartaoCompartilhando = compartilhandoId
    ? meus.find((c) => c.id === compartilhandoId)
    : null;

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
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
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

      {/* Grid */}
      {aba === "meus" ? (
        meus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
          <div className="grid grid-cols-2 gap-3">
            {meus.map((cartao) => (
              <CartaoCard
                key={cartao.id}
                cartao={cartao}
                onShare={() => setCompartilhandoId(cartao.id)}
              />
            ))}
          </div>
        )
      ) : (
        recebidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-700 font-medium mb-1">Nenhum cartão compartilhado</p>
            <p className="text-sm text-gray-400">Quando alguém compartilhar um cartão com você, ele aparece aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recebidos.map((cartao) => (
              <CartaoCard
                key={cartao.id}
                cartao={cartao}
                ownerLabel={cartao.owner_nome || cartao.owner_email || undefined}
              />
            ))}
          </div>
        )
      )}

      {/* FAB */}
      {aba === "meus" && meus.length > 0 && (
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

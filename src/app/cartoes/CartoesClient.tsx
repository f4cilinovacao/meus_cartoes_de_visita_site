"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Share2, Users, ArrowUpRight, ArrowDownLeft, Search, X, Tag, Globe, Lock, FolderOpen, Trash2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
  tags?: string[] | null;
  visibilidade?: string | null;
  grupo_id?: string | null;
}

interface Grupo {
  id: string;
  nome: string;
  cor: string;
}

interface CartaoRecebido extends Cartao {
  owner_email: string | null;
  owner_nome: string | null;
}

interface Props {
  meus: Cartao[];
  recebidos: CartaoRecebido[];
  compartilheiMap: Record<string, string[]>;
  grupos: Grupo[];
}

function VisibilidadeBadge({ visibilidade }: { visibilidade?: string | null }) {
  if (visibilidade === "publico") {
    return (
      <span className="flex items-center gap-0.5 bg-indigo-600/90 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
        <Globe size={9} /> Público
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 bg-gray-700/70 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
      <Lock size={9} /> Privado
    </span>
  );
}

function CartaoCard({ cartao, onShare, ownerLabel, badge, grupoMap }: {
  cartao: Cartao;
  onShare?: () => void;
  ownerLabel?: string;
  badge?: React.ReactNode;
  grupoMap?: Record<string, Grupo>;
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

          {cartao.foto_url && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-2">
              <p className="text-white text-xs font-semibold truncate">{cartao.nome || cartao.empresa || "Cartão"}</p>
              {cartao.empresa && cartao.nome && (
                <p className="text-white/70 text-[10px] truncate">{cartao.empresa}</p>
              )}
            </div>
          )}

          {ownerLabel && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full truncate max-w-[80%]">
              {ownerLabel}
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <VisibilidadeBadge visibilidade={cartao.visibilidade} />
            {cartao.grupo_id && grupoMap?.[cartao.grupo_id] && (() => {
              const g = grupoMap[cartao.grupo_id!]!;
              const cor = COR_MAP[g.cor] ?? COR_MAP.indigo;
              return (
                <span className={`flex items-center gap-0.5 ${cor.bg} ${cor.text} text-[10px] px-1.5 py-0.5 rounded-full font-semibold`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cor.dot}`} />{g.nome}
                </span>
              );
            })()}
          </div>

          {badge && (
            <div className="absolute top-2 right-2">
              {badge}
            </div>
          )}
        </div>
      </Link>

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

function bate(cartao: Cartao, q: string, tag: string) {
  if (tag && !cartao.tags?.includes(tag)) return false;
  if (!q) return true;
  const t = q.toLowerCase();
  return !!(
    cartao.nome?.toLowerCase().includes(t) ||
    cartao.empresa?.toLowerCase().includes(t) ||
    cartao.cargo?.toLowerCase().includes(t) ||
    cartao.email?.toLowerCase().includes(t) ||
    cartao.telefone?.toLowerCase().includes(t) ||
    cartao.tags?.some((tg) => tg.toLowerCase().includes(t))
  );
}

const COR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-400", dot: "bg-indigo-500" },
  blue:   { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-400",   dot: "bg-blue-500" },
  green:  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-400",  dot: "bg-green-500" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-400", dot: "bg-yellow-500" },
  red:    { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-400",    dot: "bg-red-500" },
  pink:   { bg: "bg-pink-100",   text: "text-pink-700",   border: "border-pink-400",   dot: "bg-pink-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-400", dot: "bg-purple-500" },
  gray:   { bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-400",   dot: "bg-gray-500" },
};
const CORES = Object.keys(COR_MAP);

export default function CartoesClient({ meus, recebidos, compartilheiMap, grupos: gruposInicial }: Props) {
  const router = useRouter();
  const [aba, setAba] = useState<"meus" | "compartilhados">("meus");
  const [compartilhandoId, setCompartilhandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [tagAtiva, setTagAtiva] = useState("");
  const [grupoAtivo, setGrupoAtivo] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>(gruposInicial);
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false);
  const [novoGrupoNome, setNovoGrupoNome] = useState("");
  const [novoGrupoCor, setNovoGrupoCor] = useState("indigo");
  const [salvandoGrupo, setSalvandoGrupo] = useState(false);

  async function criarGrupo() {
    if (!novoGrupoNome.trim()) return;
    setSalvandoGrupo(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("grupos")
      .insert({ nome: novoGrupoNome.trim(), cor: novoGrupoCor })
      .select("id, nome, cor")
      .single();
    if (data) setGrupos((g) => [...g, data]);
    setNovoGrupoNome("");
    setNovoGrupoAberto(false);
    setSalvandoGrupo(false);
    router.refresh();
  }

  async function deletarGrupo(id: string) {
    const supabase = createClient();
    await supabase.from("grupos").delete().eq("id", id);
    setGrupos((g) => g.filter((x) => x.id !== id));
    if (grupoAtivo === id) setGrupoAtivo(null);
    router.refresh();
  }

  const cartaoCompartilhando = compartilhandoId
    ? meus.find((c) => c.id === compartilhandoId)
    : null;

  // Todas as tags únicas dos meus cartões
  const todasTags = useMemo(() => {
    const set = new Set<string>();
    meus.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [meus]);

  const q = busca.trim();
  const meusFiltrados = useMemo(
    () => meus.filter((c) => bate(c, q, tagAtiva) && (!grupoAtivo || c.grupo_id === grupoAtivo)),
    [meus, q, tagAtiva, grupoAtivo]
  );
  const recebidosFiltrados = useMemo(() => recebidos.filter((c) => bate(c, q, tagAtiva)), [recebidos, q, tagAtiva]);
  const meusCompartilhados = useMemo(
    () => meus.filter((c) => compartilheiMap[c.id] && bate(c, q, tagAtiva)),
    [meus, compartilheiMap, q, tagAtiva]
  );

  const totalCompartilhados = meus.filter((c) => compartilheiMap[c.id]).length + recebidos.length;
  const grupoMap = useMemo(() => Object.fromEntries(grupos.map((g) => [g.id, g])), [grupos]);

  return (
    <>
      {cartaoCompartilhando && (
        <CompartilharModal
          cartaoId={cartaoCompartilhando.id}
          cartaoNome={cartaoCompartilhando.nome || cartaoCompartilhando.empresa || "Cartão"}
          onClose={() => setCompartilhandoId(null)}
        />
      )}

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome, empresa, e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {busca && (
          <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Grupos */}
      {(grupos.length > 0 || novoGrupoAberto) && (
        <div className="mb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setGrupoAtivo(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                !grupoAtivo ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FolderOpen size={11} /> Todos
            </button>
            {grupos.map((g) => {
              const cor = COR_MAP[g.cor] ?? COR_MAP.indigo;
              const ativo = grupoAtivo === g.id;
              return (
                <div key={g.id} className="relative group/g shrink-0">
                  <button
                    onClick={() => setGrupoAtivo(ativo ? null : g.id)}
                    className={`flex items-center gap-1.5 pl-2.5 pr-7 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border-2 ${
                      ativo ? `${cor.bg} ${cor.text} ${cor.border}` : `bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200`
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cor.dot}`} />
                    {g.nome}
                  </button>
                  <button
                    onClick={() => deletarGrupo(g.id)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/g:opacity-100 text-gray-400 hover:text-red-500 transition"
                    title="Deletar grupo"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setNovoGrupoAberto(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 whitespace-nowrap shrink-0 transition"
            >
              <Plus size={12} /> Novo grupo
            </button>
          </div>

          {novoGrupoAberto && (
            <div className="mt-2 bg-white border rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
              <input
                autoFocus
                type="text"
                placeholder="Nome do grupo"
                value={novoGrupoNome}
                onChange={(e) => setNovoGrupoNome(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") criarGrupo(); if (e.key === "Escape") setNovoGrupoAberto(false); }}
                className="text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {CORES.map((c) => {
                  const cor = COR_MAP[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNovoGrupoCor(c)}
                      className={`w-6 h-6 rounded-full ${cor.dot} transition ring-2 ring-offset-1 ${novoGrupoCor === c ? "ring-gray-700" : "ring-transparent"}`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={criarGrupo}
                  disabled={salvandoGrupo || !novoGrupoNome.trim()}
                  className="flex-1 bg-indigo-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1"
                >
                  <Check size={13} /> Criar
                </button>
                <button
                  onClick={() => { setNovoGrupoAberto(false); setNovoGrupoNome(""); }}
                  className="px-4 text-xs text-gray-500 border rounded-xl hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {grupos.length === 0 && !novoGrupoAberto && (
        <button
          onClick={() => setNovoGrupoAberto(true)}
          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 mb-3 font-medium transition"
        >
          <FolderOpen size={13} /> Criar grupo para organizar cartões
        </button>
      )}

      {/* Tags filtro */}
      {todasTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          {todasTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagAtiva(tagAtiva === tag ? "" : tag)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition shrink-0 ${
                tagAtiva === tag
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Tag size={10} />
              {tag}
            </button>
          ))}
        </div>
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
          onClick={() => setAba("compartilhados")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
            aba === "compartilhados" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <Users size={14} />
          Compartilhados
          {totalCompartilhados > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${aba === "compartilhados" ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"}`}>
              {totalCompartilhados}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo */}
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
        ) : meusFiltrados.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">Nenhum cartão encontrado para "{busca}"</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {meusFiltrados.map((cartao) => (
              <CartaoCard
                key={cartao.id}
                cartao={cartao}
                onShare={() => setCompartilhandoId(cartao.id)}
                grupoMap={grupoMap}
              />
            ))}
          </div>
        )
      ) : (
        /* Aba Compartilhados */
        meusCompartilhados.length === 0 && recebidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-700 font-medium mb-1">Nenhum compartilhamento ainda</p>
            <p className="text-sm text-gray-400">Compartilhe cartões com outros usuários ou aguarde receber</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Seção: Cartões que eu compartilhei */}
            {meusCompartilhados.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight size={15} className="text-indigo-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Compartilhei</h2>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">
                    {meusCompartilhados.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {meusCompartilhados.map((cartao) => {
                    const destinatarios = compartilheiMap[cartao.id] ?? [];
                    return (
                      <CartaoCard
                        key={cartao.id}
                        cartao={cartao}
                        onShare={() => setCompartilhandoId(cartao.id)}
                        badge={
                          <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                            {destinatarios.length} {destinatarios.length === 1 ? "pessoa" : "pessoas"}
                          </span>
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seção: Cartões compartilhados comigo */}
            {recebidosFiltrados.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownLeft size={15} className="text-green-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Recebi</h2>
                  <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">
                    {recebidosFiltrados.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recebidosFiltrados.map((cartao) => (
                    <CartaoCard
                      key={cartao.id}
                      cartao={cartao}
                      ownerLabel={cartao.owner_nome || cartao.owner_email || undefined}
                    />
                  ))}
                </div>
              </div>
            )}
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

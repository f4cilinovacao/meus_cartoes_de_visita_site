"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus, Clock, Users, UserCheck, UserX, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Perfil {
  id: string;
  username: string;
  nome: string | null;
  cargo: string | null;
  empresa: string | null;
  foto_url: string | null;
  bio: string | null;
}

interface ConexaoInfo {
  id: string;
  status: string;
  souSolicitante: boolean;
}

interface Props {
  perfis: Perfil[];
  conexaoMap: Record<string, ConexaoInfo>;
  meuUserId: string;
}

export default function PessoasClient({ perfis, conexaoMap: mapaInicial, meuUserId }: Props) {
  const [busca, setBusca] = useState("");
  const [mapa, setMapa] = useState<Record<string, ConexaoInfo>>(mapaInicial);
  const [loading, setLoading] = useState<string | null>(null);

  const q = busca.trim().toLowerCase();
  const filtrados = perfis.filter((p) =>
    !q ||
    p.nome?.toLowerCase().includes(q) ||
    p.username.toLowerCase().includes(q) ||
    p.empresa?.toLowerCase().includes(q) ||
    p.cargo?.toLowerCase().includes(q)
  );

  async function solicitar(destinatarioId: string) {
    setLoading(destinatarioId);
    const supabase = createClient();
    const { data } = await supabase
      .from("conexoes")
      .insert({ solicitante_id: meuUserId, destinatario_id: destinatarioId })
      .select("id")
      .single();
    if (data) {
      setMapa((m) => ({ ...m, [destinatarioId]: { id: data.id, status: "pendente", souSolicitante: true } }));
    }
    setLoading(null);
  }

  async function cancelar(destinatarioId: string, conexaoId: string) {
    setLoading(destinatarioId);
    const supabase = createClient();
    await supabase.from("conexoes").delete().eq("id", conexaoId);
    setMapa((m) => { const n = { ...m }; delete n[destinatarioId]; return n; });
    setLoading(null);
  }

  async function aceitar(outroId: string, conexaoId: string) {
    setLoading(outroId);
    const supabase = createClient();
    await supabase.from("conexoes").update({ status: "aceita" }).eq("id", conexaoId);
    setMapa((m) => ({ ...m, [outroId]: { ...m[outroId], status: "aceita" } }));
    setLoading(null);
  }

  async function rejeitar(outroId: string, conexaoId: string) {
    setLoading(outroId);
    const supabase = createClient();
    await supabase.from("conexoes").delete().eq("id", conexaoId);
    setMapa((m) => { const n = { ...m }; delete n[outroId]; return n; });
    setLoading(null);
  }

  function BotaoConexao({ perfil }: { perfil: Perfil }) {
    const cx = mapa[perfil.id];
    const busy = loading === perfil.id;

    if (!cx) {
      return (
        <button
          onClick={() => solicitar(perfil.id)}
          disabled={busy}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border-2 border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition disabled:opacity-50 shrink-0"
        >
          <UserPlus size={14} />
          Conectar
        </button>
      );
    }

    if (cx.status === "aceita") {
      return (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl shrink-0">
          <Users size={14} />
          Conectados
        </span>
      );
    }

    if (cx.souSolicitante) {
      return (
        <button
          onClick={() => cancelar(perfil.id, cx.id)}
          disabled={busy}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 border-2 border-gray-200 px-3 py-1.5 rounded-xl hover:border-red-300 hover:text-red-500 transition disabled:opacity-50 shrink-0"
          title="Cancelar solicitação"
        >
          <Clock size={14} />
          Pendente
        </button>
      );
    }

    // Recebeu solicitação desta pessoa
    return (
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => aceitar(perfil.id, cx.id)}
          disabled={busy}
          className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
          title="Aceitar"
        >
          <UserCheck size={14} />
        </button>
        <button
          onClick={() => rejeitar(perfil.id, cx.id)}
          disabled={busy}
          className="p-1.5 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition disabled:opacity-50"
          title="Rejeitar"
        >
          <UserX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome, username, empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-3 bg-white border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">
          {q ? `Nenhuma pessoa encontrada para "${busca}"` : "Nenhum usuário com perfil público ainda."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((p) => (
            <div key={p.id} className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-indigo-100 overflow-hidden shrink-0">
                {p.foto_url
                  ? <Image src={p.foto_url} alt="" width={48} height={48} className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">{(p.nome ?? p.username)[0].toUpperCase()}</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nome ?? p.username}</p>
                  <Link href={`/u/${p.username}`} target="_blank" className="text-gray-300 hover:text-indigo-500 transition shrink-0">
                    <ExternalLink size={12} />
                  </Link>
                </div>
                {(p.cargo || p.empresa) && (
                  <p className="text-xs text-gray-500 truncate">
                    {[p.cargo, p.empresa].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="text-xs text-gray-400">@{p.username}</p>
              </div>

              {/* Botão */}
              <BotaoConexao perfil={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Clock, Users, X } from "lucide-react";

interface Props {
  cartaoUserId: string;
  meuUserId: string;
  statusInicial: "nenhum" | "pendente_enviada" | "pendente_recebida" | "aceita";
  conexaoId?: string;
}

export default function ConexaoButton({ cartaoUserId, meuUserId, statusInicial, conexaoId: idInicial }: Props) {
  const [status, setStatus] = useState(statusInicial);
  const [conexaoId, setConexaoId] = useState(idInicial);
  const [loading, setLoading] = useState(false);

  async function solicitar() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("conexoes")
      .insert({ solicitante_id: meuUserId, destinatario_id: cartaoUserId })
      .select("id")
      .single();
    if (data) { setConexaoId(data.id); setStatus("pendente_enviada"); }
    setLoading(false);
  }

  async function cancelar() {
    if (!conexaoId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("conexoes").delete().eq("id", conexaoId);
    setStatus("nenhum");
    setConexaoId(undefined);
    setLoading(false);
  }

  async function aceitar() {
    if (!conexaoId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("conexoes").update({ status: "aceita" }).eq("id", conexaoId);
    setStatus("aceita");
    setLoading(false);
  }

  async function rejeitar() {
    if (!conexaoId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("conexoes").delete().eq("id", conexaoId);
    setStatus("nenhum");
    setConexaoId(undefined);
    setLoading(false);
  }

  if (status === "aceita") {
    return (
      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-5 py-3.5 rounded-2xl font-semibold text-sm">
        <Users size={18} />
        Conectados
      </div>
    );
  }

  if (status === "pendente_enviada") {
    return (
      <button
        onClick={cancelar}
        disabled={loading}
        className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-500 px-5 py-3.5 rounded-2xl font-semibold text-sm hover:border-red-300 hover:text-red-500 transition disabled:opacity-50"
      >
        <Clock size={18} />
        Solicitação enviada · cancelar
      </button>
    );
  }

  if (status === "pendente_recebida") {
    return (
      <div className="flex gap-2">
        <button
          onClick={aceitar}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3.5 rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Users size={18} />
          Aceitar
        </button>
        <button
          onClick={rejeitar}
          disabled={loading}
          className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-500 px-4 py-3.5 rounded-2xl font-semibold text-sm hover:border-red-300 hover:text-red-500 transition disabled:opacity-50"
        >
          <X size={18} />
          Rejeitar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={solicitar}
      disabled={loading}
      className="flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-600 px-5 py-3.5 rounded-2xl font-semibold text-sm hover:bg-indigo-50 active:scale-[0.98] transition disabled:opacity-50"
    >
      <UserPlus size={18} />
      Me conectar
    </button>
  );
}

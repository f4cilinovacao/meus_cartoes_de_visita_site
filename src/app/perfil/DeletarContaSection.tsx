"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeletarContaSection() {
  const router = useRouter();
  const [deletando, setDeletando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDeletarConta() {
    setDeletando(true);
    const res = await fetch("/api/auth/deletar-conta", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      setDeletando(false);
      setConfirmDelete(false);
      alert("Erro ao deletar conta. Tente novamente.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
        <Trash2 size={16} />
        Deletar conta
      </div>
      <p className="text-xs text-gray-500">Todos os seus cartões e dados serão removidos permanentemente.</p>
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="self-start text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
        >
          Deletar minha conta
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-red-600 font-medium">Tem certeza?</p>
          <button
            onClick={handleDeletarConta}
            disabled={deletando}
            className="bg-red-500 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {deletando ? <Loader2 size={14} className="animate-spin" /> : "Sim, deletar"}
          </button>
          <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-400 hover:text-gray-600">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

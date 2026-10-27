"use client";

import { useState, useEffect } from "react";
import { X, Share2, Trash2, Loader2, Check } from "lucide-react";

interface Compartilhamento {
  id: string;
  shared_with_email: string;
  created_at: string;
}

interface Props {
  cartaoId: string;
  cartaoNome: string;
  onClose: () => void;
}

export default function CompartilharModal({ cartaoId, cartaoNome, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [lista, setLista] = useState<Compartilhamento[]>([]);
  const [loadingLista, setLoadingLista] = useState(true);

  useEffect(() => {
    fetch(`/api/cartoes/${cartaoId}/compartilhar`)
      .then((r) => r.json())
      .then((data) => { setLista(data); setLoadingLista(false); });
  }, [cartaoId]);

  async function handleCompartilhar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch(`/api/cartoes/${cartaoId}/compartilhar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao compartilhar");
      return;
    }

    setSuccess(true);
    setEmail("");
    const novo: Compartilhamento = { id: data.id ?? Math.random().toString(), shared_with_email: email.trim().toLowerCase(), created_at: new Date().toISOString() };
    setLista((l) => [novo, ...l]);
    setTimeout(() => setSuccess(false), 2500);
  }

  async function handleRemover(id: string) {
    const res = await fetch(`/api/cartoes/${cartaoId}/compartilhar`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ compartilhamento_id: id }),
    });
    if (res.ok) setLista((l) => l.filter((x) => x.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Compartilhar cartão</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{cartaoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Form */}
          <form onSubmit={handleCompartilhar} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Compartilhar por e-mail</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 hover:bg-indigo-700 transition"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : success ? <Check size={15} /> : "Enviar"}
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-600">Compartilhado com sucesso!</p>}
          </form>

          {/* Lista atual */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Compartilhado com ({lista.length})
            </p>
            {loadingLista ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
            ) : lista.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Ainda não compartilhado com ninguém</p>
            ) : (
              <div className="flex flex-col gap-2">
                {lista.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                        {item.shared_with_email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 truncate">{item.shared_with_email}</span>
                    </div>
                    <button
                      onClick={() => handleRemover(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 transition shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

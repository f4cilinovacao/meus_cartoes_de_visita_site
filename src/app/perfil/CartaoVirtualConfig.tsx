"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ExternalLink, Check, Globe } from "lucide-react";

interface PerfilPublico {
  username: string;
  nome: string | null;
  cargo: string | null;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  site: string | null;
  instagram: string | null;
  bio: string | null;
  ativo: boolean;
}

interface Props {
  userId: string;
  perfilAtual: PerfilPublico | null;
  emailUsuario: string;
}

export default function CartaoVirtualConfig({ userId, perfilAtual, emailUsuario }: Props) {
  const [form, setForm] = useState<PerfilPublico>({
    username: perfilAtual?.username ?? "",
    nome: perfilAtual?.nome ?? "",
    cargo: perfilAtual?.cargo ?? "",
    empresa: perfilAtual?.empresa ?? "",
    email: perfilAtual?.email ?? emailUsuario,
    telefone: perfilAtual?.telefone ?? "",
    whatsapp: perfilAtual?.whatsapp ?? "",
    site: perfilAtual?.site ?? "",
    instagram: perfilAtual?.instagram ?? "",
    bio: perfilAtual?.bio ?? "",
    ativo: perfilAtual?.ativo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function set(field: keyof PerfilPublico) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSaving(true);

    const username = form.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!username || username.length < 3) {
      setErro("Username deve ter pelo menos 3 caracteres (letras, números, - ou _)");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const payload = { ...form, username, id: userId };

    const { error } = perfilAtual
      ? await supabase.from("perfis_publicos").update(payload).eq("id", userId)
      : await supabase.from("perfis_publicos").insert(payload);

    if (error) {
      setErro(error.message.includes("unique") ? "Esse username já está em uso" : error.message);
    } else {
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }
    setSaving(false);
  }

  const url = `meuscartoesdevisita.com.br/u/${form.username || "username"}`;

  return (
    <div className="bg-white rounded-2xl border p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-900">Cartão Virtual Público</h2>
        </div>
        {perfilAtual && (
          <a
            href={`/u/${perfilAtual.username}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
          >
            Ver meu cartão <ExternalLink size={12} />
          </a>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Crie uma página pública com seus contatos para compartilhar.
        Ficará disponível em: <span className="font-mono text-indigo-600">{url}</span>
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        {/* Username */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Username*</label>
          <div className="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
            <span className="text-gray-400 text-sm pl-3 pr-1">/u/</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
              placeholder="seuusuario"
              required
              minLength={3}
              className="flex-1 py-2.5 pr-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { field: "nome" as const, label: "Nome*", placeholder: "João Silva", required: true },
            { field: "cargo" as const, label: "Cargo", placeholder: "Gerente Comercial" },
            { field: "empresa" as const, label: "Empresa", placeholder: "Acme Ltda." },
            { field: "email" as const, label: "E-mail", placeholder: "joao@acme.com" },
            { field: "telefone" as const, label: "Telefone", placeholder: "(11) 99999-0000" },
            { field: "whatsapp" as const, label: "WhatsApp", placeholder: "11999990000" },
            { field: "instagram" as const, label: "Instagram", placeholder: "@usuario" },
            { field: "site" as const, label: "Site", placeholder: "https://acme.com" },
          ].map(({ field, label, placeholder, required }) => (
            <div key={field}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
              <input
                type="text"
                value={(form[field] as string) ?? ""}
                onChange={set(field)}
                placeholder={placeholder}
                required={required}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Bio</label>
          <textarea
            value={form.bio ?? ""}
            onChange={set("bio")}
            placeholder="Uma frase sobre você ou sua empresa..."
            rows={2}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {erro && <p className="text-xs text-red-500">{erro}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : sucesso ? <><Check size={16} /> Salvo!</> : "Salvar cartão virtual"}
        </button>
      </form>
    </div>
  );
}

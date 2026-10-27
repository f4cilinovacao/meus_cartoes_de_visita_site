"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Camera, X, Loader2, Trash2, Mail, Phone, Globe, Share2, FlipHorizontal, Download, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const CompartilharModal = dynamic(() => import("@/components/CompartilharModal"), { ssr: false });
const TagsInput = dynamic(() => import("@/components/TagsInput"), { ssr: false });

type Cartao = {
  id: string;
  nome: string | null;
  empresa: string | null;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  site: string | null;
  instagram: string | null;
  endereco: string | null;
  notas: string | null;
  foto_url: string | null;
  foto_verso: string | null;
  tags: string[] | null;
  origem: string | null;
  created_at: string | null;
  user_id: string;
  visibilidade: string | null;
};

export default function EditCartaoForm({ cartao }: { cartao: Cartao }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const fileVersoRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [novaFotoVerso, setNovaFotoVerso] = useState<File | null>(null);
  const [fotoVersoPreview, setFotoVersoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(cartao.tags ?? []);
  const [visibilidade, setVisibilidade] = useState<"privado" | "publico">((cartao.visibilidade as "privado" | "publico") ?? "privado");
  const [form, setForm] = useState({
    nome: cartao.nome ?? "",
    empresa: cartao.empresa ?? "",
    cargo: cartao.cargo ?? "",
    email: cartao.email ?? "",
    telefone: cartao.telefone ?? "",
    site: cartao.site ?? "",
    instagram: cartao.instagram ?? "",
    endereco: cartao.endereco ?? "",
    notas: cartao.notas ?? "",
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNovaFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleFotoVerso(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNovaFotoVerso(file);
    setFotoVersoPreview(URL.createObjectURL(file));
  }

  async function uploadFoto(file: File, userId: string): Promise<string | null> {
    const supabase = createClient();
    const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from("cartoes-fotos").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("cartoes-fotos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let foto_url = cartao.foto_url;
    let foto_verso = cartao.foto_verso;

    if (user) {
      const [novaUrl, novaVersoUrl] = await Promise.all([
        novaFoto ? uploadFoto(novaFoto, user.id) : Promise.resolve(null),
        novaFotoVerso ? uploadFoto(novaFotoVerso, user.id) : Promise.resolve(null),
      ]);
      if (novaUrl) foto_url = novaUrl;
      if (novaVersoUrl) foto_verso = novaVersoUrl;
    }

    await supabase.from("cartoes").update({ ...form, foto_url, foto_verso, tags, visibilidade }).eq("id", cartao.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Apagar este cartão?")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("cartoes").delete().eq("id", cartao.id);
    router.push("/cartoes");
  }

  const fotoAtual = fotoPreview ?? cartao.foto_url;
  const fotoVersoAtual = fotoVersoPreview ?? cartao.foto_verso;

  function exportarVCard() {
    const escape = (s: string | null) => (s ?? "").replace(/[,;\\]/g, (c) => `\\${c}`);
    const nomes = (cartao.nome ?? "").trim().split(" ");
    const sobrenome = nomes.length > 1 ? nomes.slice(1).join(" ") : "";
    const nome = nomes[0] ?? "";
    const linhas = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escape(sobrenome)};${escape(nome)};;;`,
      `FN:${escape(cartao.nome)}`,
      cartao.empresa ? `ORG:${escape(cartao.empresa)}` : "",
      cartao.cargo ? `TITLE:${escape(cartao.cargo)}` : "",
      cartao.email ? `EMAIL;TYPE=WORK:${cartao.email}` : "",
      cartao.telefone ? `TEL;TYPE=WORK,VOICE:${cartao.telefone}` : "",
      cartao.site ? `URL:${cartao.site}` : "",
      cartao.endereco ? `ADR;TYPE=WORK:;;${escape(cartao.endereco)};;;;` : "",
      cartao.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${cartao.instagram}` : "",
      cartao.notas ? `NOTE:${escape(cartao.notas)}` : "",
      "END:VCARD",
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([linhas], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(cartao.nome ?? "contato").replace(/\s+/g, "_")}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {compartilhando && (
        <CompartilharModal
          cartaoId={cartao.id}
          cartaoNome={cartao.nome || cartao.empresa || "Cartão"}
          onClose={() => setCompartilhando(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cartoes" className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="font-bold text-gray-900 truncate">{cartao.nome || "Cartão"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <>
                <button
                  onClick={exportarVCard}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition"
                  title="Salvar nos contatos"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setCompartilhando(true)}
                  className="p-2 text-indigo-400 hover:text-indigo-600 transition"
                  title="Compartilhar"
                >
                  <Share2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-400 hover:text-red-600 transition"
            >
              {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 flex items-center gap-1"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando</> : editing ? "Salvar" : "Editar"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Fotos */}
        <div className="flex flex-col gap-3">
          {/* Frente */}
          <div>
            {(fotoAtual || editing) && (
              <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Frente</p>
            )}
            {fotoAtual ? (
              <div className="relative rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9]">
                <Image src={fotoAtual} alt="Frente do cartão" fill className="object-contain" />
                {editing && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1">
                    <Camera size={12} /> Trocar foto
                  </button>
                )}
              </div>
            ) : editing ? (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-indigo-300 rounded-2xl py-8 flex flex-col items-center gap-2 text-indigo-400 hover:bg-indigo-50 transition">
                <Camera size={28} />
                <span className="text-sm font-medium">Adicionar foto da frente</span>
              </button>
            ) : null}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </div>

          {/* Verso */}
          {(fotoAtual || fotoVersoAtual) && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Verso</p>
              {fotoVersoAtual ? (
                <div className="relative rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9]">
                  <Image src={fotoVersoAtual} alt="Verso do cartão" fill className="object-contain" />
                  {editing && (
                    <button type="button" onClick={() => fileVersoRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1">
                      <Camera size={12} /> Trocar foto
                    </button>
                  )}
                  {editing && (
                    <button type="button" onClick={() => { setNovaFotoVerso(null); setFotoVersoPreview("__remove__"); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : editing ? (
                <button type="button" onClick={() => fileVersoRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:bg-gray-50 transition">
                  <FlipHorizontal size={24} />
                  <span className="text-sm font-medium">Adicionar foto do verso</span>
                </button>
              ) : null}
              <input ref={fileVersoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoVerso} />
            </div>
          )}
        </div>

        {/* Ações rápidas (modo visualização) */}
        {!editing && (cartao.email || cartao.telefone || cartao.site) && (
          <div className="flex gap-3">
            {cartao.email && (
              <a href={`mailto:${cartao.email}`} className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Mail size={20} />
                <span className="text-xs font-medium">E-mail</span>
              </a>
            )}
            {cartao.telefone && (
              <a href={`tel:${cartao.telefone}`} className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Phone size={20} />
                <span className="text-xs font-medium">Ligar</span>
              </a>
            )}
            {cartao.site && (
              <a href={cartao.site} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Globe size={20} />
                <span className="text-xs font-medium">Site</span>
              </a>
            )}
          </div>
        )}

        {/* Campos */}
        <div className="bg-white rounded-2xl border divide-y">
          {[
            { field: "nome", label: "Nome", type: "text" },
            { field: "empresa", label: "Empresa", type: "text" },
            { field: "cargo", label: "Cargo", type: "text" },
            { field: "email", label: "E-mail", type: "email" },
            { field: "telefone", label: "Telefone", type: "tel" },
            { field: "site", label: "Site", type: "url" },
            { field: "instagram", label: "Instagram", type: "text" },
            { field: "endereco", label: "Endereço", type: "text" },
          ].map(({ field, label, type }) => {
            const val = form[field as keyof typeof form];
            if (!editing && !val) return null;
            return (
              <div key={field} className="flex items-center px-4 py-3 gap-3">
                <label className="text-sm text-gray-400 w-24 shrink-0">{label}</label>
                {editing ? (
                  <input
                    type={type}
                    value={val}
                    onChange={set(field)}
                    className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none"
                  />
                ) : (
                  <span className="flex-1 text-sm text-gray-900">{val}</span>
                )}
              </div>
            );
          })}

          {(editing || tags.length > 0) && (
            <div className="px-4 py-3">
              <label className="text-sm text-gray-400 block mb-1">Tags</label>
              {editing ? (
                <TagsInput tags={tags} onChange={setTags} />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {(editing || form.notas) && (
            <div className="px-4 py-3">
              <label className="text-sm text-gray-400 block mb-1">Notas</label>
              {editing ? (
                <textarea
                  value={form.notas}
                  onChange={set("notas")}
                  rows={3}
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.notas}</p>
              )}
            </div>
          )}
        </div>

        {/* Visibilidade */}
        {editing ? (
          <div className="bg-white rounded-2xl border p-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-700">Visibilidade do cartão</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: "privado", icon: <Lock size={16} />, label: "Privado", desc: "Só você vê" },
                { val: "publico", icon: <Globe size={16} />, label: "Público", desc: "Qualquer pessoa pode encontrar" },
              ] as const).map(({ val, icon, label, desc }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setVisibilidade(val)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition text-left ${visibilidade === val ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className={`flex items-center gap-1.5 font-semibold text-sm ${visibilidade === val ? "text-indigo-600" : "text-gray-700"}`}>
                    {icon}{label}
                  </span>
                  <span className="text-xs text-gray-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 px-1">
            {visibilidade === "publico" ? <Globe size={12} className="text-indigo-400" /> : <Lock size={12} />}
            <span>{visibilidade === "publico" ? "Cartão público" : "Cartão privado"}</span>
          </div>
        )}

        {/* Histórico */}
        {!editing && (cartao.origem || cartao.created_at) && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <span>
              {cartao.origem === "ocr" ? "📷 Digitalizado por foto" : cartao.origem === "compartilhado" ? "🔗 Recebido por compartilhamento" : "✏️ Adicionado manualmente"}
            </span>
            {cartao.created_at && (
              <span>· {new Date(cartao.created_at).toLocaleDateString("pt-BR")}</span>
            )}
          </div>
        )}

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : "Salvar alterações"}
          </button>
        )}
      </div>
    </div>
  );
}

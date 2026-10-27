"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Camera, X, Loader2, ScanLine, FlipHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const FotoCrop = dynamic(() => import("@/components/FotoCrop"), { ssr: false });
const TagsInput = dynamic(() => import("@/components/TagsInput"), { ssr: false });

type CropAlvo = "frente" | "verso";

export default function NovoCartaoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const fileVersoRef = useRef<HTMLInputElement>(null);
  const [cropAlvo, setCropAlvo] = useState<CropAlvo>("frente");

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoVerso, setFotoVerso] = useState<File | null>(null);
  const [fotoVersoPreview, setFotoVersoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrErro, setOcrErro] = useState("");
  const [form, setForm] = useState({
    nome: "", empresa: "", cargo: "", email: "", telefone: "", site: "", instagram: "", endereco: "", notas: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  async function handleFotoFile(file: File, previewUrl: string, alvo: CropAlvo) {
    if (alvo === "frente") {
      setFoto(file);
      setFotoPreview(previewUrl);
      // OCR só na frente
      setScanning(true);
      setOcrErro("");
      try {
        const fd = new FormData();
        fd.append("imagem", file);
        const res = await fetch("/api/ocr", { method: "POST", body: fd });
        const dados = await res.json();
        if (!res.ok) {
          setOcrErro(`OCR: ${dados.error ?? res.status}`);
        } else {
          const preencheu = dados.nome || dados.empresa || dados.email || dados.telefone;
          if (!preencheu) setOcrErro("OCR não encontrou dados no cartão");
          setForm((f) => ({
            nome: dados.nome || f.nome,
            empresa: dados.empresa || f.empresa,
            cargo: dados.cargo || f.cargo,
            email: dados.email || f.email,
            telefone: dados.telefone || f.telefone,
            site: dados.site || f.site,
            instagram: dados.instagram || f.instagram,
            endereco: dados.endereco || f.endereco,
            notas: f.notas,
          }));
        }
      } catch (e) {
        setOcrErro(`Erro ao chamar OCR: ${e}`);
      } finally {
        setScanning(false);
      }
    } else {
      setFotoVerso(file);
      setFotoVersoPreview(previewUrl);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, alvo: CropAlvo) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropAlvo(alvo);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function uploadFoto(file: File, userId: string): Promise<string | null> {
    const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("cartoes-fotos").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("cartoes-fotos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [foto_url, foto_verso] = await Promise.all([
      foto ? uploadFoto(foto, user.id) : Promise.resolve(null),
      fotoVerso ? uploadFoto(fotoVerso, user.id) : Promise.resolve(null),
    ]);

    const { error } = await supabase.from("cartoes").insert({
      user_id: user.id,
      ...form,
      foto_url,
      foto_verso,
      tags,
    });

    if (error) {
      alert("Erro ao salvar cartão.");
      setSaving(false);
      return;
    }

    router.push("/cartoes");
  }

  return (
    <>
      {cropSrc && (
        <FotoCrop
          src={cropSrc}
          onConfirm={(file, url) => {
            setCropSrc(null);
            handleFotoFile(file, url, cropAlvo);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/cartoes" className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="font-bold text-gray-900">Novo Cartão</h1>
          </div>
        </header>

        <form onSubmit={handleSave} className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

          {/* Fotos frente e verso */}
          <div className="flex flex-col gap-3">
            {/* Frente */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Frente</p>
              {fotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9]">
                  <Image src={fotoPreview} alt="Frente do cartão" fill className="object-contain" />
                  <button
                    type="button"
                    onClick={() => { setFoto(null); setFotoPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/50 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1"
                  >
                    <Camera size={12} /> Trocar foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-indigo-300 rounded-2xl py-8 flex flex-col items-center gap-2 text-indigo-400 hover:bg-indigo-50 active:bg-indigo-100 transition"
                >
                  <Camera size={28} />
                  <span className="text-sm font-medium">Foto da frente</span>
                </button>
              )}
              {scanning && (
                <div className="flex items-center gap-2 text-indigo-500 text-sm mt-2">
                  <ScanLine size={16} className="animate-pulse" />
                  Lendo dados do cartão...
                </div>
              )}
              {ocrErro && <p className="text-xs text-amber-600 mt-1">{ocrErro}</p>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, "frente")} />
            </div>

            {/* Verso — só aparece se tiver frente ou se quiser adicionar */}
            {(fotoPreview || fotoVersoPreview) && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Verso (opcional)</p>
                {fotoVersoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9]">
                    <Image src={fotoVersoPreview} alt="Verso do cartão" fill className="object-contain" />
                    <button
                      type="button"
                      onClick={() => { setFotoVerso(null); setFotoVersoPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileVersoRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black/50 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1"
                    >
                      <Camera size={12} /> Trocar foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileVersoRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    <FlipHorizontal size={24} />
                    <span className="text-sm font-medium">Adicionar foto do verso</span>
                  </button>
                )}
                <input ref={fileVersoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileInput(e, "verso")} />
              </div>
            )}
          </div>

          {/* Campos */}
          <div className="bg-white rounded-2xl border divide-y">
            {[
              { field: "nome", label: "Nome", type: "text", placeholder: "João Silva" },
              { field: "empresa", label: "Empresa", type: "text", placeholder: "Acme Ltda." },
              { field: "cargo", label: "Cargo", type: "text", placeholder: "Gerente Comercial" },
              { field: "email", label: "E-mail", type: "email", placeholder: "joao@acme.com" },
              { field: "telefone", label: "Telefone", type: "tel", placeholder: "(11) 99999-0000" },
              { field: "site", label: "Site", type: "url", placeholder: "https://acme.com" },
              { field: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
              { field: "endereco", label: "Endereço", type: "text", placeholder: "Rua..." },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field} className="flex items-center px-4 py-3 gap-3">
                <label className="text-sm text-gray-500 w-24 shrink-0">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={set(field)}
                  className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300"
                />
              </div>
            ))}
            <div className="px-4 py-3">
              <label className="text-sm text-gray-500 block mb-1">Tags</label>
              <TagsInput tags={tags} onChange={setTags} />
            </div>
            <div className="px-4 py-3">
              <label className="text-sm text-gray-500 block mb-1">Notas</label>
              <textarea
                placeholder="Onde nos conhecemos, contexto..."
                value={form.notas}
                onChange={set("notas")}
                rows={3}
                className="w-full text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-300 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition disabled:opacity-50"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : "Salvar cartão"}
          </button>
        </form>
      </div>
    </>
  );
}

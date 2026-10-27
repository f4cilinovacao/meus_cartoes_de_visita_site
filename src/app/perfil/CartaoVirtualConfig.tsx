"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ExternalLink, Check, Globe, Copy, Eye, QrCode, BarChart2 } from "lucide-react";
import QRCode from "react-qr-code";

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
  twitter: string | null;
  tiktok: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  localizacao: string | null;
  bio: string | null;
  foto_url: string | null;
  capa_url: string | null;
  short_code: string | null;
  views: number | null;
  ativo: boolean;
}

interface Props {
  userId: string;
  perfilAtual: PerfilPublico | null;
  emailUsuario: string;
  avatarUrl: string | null;
}

export default function CartaoVirtualConfig({ userId, perfilAtual, emailUsuario, avatarUrl }: Props) {
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
    twitter: perfilAtual?.twitter ?? "",
    tiktok: perfilAtual?.tiktok ?? "",
    linkedin: perfilAtual?.linkedin ?? "",
    youtube: perfilAtual?.youtube ?? "",
    facebook: perfilAtual?.facebook ?? "",
    localizacao: perfilAtual?.localizacao ?? "",
    bio: perfilAtual?.bio ?? "",
    foto_url: perfilAtual?.foto_url ?? avatarUrl ?? "",
    capa_url: perfilAtual?.capa_url ?? "",
    short_code: perfilAtual?.short_code ?? "",
    views: perfilAtual?.views ?? 0,
    ativo: perfilAtual?.ativo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [copiado, setCopiado] = useState<"normal" | "curto" | null>(null);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [mostrarAnalytics, setMostrarAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<{ direto: number; qr: number; curto: number; ultimos7: { dia: string; total: number }[] } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mostrarAnalytics || !perfilAtual || analytics) return;
    const supabase = createClient();
    supabase
      .from("perfil_views")
      .select("origem, viewed_at")
      .then(({ data }) => {
        if (!data) return;
        const cnt = { direto: 0, qr: 0, curto: 0 };
        const dias: Record<string, number> = {};
        const agora = new Date();
        for (const row of data) {
          if (row.origem in cnt) cnt[row.origem as keyof typeof cnt]++;
          const diff = Math.floor((agora.getTime() - new Date(row.viewed_at).getTime()) / 86400000);
          if (diff < 7) {
            const label = new Date(row.viewed_at).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
            dias[label] = (dias[label] ?? 0) + 1;
          }
        }
        // últimos 7 dias ordenados
        const ultimos7 = Object.entries(dias)
          .map(([dia, total]) => ({ dia, total }))
          .slice(-7);
        setAnalytics({ ...cnt, ultimos7 });
      });
  }, [mostrarAnalytics, perfilAtual, analytics]);

  function baixarQR() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    const img = new window.Image();
    img.onload = () => { ctx.drawImage(img, 0, 0, 300, 300); const a = document.createElement("a"); a.download = "qrcode-cartao.png"; a.href = canvas.toDataURL(); a.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function copiar(texto: string, tipo: "normal" | "curto") {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
  }

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
    const short_code = form.short_code || Math.random().toString(36).slice(2, 8);
    const payload = { ...form, username, short_code, id: userId };

    const { error } = perfilAtual
      ? await supabase.from("perfis_publicos").update(payload).eq("id", userId)
      : await supabase.from("perfis_publicos").insert(payload);

    if (error) {
      setErro(error.message.includes("unique") ? "Esse username já está em uso" : error.message);
    } else {
      setForm((f) => ({ ...f, short_code }));
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }
    setSaving(false);
  }

  const BASE = "meuscartoesdevisita.com.br";
  const urlNormal = `https://${BASE}/u/${form.username || "username"}`;
  const urlCurta = form.short_code ? `https://${BASE}/s/${form.short_code}` : null;
  const urlQR = `https://${BASE}/u/${form.username || "username"}?ref=qr`;

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

      {/* Links */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Link normal</p>
            <p className="text-xs font-mono text-indigo-600 truncate max-w-[220px]">{BASE}/u/{form.username || "username"}</p>
          </div>
          <button onClick={() => copiar(urlNormal, "normal")} className="text-gray-400 hover:text-indigo-600 transition p-1">
            {copiado === "normal" ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
          </button>
        </div>
        {urlCurta ? (
          <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-xs text-indigo-400 mb-0.5">Link curto</p>
              <p className="text-xs font-mono text-indigo-700 font-semibold">{BASE}/s/{form.short_code}</p>
            </div>
            <button onClick={() => copiar(urlCurta, "curto")} className="text-indigo-400 hover:text-indigo-700 transition p-1">
              {copiado === "curto" ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">O link curto será gerado automaticamente ao salvar.</p>
        )}
      </div>

      {/* Stats + QR */}
      {perfilAtual && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Eye size={15} className="text-indigo-400" />
            <span><strong className="text-gray-800">{perfilAtual.views ?? 0}</strong> visualizações</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMostrarAnalytics((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              <BarChart2 size={15} />
              {mostrarAnalytics ? "Ocultar stats" : "Ver stats"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarQR((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              <QrCode size={15} />
              {mostrarQR ? "Ocultar QR" : "Ver QR"}
            </button>
          </div>
        </div>
      )}

      {/* Analytics panel */}
      {mostrarAnalytics && perfilAtual && (
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Origem das visitas</p>
          {!analytics ? (
            <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 size={13} className="animate-spin" /> Carregando...</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: "Link direto", key: "direto", color: "bg-indigo-100 text-indigo-700" },
                  { label: "Link curto", key: "curto", color: "bg-blue-100 text-blue-700" },
                  { label: "QR Code", key: "qr", color: "bg-green-100 text-green-700" },
                ] as const).map(({ label, key, color }) => (
                  <div key={key} className={`rounded-xl p-3 flex flex-col items-center gap-1 ${color}`}>
                    <span className="text-xl font-bold">{analytics[key]}</span>
                    <span className="text-xs font-medium text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              {analytics.ultimos7.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Últimos 7 dias</p>
                  <div className="flex items-end gap-1 h-16">
                    {analytics.ultimos7.map(({ dia, total }) => {
                      const max = Math.max(...analytics.ultimos7.map((d) => d.total), 1);
                      return (
                        <div key={dia} className="flex flex-col items-center gap-1 flex-1" title={`${dia}: ${total}`}>
                          <div
                            className="w-full bg-indigo-400 rounded-t-md transition-all"
                            style={{ height: `${Math.max(4, (total / max) * 52)}px` }}
                          />
                          <span className="text-[9px] text-gray-400 truncate w-full text-center">{dia}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {analytics.ultimos7.length === 0 && (
                <p className="text-xs text-gray-400 italic">Nenhuma visita nos últimos 7 dias.</p>
              )}
            </>
          )}
        </div>
      )}

      {mostrarQR && urlCurta && (
        <div className="flex flex-col items-center gap-3 bg-gray-50 rounded-2xl p-4">
          <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-sm">
            <QRCode value={urlQR} size={160} />
          </div>
          <p className="text-xs text-gray-400 text-center">{BASE}/s/{form.short_code}</p>
          <button
            type="button"
            onClick={baixarQR}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition"
          >
            Baixar QR Code (PNG)
          </button>
        </div>
      )}

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

        {/* Foto de perfil */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">URL da foto de perfil</label>
          <input
            type="url"
            value={(form.foto_url as string) ?? ""}
            onChange={set("foto_url")}
            placeholder="https://..."
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {form.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.foto_url} alt="preview" className="mt-2 w-12 h-12 rounded-full object-cover border" />
          )}
        </div>

        {/* Foto de capa */}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">URL da foto de capa <span className="text-gray-400 font-normal">(faixa atrás do perfil)</span></label>
          <input
            type="url"
            value={(form.capa_url as string) ?? ""}
            onChange={set("capa_url")}
            placeholder="https://..."
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {form.capa_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.capa_url} alt="preview capa" className="mt-2 w-full h-16 object-cover rounded-xl border" />
          )}
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
            { field: "twitter" as const, label: "X (Twitter)", placeholder: "@usuario" },
            { field: "tiktok" as const, label: "TikTok", placeholder: "@usuario" },
            { field: "linkedin" as const, label: "LinkedIn", placeholder: "linkedin.com/in/usuario" },
            { field: "youtube" as const, label: "YouTube", placeholder: "@canal ou URL" },
            { field: "facebook" as const, label: "Facebook", placeholder: "facebook.com/usuario" },
            { field: "site" as const, label: "Site", placeholder: "https://acme.com" },
            { field: "localizacao" as const, label: "Localização", placeholder: "Cidade • Estado" },
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

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Phone, Mail, MapPin, ChevronRight, UserPlus } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export const instant = false;

export default async function PerfilPublicoPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("perfis_publicos")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("ativo", true)
    .single();

  if (!perfil) notFound();

  // Incrementa views (fire-and-forget, não bloqueia render)
  supabase.rpc("increment_profile_views", { profile_username: username.toLowerCase() });

  // vCard
  const escape = (s: string | null) => (s ?? "").replace(/[,;\\]/g, (c) => `\\${c}`);
  const nomes = (perfil.nome ?? "").trim().split(" ");
  const vcf = [
    "BEGIN:VCARD", "VERSION:3.0",
    `N:${escape(nomes.slice(1).join(" "))};${escape(nomes[0])};;;`,
    `FN:${escape(perfil.nome)}`,
    perfil.empresa ? `ORG:${escape(perfil.empresa)}` : "",
    perfil.cargo ? `TITLE:${escape(perfil.cargo)}` : "",
    perfil.email ? `EMAIL;TYPE=WORK:${perfil.email}` : "",
    perfil.telefone ? `TEL;TYPE=WORK,VOICE:${perfil.telefone}` : "",
    perfil.site ? `URL:${perfil.site}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
  const vcfDataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`;

  // Redes sociais
  type Social = { label: string; href: string; bg: string; text: string; abbr: string };
  const sociais: Social[] = [
    perfil.instagram && { label: "Instagram", abbr: "IG", href: `https://instagram.com/${perfil.instagram.replace("@", "")}`, bg: "bg-gradient-to-br from-pink-500 to-orange-400", text: "text-white" },
    perfil.linkedin && { label: "LinkedIn", abbr: "in", href: perfil.linkedin.startsWith("http") ? perfil.linkedin : `https://linkedin.com/in/${perfil.linkedin}`, bg: "bg-blue-700", text: "text-white" },
    perfil.youtube && { label: "YouTube", abbr: "▶", href: perfil.youtube.startsWith("http") ? perfil.youtube : `https://youtube.com/@${perfil.youtube.replace("@", "")}`, bg: "bg-red-600", text: "text-white" },
    perfil.twitter && { label: "X", abbr: "𝕏", href: `https://x.com/${perfil.twitter.replace("@", "")}`, bg: "bg-black", text: "text-white" },
    perfil.tiktok && { label: "TikTok", abbr: "TT", href: `https://tiktok.com/@${perfil.tiktok.replace("@", "")}`, bg: "bg-gray-900", text: "text-white" },
    perfil.facebook && { label: "Facebook", abbr: "f", href: perfil.facebook.startsWith("http") ? perfil.facebook : `https://facebook.com/${perfil.facebook}`, bg: "bg-blue-600", text: "text-white" },
    perfil.site && { label: "Site", abbr: "🌐", href: perfil.site, bg: "bg-gray-200", text: "text-gray-700" },
  ].filter(Boolean) as Social[];

  return (
    <>
    <style>{`
      body { background: url('/bg-cartao-virtual.webp') center center / cover no-repeat fixed !important; min-height: 100vh; }
      [data-dark="1"] body { background: #0f172a !important; }
      [data-dark="1"] .card-bg { background: #1e293b !important; }
      [data-dark="1"] .card-text { color: #f1f5f9 !important; }
      [data-dark="1"] .card-sub { color: #94a3b8 !important; }
      [data-dark="1"] .card-row { background: #334155 !important; border-color: #475569 !important; }
      [data-dark="1"] .card-row-text { color: #e2e8f0 !important; }
    `}</style>
    <DarkModeToggle />
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-sm flex flex-col gap-5">

        {/* Card principal */}
        <div className="card-bg bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Foto de capa */}
          {perfil.capa_url && (
            <div className="w-full h-28 overflow-hidden rounded-t-3xl">
              <Image src={perfil.capa_url} alt="Capa" fill={false} width={400} height={112} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Topo do card */}
          <div className={`flex flex-col items-center ${perfil.capa_url ? "-mt-12 pt-0" : "pt-8"} pb-5 px-6 gap-3`}>

            {/* Foto */}
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 ${perfil.capa_url ? "ring-2 ring-white" : ""}`}>
              {perfil.foto_url ? (
                <Image src={perfil.foto_url} alt={perfil.nome ?? ""} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
                  {(perfil.nome ?? "?")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Identidade */}
            <div className="text-center">
              <h1 className="card-text text-2xl font-bold text-gray-900 leading-tight">{perfil.nome}</h1>
              {perfil.cargo && <p className="text-indigo-600 font-semibold mt-0.5">{perfil.cargo}</p>}
              {perfil.empresa && <p className="card-sub text-gray-500 text-sm mt-0.5">{perfil.empresa}</p>}
              {perfil.bio && <p className="card-sub text-gray-500 text-sm mt-2 leading-relaxed">{perfil.bio}</p>}
            </div>
          </div>

          {/* Ações */}
          <div className="px-5 pb-5 flex flex-col gap-3">

            {/* WhatsApp CTA primário */}
            {perfil.whatsapp && (
              <a
                href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white px-5 py-4 rounded-2xl font-bold text-base transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Vamos conversar?</span>
                </div>
                <ChevronRight size={20} />
              </a>
            )}

            {/* Salvar contato */}
            <a
              href={vcfDataUrl}
              download={`${(perfil.nome ?? "contato").replace(/\s+/g, "_")}.vcf`}
              className="flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-600 px-5 py-3.5 rounded-2xl font-semibold text-sm hover:bg-indigo-50 active:scale-[0.98] transition"
            >
              <UserPlus size={18} />
              Salvar contato
            </a>

            {/* Telefone */}
            {perfil.telefone && (
              <a
                href={`tel:${perfil.telefone}`}
                className="card-row flex items-center gap-4 border border-gray-100 bg-gray-50 hover:bg-indigo-50 px-4 py-3.5 rounded-2xl transition active:scale-[0.98]"
              >
                <Phone size={20} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="card-sub text-xs font-semibold text-gray-500 uppercase tracking-wide">Ligar</p>
                  <p className="card-row-text text-sm font-medium text-gray-800 truncate">{perfil.telefone}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </a>
            )}

            {/* E-mail */}
            {perfil.email && (
              <a
                href={`mailto:${perfil.email}`}
                className="card-row flex items-center gap-4 border border-gray-100 bg-gray-50 hover:bg-indigo-50 px-4 py-3.5 rounded-2xl transition active:scale-[0.98]"
              >
                <Mail size={20} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="card-sub text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</p>
                  <p className="card-row-text text-sm font-medium text-gray-800 truncate">{perfil.email}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </a>
            )}

            {/* Redes sociais */}
            {sociais.length > 0 && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {sociais.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className={`w-11 h-11 rounded-full ${s.bg} ${s.text} flex items-center justify-center font-bold text-sm shadow-sm hover:scale-110 active:scale-95 transition`}
                    >
                      {s.abbr}
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* Localização */}
            {perfil.localizacao && (
              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mt-1">
                <MapPin size={13} />
                <span>{perfil.localizacao}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé / branding */}
        <a
          href="https://meuscartoesdevisita.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 hover:opacity-80 transition"
        >
          <Image src="/logo.svg" alt="Meus Cartões de Visita" width={160} height={40} />
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Crie seu cartão digital</p>
        </a>

      </div>
    </div>
    </>
  );
}

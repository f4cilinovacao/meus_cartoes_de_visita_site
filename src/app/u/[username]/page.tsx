import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, Globe, MessageCircle } from "lucide-react";

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

  const links = [
    perfil.whatsapp && {
      icon: <MessageCircle size={20} />,
      label: "WhatsApp",
      href: `https://wa.me/${perfil.whatsapp.replace(/\D/g, "")}`,
      color: "bg-green-500 hover:bg-green-600",
    },
    perfil.telefone && {
      icon: <Phone size={20} />,
      label: perfil.telefone,
      href: `tel:${perfil.telefone}`,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    perfil.email && {
      icon: <Mail size={20} />,
      label: perfil.email,
      href: `mailto:${perfil.email}`,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    perfil.instagram && {
      icon: <span className="text-sm font-bold leading-none">IG</span>,
      label: perfil.instagram,
      href: `https://instagram.com/${perfil.instagram.replace("@", "")}`,
      color: "bg-pink-500 hover:bg-pink-600",
    },
    perfil.twitter && {
      icon: <span className="text-sm font-bold leading-none">𝕏</span>,
      label: perfil.twitter,
      href: `https://x.com/${perfil.twitter.replace("@", "")}`,
      color: "bg-black hover:bg-gray-900",
    },
    perfil.tiktok && {
      icon: <span className="text-sm font-bold leading-none">TT</span>,
      label: perfil.tiktok,
      href: `https://tiktok.com/@${perfil.tiktok.replace("@", "")}`,
      color: "bg-gray-900 hover:bg-black",
    },
    perfil.linkedin && {
      icon: <span className="text-sm font-bold leading-none">in</span>,
      label: "LinkedIn",
      href: perfil.linkedin.startsWith("http") ? perfil.linkedin : `https://linkedin.com/in/${perfil.linkedin}`,
      color: "bg-blue-700 hover:bg-blue-800",
    },
    perfil.youtube && {
      icon: <span className="text-sm font-bold leading-none">▶</span>,
      label: "YouTube",
      href: perfil.youtube.startsWith("http") ? perfil.youtube : `https://youtube.com/@${perfil.youtube.replace("@", "")}`,
      color: "bg-red-600 hover:bg-red-700",
    },
    perfil.facebook && {
      icon: <span className="text-sm font-bold leading-none">f</span>,
      label: "Facebook",
      href: perfil.facebook.startsWith("http") ? perfil.facebook : `https://facebook.com/${perfil.facebook}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    perfil.site && {
      icon: <Globe size={20} />,
      label: perfil.site.replace(/^https?:\/\//, ""),
      href: perfil.site,
      color: "bg-gray-700 hover:bg-gray-800",
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string; color: string }[];

  // vCard para "Salvar contato"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Avatar */}
        <div className="relative">
          {perfil.foto_url ? (
            <Image
              src={perfil.foto_url}
              alt={perfil.nome ?? ""}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-3xl border-4 border-white shadow-lg">
              {(perfil.nome ?? "?")[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{perfil.nome}</h1>
          {perfil.cargo && <p className="text-indigo-600 font-medium mt-0.5">{perfil.cargo}</p>}
          {perfil.empresa && <p className="text-gray-500 text-sm mt-0.5">{perfil.empresa}</p>}
          {perfil.bio && <p className="text-gray-600 text-sm mt-3 max-w-xs">{perfil.bio}</p>}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`flex items-center gap-3 ${link.color} text-white px-5 py-3.5 rounded-2xl font-medium transition active:scale-95 shadow-sm`}
              >
                {link.icon}
                <span className="truncate">{link.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Salvar contato */}
        <a
          href={vcfDataUrl}
          download={`${(perfil.nome ?? "contato").replace(/\s+/g, "_")}.vcf`}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-indigo-200 text-indigo-600 px-5 py-3 rounded-2xl font-semibold text-sm hover:bg-indigo-50 transition"
        >
          Salvar nos contatos
        </a>

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-1.5 mt-4">
          <p className="text-xs text-gray-400">Criado com</p>
          <a href="https://meuscartoesdevisita.com.br" target="_blank" rel="noopener noreferrer">
            <Image
              src="/logo.svg"
              alt="Meus Cartões de Visita"
              width={160}
              height={40}
              className="opacity-70 hover:opacity-100 transition"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

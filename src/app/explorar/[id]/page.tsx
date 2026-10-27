import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Phone, Mail, Globe, MapPin, Building2, Tag } from "lucide-react";
import ConexaoButton from "./ConexaoButton";

export const instant = false;

export default async function ExplorarCartaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from("cartoes")
    .select("id, user_id, nome, empresa, cargo, email, telefone, site, instagram, endereco, foto_url, foto_verso, tags, notas")
    .eq("id", id)
    .eq("visibilidade", "publico")
    .maybeSingle();

  if (!c) notFound();

  // Verifica se o usuário está logado e a relação de conexão com o dono do cartão
  const { data: { user } } = await supabase.auth.getUser();
  let conexaoStatus: "nenhum" | "pendente_enviada" | "pendente_recebida" | "aceita" = "nenhum";
  let conexaoId: string | undefined;
  const ehMeuCartao = user?.id === c.user_id;

  if (user && !ehMeuCartao) {
    const { data: cx } = await supabase
      .from("conexoes")
      .select("id, status, solicitante_id")
      .or(`and(solicitante_id.eq.${user.id},destinatario_id.eq.${c.user_id}),and(solicitante_id.eq.${c.user_id},destinatario_id.eq.${user.id})`)
      .maybeSingle();
    if (cx) {
      conexaoId = cx.id;
      if (cx.status === "aceita") conexaoStatus = "aceita";
      else if (cx.solicitante_id === user.id) conexaoStatus = "pendente_enviada";
      else conexaoStatus = "pendente_recebida";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/explorar" className="p-1 -ml-1 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="font-bold text-gray-900 truncate">{c.nome || c.empresa || "Cartão"}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Foto frente */}
        {c.foto_url && (
          <div className="rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9] relative">
            <Image src={c.foto_url} alt="Frente do cartão" fill className="object-contain" />
          </div>
        )}

        {/* Foto verso */}
        {c.foto_verso && (
          <div className="rounded-2xl overflow-hidden border bg-gray-100 aspect-[16/9] relative">
            <Image src={c.foto_verso} alt="Verso do cartão" fill className="object-contain" />
          </div>
        )}

        {/* Botão conexão */}
        {user && !ehMeuCartao && (
          <ConexaoButton
            cartaoUserId={c.user_id}
            meuUserId={user.id}
            statusInicial={conexaoStatus}
            conexaoId={conexaoId}
          />
        )}
        {!user && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-600 px-5 py-3.5 rounded-2xl font-semibold text-sm hover:bg-indigo-50 transition"
          >
            Entre para se conectar
          </Link>
        )}

        {/* Ações rápidas */}
        {(c.email || c.telefone || c.site) && (
          <div className="flex gap-3">
            {c.telefone && (
              <a href={`tel:${c.telefone}`} className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Phone size={20} />
                <span className="text-xs font-medium">Ligar</span>
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Mail size={20} />
                <span className="text-xs font-medium">E-mail</span>
              </a>
            )}
            {c.site && (
              <a href={c.site} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center gap-1 bg-white border rounded-2xl py-3 text-indigo-600 hover:bg-indigo-50 transition">
                <Globe size={20} />
                <span className="text-xs font-medium">Site</span>
              </a>
            )}
          </div>
        )}

        {/* Campos */}
        <div className="bg-white rounded-2xl border divide-y">
          {[
            { label: "Nome", value: c.nome },
            { label: "Empresa", value: c.empresa },
            { label: "Cargo", value: c.cargo },
            { label: "E-mail", value: c.email },
            { label: "Telefone", value: c.telefone },
            { label: "Site", value: c.site },
            { label: "Instagram", value: c.instagram },
            { label: "Endereço", value: c.endereco },
          ].filter((row) => row.value).map(({ label, value }) => (
            <div key={label} className="flex items-center px-4 py-3 gap-3">
              <span className="text-sm text-gray-400 w-24 shrink-0">{label}</span>
              <span className="flex-1 text-sm text-gray-900">{value}</span>
            </div>
          ))}

          {c.tags && c.tags.length > 0 && (
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-sm text-gray-400 w-24 shrink-0 pt-0.5">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {c.notas && (
            <div className="px-4 py-3">
              <span className="text-sm text-gray-400 block mb-1">Notas</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.notas}</p>
            </div>
          )}
        </div>

        {/* Localização */}
        {c.endereco && (
          <div className="flex items-center gap-2 text-sm text-gray-400 px-1">
            <MapPin size={14} />
            <span>{c.endereco}</span>
          </div>
        )}

        {/* Branding */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <a href="https://meuscartoesdevisita.com.br" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <Image src="/logo.svg" alt="Meus Cartões de Visita" width={140} height={35} />
          </a>
          <p className="text-xs text-gray-400">Organize seus cartões de visita</p>
        </div>

        {/* Info empresa */}
        {c.empresa && (
          <div className="flex items-center gap-2 text-xs text-gray-400 px-1 justify-center">
            <Building2 size={12} />
            <span>{c.empresa}</span>
          </div>
        )}
      </div>
    </div>
  );
}

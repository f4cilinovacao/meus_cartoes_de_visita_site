"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Globe, Share2, ChevronRight, X } from "lucide-react";

const PASSOS = [
  {
    icon: <CreditCard size={32} className="text-indigo-500" />,
    titulo: "Adicione seu primeiro cartão",
    descricao: "Fotografe ou preencha manualmente os dados de um cartão de visita que você recebeu.",
    acao: "Adicionar cartão",
    href: "/cartoes/novo",
  },
  {
    icon: <Globe size={32} className="text-indigo-500" />,
    titulo: "Crie seu cartão virtual",
    descricao: "Monte sua página pública com seus contatos para compartilhar com qualquer pessoa.",
    acao: "Configurar agora",
    href: "/perfil",
  },
  {
    icon: <Share2 size={32} className="text-indigo-500" />,
    titulo: "Compartilhe seus cartões",
    descricao: "Envie seus cartões digitalizados para colegas por e-mail diretamente pelo app.",
    acao: "Ver meus cartões",
    href: "/cartoes",
  },
];

const STORAGE_KEY = "onboarding_dispensado";

export default function OnboardingWizard() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [dispensado, setDispensado] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });

  function dispensar() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* */ }
    setDispensado(true);
  }

  function avancar() {
    if (passo < PASSOS.length - 1) {
      setPasso((p) => p + 1);
    } else {
      dispensar();
    }
  }

  function irPara(href: string) {
    dispensar();
    router.push(href);
  }

  if (dispensado) return null;

  const p = PASSOS[passo];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 relative">
        {/* Fechar */}
        <button onClick={dispensar} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <X size={20} />
        </button>

        {/* Progresso */}
        <div className="flex gap-1.5 justify-center">
          {PASSOS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === passo ? "w-8 bg-indigo-500" : i < passo ? "w-4 bg-indigo-300" : "w-4 bg-gray-200"}`}
            />
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col items-center gap-3 text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            {p.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{p.titulo}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{p.descricao}</p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => irPara(p.href)}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition"
          >
            {p.acao} <ChevronRight size={18} />
          </button>
          <button
            onClick={avancar}
            className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition"
          >
            {passo < PASSOS.length - 1 ? "Pular este passo" : "Fechar"}
          </button>
        </div>
      </div>
    </div>
  );
}

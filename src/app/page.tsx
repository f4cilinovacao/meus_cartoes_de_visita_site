import Link from "next/link";
import Image from "next/image";
import { Search, Tag, Share2, Camera, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Meus Cartões de Visita" width={180} height={45} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <CheckCircle size={13} />
            Gratuito para começar
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Seus cartões de visita{" "}
            <span className="text-indigo-600">sempre com você</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Armazene, consulte, classifique, organize e compartilhe seus cartões de visita — tudo em um só lugar. Tire uma foto e nunca perca um contato importante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastro"
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-4 rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-95 transition shadow-md shadow-indigo-200"
            >
              Começar agora — é grátis
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-7 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 transition"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Mock card stack */}
        <div className="max-w-sm mx-auto mt-14 relative h-52">
          {/* Card 3 */}
          <div className="absolute inset-0 rotate-6 bg-purple-100 rounded-2xl border border-purple-200 shadow-sm" />
          {/* Card 2 */}
          <div className="absolute inset-0 rotate-2 bg-blue-50 rounded-2xl border border-blue-200 shadow-sm" />
          {/* Card 1 - front */}
          <div className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-lg p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900 text-base">Ana Paula Souza</p>
                <p className="text-indigo-600 text-sm font-medium">Diretora de Marketing</p>
                <p className="text-gray-400 text-xs mt-0.5">Tech Solutions Ltda.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                A
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>ana@techsolutions.com.br</span>
              <span>(11) 99999-0000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Recursos</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-14">
            Tudo que você precisa em um só app
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Camera size={22} className="text-indigo-600" />,
                title: "Capture com câmera",
                desc: "Fotografe o cartão e deixe a IA preencher os dados automaticamente.",
              },
              {
                icon: <Search size={22} className="text-indigo-600" />,
                title: "Busca instantânea",
                desc: "Encontre qualquer contato em segundos por nome, empresa ou cargo.",
              },
              {
                icon: <Tag size={22} className="text-indigo-600" />,
                title: "Organize como quiser",
                desc: "Classifique seus contatos com tags, notas e campos personalizados.",
              },
              {
                icon: <Share2 size={22} className="text-indigo-600" />,
                title: "Compartilhe fácil",
                desc: "Exporte contatos para o seu celular ou envie para colegas.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6">
                <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-14">
            Simples assim
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tire uma foto", desc: "Abra o app, aponte a câmera para o cartão e fotografe." },
              { step: "2", title: "IA preenche tudo", desc: "Os dados como nome, email e telefone são extraídos automaticamente." },
              { step: "3", title: "Organize e busque", desc: "Seu cartão fica salvo e acessível a qualquer hora, em qualquer lugar." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-300">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Chega de cartões perdidos
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Crie sua conta agora e digitalize seus cartões em minutos.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-50 active:scale-95 transition shadow-lg"
          >
            Criar conta grátis
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center bg-white border-t border-gray-100">
        <div className="flex items-center justify-center mb-2">
          <Image src="/logo.svg" alt="Meus Cartões de Visita" width={160} height={40} />
        </div>
        <p className="text-xs text-gray-400">© 2025 · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

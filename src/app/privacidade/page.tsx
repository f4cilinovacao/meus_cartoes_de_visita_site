import Link from "next/link";
import Image from "next/image";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.svg" alt="" width={26} height={26} aria-hidden="true" />
            <span className="font-bold text-gray-900 text-sm">Meus Cartões de Visita</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: outubro de 2025</p>

        <div className="bg-white rounded-2xl border p-8 flex flex-col gap-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Quem somos</h2>
            <p>O <strong>Meus Cartões de Visita</strong> é um serviço disponível em <a href="https://meuscartoesdevisita.com.br" className="text-indigo-600 hover:underline">meuscartoesdevisita.com.br</a> que permite aos usuários digitalizar, armazenar e organizar cartões de visita físicos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li><strong>Dados de conta:</strong> nome, endereço de email e foto de perfil, fornecidos ao criar uma conta ou ao entrar com o Google.</li>
              <li><strong>Cartões de visita:</strong> informações extraídas dos cartões que você fotografa (nome, empresa, cargo, email, telefone, site, endereço, notas) e as fotos dos cartões.</li>
              <li><strong>Dados de uso:</strong> informações técnicas como endereço IP, tipo de navegador e páginas visitadas, usadas para fins de segurança e melhoria do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li>Para fornecer e manter o serviço.</li>
              <li>Para autenticar sua identidade e proteger sua conta.</li>
              <li>Para processar as imagens dos cartões e extrair informações automaticamente.</li>
              <li>Para enviar comunicações relacionadas ao serviço (ex.: confirmação de email).</li>
            </ul>
            <p className="mt-3">Não vendemos, compartilhamos nem usamos seus dados para fins publicitários.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Armazenamento e segurança</h2>
            <p>Seus dados são armazenados de forma segura no <strong>Supabase</strong>, com criptografia em trânsito (HTTPS) e em repouso. O acesso aos seus cartões é restrito exclusivamente à sua conta através de políticas de segurança em nível de linha (Row Level Security).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Seus direitos</h2>
            <p>Você pode, a qualquer momento:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 mt-2">
              <li>Acessar e editar seus dados dentro do próprio aplicativo.</li>
              <li>Excluir seus cartões individualmente.</li>
              <li>Solicitar a exclusão completa da sua conta e todos os dados associados pelo email <a href="mailto:larturmenezes@gmail.com" className="text-indigo-600 hover:underline">larturmenezes@gmail.com</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p>Utilizamos cookies exclusivamente para manter sua sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contato</h2>
            <p>Para dúvidas sobre esta política, entre em contato pelo email: <a href="mailto:larturmenezes@gmail.com" className="text-indigo-600 hover:underline">larturmenezes@gmail.com</a></p>
          </section>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">← Voltar para o início</Link>
        </p>
      </main>
    </div>
  );
}

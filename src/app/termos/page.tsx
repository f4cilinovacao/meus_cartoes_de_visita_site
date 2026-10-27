import Link from "next/link";
import Image from "next/image";

export default function TermosPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: outubro de 2025</p>

        <div className="bg-white rounded-2xl border p-8 flex flex-col gap-8 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos termos</h2>
            <p>Ao criar uma conta e utilizar o <strong>Meus Cartões de Visita</strong>, você concorda com estes Termos de Serviço. Se não concordar, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descrição do serviço</h2>
            <p>O Meus Cartões de Visita é uma plataforma que permite digitalizar, armazenar, organizar e consultar cartões de visita físicos. O serviço é oferecido gratuitamente, podendo no futuro incluir planos pagos com recursos adicionais.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Uso aceitável</h2>
            <p>Você concorda em utilizar o serviço apenas para fins legais e em conformidade com estes termos. É proibido:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 mt-2">
              <li>Armazenar dados de terceiros sem o consentimento destes.</li>
              <li>Utilizar o serviço para fins comerciais de revenda de dados.</li>
              <li>Tentar comprometer a segurança ou integridade do sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Sua conta</h2>
            <p>Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Propriedade dos dados</h2>
            <p>Todos os dados que você inserir no serviço pertencem a você. Não reivindicamos nenhum direito de propriedade sobre suas informações ou cartões armazenados.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Disponibilidade do serviço</h2>
            <p>Nos esforçamos para manter o serviço disponível continuamente, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções ou modificações a qualquer momento.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitação de responsabilidade</h2>
            <p>O serviço é fornecido "como está". Não nos responsabilizamos por perda de dados, interrupções do serviço ou danos indiretos decorrentes do uso da plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Alterações nos termos</h2>
            <p>Podemos atualizar estes termos a qualquer momento. Alterações significativas serão comunicadas por email. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Contato</h2>
            <p>Para dúvidas sobre estes termos: <a href="mailto:larturmenezes@gmail.com" className="text-indigo-600 hover:underline">larturmenezes@gmail.com</a></p>
          </section>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">← Voltar para o início</Link>
        </p>
      </main>
    </div>
  );
}

import { Phone, Mail, Instagram } from "lucide-react";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata = {
  title: "Contato | Mitram Imóveis",
  description: "Entre em contato conosco.",
};

export default function ContactPage() {
  return (
    <div className="bg-mitram-white min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Side: Contact Info */}
        <div className="w-full md:w-2/5 p-10 md:p-16 flex flex-col justify-between bg-white relative">
          <div>
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Phone size={20} className="text-gray-400" />
                  <h3 className="font-bold text-mitram-dark text-lg">WhatsApp / Telefone</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1 ml-8">Nossa equipe está pronta para ajudar.</p>
                <p className="text-mitram-dark font-semibold ml-8">41 99678-7173</p>
                <p className="text-gray-400 text-xs mt-1 ml-8">Segunda a Sexta das 8h às 18h.</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Mail size={20} className="text-gray-400" />
                  <h3 className="font-bold text-mitram-dark text-lg">E-mail</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1 ml-8">Envie-nos um e-mail para propostas e parcerias.</p>
                <p className="text-mitram-dark font-semibold ml-8">lucas.vidal.andrade@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-500 hover:text-mitram-gold hover:bg-mitram-gold/10 transition-colors" title="Instagram">
              <Instagram size={22} />
            </a>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-3/5 bg-mitram-grayLight p-10 md:p-16 rounded-t-[2.5rem] md:rounded-l-none md:rounded-r-[2.5rem]">
          <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark leading-tight mb-4">
            Tem alguma dúvida?<br/>Vamos conversar.
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Conte-nos um pouco sobre você e o que está buscando.
          </p>
          
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

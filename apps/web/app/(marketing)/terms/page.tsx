import { ShieldCheck, Scale, FileCheck, HelpCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="border-b pb-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Scale className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Legal Terms</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-slate-500">
            Devnexes Digital Solutions Private Limited &bull; Effective Date: January 1, 2024
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <FileCheck className="w-5 h-5 text-blue-600" /> 1. Agreement & Tenancy
            </h2>
            <p>
              These Terms of Service govern your organization's ("Tenant") access to and use of the NexERP enterprise resource planning software, hosted services, and related APIs provided by Devnexes Digital Solutions Private Limited ("Devnexes"). By accessing or utilizing the platform, you agree to be bound by these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> 2. Security & Authorized Access
            </h2>
            <p>
              Each tenant receives dedicated isolated operational space. Tenants are responsible for managing access privileges, maintaining the secrecy of authentication credentials, and ensuring all invited operators adhere to organizational security policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Service Availability & SLA</h2>
            <p>
              Devnexes provides an enterprise availability SLA targeting 99.9% uptime for core production and retail POS endpoints. Maintenance windows are scheduled during off-peak operational hours with prior advisory notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Intellectual Property & Data Ownership</h2>
            <p>
              Tenants retain complete and exclusive ownership of all uploaded business records, inventory catalogs, financial ledger entries, and transaction history. Devnexes retains all proprietary rights and intellectual property in the NexERP codebase, design systems, and architecture.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" /> 5. Legal & Corporate Inquiries
            </h2>
            <p>
              For contractual, billing, or compliance inquiries, please contact our corporate legal department:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 text-sm">
              <p className="font-semibold text-slate-900">Devnexes Digital Solutions Private Limited</p>
              <p className="text-slate-600">Email: <a href="mailto:legal@devnexes.com" className="text-blue-600 hover:underline">legal@devnexes.com</a></p>
              <p className="text-slate-600">Website: <a href="https://devnexes.com" className="text-blue-600 hover:underline">https://devnexes.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

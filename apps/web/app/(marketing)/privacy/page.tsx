import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="border-b pb-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Legal & Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-500">
            Devnexes Digital Solutions Private Limited &bull; Effective Date: January 1, 2024
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-blue-600" /> 1. Data Collection & Processing
            </h2>
            <p>
              Devnexes Digital Solutions Private Limited ("Devnexes", "we", "us", or "our") provides the NexERP textile-to-retail enterprise resource planning platform. We collect and process business information strictly necessary to fulfill our service agreements, including tenant account credentials, staff profile data, inventory transactions, and customer sales records entered by your organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-blue-600" /> 2. Confidentiality & Third Parties
            </h2>
            <p>
              We do not sell, rent, monetize, or trade your organization's business records or customer data. Data processing is strictly confined to authorized infrastructure sub-processors (cloud hosting, transactional communications, and authentication providers) bound by strict confidentiality and data protection agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" /> 3. Data Retention & Portability
            </h2>
            <p>
              Business records are retained for the duration of your active subscription and in accordance with applicable statutory financial compliance requirements. Tenants maintain full data ownership and can export complete relational data backups at any time through our automated export tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Security & Compliance Contact</h2>
            <p>
              For privacy inquiries, audit requests, or data subject access requests, please contact our Data Protection Officer at:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3 text-sm">
              <p className="font-semibold text-slate-900">Devnexes Digital Solutions Private Limited</p>
              <p className="text-slate-600">Email: <a href="mailto:privacy@devnexes.com" className="text-blue-600 hover:underline">privacy@devnexes.com</a></p>
              <p className="text-slate-600">Web: <a href="https://devnexes.com" className="text-blue-600 hover:underline">https://devnexes.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

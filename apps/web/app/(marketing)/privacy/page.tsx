import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-500 mb-8">Last Updated: October 2023</p>

        <Alert className="mb-10 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 font-bold">DRAFT — PENDING LEGAL REVIEW</AlertTitle>
          <AlertDescription className="text-amber-700">
            This document is a placeholder and has not been reviewed by a licensed attorney. It does not constitute a legally binding agreement.
          </AlertDescription>
        </Alert>

        <div className="prose prose-slate max-w-none">
          <h2>1. Data Collection</h2>
          <p>
            We collect personal data necessary to provide the NexERP service. This includes account information, employee PII, biometric templates (where explicitly consented), and customer data entered by the Tenant.
          </p>

          <h2>2. How We Use Data</h2>
          <p>
            Data is strictly used for service delivery. We do not sell your data or your customers' data to third parties.
          </p>

          <h2>3. Data Retention & Deletion</h2>
          <p>
            Data is retained according to our Data Retention Policy, which is enforced globally across the platform. Terminated employee records, particularly biometric data, are subjected to strict hard-deletion jobs once the retention window expires.
          </p>

          <h2>4. Data Subject Rights</h2>
          <p>
            You have the right to access, correct, or request the erasure of your personal data. Tenants can use the "Request Full Data Export" feature to fulfill portability requests. For privacy inquiries, please contact privacy@devnexes.site.
          </p>
        </div>
      </div>
    </div>
  );
}

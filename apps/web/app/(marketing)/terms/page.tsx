import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TermsOfServicePage() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Terms of Service
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
          <h2>1. Definitions</h2>
          <p>
            "Tenant" refers to the business entity subscribing to the NexERP platform. "User" refers to any individual granted access to the platform by a Tenant.
          </p>

          <h2>2. Account & Access</h2>
          <p>
            Access to NexERP is provided on an invite-only basis. Tenants are responsible for maintaining the security of their accounts and ensuring that all invited Users comply with these Terms.
          </p>

          <h2>3. Subscription & Billing</h2>
          <p>
            Subscriptions are billed in advance on a monthly or annual basis. Failure to pay may result in account suspension.
          </p>

          <h2>4. Data Ownership</h2>
          <p>
            Tenants retain full ownership of all business data uploaded or generated within the platform. Devnexes retains all intellectual property rights to the NexERP platform, software, and underlying technology.
          </p>

          <h2>5. Termination</h2>
          <p>
            Either party may terminate this agreement. Upon termination, Tenants will have a 30-day window to export their data before it is permanently deleted in accordance with our Data Retention Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

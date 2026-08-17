import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield } from "lucide-react";

export default function SubProcessorsPage() {
  const processors = [
    { name: "Amazon Web Services (AWS)", role: "Cloud Hosting & Infrastructure", location: "US-East-1 (Default)" },
    { name: "Clerk", role: "Identity & Access Management (SSO, MFA)", location: "United States" },
    { name: "Twilio", role: "SMS & WhatsApp Notifications", location: "United States" },
    { name: "JazzCash / Easypaisa", role: "Payment Gateways (Tokenized)", location: "Pakistan" },
  ];

  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Authorized Sub-processors
            </h1>
            <p className="text-slate-500 mt-1">
              Third-party services that process data on behalf of NexERP.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub-processor</TableHead>
                <TableHead>Role / Purpose</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processors.map((processor) => (
                <TableRow key={processor.name}>
                  <TableCell className="font-semibold text-slate-900">{processor.name}</TableCell>
                  <TableCell className="text-slate-600">{processor.role}</TableCell>
                  <TableCell className="text-slate-500">{processor.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

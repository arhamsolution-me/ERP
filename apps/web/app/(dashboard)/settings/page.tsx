import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Bell, CreditCard, Key, Database, GitBranch } from "lucide-react";
import Link from "next/link";

export default function SettingsHomePage() {
  const categories = [
    { name: "Company Profile", desc: "Manage business details, logo, and core settings.", icon: Building2, href: "/settings/company" },
    { name: "Branches & Mills", desc: "Configure physical locations and warehouses.", icon: GitBranch, href: "/settings/branches" },
    { name: "Users & Access", desc: "Invite staff and manage their access.", icon: Users, href: "/settings/users" },
    { name: "Roles & Permissions", desc: "Define granular access controls.", icon: Shield, href: "/settings/roles" },
    { name: "Notifications", desc: "Configure email, SMS, and in-app alerts.", icon: Bell, href: "/settings/notifications" },
    { name: "Billing & Plans", desc: "Manage subscription and payment methods.", icon: CreditCard, href: "/settings/billing" },
    { name: "Integrations", desc: "Connect FBR, payment gateways, and devices.", icon: Key, href: "/settings/integrations" },
    { name: "Data & Export", desc: "Request data backups and audit logs.", icon: Database, href: "/settings/data" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your NexERP tenant configuration and integrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.name} href={category.href}>
            <Card className="h-full hover:border-blue-500 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-md group-hover:bg-blue-100 transition-colors">
                    <category.icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.desc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

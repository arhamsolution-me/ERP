import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, ShieldAlert } from "lucide-react";

export default function UsersSettingsPage() {
  // Mock data
  const users = [
    { id: "USR-01", name: "Ahmed Raza", email: "ahmed@nexerp.com", roles: ["Owner"], status: "Active" },
    { id: "USR-02", name: "Sara Ahmed", email: "sara@nexerp.com", roles: ["Store Supervisor"], status: "Active" },
    { id: "USR-03", name: "Zainab Ali", email: "zainab@nexerp.com", roles: ["Accountant"], status: "Invited" },
    { id: "USR-04", name: "Hamza Khan", email: "hamza@nexerp.com", roles: ["Cashier"], status: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Access</h1>
          <p className="text-muted-foreground">
            Manage system access, roles, and security for your staff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8 bg-gray-50"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Security</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline">
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles.map(role => (
                      <Badge key={role} variant="outline" className="text-xs bg-slate-50">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      user.status === "Active" ? "default" :
                      user.status === "Invited" ? "secondary" :
                      "destructive"
                    }
                    className={user.status === "Active" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent" : ""}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.status === "Active" && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Suspend
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

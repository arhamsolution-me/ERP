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
import { Search, Plus, Filter, FileText, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function RequisitionsListPage() {
  // Mock data
  const requisitions = [
    { id: "REQ-2023-1001", requester: "Ali Khan", branch: "Main Mill", totalItems: 3, estCost: "$4,500", date: "2023-10-25", status: "Approved" },
    { id: "REQ-2023-1002", requester: "Sara Ahmed", branch: "Retail Hub", totalItems: 1, estCost: "$1,200", date: "2023-10-26", status: "Submitted" },
    { id: "REQ-2023-1003", requester: "Usman Tariq", branch: "Main Mill", totalItems: 5, estCost: "$12,000", date: "2023-10-27", status: "Submitted" },
    { id: "REQ-2023-1004", requester: "Fatima Noor", branch: "HQ", totalItems: 2, estCost: "$350", date: "2023-10-27", status: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Requisitions</h1>
          <p className="text-muted-foreground">
            Internal requests for materials and equipment requiring approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Requisition
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID or requester..."
              className="pl-8 bg-gray-50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter Status
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Req ID</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
              <TableHead>Required By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-sm text-blue-600">
                  <Link href={`/purchase/requisitions/${req.id}`} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {req.id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{req.requester}</TableCell>
                <TableCell className="text-muted-foreground">{req.branch}</TableCell>
                <TableCell className="text-right">{req.totalItems}</TableCell>
                <TableCell className="text-right font-medium">{req.estCost}</TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      req.status === "Approved" ? "default" :
                      req.status === "Submitted" ? "secondary" :
                      "outline"
                    }
                    className={
                      req.status === "Approved" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent" :
                      req.status === "Submitted" ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent" :
                      ""
                    }
                  >
                    {req.status === "Approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {req.status === "Submitted" && <Clock className="mr-1 h-3 w-3" />}
                    {req.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

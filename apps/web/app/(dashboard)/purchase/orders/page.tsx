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
import { Search, Plus, Filter, ShoppingCart, Truck, CheckCheck, Send } from "lucide-react";
import Link from "next/link";

export default function PurchaseOrdersListPage() {
  // Mock data
  const orders = [
    { id: "PO-2023-0801", vendor: "Chenab Textiles Ltd.", total: "$12,500.00", date: "2023-10-25", expectedDelivery: "2023-11-01", status: "Sent" },
    { id: "PO-2023-0802", vendor: "Global Machinery Inc.", total: "$45,000.00", date: "2023-10-20", expectedDelivery: "2023-10-28", status: "Partially Received" },
    { id: "PO-2023-0803", vendor: "Apex Logistics", total: "$1,200.00", date: "2023-10-15", expectedDelivery: "2023-10-18", status: "Received" },
    { id: "PO-2023-0804", vendor: "Chenab Textiles Ltd.", total: "$4,500.00", date: "2023-10-27", expectedDelivery: "-", status: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage external purchase orders sent to your vendors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by PO number or vendor..."
              className="pl-8 bg-gray-50"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono text-sm text-blue-600">
                  <Link href={`/purchase/orders/${po.id}`} className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                    {po.id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{po.vendor}</TableCell>
                <TableCell className="text-right font-bold">{po.total}</TableCell>
                <TableCell>{po.date}</TableCell>
                <TableCell className="text-muted-foreground">{po.expectedDelivery}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      po.status === "Received" ? "default" :
                      po.status === "Partially Received" ? "secondary" :
                      po.status === "Sent" ? "outline" :
                      "secondary"
                    }
                    className={
                      po.status === "Received" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent" :
                      po.status === "Partially Received" ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent" :
                      po.status === "Sent" ? "bg-amber-100 text-amber-800 border-amber-200" :
                      "bg-slate-100 text-slate-700"
                    }
                  >
                    {po.status === "Received" && <CheckCheck className="mr-1 h-3 w-3" />}
                    {po.status === "Partially Received" && <Truck className="mr-1 h-3 w-3" />}
                    {po.status === "Sent" && <Send className="mr-1 h-3 w-3" />}
                    {po.status}
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

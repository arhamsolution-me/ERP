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
import { Search, Plus, Building2, AlertOctagon, Star, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function VendorsListPage() {
  // Mock data
  const vendors = [
    { id: "VND-001", name: "Chenab Textiles Ltd.", type: "Raw Material", rating: 4.8, status: "Active" },
    { id: "VND-002", name: "Apex Logistics", type: "Services", rating: 4.2, status: "Active" },
    { id: "VND-003", name: "Global Machinery Inc.", type: "Equipment", rating: 4.9, status: "Active" },
    { id: "VND-004", name: "Shadman Dyes", type: "Raw Material", rating: 2.1, status: "Blacklisted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your suppliers, view ratings, and track purchase history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8 bg-gray-50"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id} className={vendor.status === "Blacklisted" ? "bg-red-50/30" : ""}>
                <TableCell className="font-mono text-sm text-blue-600">
                  <Link href={`/purchase/vendors/${vendor.id}`}>
                    {vendor.id}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {vendor.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-50 text-slate-700">
                    {vendor.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    {vendor.rating.toFixed(1)}
                  </div>
                </TableCell>
                <TableCell>
                  {vendor.status === "Blacklisted" ? (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-transparent">
                      <AlertOctagon className="mr-1 h-3 w-3" />
                      Blacklisted
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

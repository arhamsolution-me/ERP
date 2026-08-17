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
import { Search, Plus, Barcode, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ProductsCatalogPage() {
  // Mock data
  const products = [
    { id: "PRD-901", sku: "DNM-12OZ-BLU", name: "Classic Blue Denim 12oz", category: "Fabric", variants: 1, price: "$5.50/m" },
    { id: "PRD-902", sku: "TSH-BSC-WHT", name: "Basic White T-Shirt", category: "Apparel", variants: 5, price: "$12.00" },
    { id: "PRD-903", sku: "SLK-SCRF-PRT", name: "Printed Silk Scarf", category: "Accessories", variants: 3, price: "$24.00" },
    { id: "PRD-904", sku: "YRN-PLY-30S", name: "Polyester Yarn 30s Cone", category: "Yarn", variants: 1, price: "$3.20/kg" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-muted-foreground">
            Master catalog of all finished goods, fabrics, and apparel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Barcode className="mr-2 h-4 w-4" />
            Print Labels
          </Button>
          <Link href="/inventory/products/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by SKU or Name..."
              className="pl-8 bg-gray-50"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center border text-gray-400">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-blue-600">
                  <Link href={`/inventory/products/${product.id}`}>
                    {product.sku}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell>{product.variants}</TableCell>
                <TableCell className="text-right">{product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

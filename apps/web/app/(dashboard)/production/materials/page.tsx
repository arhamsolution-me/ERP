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
import { Search, Plus } from "lucide-react";

export default function MaterialsListPage() {
  // Mock data
  const materials = [
    { id: "M-001", name: "Raw Cotton - Grade A", category: "Fiber", unit: "kg", stock: 15400, threshold: 5000 },
    { id: "M-002", name: "Polyester Yarn 30s", category: "Yarn", unit: "kg", stock: 2100, threshold: 3000 },
    { id: "M-003", name: "Indigo Dye", category: "Chemical", unit: "ltr", stock: 450, threshold: 200 },
    { id: "M-004", name: "Softener X-100", category: "Chemical", unit: "ltr", stock: 120, threshold: 150 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Raw Materials</h1>
          <p className="text-muted-foreground">
            Master catalog and current stock levels for production materials.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials..."
              className="pl-8 bg-gray-50"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total Stock</TableHead>
              <TableHead className="w-[200px]">Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((mat) => {
              const percent = Math.min(100, (mat.stock / mat.threshold) * 50);
              const isLow = mat.stock < mat.threshold;
              
              return (
                <TableRow key={mat.id}>
                  <TableCell className="font-medium text-blue-600">{mat.id}</TableCell>
                  <TableCell>{mat.name}</TableCell>
                  <TableCell>{mat.category}</TableCell>
                  <TableCell className="text-right">{mat.stock.toLocaleString()} {mat.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      {isLow && <span className="text-[10px] uppercase font-bold text-red-500">Reorder</span>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

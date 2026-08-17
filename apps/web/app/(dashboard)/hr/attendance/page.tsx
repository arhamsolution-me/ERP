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
import { Search, Fingerprint, Keyboard, Smartphone, AlertCircle } from "lucide-react";

export default function AttendanceLogPage() {
  // Mock data
  const logs = [
    { id: 1, empName: "Ali Khan", date: "2023-10-27", checkIn: "08:02 AM", checkOut: "05:15 PM", source: "Biometric" },
    { id: 2, empName: "Sara Ahmed", date: "2023-10-27", checkIn: "09:00 AM", checkOut: "06:05 PM", source: "Mobile" },
    { id: 3, empName: "Usman Tariq", date: "2023-10-27", checkIn: "08:15 AM", checkOut: null, source: "Biometric" },
    { id: 4, empName: "Fatima Noor", date: "2023-10-26", checkIn: "09:10 AM", checkOut: "05:00 PM", source: "Manual" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Log</h1>
          <p className="text-muted-foreground">
            Live feed of employee check-ins and check-outs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            Manual Entry
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or date..."
              className="pl-8 bg-gray-50"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.empName}</TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell className="text-emerald-600 font-medium">{log.checkIn}</TableCell>
                <TableCell className={!log.checkOut ? "text-orange-500 font-medium" : ""}>
                  {log.checkOut || "Missing"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {log.source === "Biometric" && <Fingerprint className="h-3 w-3" />}
                    {log.source === "Manual" && <Keyboard className="h-3 w-3" />}
                    {log.source === "Mobile" && <Smartphone className="h-3 w-3" />}
                    {log.source}
                  </div>
                </TableCell>
                <TableCell>
                  {!log.checkOut && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
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

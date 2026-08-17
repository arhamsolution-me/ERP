import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, PauseCircle, PlayCircle, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data for UI
  const batch = {
    id: id,
    product: "Cotton Denim 12oz",
    status: "In Progress",
    currentStage: "Dyeing",
    plannedQty: 5000,
    startedOn: "2023-10-25",
  };

  const stages = ["Spinning", "Weaving", "Dyeing", "Finishing", "QC"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Batch {batch.id}</h1>
            <Badge variant="default">{batch.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {batch.product} &bull; Planned Qty: {batch.plannedQty.toLocaleString()} mtrs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PauseCircle className="mr-2 h-4 w-4" />
            Put On Hold
          </Button>
          <Button size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Advance Stage
          </Button>
        </div>
      </div>

      {/* Stage Tracker */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex justify-between">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-blue-600 -translate-y-1/2 z-0"></div>
            
            {stages.map((stage, index) => {
              const isCompleted = index < 2; // Spinning, Weaving
              const isCurrent = index === 2; // Dyeing
              
              return (
                <div key={stage} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-blue-600 border-white text-white' : isCurrent ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Batch Details</TabsTrigger>
          <TabsTrigger value="materials">Material Consumption</TabsTrigger>
          <TabsTrigger value="qc">QC Checkpoints</TabsTrigger>
          <TabsTrigger value="audit">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Current Stage</Label>
                    <div className="font-medium">{batch.currentStage}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Machine Assignment</Label>
                    <div className="font-medium text-blue-600 cursor-pointer">Dyeing Vat 2</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Supervisor</Label>
                    <div className="font-medium">Ali Khan</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Started On</Label>
                    <div className="font-medium">{batch.startedOn}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Wastage Tracking</CardTitle>
                <CardDescription>Log wastage for the current stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="wastageQty">Wastage Qty (mtrs)</Label>
                    <Input id="wastageQty" type="number" placeholder="0.00" />
                  </div>
                  <Button variant="secondary">Log</Button>
                </div>
                <div className="mt-4 text-sm">
                  Total Accumulated: <span className="font-semibold text-red-600">125 mtrs (2.5%)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="materials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Raw Materials</CardTitle>
                <CardDescription>Materials consumed by this batch</CardDescription>
              </div>
              <Button size="sm" variant="outline">Add Consumption</Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto h-8 w-8 mb-2" />
                No materials logged yet.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Placeholder for QC and Audit */}
        <TabsContent value="qc">
          <Card><CardContent className="p-6">QC Checks will appear here.</CardContent></Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card><CardContent className="p-6">Audit logs will appear here.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

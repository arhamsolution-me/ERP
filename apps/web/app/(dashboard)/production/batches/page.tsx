"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Filter, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type BatchStatus = "spinning" | "weaving" | "dyeing" | "finishing" | "qc" | "completed";

type Batch = {
  id: string;
  product: { name: string };
  quantity: number;
  stage: BatchStatus;
  status: "on-track" | "delayed" | "on-hold";
  completion: number;
  startDate: string;
  dueDate: string;
};

const STAGES: { id: BatchStatus; label: string }[] = [
  { id: "spinning", label: "Spinning" },
  { id: "weaving", label: "Weaving" },
  { id: "dyeing", label: "Dyeing" },
  { id: "finishing", label: "Finishing" },
  { id: "qc", label: "Quality Control" },
];

export default function ProductionBatchesPage() {
  const [search, setSearch] = useState("");
  const apiClient = useApiClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ['production-batches'],
    queryFn: async () => {
      const res = await apiClient.get('/production/batches');
      return res.data.map((b: any) => ({
        id: b.id,
        product: { name: b.product_variant?.product?.name || 'Unknown' },
        quantity: b.quantity,
        stage: b.stage,
        status: b.status === "delayed" ? "delayed" : b.status === "on-hold" ? "on-hold" : "on-track",
        completion: b.stage === "qc" ? 90 : b.stage === "finishing" ? 75 : b.stage === "dyeing" ? 50 : b.stage === "weaving" ? 25 : 10,
        startDate: new Date(b.start_date).toLocaleDateString(),
        dueDate: new Date(b.end_date).toLocaleDateString(),
      })) as Batch[];
    }
  });

  const filteredBatches = (batches || []).filter(b => b.id.toLowerCase().includes(search.toLowerCase()) || b.product.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8 bg-slate-50/50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Production Board</h1>
          <p className="text-slate-500 mt-1">Live tracking of textile batches across mill stages.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/80 border-slate-200"
            />
          </div>
          <Button variant="outline" size="icon" className="bg-white/80 border-slate-200 text-slate-600">
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20">
            <Plus className="mr-2 h-4 w-4" /> New Batch
          </Button>
        </motion.div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-6 h-full min-w-max px-1">
          {STAGES.map((stageObj, stageIdx) => {
            const stageBatches = filteredBatches.filter(b => b.stage === stageObj.id);
            
            return (
              <div key={stageObj.id} className="w-80 flex flex-col h-full">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {stageObj.label}
                  </h3>
                  <Badge variant="secondary" className="bg-slate-200/50 text-slate-600 border-none">
                    {stageBatches.length}
                  </Badge>
                </div>

                {/* Stage Column (Cards) */}
                <div className="flex-1 rounded-2xl bg-slate-200/30 border border-slate-200/50 p-3 overflow-y-auto space-y-3 shadow-inner">
                  {stageBatches.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-sm text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                      Empty
                    </div>
                  ) : (
                    stageBatches.map((batch, idx) => (
                      <motion.div
                        key={batch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (stageIdx * 0.1) + (idx * 0.05) }}
                      >
                        <Card className={`cursor-grab active:cursor-grabbing border-none shadow-sm hover:shadow-md transition-shadow bg-white ${batch.status === 'delayed' || batch.status === 'on-hold' ? 'ring-1 ring-red-400 ring-offset-1' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                {batch.id}
                              </span>
                              {batch.status === 'delayed' || batch.status === 'on-hold' ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : batch.completion === 100 ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : null}
                            </div>
                            
                            <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{batch.product.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 tabular-nums">{batch.quantity.toLocaleString()} meters planned</p>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 space-y-1.5">
                              <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                <span>Progress</span>
                                <span>{batch.completion}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${batch.completion}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full ${batch.status === 'delayed' || batch.status === 'on-hold' ? 'bg-red-500' : 'bg-indigo-500'}`}
                                />
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span className={batch.status === 'delayed' || batch.status === 'on-hold' ? 'text-red-600' : ''}>Due: {batch.dueDate}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

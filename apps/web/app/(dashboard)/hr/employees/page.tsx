"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, User, MapPin, Phone, Mail, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  status: "active" | "leave" | "suspended";
  biometricId: string;
};

export default function HREmployeesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const apiClient = useApiClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => {
      const res = await apiClient.get('/hr/employees');
      return res.data.map((emp: any) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.role?.name || 'Employee',
        department: emp.department?.name || 'General',
        location: emp.location?.name || 'Main Mill',
        status: emp.status === "ACTIVE" ? "active" : emp.status === "ON_LEAVE" ? "leave" : "suspended",
        biometricId: emp.biometric_id || `BIO-${emp.id.substring(0, 4)}`,
      })) as Employee[];
    }
  });

  const departments = ["All", ...Array.from(new Set((employees || []).map(e => e.department)))];

  const filtered = (employees || []).filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || emp.id.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" ? true : emp.department === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] p-4 md:p-8 bg-slate-50/50 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employee Directory</h1>
          <p className="text-slate-500 mt-1">Manage staff, roles, and biometric access.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          
          {/* Department Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200 overflow-x-auto w-full sm:w-auto hide-scrollbar">
            {departments.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-slate-200"
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white text-slate-600 shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-400">
                  <User className="w-12 h-12 mb-3 opacity-20" />
                  <p>No employees found.</p>
                </div>
              ) : (
                filtered.map((emp, index) => (
                  <motion.div
                    key={emp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                              <p className="text-xs font-medium text-slate-500">{emp.id}</p>
                            </div>
                          </div>
                          {emp.status === 'active' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Active</Badge>}
                          {emp.status === 'leave' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none">On Leave</Badge>}
                          {emp.status === 'suspended' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">Suspended</Badge>}
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <Badge variant="outline" className="font-normal text-slate-500 mr-2">{emp.department}</Badge>
                            <span className="font-medium text-slate-800">{emp.role}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            {emp.location}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <div className="flex items-center">
                              <Fingerprint className="w-3.5 h-3.5 mr-1.5" />
                              Bio ID: {emp.biometricId}
                            </div>
                            <div className="flex gap-2">
                              <button className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Phone className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

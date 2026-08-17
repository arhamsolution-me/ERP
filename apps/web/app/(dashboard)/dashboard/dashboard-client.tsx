'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Package, TrendingUp, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const salesData = [
  { name: 'Mon', total: 4000 },
  { name: 'Tue', total: 3000 },
  { name: 'Wed', total: 5000 },
  { name: 'Thu', total: 2780 },
  { name: 'Fri', total: 6890 },
  { name: 'Sat', total: 8390 },
  { name: 'Sun', total: 7490 },
];

const productionData = [
  { name: 'Week 1', completed: 40, target: 50 },
  { name: 'Week 2', completed: 60, target: 55 },
  { name: 'Week 3', completed: 45, target: 60 },
  { name: 'Week 4', completed: 80, target: 70 },
];

const activities = [
  { id: 1, text: 'Batch #B-1042 advanced to Dyeing', time: '10 mins ago', type: 'production' },
  { id: 2, text: 'Wholesale Order #WO-992 confirmed', time: '45 mins ago', type: 'sales' },
  { id: 3, text: 'Low stock alert: Cotton Yarn (Red)', time: '2 hours ago', type: 'alert' },
  { id: 4, text: 'POS Terminal Main-Branch synced', time: '4 hours ago', type: 'system' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function DashboardClient() {
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening across the enterprise today.</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">Rs. 4,250,000</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Active Batches</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-full">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">34</div>
            <p className="text-xs text-slate-500 mt-1">12 in Dyeing, 8 in QC</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
            <div className="p-2 bg-red-50 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">7</div>
            <p className="text-xs text-red-600 mt-1 font-medium">Requires immediate PO</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Active Staff</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">142</div>
            <p className="text-xs text-slate-500 mt-1">Clocked in today</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Sales Chart */}
        <Card className="col-span-4 border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Weekly Revenue (Retail + Wholesale)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="col-span-3 border-none shadow-md bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full mt-0.5 ${
                    activity.type === 'production' ? 'bg-indigo-50 text-indigo-600' :
                    activity.type === 'sales' ? 'bg-emerald-50 text-emerald-600' :
                    activity.type === 'alert' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {activity.type === 'alert' ? <AlertCircle className="w-4 h-4" /> :
                     activity.type === 'sales' ? <TrendingUp className="w-4 h-4" /> :
                     activity.type === 'production' ? <Package className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

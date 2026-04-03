"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ContainerRecord } from '@/lib/types';
import { Search, Package, Truck, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function LogsPage() {
  const [records, setRecords] = useState<ContainerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('containers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch records";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredRecords = records.filter((record) =>
    record.truck_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sound':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'damage':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-sm text-slate-400 uppercase font-bold">Loading Records...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-20 font-sans flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="text-blue-500" size={24} />
          <h1 className="font-bold tracking-tight uppercase text-sm">Container Logs</h1>
        </div>
        <button
          onClick={fetchRecords}
          disabled={refreshing}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by Truck Number..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 pl-11 pr-4 py-3 rounded-xl border border-slate-800 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
          />
        </div>
        {searchQuery && (
          <p className="text-[10px] text-slate-500 mt-1 ml-1 uppercase font-bold">
            {filteredRecords.length} of {records.length} records
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center gap-3">
          <Truck className="text-slate-600" size={48} />
          <p className="text-slate-500 text-sm font-bold">
            {searchQuery ? 'No matching records found' : 'No records yet'}
          </p>
          {!searchQuery && (
            <p className="text-slate-600 text-xs">Scan a container to add your first record</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-3">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 text-[10px] text-slate-500 uppercase font-black tracking-wider">
            <div className="col-span-3">Container</div>
            <div className="col-span-3">Truck</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-4">Date</div>
          </div>

          {/* Records */}
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors"
            >
              {/* Mobile Layout */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-blue-400" />
                    <span className="font-mono text-blue-300 text-sm">{record.container_no}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Truck size={12} />
                    <span>{record.truck_no}</span>
                  </div>
                  <span className="text-[10px] text-slate-600">{formatDate(record.created_at)}</span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                <div className="col-span-3 font-mono text-blue-300 text-sm">{record.container_no}</div>
                <div className="col-span-3 flex items-center gap-2 text-slate-300 text-sm">
                  <Truck size={14} />
                  {record.truck_no}
                </div>
                <div className="col-span-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="col-span-4 text-xs text-slate-500">{formatDate(record.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

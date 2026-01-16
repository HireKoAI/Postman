import React, { useState } from 'react';
import { X, Search, Database, ChevronRight, ChevronDown, Check, Globe, RefreshCw, AlertCircle, Box, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { fetchFromDynamoDB } from '../utils/dynamoService';

export function DynamoImportModal({ isOpen, onClose, onImport }) {
    const [queryResult, setQueryResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchName.trim()) return;

        setLoading(true);
        setError(null);
        setQueryResult(null);

        try {
            const data = await fetchFromDynamoDB(searchName.trim());
            setQueryResult(data);
            setIsExpanded(true);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to fetch record from DynamoDB");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Cloud Query</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Query DynamoDB by Namespace Name</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 shrink-0">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1 group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Enter exact Namespace name (Partition Key)..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-gray-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchName.trim()}
                            className={clsx(
                                "px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2",
                                loading && "cursor-not-allowed"
                            )}
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                            {loading ? "Querying..." : "Search"}
                        </button>
                    </form>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-6">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                <RefreshCw size={32} className="text-blue-400 animate-spin" />
                            </div>
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Fetching from DynamoDB...</h4>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12 px-10">
                            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <h4 className="text-lg font-black text-gray-700 mb-2">Query Failed</h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                {error}
                            </p>
                        </div>
                    ) : !queryResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30 grayscale">
                            <Box size={48} className="text-gray-300 mb-6" />
                            <h4 className="text-lg font-black text-gray-600 mb-2">No active query</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                                Provide a Namespace name above to search the cloud table
                            </p>
                        </div>
                    ) : (
                        <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-sm bg-white animate-in slide-in-from-bottom-2">
                            <div className="p-5 flex items-center justify-between bg-blue-50/30">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                        queryResult.type === 'mcp' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            queryResult.type === 'postman' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {queryResult.type === 'mcp' ? <Terminal size={20} /> : <Box size={20} />}
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <h3 className="text-base font-black text-gray-900 truncate tracking-tight">{queryResult.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="px-1.5 py-0.5 bg-white border border-gray-100 text-[8px] font-black text-gray-500 rounded uppercase tracking-wider">{queryResult.type}</div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {queryResult.endpoints.length} endpoints</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { onImport(queryResult); onClose(); }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 active:scale-95 flex items-center gap-2"
                                    >
                                        <Check size={12} />
                                        Import
                                    </button>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="px-5 pb-5 pt-0 border-t border-blue-50">
                                    <div className="space-y-2 mt-4">
                                        {queryResult.endpoints.map(ep => (
                                            <div key={ep.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50/50 border border-gray-100 rounded-lg text-xs group/item">
                                                <span className={clsx(
                                                    "w-10 text-[9px] font-black text-center py-0.5 rounded border uppercase tracking-wider shadow-sm",
                                                    ep.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        ep.method === 'POST' ? "bg-green-50 text-green-600 border-green-100" :
                                                            ep.method === 'PUT' ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                                                "bg-red-50 text-red-600 border-red-100"
                                                )}>{ep.method}</span>
                                                <span className="font-bold text-gray-600 truncate flex-1">{ep.path}</span>
                                                <span className="text-[9px] font-black text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity uppercase tracking-widest">{ep.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} />
                        Connected to {import.meta.env.VITE_AWS_REGION || 'local env'}
                    </p>
                    <button
                        onClick={onClose}
                        className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all"
                    >
                        Close Explorer
                    </button>
                </div>
            </div>
        </div>
    );
}

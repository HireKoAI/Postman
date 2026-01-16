import React from 'react';
import { Hash, Code2, Globe, Terminal, X, Trash2, Box } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar({ items = [], activeNamespaceName, onOpenTab, onDeleteItem }) {
    // The 'items' array already contains only the active namespace's data from App.jsx
    const activeNamespace = items[0];
    const endpoints = activeNamespace?.endpoints || [];

    return (
        <aside className="w-[300px] border-r border-gray-100 bg-gray-50/30 flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
            <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={12} className="text-purple-600" />
                        Endpoints
                    </h2>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-black rounded-full border border-purple-100 shadow-sm">
                        {endpoints.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <Box size={14} className="text-gray-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 truncate">
                        {activeNamespaceName || "Select Namespace"}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
                {!activeNamespace ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-50 grayscale scale-90 transition-all">
                        <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Code2 size={24} className="text-purple-200" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest max-w-[140px] leading-relaxed">Select a namespace to see endpoints</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {endpoints.map((endpoint) => (
                            <div key={endpoint.id} className="group relative">
                                <button
                                    onClick={() => onOpenTab && onOpenTab(endpoint, activeNamespace)}
                                    className="w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-3 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:translate-x-1 group/item"
                                >
                                    <div className={clsx(
                                        "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[8px] font-black transition-all border shrink-0",
                                        endpoint.method === 'GET' ? "bg-blue-50 text-blue-500 border-blue-100 group-hover/item:bg-blue-500 group-hover/item:text-white" :
                                            endpoint.method === 'POST' ? "bg-green-50 text-green-500 border-green-100 group-hover/item:bg-green-500 group-hover/item:text-white" :
                                                endpoint.method === 'PUT' ? "bg-yellow-50 text-yellow-600 border-yellow-100 group-hover/item:bg-yellow-600 group-hover/item:text-white" :
                                                    endpoint.method === 'DELETE' ? "bg-red-50 text-red-500 border-red-100 group-hover/item:bg-red-500 group-hover/item:text-white" :
                                                        "bg-gray-50 text-gray-400 border-gray-100 group-hover/item:bg-gray-400 group-hover/item:text-white"
                                    )}>
                                        {endpoint.method || (activeNamespace.type === 'mcp' ? "TOOL" : "API")}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="font-bold text-xs text-gray-700 truncate transition-colors group-hover/item:text-purple-600">
                                            {endpoint.name}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-medium truncate mt-0.5">
                                            {endpoint.path}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Remove this namespace?`)) {
                                            onDeleteItem(activeNamespace.id);
                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:shadow-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                    title="Delete Namespace"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

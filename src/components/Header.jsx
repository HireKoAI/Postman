import React, { useState } from 'react';
import { ChevronDown, Plus, LayoutGrid, Trash2, FolderPlus, UploadCloud, Terminal, FolderKanban, Box, Settings, Globe } from 'lucide-react';
import clsx from 'clsx';

export function Header({
    topNamespaces = [],
    activeId,
    activeSubNamespaceId,
    onSelect,
    onAddNamespace,
    onDeleteNamespace,
    onDeleteItem,
    onShowImport,
    subNamespaces = []
}) {
    const [isNSOpen, setIsNSOpen] = useState(false);

    const activeTopNS = topNamespaces.find(n => n.id === activeId) || topNamespaces[0];

    return (
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-md flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                        <Terminal size={20} />
                    </div>
                </div>

                <div className="h-8 w-px bg-gray-100" />

                <div className="flex items-center gap-4">
                    {/* Namespace Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNSOpen(!isNSOpen)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-md transition-all group min-w-0 max-w-[240px]"
                        >
                            <Box size={14} className="text-purple-500 shrink-0" />
                            <span className="text-sm font-bold text-gray-700 truncate flex-1 text-left">
                                {subNamespaces.find(s => s.id === activeSubNamespaceId)?.name || (activeId ? "All Namespaces" : "Namespaces")}
                            </span>
                            <ChevronDown size={14} className={`text-gray-400 group-hover:text-purple-400 transition-transform shrink-0 ${isNSOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isNSOpen && (
                            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-[60] max-h-[400px] overflow-y-auto scrollbar-hide">
                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                    <button
                                        onClick={() => { onSelect(activeTopNS?.id, null); setIsNSOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-purple-50 text-gray-600 transition-all text-sm group/all"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0 shadow-sm group-hover/all:scale-125 transition-transform" />
                                        <span className="font-bold tracking-tight">Show All Namespaces</span>
                                    </button>
                                </div>

                                {subNamespaces.filter(s => s.topNamespaceId === activeId).length === 0 ? (
                                    <div className="px-4 py-8 text-center" key="empty">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">No namespaces found</p>
                                    </div>
                                ) : (
                                    subNamespaces.filter(s => s.topNamespaceId === activeId).map(ns => (
                                        <div key={ns.id} className="group/container flex items-center pr-2 hover:bg-purple-50/50">
                                            <button
                                                onClick={() => { onSelect(ns.topNamespaceId, ns.id); setIsNSOpen(false); }}
                                                className="flex-1 text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 text-gray-700 min-w-0 group/item"
                                            >
                                                <div className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${ns.type === 'postman' ? 'bg-orange-400' :
                                                    ns.type === 'openapi' ? 'bg-blue-400' :
                                                        'bg-emerald-400'
                                                    }`} />
                                                <span className="truncate font-bold tracking-tight flex-1 group-hover/item:text-purple-600 transition-colors">{ns.name}</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Delete "${ns.name}"?`)) {
                                                        onDeleteItem(ns.id);
                                                    }
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:shadow-sm rounded-md transition-all opacity-0 group-hover/container:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}

                                <div className="p-2 border-t border-gray-50 flex flex-col gap-1">
                                    <button
                                        onClick={() => {
                                            onAddNamespace();
                                            setIsNSOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-400 hover:text-purple-600 transition-all text-xs font-black uppercase tracking-widest border border-dashed border-transparent hover:border-purple-100"
                                    >
                                        <Plus size={14} />
                                        New Namespace
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onShowImport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95 group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    Import
                </button>
                <div className="w-9 h-9 border-2 border-purple-100 rounded-full flex items-center justify-center bg-purple-50 text-purple-700 font-black text-xs shadow-sm">
                    U
                </div>
            </div>
        </header>
    );
}

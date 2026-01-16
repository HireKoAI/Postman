import React, { useState } from 'react';
import { ChevronDown, Plus, LayoutGrid, Trash2, FolderPlus, UploadCloud, Terminal, FolderKanban, Box, Settings, Globe, RefreshCw, Check } from 'lucide-react';
import clsx from 'clsx';

export function Header({
    topNamespaces = [],
    activeId,
    activeSubNamespaceId,
    onSelect,
    onAddNamespace,
    onDeleteNamespace,
    onDeleteItem,
    onExportToMcp,
    isDeploying,
    isDeployed,
    subNamespaces = []
}) {
    const [isNSOpen, setIsNSOpen] = useState(false);

    const activeTopNS = topNamespaces.find(n => n.id === activeId) || topNamespaces[0];

    return (
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 z-50 relative">
            {/* Left section: Namespace Selector */}
            <div className="flex items-center gap-4 z-10 w-1/3">
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

            {/* Center section: Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto flex items-center justify-center">
                    <img
                        src="https://mc-30acf3eb-3568-4f77-bd15-8645-cdn-endpoint.azureedge.net/-/media/project/extreme/design/logo.svg?rev=a03fb9205bec4cadbe609068bb3de2e6"
                        alt="Extreme Networks"
                        className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => window.location.href = '/'}
                    />
                </div>
            </div>

            {/* Right section: Export/Profile */}
            <div className="flex items-center justify-end gap-4 z-10 w-1/3">
                <button
                    onClick={onExportToMcp}
                    disabled={isDeploying || isDeployed}
                    className={clsx(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group min-w-[180px] justify-center",
                        isDeployed
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-purple-600 text-white shadow-purple-600/20 hover:bg-purple-700 disabled:opacity-80 disabled:cursor-not-allowed"
                    )}
                >
                    {isDeploying ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            Deploying...
                        </>
                    ) : isDeployed ? (
                        <>
                            <Check size={16} className="animate-bounce" />
                            Live on MCP
                        </>
                    ) : (
                        <>
                            <UploadCloud size={16} className="group-hover:-translate-y-1 transition-transform" />
                            Deploy to MCP
                        </>
                    )}
                </button>
                <div className="w-9 h-9 border-2 border-purple-100 rounded-full flex items-center justify-center bg-purple-50 text-purple-700 font-black text-xs shadow-sm">
                    U
                </div>
            </div>
        </header>
    );
}

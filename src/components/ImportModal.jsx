import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileCode, Globe, Box, Terminal, FileJson, AlertCircle, Plus, Database } from 'lucide-react';
import clsx from 'clsx';
import { parseNamespace, parseMcpServer } from '../utils/parsers';

export function ImportModal({ isOpen, onClose, onImport, onOpenDynamoExplorer }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFile = async (file) => {
        if (!file) return;
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                let parsed;

                const isMcp = json.mcpServers || (json.name && json.tools);
                if (isMcp) {
                    parsed = parseMcpServer(json);
                } else {
                    parsed = parseNamespace(json);
                }

                onImport(parsed);
                onClose();
            } catch (err) {
                setError(err.message || "Failed to parse JSON file");
            }
        };
        reader.onerror = () => setError("Failed to read file");
        reader.readAsText(file);
    };

    const handleDynamoImport = async () => {
        onOpenDynamoExplorer();
        onClose();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Add New Namespace</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">Import from local files or cloud</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Import Error</p>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Drag & Drop Area */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                            "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 py-12 flex flex-col items-center justify-center gap-4",
                            isDragging
                                ? "bg-purple-50 border-purple-400 shadow-inner"
                                : "bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                        )}
                    >
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept=".json"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />

                        <div className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                            isDragging ? "bg-purple-600 text-white scale-110 shadow-xl shadow-purple-200" : "bg-white text-purple-600 shadow-lg group-hover:scale-110"
                        )}>
                            <UploadCloud size={24} />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-black text-gray-900 mb-1">
                                Click or drag & drop namespace JSON
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                local OpenAPI • Postman • MCP Server
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            disabled={isLoading}
                            onClick={handleDynamoImport}
                            className={clsx(
                                "w-full flex items-center justify-center gap-3 py-4 font-black text-white rounded-xl shadow-xl transition-all group",
                                isLoading
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <Database size={20} className="group-hover:rotate-12 transition-transform" />
                            )}
                            <span>{isLoading ? "Fetching from AWS..." : "Add from DynamoDB"}</span>
                        </button>
                    </div>

                    {/* Support Info */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                            <FileCode size={16} className="text-blue-500 mb-2" />
                            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">OpenAPI</p>
                            <p className="text-[11px] text-blue-600/70 font-medium leading-tight mt-1">v2.0, v3.0+</p>
                        </div>
                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                            <FileJson size={16} className="text-orange-600 mb-2" />
                            <p className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Postman</p>
                            <p className="text-[11px] text-orange-600/70 font-medium leading-tight mt-1">v2.1 Collections</p>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                            <Terminal size={16} className="text-emerald-600 mb-2" />
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">MCP Server</p>
                            <p className="text-[11px] text-emerald-600/70 font-medium leading-tight mt-1">Tool Configs</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                    <div className="flex items-center gap-2 text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Cloud Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

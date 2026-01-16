import React, { useState, useEffect } from 'react';
import { Play, Save, ChevronRight, Copy, Check, Globe, Clock, Shield, Database, Layout, Braces, Code2, Eye, Info, Terminal, Box, Hash } from 'lucide-react';
import clsx from 'clsx';

export function RequestEditor({ tab }) {
    const { endpoint, namespace } = tab;
    const hasBody = endpoint.body || endpoint.requestSchema || endpoint.method !== 'GET';
    const [activeSection, setActiveSection] = useState(() => {
        // Default to 'body' if it's a mutation and we have schema/body
        if (endpoint.method !== 'GET' && (endpoint.requestSchema || endpoint.body)) return 'body';
        // Otherwise if no query params, also default to 'body' if we have one
        if ((!endpoint.parameters || endpoint.parameters.filter(p => p.in === 'query').length === 0) && (endpoint.requestSchema || endpoint.body)) return 'body';
        return 'params';
    });
    const [copied, setCopied] = useState(false);
    const [responseViewMode, setResponseViewMode] = useState('pretty'); // 'pretty' or 'schema'
    const [activeResponseStatus, setActiveResponseStatus] = useState(null);

    useEffect(() => {
        if (endpoint.responses?.length > 0) {
            setActiveResponseStatus(endpoint.responses[0].status);
        }
    }, [endpoint.id]);

    const activeResponse = endpoint.responses?.find(r => r.status === activeResponseStatus) || endpoint.responses?.[0];

    useEffect(() => {
        setResponseViewMode('pretty');
    }, [activeResponseStatus]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const SyntaxHighlighter = ({ content, mode = 'json' }) => {
        if (!content) return null;
        const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

        const lines = text.split('\n');
        return (
            <pre className="text-[11px] font-mono leading-relaxed text-gray-700">
                {lines.map((line, i) => (
                    <div key={i} className="flex group/line">
                        <span className="w-8 text-[9px] text-gray-300 font-bold pr-4 text-right select-none">{i + 1}</span>
                        <span className="flex-1 whitespace-pre-wrap">{line}</span>
                    </div>
                ))}
            </pre>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <div className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-black tracking-widest border shadow-sm",
                        endpoint.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            endpoint.method === 'POST' ? "bg-green-50 text-green-600 border-green-100" :
                                endpoint.method === 'PUT' ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                    endpoint.method === 'DELETE' ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-600 border-gray-100"
                    )}>
                        {namespace.type === 'mcp' ? "TOOL" : endpoint.method}
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 group/url transition-all focus-within:ring-2 focus-within:ring-purple-600/5 focus-within:border-purple-200">
                        <Globe size={14} className="text-gray-400" />
                        <div className="flex-1 flex items-center gap-1 overflow-hidden">
                            <span className="text-sm font-bold text-gray-800 truncate select-all">{endpoint.path}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-black text-xs hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95 group">
                        <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        SEND
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-gray-900 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <Save size={18} />
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 overflow-hidden flex flex-col xl:flex-row">
                {/* Request Section */}
                <div className="flex-1 border-r border-gray-100 flex flex-col min-h-[40%] xl:min-h-0">
                    <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-6 shrink-0 h-11">
                        {['params', 'headers', 'body', 'auth'].map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={clsx(
                                    "px-4 h-full text-[10px] font-black uppercase tracking-widest transition-all relative border-b-2",
                                    activeSection === section ? "text-purple-600 border-purple-600 bg-white" : "text-gray-400 border-transparent hover:text-gray-600"
                                )}
                            >
                                {section}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 relative">
                        {activeSection === 'params' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Hash size={12} className="text-purple-600" />
                                        Query Parameters
                                    </h4>
                                    <button className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">+ Add Param</button>
                                </div>
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Key</th>
                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Value</th>
                                                <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {Array.isArray(endpoint.parameters) && endpoint.parameters.filter(p => p.in === 'query').map((param, i) => (
                                                <tr key={i} className="group hover:bg-gray-50/30">
                                                    <td className="px-6 py-4 font-bold text-gray-700">{param.name}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            placeholder={`Value (${param.type || 'string'})`}
                                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder:text-gray-300 font-medium"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400 text-xs font-medium italic">{param.description || 'No description'}</td>
                                                </tr>
                                            ))}
                                            {(!Array.isArray(endpoint.parameters) || endpoint.parameters.filter(p => p.in === 'query').length === 0) && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">No parameters configured</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSection === 'body' && (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Code2 size={12} className="text-purple-600" />
                                            Request Body
                                        </h4>
                                        <div className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase tracking-wider">JSON</div>
                                    </div>
                                    {endpoint.requestSchema && (
                                        <div className="group/schema relative">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-600 uppercase tracking-widest cursor-help">
                                                <Braces size={12} />
                                                Schema Available
                                            </div>
                                            <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white p-4 rounded-xl shadow-2xl opacity-0 group-hover/schema:opacity-100 pointer-events-none transition-all z-[70] border border-white/10">
                                                <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">OAS JSON Schema</div>
                                                <pre className="text-[10px] font-mono text-gray-300 leading-relaxed overflow-x-auto">
                                                    {JSON.stringify(endpoint.requestSchema, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 font-mono overflow-auto group/editor relative min-h-[300px] shadow-inner">
                                    <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover/editor:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleCopy(JSON.stringify(endpoint.requestSchema || {}, null, 2))}
                                            className="p-2 bg-white rounded-lg shadow-sm text-gray-400 hover:text-purple-600 border border-gray-100"
                                        >
                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <SyntaxHighlighter content={endpoint.body || endpoint.requestSchema || {}} />
                                    {(!endpoint.requestSchema && !endpoint.body) && (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale pt-20">
                                            <Layout size={40} className="text-gray-300 mb-4" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No body schema defined</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'headers' && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale py-12">
                                <Shield size={40} className="text-gray-300 mb-4" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Headers Configuration coming soon</p>
                            </div>
                        )}

                        {activeSection === 'auth' && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale py-12">
                                <Database size={40} className="text-gray-300 mb-4" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auth Configuration coming soon</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Response Section */}
                <div className="flex-1 flex flex-col min-h-[40%] xl:min-h-0 bg-gray-50/20">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 shrink-0 h-11">
                        <div className="flex items-center gap-4 h-full">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-200 pr-4 mr-2">Response</h4>
                            <div className="flex items-center gap-1 h-full">
                                {(endpoint.responses || []).map((resp) => (
                                    <button
                                        key={resp.status}
                                        onClick={() => setActiveResponseStatus(resp.status)}
                                        className={clsx(
                                            "px-3 h-full text-[10px] font-black transition-all border-b-2",
                                            activeResponseStatus === resp.status
                                                ? "text-purple-600 border-purple-600 bg-white"
                                                : "text-gray-400 border-transparent hover:text-gray-600"
                                        )}
                                    >
                                        <span className={clsx(
                                            "mr-1.5",
                                            resp.status.startsWith('2') ? "text-green-500" :
                                                resp.status.startsWith('4') ? "text-orange-500" : "text-red-500"
                                        )}>{resp.status}</span>
                                        {resp.description}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white border border-gray-200 rounded-lg p-0.5 flex">
                                <button
                                    onClick={() => setResponseViewMode('pretty')}
                                    className={clsx(
                                        "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                                        responseViewMode === 'pretty' ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    Pretty
                                </button>
                                <button
                                    onClick={() => setResponseViewMode('schema')}
                                    className={clsx(
                                        "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
                                        responseViewMode === 'schema' ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    Schema
                                </button>
                            </div>
                        </div>
                    </div>

                    {activeResponse ? (
                        <div className="flex-1 flex flex-col overflow-hidden bg-white p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">--- ms</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">--- KB</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(JSON.stringify(responseViewMode === 'pretty' ? activeResponse.content : activeResponse.schema, null, 2))}
                                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100"
                                    >
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-6 font-mono overflow-auto shadow-inner relative group">
                                <SyntaxHighlighter
                                    content={responseViewMode === 'pretty' ? activeResponse.content : activeResponse.schema}
                                />
                                {!(responseViewMode === 'pretty' ? activeResponse.content : activeResponse.schema) && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                        <Eye size={40} className="text-gray-300 mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No {responseViewMode} available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center p-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 w-full flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6">
                                    <Globe size={24} className="text-purple-600 opacity-20" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Response Data</p>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Import a namespace with responses or click Send</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


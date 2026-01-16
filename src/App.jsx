import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { ImportModal } from './components/ImportModal.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { RequestEditor } from './components/RequestEditor.jsx';
import { DynamoImportModal } from './components/DynamoImportModal.jsx';
import { Plus, Trash2, LayoutGrid, Terminal, Globe, Search, RefreshCw, X, FolderKanban, Box, Database } from 'lucide-react';
import clsx from 'clsx';

function App() {
    // --- Namespace & Collection State ---
    const [topNamespaces, setTopNamespaces] = useState(() => {
        const saved = localStorage.getItem('ns_top_v6');
        return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Main Namespace' }];
    });

    const [activeTopNamespaceId, setActiveTopNamespaceId] = useState(() => {
        return localStorage.getItem('active_top_ns_id_v6') || 'default';
    });

    const [subNamespaces, setSubNamespaces] = useState(() => {
        const saved = localStorage.getItem('ns_sub_list_v6');
        return saved ? JSON.parse(saved) : [];
    });

    const [showDynamoExplorer, setShowDynamoExplorer] = useState(false);

    // --- UI State ---
    const [tabs, setTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [activeSubNamespaceId, setActiveSubNamespaceId] = useState(null);

    // --- Persistence Effects ---
    useEffect(() => {
        localStorage.setItem('ns_top_v6', JSON.stringify(topNamespaces));
    }, [topNamespaces]);

    useEffect(() => {
        localStorage.setItem('active_top_ns_id_v6', activeTopNamespaceId);
    }, [activeTopNamespaceId]);

    useEffect(() => {
        localStorage.setItem('ns_sub_list_v6', JSON.stringify(subNamespaces));
    }, [subNamespaces]);

    // --- Automatic DynamoDB Fetching ---
    useEffect(() => {
        const loadFromDynamo = async () => {
            try {
                const { fetchAllFromDynamoDB } = await import('./utils/dynamoService');
                const cloudSubNS = await fetchAllFromDynamoDB();
                if (cloudSubNS && cloudSubNS.length > 0) {
                    setSubNamespaces(prev => {
                        // Merge cloud data with local, prioritizing cloud for duplicates by name
                        const local = [...prev];
                        cloudSubNS.forEach(cloudItem => {
                            const index = local.findIndex(l => l.name === cloudItem.name && l.topNamespaceId === cloudItem.topNamespaceId);
                            if (index !== -1) {
                                local[index] = cloudItem;
                            } else {
                                local.push(cloudItem);
                            }
                        });
                        return local;
                    });
                }
            } catch (err) {
                console.error("Auto-fetch from DynamoDB failed:", err);
            }
        };
        loadFromDynamo();
    }, []); // Run once on mount

    // --- Handlers ---
    const addTopNamespace = (name) => {
        const newNs = { id: Date.now().toString(), name };
        setTopNamespaces(prev => [...prev, newNs]);
        setActiveTopNamespaceId(newNs.id);
    };

    const deleteTopNamespace = (id) => {
        if (topNamespaces.length <= 1) return;
        setTopNamespaces(prev => prev.filter(n => n.id !== id));
        setSubNamespaces(prev => prev.filter(s => s.topNamespaceId !== id));
        if (activeTopNamespaceId === id) setActiveTopNamespaceId(topNamespaces[0].id);
    };

    const handleImport = (parsedData) => {
        const newId = Date.now().toString() + Math.random();
        setSubNamespaces(prev => {
            const filtered = prev.filter(s =>
                !(s.topNamespaceId === activeTopNamespaceId && s.name.toLowerCase() === parsedData.name.toLowerCase())
            );
            const newSubNamespace = {
                ...parsedData,
                id: newId,
                topNamespaceId: activeTopNamespaceId
            };
            return [...filtered, newSubNamespace];
        });
        setActiveSubNamespaceId(newId);
        setTabs([]);
        setActiveTabId(null);

        // Auto-save to DynamoDB
        handleSaveToDynamo({
            ...parsedData,
            id: newId,
            topNamespaceId: activeTopNamespaceId
        });
    };

    const handleSaveToDynamo = async (namespace) => {
        try {
            const { saveToDynamoDB } = await import('./utils/dynamoService');
            await saveToDynamoDB(namespace);
            alert(`Stored ${namespace.endpoints?.length} endpoints for "${namespace.name}" in DynamoDB!`);
        } catch (err) {
            console.error(err);
            alert("Failed to save to DynamoDB: " + err.message);
        }
    };

    const openTab = (endpoint, ns) => {
        const tabId = endpoint.id;
        if (!tabs.find(t => t.id === tabId)) {
            setTabs(prev => [...prev, {
                id: tabId,
                type: ns.type,
                title: endpoint.name,
                method: endpoint.method,
                endpoint,
                namespace: ns
            }]);
        }
        setActiveTabId(tabId);
    };

    const closeTab = (id) => {
        const remain = tabs.filter(t => t.id !== id);
        setTabs(remain);
        if (activeTabId === id) {
            setActiveTabId(remain[remain.length - 1]?.id || null);
        }
    };

    const activeTopNamespace = topNamespaces.find(n => n.id === activeTopNamespaceId);
    const currentTopNamespaceSubNamespaces = subNamespaces.filter(s => s.topNamespaceId === activeTopNamespaceId);
    const sidebarItems = activeSubNamespaceId ? subNamespaces.filter(s => s.id === activeSubNamespaceId) : [];
    const dashboardItems = activeSubNamespaceId ? subNamespaces.filter(s => s.id === activeSubNamespaceId) : currentTopNamespaceSubNamespaces;
    const activeTab = tabs.find(t => t.id === activeTabId);

    const [isDeploying, setIsDeploying] = useState(false);
    const [isDeployed, setIsDeployed] = useState(false);

    const handleExportToMcp = () => {
        if (isDeploying || isDeployed) return;

        setIsDeploying(true);
        // Simulate deployment process
        setTimeout(() => {
            setIsDeploying(false);
            setIsDeployed(true);
            alert("Successfully converted and deployed everything to MCP!");

            // Reset back to initial state after 10 seconds
            setTimeout(() => {
                setIsDeployed(false);
            }, 10000);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 overflow-hidden h-screen">
            <Header
                topNamespaces={topNamespaces}
                activeId={activeTopNamespaceId}
                activeSubNamespaceId={activeSubNamespaceId}
                onSelect={(topId, subId) => {
                    const isNewTop = topId !== activeTopNamespaceId;
                    const isNewSub = subId !== activeSubNamespaceId;
                    setActiveTopNamespaceId(topId);
                    setActiveSubNamespaceId(subId);
                    if (isNewTop || isNewSub) {
                        setTabs([]);
                        setActiveTabId(null);
                    }
                }}
                onAddNamespace={() => setShowImportModal(true)}
                onDeleteNamespace={deleteTopNamespace}
                onDeleteItem={(id) => {
                    setSubNamespaces(prev => prev.filter(s => s.id !== id));
                    if (activeSubNamespaceId === id) setActiveSubNamespaceId(null);
                }}
                onExportToMcp={handleExportToMcp}
                isDeploying={isDeploying}
                isDeployed={isDeployed}
                subNamespaces={subNamespaces}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    items={sidebarItems}
                    activeNamespaceName={subNamespaces.find(s => s.id === activeSubNamespaceId)?.name}
                    onOpenTab={openTab}
                    onDeleteItem={(id) => {
                        setSubNamespaces(prev => prev.filter(s => s.id !== id));
                        if (activeSubNamespaceId === id) setActiveSubNamespaceId(null);
                    }}
                />

                <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="flex items-center bg-gray-50 border-b border-gray-200 h-10 shrink-0 overflow-hidden">
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide h-full items-center">
                            {tabs.length === 0 && (
                                <div className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={12} />
                                    New Tab
                                </div>
                            )}
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    onClick={() => setActiveTabId(tab.id)}
                                    className={clsx(
                                        "flex items-center gap-3 px-4 h-full cursor-pointer text-xs border-r border-gray-200 transition-all shrink-0 max-w-[180px] min-w-[120px] relative group",
                                        activeTabId === tab.id ? "bg-white text-purple-600 font-bold" : "text-gray-500 hover:bg-gray-100/80"
                                    )}
                                >
                                    <span className={clsx(
                                        "text-[8px] font-black shrink-0 w-6 text-center",
                                        tab.method === 'GET' ? "text-blue-500" :
                                            tab.method === 'POST' ? "text-green-500" :
                                                tab.method === 'PUT' ? "text-yellow-600" :
                                                    tab.method === 'DELETE' ? "text-red-500" : "text-gray-400"
                                    )}>
                                        {tab.type === 'mcp' ? "TOOL" : tab.method}
                                    </span>
                                    <span className="truncate flex-1 min-w-0">{tab.title}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                        className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                    {activeTabId === tab.id && (
                                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setActiveTabId(null)}
                            className="h-full px-4 border-l border-gray-200 hover:bg-white text-gray-400 hover:text-purple-600 transition-all flex items-center justify-center shrink-0"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab ? (
                            <RequestEditor
                                key={activeTab.id}
                                tab={activeTab}
                            />
                        ) : (
                            <div className="h-full overflow-auto p-8 lg:p-12">
                                <div className="max-w-6xl mx-auto w-full">
                                    {!activeSubNamespaceId && (
                                        <div className="mb-12">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                                                    <Box size={20} />
                                                </div>
                                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Namespace Hub</h1>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {topNamespaces.map(ns => (
                                                    <button
                                                        key={ns.id}
                                                        onClick={() => setActiveTopNamespaceId(ns.id)}
                                                        className={clsx(
                                                            "px-6 py-3 rounded-xl text-xs font-black transition-all border shadow-sm",
                                                            activeTopNamespaceId === ns.id
                                                                ? "bg-white text-purple-600 border-purple-100 ring-2 ring-purple-600/5 shadow-purple-500/5"
                                                                : "bg-gray-50/50 text-gray-400 border-transparent hover:bg-white hover:border-gray-100 hover:text-gray-600"
                                                        )}
                                                    >
                                                        {ns.name}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => addTopNamespace(prompt("Enter Namespace name:") || "New Namespace")}
                                                    className="px-6 py-3 rounded-xl text-xs font-black text-gray-400 border border-dashed border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={14} />
                                                    Add Top Namespace
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex flex-col">
                                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">
                                                {activeSubNamespaceId ? "Namespace Focus" : "Available Namespaces"}
                                            </h2>
                                            <span className="text-xs font-bold text-gray-400">
                                                {dashboardItems.length} {dashboardItems.length === 1 ? 'namespace' : 'namespaces'} in {activeTopNamespace?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowImportModal(true)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm hover:shadow-lg active:scale-95"
                                            >
                                                <Plus size={14} />
                                                Import
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-gray-900 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                                                <RefreshCw size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {dashboardItems.length === 0 ? (
                                        <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl py-24 text-center">
                                            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/5 mx-auto mb-8">
                                                {activeSubNamespaceId ? <Globe size={32} className="text-purple-600" /> : <Plus size={32} className="text-purple-600" />}
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                                {activeSubNamespaceId ? "No resources found" : "Ready for APIs"}
                                            </h3>
                                            <p className="text-sm text-gray-400 max-w-sm mx-auto mb-10 font-bold uppercase tracking-widest leading-relaxed">
                                                {activeSubNamespaceId ? "This namespace appears to be empty" : "Start by importing an OpenAPI schema or Postman collection into this namespace"}
                                            </p>
                                            {!activeSubNamespaceId && (
                                                <button
                                                    onClick={() => setShowImportModal(true)}
                                                    className="px-10 py-4 bg-purple-600 text-white rounded-xl font-black text-sm hover:bg-purple-700 transition-all shadow-2xl shadow-purple-600/20 active:scale-95"
                                                >
                                                    Import First Namespace
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {dashboardItems.map(ns => (
                                                <div key={ns.id} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all group overflow-hidden relative cursor-default">
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black ${ns.type === 'postman' ? 'bg-orange-50 text-orange-500 shadow-orange-500/10 shadow-lg' :
                                                            ns.type === 'openapi' ? 'bg-blue-50 text-blue-500 shadow-blue-500/10 shadow-lg' :
                                                                'bg-emerald-50 text-emerald-500 shadow-emerald-500/10 shadow-lg'
                                                            }`}>
                                                            {ns.type === 'mcp' ? <Terminal size={24} /> : (ns.name?.[0]?.toUpperCase() || 'N')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveToDynamo(ns);
                                                                }}
                                                                className="p-2.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm rounded-lg transition-all"
                                                                title="Save to DynamoDB"
                                                            >
                                                                <Database size={18} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Remove "${ns.name}"?`)) {
                                                                        setSubNamespaces(prev => prev.filter(i => i.id !== ns.id));
                                                                        if (activeSubNamespaceId === ns.id) setActiveSubNamespaceId(null);
                                                                    }
                                                                }}
                                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:shadow-sm rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0 mb-6">
                                                        <h3 className="text-xl font-black text-gray-900 mb-1 truncate">{ns.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ns.type === 'postman' ? 'bg-orange-50 text-orange-600' :
                                                                ns.type === 'openapi' ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-emerald-50 text-emerald-600'
                                                                }`}>
                                                                {ns.type}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">•</span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{ns.endpoints?.length || 0} Endpoints</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-50">
                                                        {ns.endpoints?.slice(0, 3).map(e => (
                                                            <div key={e.id} className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 truncate max-w-[100px]">
                                                                {e.name}
                                                            </div>
                                                        ))}
                                                        {(ns.endpoints?.length > 3) && (
                                                            <div className="px-2 py-1 text-[10px] font-bold text-purple-600">
                                                                +{ns.endpoints.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport}
                onOpenDynamoExplorer={() => setShowDynamoExplorer(true)}
            />

            <DynamoImportModal
                isOpen={showDynamoExplorer}
                onClose={() => setShowDynamoExplorer(false)}
                onImport={handleImport}
            />
        </div>
    );
}

export default App;

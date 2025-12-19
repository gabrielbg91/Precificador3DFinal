import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';

/**
 * Ícones SVG estáveis para evitar erros de renderização de objetos.
 */
const Icons = {
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  PlusCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  ),
  Pencil: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  XCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  ),
  Trash2: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.28"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/><path d="M21 8.5v7c0 .66-.39 1.25-1 1.5l-7 4c-.61.35-1.39.35-2 0l-7-4c-.61-.25-1-.84-1-1.5v-7c0-.66.39-1.25 1-1.5l7-4c.61-.35 1.39-.35 2 0l7 4c.61.25 1 .84 1 1.5z"/></svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  Cpu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>
  ),
  Printer: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  ),
  Box: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  )
};

// --- CONFIGURAÇÃO FIREBASE (Usa a config global do Canvas ou o fallback) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyDL8I-fbmkc9UiJHyNfPFZCGj_eTwRsoN0",
      authDomain: "meu-estudio-3d.firebaseapp.com",
      projectId: "meu-estudio-3d",
      storageBucket: "meu-estudio-3d.firebasestorage.app",
      messagingSenderId: "159233039426",
      appId: "1:159233039426:web:e05620fcc92c21345121db",
      measurementId: "G-VRBJB875RQ"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// CORREÇÃO: Sanitizar o ID da app para evitar barras '/' que quebram o Firestore
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : "meu-estudio-3d";
const APP_ID = rawAppId.replace(/\//g, '_');

const App = () => {
  // --- ESTADOS GLOBAIS ---
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");
  
  const [settings, setSettings] = useState({
    energyKwhPrice: 0.90,
    machineHourlyRate: 3.50,
    myHourlyRate: 50,
    retailMargin: 100,
    wholesaleMargin: 40,
    activePrinterId: "",
    logoUrl: null 
  });

  const fileInputRef = useRef(null);

  // Estados de Listas
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);

  // Estados de Formulários
  const [newPart, setNewPart] = useState({ 
    name: "", printTime: 0, extraLaborHours: 0, plates: 1, manualAdditionalCosts: 0,
    usedFilaments: [{ filamentId: "", grams: 0 }],
    usedComponents: [{ componentId: "", quantity: 1 }] 
  });
  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: 0.3 });
  const [newFilament, setNewFilament] = useState({ name: "", type: "PLA", color: "", priceKg: 120 });
  const [newComponent, setNewComponent] = useState({ name: "", description: "", unitPrice: 0 });
  
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [editingFilamentId, setEditingFilamentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [editingPartId, setEditingPartId] = useState(null);

  // --- EFEITO: AUTENTICAÇÃO (MANDATORY RULE 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erro Auth:", err);
        setErrorStatus("Falha na autenticação. Verifique a consola.");
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- EFEITO: SINCRONIZAÇÃO (REGRA 1) ---
  useEffect(() => {
    if (!user) return;

    const basePath = ['artifacts', APP_ID, 'users', user.uid];
    
    const unsubSettings = onSnapshot(doc(db, ...basePath, 'config', 'global'), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    }, (err) => console.error("Erro Config:", err));

    const unsubPrinters = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'printers'), (snap) => {
      setPrinters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubFilaments = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'filaments'), (snap) => {
      setFilaments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubComponents = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'components'), (snap) => {
      setComponents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubParts = onSnapshot(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'parts'), (snap) => {
      setParts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubSettings(); unsubPrinters(); unsubFilaments(); unsubComponents(); unsubParts();
    };
  }, [user]);

  // --- PERSISTÊNCIA ---
  const saveToDb = async (coll, id, data) => {
    if (!user) return;
    const docId = id ? id.toString() : Date.now().toString();
    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, docId), data);
    } catch (e) {
      console.error(`Erro ao guardar em ${coll}:`, e);
    }
  };

  const deleteFromDb = async (coll, id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString()));
    } catch (e) {
      console.error(`Erro ao apagar em ${coll}:`, e);
    }
  };

  const updateGlobalSettings = async (newData) => {
    if (!user) return;
    const merged = { ...settings, ...newData };
    setSettings(merged);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged);
  };

  // --- HANDLERS ---
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateGlobalSettings({ logoUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddPrinter = (e) => {
    e.preventDefault();
    if (!newPrinter.name) return;
    saveToDb('printers', editingPrinterId, newPrinter);
    setEditingPrinterId(null);
    setNewPrinter({ name: "", powerKw: 0.3 });
  };

  const handleAddFilament = (e) => {
    e.preventDefault();
    if (!newFilament.name) return;
    saveToDb('filaments', editingFilamentId, newFilament);
    setEditingFilamentId(null);
    setNewFilament({ name: "", type: "PLA", color: "", priceKg: 120 });
  };

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newComponent.name) return;
    saveToDb('components', editingComponentId, newComponent);
    setEditingComponentId(null);
    setNewComponent({ name: "", description: "", unitPrice: 0 });
  };

  const handleAddPart = (e) => {
    e.preventDefault();
    if (!newPart.name) return;
    saveToDb('parts', editingPartId, newPart);
    setEditingPartId(null);
    setNewPart({ 
      name: "", printTime: 0, extraLaborHours: 0, plates: 1, manualAdditionalCosts: 0,
      usedFilaments: [{ filamentId: "", grams: 0 }],
      usedComponents: [{ componentId: "", quantity: 1 }] 
    });
  };

  const addFilamentRow = () => setNewPart(prev => ({ ...prev, usedFilaments: [...prev.usedFilaments, { filamentId: "", grams: 0 }] }));
  const updateFilamentRow = (idx, field, val) => {
    const updated = [...newPart.usedFilaments];
    updated[idx][field] = val;
    setNewPart(prev => ({ ...prev, usedFilaments: updated }));
  };

  const addComponentRow = () => setNewPart(prev => ({ ...prev, usedComponents: [...prev.usedComponents, { componentId: "", quantity: 1 }] }));
  const updateComponentRow = (idx, field, val) => {
    const updated = [...newPart.usedComponents];
    updated[idx][field] = val;
    setNewPart(prev => ({ ...prev, usedComponents: updated }));
  };

  const startEditPart = (p) => {
    setEditingPartId(p.id);
    setNewPart({ ...p });
  };

  const cancelEditPart = () => {
    setEditingPartId(null);
    setNewPart({ 
      name: "", printTime: 0, extraLaborHours: 0, plates: 1, manualAdditionalCosts: 0,
      usedFilaments: [{ filamentId: "", grams: 0 }],
      usedComponents: [{ componentId: "", quantity: 1 }] 
    });
  };

  // --- LÓGICA DE CÁLCULO ---
  const calculateCosts = (part) => {
    const printer = printers.find(p => p.id.toString() === settings.activePrinterId) || { powerKw: 0, name: "---" };
    let totalMaterialCost = 0;
    let totalWeight = 0;
    
    (part.usedFilaments || []).forEach(item => {
      const fil = filaments.find(f => f.id.toString() === item.filamentId?.toString());
      if (fil) {
        totalMaterialCost += (parseFloat(item.grams) / 1000) * fil.priceKg;
        totalWeight += parseFloat(item.grams);
      }
    });

    let totalComponentsCost = 0;
    (part.usedComponents || []).forEach(item => {
      const comp = components.find(c => c.id.toString() === item.componentId?.toString());
      if (comp) totalComponentsCost += (comp.unitPrice * item.quantity);
    });

    const energyCost = (parseFloat(part.printTime) || 0) * (parseFloat(printer.powerKw) || 0) * (settings.energyKwhPrice || 0);
    const machineWearCost = (parseFloat(part.printTime) || 0) * (settings.machineHourlyRate || 0);
    const laborCost = (parseFloat(part.extraLaborHours) || 0) * (settings.myHourlyRate || 0);
    const extraCosts = (parseFloat(part.manualAdditionalCosts) || 0) + totalComponentsCost;
    
    const totalProductionCost = totalMaterialCost + energyCost + machineWearCost + laborCost + extraCosts;
    
    return {
      totalProductionCost, 
      retailPrice: totalProductionCost * (1 + (settings.retailMargin || 0) / 100),
      wholesalePrice: totalProductionCost * (1 + (settings.wholesaleMargin || 0) / 100),
      totalWeight,
      totalComponentsCost,
      printerName: printer.name
    };
  };

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const theme = {
    bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    input: darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    headerBg: darkMode ? 'bg-slate-900/50' : 'bg-slate-50/30',
    tableHeader: darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50/50 text-slate-400',
    tableBorder: darkMode ? 'border-slate-800' : 'border-slate-50',
    tableRowHover: darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black animate-pulse uppercase tracking-widest">Sincronizando Estúdio...</div>;

  return (
    <div className={`min-h-screen transition-all duration-500 p-4 md:p-8 font-sans ${theme.bg}`}>
      <div className="max-w-7xl mx-auto">
        
        {errorStatus && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-3 animate-bounce">
            <Icons.XCircle /> <span>{String(errorStatus)}</span>
          </div>
        )}

        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current.click()}>
              <div className={`h-24 w-24 rounded-3xl border-2 p-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-700 group-hover:border-blue-500' : 'bg-white border-slate-200 group-hover:border-blue-400'}`}>
                {settings.logoUrl ? <img src={String(settings.logoUrl)} className="h-full w-full object-contain" alt="Logo" /> : <div className="text-blue-600 scale-150"><Icons.Box /></div>}
              </div>
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                <Icons.Pencil size={24} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Precificador 3D Pro</h1>
              <p className={`text-xs md:text-sm font-bold tracking-widest ${theme.textMuted}`}>Industrial Ecosystem v2.2</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-3xl transition-all duration-300 border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-yellow-400 shadow-xl shadow-yellow-900/10' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              <span className="hidden sm:inline font-black text-[10px] uppercase tracking-widest">{darkMode ? 'Luz' : 'Breu'}</span>
            </button>
            <div className={`p-5 rounded-3xl border text-center min-w-[130px] ${theme.card}`}>
              <span className="block text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Catálogo</span>
              <span className="text-3xl font-black text-indigo-600 leading-none">{parts.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. MÁQUINAS */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase">
                <Icons.Printer /> 1. Máquinas
              </h2>
              <form onSubmit={handleAddPrinter} className="space-y-3 mb-5">
                <input type="text" placeholder="Nome da Impressora..." value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} />
                <div className="flex gap-2">
                  <input type="number" step="0.01" placeholder="kW" value={newPrinter.powerKw || ''} onChange={e => setNewPrinter({...newPrinter, powerKw: parseFloat(e.target.value) || 0})} className={`flex-1 p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                  <button type="submit" className="bg-slate-800 text-white px-5 rounded-2xl hover:bg-slate-700 transition-all shadow-lg">
                    {editingPrinterId ? <Icons.Check /> : <Icons.PlusCircle />}
                  </button>
                </div>
              </form>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-slate-500">
                {printers.map(p => (
                  <div key={p.id} className={`flex justify-between items-center p-3.5 rounded-2xl text-xs border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span><strong>{String(p.name)}</strong> • {p.powerKw} kW</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingPrinterId(p.id); setNewPrinter({...p}); }} className="hover:text-blue-500 transition-colors"><Icons.Pencil size="14" /></button>
                      <button onClick={() => deleteFromDb('printers', p.id)} className="hover:text-red-500 transition-colors"><Icons.Trash2 size="14" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. FILAMENTOS */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase">
                <Icons.Layers /> 2. Filamentos
              </h2>
              <form onSubmit={handleAddFilament} className="space-y-3 mb-5">
                <input type="text" placeholder="Marca/Nome..." value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Material" value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                  <input type="number" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => setNewFilament({...newFilament, priceKg: parseFloat(e.target.value) || 0})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg">
                  {editingFilamentId ? "Atualizar" : "Guardar Filamento"}
                </button>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {filaments.map(f => (
                  <div key={f.id} className={`flex justify-between items-center p-3.5 rounded-2xl text-[10px] border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div>
                      <span className="font-bold block text-blue-500 uppercase">{String(f.name)}</span>
                      <p className={theme.textMuted}>{String(f.type)} • {formatCurrency(f.priceKg)}/Kg</p>
                    </div>
                    <div className="flex gap-2 text-slate-500">
                      <button onClick={() => { setEditingFilamentId(f.id); setNewFilament({...f}); }} className="hover:text-blue-500 transition-colors"><Icons.Pencil size="14" /></button>
                      <button onClick={() => deleteFromDb('filaments', f.id)} className="hover:text-red-500 transition-colors"><Icons.Trash2 size="14" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. ALMOXARIFADO */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase">
                <Icons.Box /> 3. Almoxarifado
              </h2>
              <form onSubmit={handleAddComponent} className="space-y-3 mb-5">
                <input type="text" placeholder="Componente (Imã, LED...)" value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} className={`w-full p-3.5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} />
                <div className="flex gap-2">
                  <input type="number" step="0.01" placeholder="R$ Unid." value={newComponent.unitPrice || ''} onChange={e => setNewComponent({...newComponent, unitPrice: parseFloat(e.target.value) || 0})} className={`flex-1 p-3.5 rounded-2xl text-sm outline-none ${theme.input}`} />
                  <button type="submit" className="bg-emerald-600 text-white px-5 rounded-2xl hover:bg-emerald-700 shadow-lg transition-colors">
                    {editingComponentId ? <Icons.Check /> : <Icons.PlusCircle />}
                  </button>
                </div>
              </form>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {components.map(c => (
                  <div key={c.id} className={`flex justify-between items-center p-3.5 rounded-2xl text-[10px] border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex-1">
                      <span className="font-bold text-emerald-500 uppercase">{String(c.name)}</span>
                      <p className="font-black opacity-70">{formatCurrency(c.unitPrice)} p/unid.</p>
                    </div>
                    <div className="flex gap-2 text-slate-500">
                      <button onClick={() => { setEditingComponentId(c.id); setNewComponent({...c}); }} className="hover:text-blue-500 transition-colors"><Icons.Pencil size="14" /></button>
                      <button onClick={() => deleteFromDb('components', c.id)} className="hover:text-red-500 transition-colors"><Icons.Trash2 size="14" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. CONFIGURAÇÕES GLOBAIS */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase text-nowrap">
                <Icons.Settings /> 4. Configurações
              </h2>
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-blue-900/10 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                  <label className="text-[10px] font-black uppercase block mb-2 tracking-widest opacity-60">Máquina em Simulação:</label>
                  <select value={settings.activePrinterId} onChange={e => updateGlobalSettings({ activePrinterId: e.target.value })} className="w-full p-2 rounded-lg text-sm font-black bg-transparent outline-none cursor-pointer">
                    <option value="">Selecione...</option>
                    {printers.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">{String(p.name)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest">Preço kWh</label>
                    <input type="number" step="0.01" value={settings.energyKwhPrice} onChange={e => updateGlobalSettings({ energyKwhPrice: parseFloat(e.target.value) || 0 })} className={`w-full p-3.5 rounded-2xl text-xs font-black outline-none ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest text-nowrap">Desgaste/h</label>
                    <input type="number" step="0.1" value={settings.machineHourlyRate} onChange={e => updateGlobalSettings({ machineHourlyRate: parseFloat(e.target.value) || 0 })} className={`w-full p-3.5 rounded-2xl text-xs font-black outline-none ${theme.input}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-4 rounded-3xl border border-green-500/20 text-center">
                    <label className="text-[9px] text-green-500 font-black block uppercase mb-1">Varejo %</label>
                    <input type="number" value={settings.retailMargin} onChange={e => updateGlobalSettings({ retailMargin: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent text-center font-black text-green-500 outline-none text-lg" />
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-3xl border border-orange-500/20 text-center">
                    <label className="text-[9px] text-orange-500 font-black block uppercase mb-1 text-nowrap">Atacado %</label>
                    <input type="number" value={settings.wholesaleMargin} onChange={e => updateGlobalSettings({ wholesaleMargin: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent text-center font-black text-orange-500 outline-none text-lg" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-8 space-y-8">
            
            {/* 5. LANÇAMENTO DE PEÇA MASTER */}
            <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter">
                <Icons.PlusCircle /> {editingPartId ? 'Ajustar Projeto Master' : 'Novo Projeto Master'}
              </h2>
              <form onSubmit={handleAddPart} className="space-y-8">
                <input type="text" placeholder="Título da Peça Master..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`w-full p-6 rounded-[2rem] text-2xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 transition-all ${theme.input}`} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Horas Impressão</label>
                    <input type="number" step="0.1" value={newPart.printTime || ''} onChange={e => setNewPart(p => ({...p, printTime: parseFloat(e.target.value) || 0}))} className={`w-full p-4 rounded-2xl outline-none font-black ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Trabalho Manual (h)</label>
                    <input type="number" step="0.5" value={newPart.extraLaborHours || ''} onChange={e => setNewPart(p => ({...p, extraLaborHours: parseFloat(e.target.value) || 0}))} className={`w-full p-4 rounded-2xl outline-none font-black ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Extra Fixo (R$)</label>
                    <input type="number" value={newPart.manualAdditionalCosts || ''} onChange={e => setNewPart(p => ({...p, manualAdditionalCosts: parseFloat(e.target.value) || 0}))} className={`w-full p-4 rounded-2xl outline-none font-black ${theme.input}`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* SEÇÃO FILAMENTOS */}
                  <div className={`p-7 rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Filamentos</h3>
                      <button type="button" onClick={addFilamentRow} className="p-2 bg-indigo-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><Icons.PlusCircle /></button>
                    </div>
                    <div className="space-y-4">
                      {newPart.usedFilaments.map((row, idx) => (
                        <div key={idx} className="flex gap-3 items-end animate-in">
                          <select value={row.filamentId} onChange={(e) => updateFilamentRow(idx, 'filamentId', e.target.value)} className={`flex-1 p-3.5 rounded-2xl text-[10px] font-bold outline-none ${theme.input}`}>
                            <option value="">Escolher...</option>
                            {filaments.map(f => <option key={f.id} value={f.id} className="bg-slate-900 text-white">{String(f.name)}</option>)}
                          </select>
                          <input type="number" placeholder="g" value={row.grams || ''} onChange={(e) => updateFilamentRow(idx, 'grams', parseFloat(e.target.value) || 0)} className={`w-20 p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                          <button type="button" onClick={() => setNewPart(p => ({...p, usedFilaments: p.usedFilaments.filter((_, i) => i !== idx)}))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Icons.Trash2 size="16" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEÇÃO ALMOXARIFADO */}
                  <div className={`p-7 rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Peças Extras</h3>
                      <button type="button" onClick={addComponentRow} className="p-2 bg-emerald-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"><Icons.PlusCircle /></button>
                    </div>
                    <div className="space-y-4">
                      {newPart.usedComponents.map((row, idx) => (
                        <div key={idx} className="flex gap-3 items-end animate-in">
                          <select value={row.componentId} onChange={(e) => updateComponentRow(idx, 'componentId', e.target.value)} className={`flex-1 p-3.5 rounded-2xl text-[10px] font-bold outline-none ${theme.input}`}>
                            <option value="">Escolher...</option>
                            {components.map(c => <option key={c.id} value={c.id} className="bg-slate-900 text-white">{String(c.name)}</option>)}
                          </select>
                          <input type="number" placeholder="Qtd" value={row.quantity || ''} onChange={(e) => updateComponentRow(idx, 'quantity', parseInt(e.target.value) || 0)} className={`w-16 p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                          <button type="button" onClick={() => setNewPart(p => ({...p, usedComponents: p.usedComponents.filter((_, i) => i !== idx)}))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Icons.Trash2 size="16" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-7 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                    <Icons.Check /> {editingPartId ? "Confirmar Atualização" : "Guardar Projeto no Estúdio"}
                  </button>
                  {editingPartId && (
                    <button type="button" onClick={cancelEditPart} className={`px-12 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-colors ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Cancelar</button>
                  )}
                </div>
              </form>
            </div>

            {/* CATÁLOGO DE RESULTADOS */}
            <div className={`rounded-[3rem] border overflow-hidden transition-all duration-500 ${theme.card}`}>
              <div className={`p-10 border-b ${theme.headerBg} ${theme.tableBorder} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter">
                  <Icons.Package /> Projetos Guardados
                </h2>
                <div className="px-8 py-3 rounded-full bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <Icons.Printer /> {printers.find(p => p.id.toString() === settings.activePrinterId)?.name || '---'}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[9px] uppercase font-black tracking-widest border-b ${theme.tableHeader} ${theme.tableBorder}`}>
                      <th className="px-10 py-6">Identificação</th>
                      <th className="px-10 py-6">Produção</th>
                      <th className="px-10 py-6 text-center">Custo</th>
                      <th className="px-10 py-6 text-center text-green-500">Varejo</th>
                      <th className="px-10 py-6 text-center text-orange-500">Atacado</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.tableBorder}`}>
                    {parts.map(part => {
                      const res = calculateCosts(part);
                      return (
                        <tr key={part.id} className={`transition-all ${theme.tableRowHover} group`}>
                          <td className="px-10 py-8">
                            <span className="font-black block text-lg group-hover:text-blue-500 transition-colors uppercase leading-none mb-2 tracking-tight">{String(part.name)}</span>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>Ref: #{part.id.toString().slice(-4)}</span>
                          </td>
                          <td className="px-10 py-8 text-[11px] font-bold text-slate-500 space-y-1 uppercase tracking-tighter">
                            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> {res.totalWeight}g Material</p>
                            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {part.printTime}h Máquina</p>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <span className={`text-xs font-black px-5 py-2.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                              {formatCurrency(res.totalProductionCost)}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <span className="text-2xl font-black text-green-500 block leading-tight">{formatCurrency(res.retailPrice)}</span>
                            <span className="text-[10px] text-green-600/50 font-black uppercase tracking-tighter">Lucro: {formatCurrency(res.retailPrice - res.totalProductionCost)}</span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <span className="text-2xl font-black text-orange-500 block leading-tight">{formatCurrency(res.wholesalePrice)}</span>
                            <span className="text-[10px] text-orange-600/50 font-black uppercase tracking-tighter">Lucro: {formatCurrency(res.wholesalePrice - res.totalProductionCost)}</span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex gap-3 justify-end opacity-20 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                               <button onClick={() => startEditPart(part)} className={`p-3 rounded-2xl border shadow-sm transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-100 text-blue-500'}`}><Icons.Pencil size="18" /></button>
                               <button onClick={() => deleteFromDb('parts', part.id)} className={`p-3 rounded-2xl border shadow-sm transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-red-400' : 'bg-white border-slate-100 text-red-500'}`}><Icons.Trash2 size="18" /></button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
        
        <footer className="mt-24 text-center text-slate-500 text-[10px] font-black uppercase tracking-[1em] pb-16 opacity-30">
          Industrial Cloud Platform • precificador-3d-pro • v2.2
        </footer>
      </div>
    </div>
  );
};

export default App;
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
 * Ícones SVG estáveis para a interface.
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
  Box: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ),
  Sparkles: ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 19v2"/><path d="M21 20h-4"/></svg>
  ),
  MessageSquare: ({size = 18}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Loader: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  ),
  Info: ({ size = 14 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  Clipboard: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
  ),
  CheckCheck: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  ),
  CopyPlus: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/><path d="M12 11h6"/><path d="M15 8v6"/></svg>
  ),
  Clock: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Printer: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  )
};

// --- CONFIGURAÇÃO FIREBASE ---
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

const rawAppId = typeof __app_id !== 'undefined' ? __app_id : "meu-estudio-3d";
const APP_ID = rawAppId.replace(/\//g, '_');

// --- HELPERS DE TEMPO ---
const timeToDecimal = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) + (minutes || 0) / 60;
};

const decimalToTime = (decimal) => {
  if (!decimal) return "00:00";
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// --- API DO GEMINI ---
const callGeminiAPI = async (prompt, apiKey) => {
  if (!apiKey) {
    alert("⚠️ Configura a tua Chave API Gemini no Card 4.");
    return "API Key em falta.";
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) throw new Error("Erro na API.");
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro na resposta.";
  } catch (error) {
    console.error(error);
    return "Erro ao contactar a IA.";
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Estados de Dados
  const [settings, setSettings] = useState({
    energyKwhPrice: 0.90, machineHourlyRate: 3.50, myHourlyRate: 50.00,
    retailMargin: 100, wholesaleMargin: 40, activePrinterId: "", 
    logoUrl: null, geminiApiKey: ""
  });
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);

  // Estados de Formulário
  const [newPart, setNewPart] = useState({ 
    name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", manualAdditionalCosts: 0, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] 
  });
  const [editingPartId, setEditingPartId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState({ title: "", text: "" });

  // Estados de Edição Auxiliares
  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: 0.3 });
  const [newFilament, setNewFilament] = useState({ name: "", type: "PLA", color: "", priceKg: 120 });
  const [newComponent, setNewComponent] = useState({ name: "", description: "", unitPrice: 0 });
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [editingFilamentId, setEditingFilamentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);

  const fileInputRef = useRef(null);

  // Auth (Rule 3)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Sync Firestore
  useEffect(() => {
    if (!user) return;
    const path = ['artifacts', APP_ID, 'users', user.uid];
    const unsubS = onSnapshot(doc(db, ...path, 'config', 'global'), (s) => s.exists() && setSettings(p => ({...p, ...s.data()})));
    const unsubP = onSnapshot(collection(db, ...path, 'printers'), (s) => setPrinters(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubF = onSnapshot(collection(db, ...path, 'filaments'), (s) => setFilaments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubC = onSnapshot(collection(db, ...path, 'components'), (s) => setComponents(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubParts = onSnapshot(collection(db, ...path, 'parts'), (s) => setParts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubS(); unsubP(); unsubF(); unsubC(); unsubParts(); };
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // DB Methods
  const save = async (coll, id, data) => {
    const docId = id || Date.now().toString();
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, docId), data);
  };
  const del = async (coll, id) => {
    await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString()));
  };

  const updateSettings = async (newData) => {
    const merged = { ...settings, ...newData };
    setSettings(merged);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged);
  };

  // Calculations
  const calculate = (part) => {
    const printer = printers.find(p => p.id === settings.activePrinterId) || { powerKw: 0 };
    const pTime = timeToDecimal(part.printTime);
    const lTime = timeToDecimal(part.extraLaborHours);

    let matCost = 0, weight = 0, compCost = 0;
    part.usedFilaments.forEach(u => {
      const f = filaments.find(fil => fil.id === u.filamentId);
      if (f) { matCost += (u.grams / 1000) * f.priceKg; weight += u.grams; }
    });
    part.usedComponents.forEach(u => {
      const c = components.find(comp => comp.id === u.componentId);
      if (c) compCost += c.unitPrice * u.quantity;
    });

    const energy = pTime * printer.powerKw * settings.energyKwhPrice;
    const wear = pTime * settings.machineHourlyRate;
    const labor = lTime * settings.myHourlyRate;
    const totalCost = matCost + energy + wear + labor + compCost + (parseFloat(part.manualAdditionalCosts) || 0);

    const breakdown = {
      material: (matCost / (totalCost || 1)) * 100,
      energy: ((energy + wear) / (totalCost || 1)) * 100,
      labor: (labor / (totalCost || 1)) * 100,
      extras: ((compCost + (parseFloat(part.manualAdditionalCosts) || 0)) / (totalCost || 1)) * 100
    };

    return { totalCost, retail: totalCost * (1 + settings.retailMargin / 100), wholesale: totalCost * (1 + settings.wholesaleMargin / 100), weight, breakdown };
  };

  // UI Handlers
  const handleAddPart = (e) => {
    e.preventDefault();
    save('parts', editingPartId, newPart);
    setEditingPartId(null);
    setNewPart({ name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", manualAdditionalCosts: 0, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] });
  };
  
  // Handlers Auxiliares
  const handleAddPrinter = (e) => { e.preventDefault(); save('printers', editingPrinterId, newPrinter); setEditingPrinterId(null); setNewPrinter({ name: "", powerKw: 0.3 }); };
  const handleAddFilament = (e) => { e.preventDefault(); save('filaments', editingFilamentId, newFilament); setEditingFilamentId(null); setNewFilament({ name: "", type: "PLA", color: "", priceKg: 120 }); };
  const handleAddComponent = (e) => { e.preventDefault(); save('components', editingComponentId, newComponent); setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: 0 }); };
  
  const startEditFilament = (f) => { setEditingFilamentId(f.id); setNewFilament(f); };
  const cancelEditFilament = () => { setEditingFilamentId(null); setNewFilament({ name: "", type: "PLA", color: "", priceKg: 120 }); };
  
  const startEditPart = (p) => { setEditingPartId(p.id); setNewPart(p); };
  const cancelEditPart = () => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", manualAdditionalCosts: 0, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  
  const duplicatePart = (p) => { const {id, ...d} = p; setNewPart({...d, name: `${d.name} (Cópia)`}); window.scrollTo({top:0, behavior:'smooth'}); };

  const addFilamentRow = () => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: 0 }] }));
  const updateFilamentRow = (idx, field, val) => { const updated = [...newPart.usedFilaments]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedFilaments: updated })); };
  
  const addComponentRow = () => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }));
  const updateComponentRow = (idx, field, val) => { const updated = [...newPart.usedComponents]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedComponents: updated })); };

  const handleCopyQuote = (part, res) => {
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const filamentsStr = part.usedFilaments.map(u => filaments.find(f => f.id === u.filamentId)?.name).filter(Boolean).join(', ');
    const text = `🚀 *ORÇAMENTO PROFISSIONAL 3D* 🚀\n📅 Data: ${formattedDate}\n📦 Projeto: ${part.name.toUpperCase()}\n------------------------------------\n⚙️ ESPECIFICAÇÕES\n⏱️ Tempo: ${part.printTime}h\n⚖️ Peso: ${res.weight}g\n🎨 Material: ${filamentsStr || 'Padrão'}\n------------------------------------\n💰 INVESTIMENTO: R$ ${res.retail.toFixed(2)}\n⚠️ Validade: 15 dias.`;
    
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); setCopiedId(part.id); setTimeout(() => setCopiedId(null), 2000); } catch (e) {}
    document.body.removeChild(textArea);
  };

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

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest">A Sincronizar...</div>;

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-all duration-500 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Modal IA */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${theme.card}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-indigo-500 flex items-center gap-2"><Icons.Sparkles /> {aiContent.title}</h3>
                <button onClick={() => setAiModalOpen(false)}><Icons.XCircle /></button>
              </div>
              <div className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{aiLoading ? "A consultar a IA..." : aiContent.text}</div>
            </div>
          </div>
        )}

        <header className="mb-12 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl border-2 flex items-center justify-center overflow-hidden cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
              {settings.logoUrl ? <img src={settings.logoUrl} className="h-full w-full object-contain" /> : <div className="text-blue-600 scale-150"><Icons.Box /></div>}
              <input type="file" ref={fileInputRef} onChange={(e) => { const r = new FileReader(); r.onloadend = () => updateSettings({ logoUrl: r.result }); r.readAsDataURL(e.target.files[0]); }} className="hidden" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Precificador 3D Pro</h1>
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Industrial Ecosystem v2.3</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-3xl border ${darkMode ? 'text-yellow-400 bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <div className={`p-5 rounded-3xl border min-w-[130px] text-center ${theme.card}`}>
              <span className="block text-[10px] opacity-40 uppercase font-black tracking-widest">Projetos</span>
              <span className="text-3xl font-black text-indigo-600 leading-none">{parts.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Configurações */}
          <div className="lg:col-span-4 space-y-8">
            <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Settings /> Configurações</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block">Impressora Ativa</label>
                  <select value={settings.activePrinterId} onChange={e => updateSettings({ activePrinterId: e.target.value })} className={`w-full p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`}>
                    <option value="">Selecionar...</option>
                    {printers.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60">kWh</label><input type="number" step="0.01" value={settings.energyKwhPrice} onChange={e => updateSettings({ energyKwhPrice: parseFloat(e.target.value) })} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60">Máq/h</label><input type="number" step="0.1" value={settings.machineHourlyRate} onChange={e => updateSettings({ machineHourlyRate: parseFloat(e.target.value) })} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60">Minha/h</label><input type="number" step="0.1" value={settings.myHourlyRate} onChange={e => updateSettings({ myHourlyRate: parseFloat(e.target.value) })} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                </div>
                <div className="p-4 rounded-2xl border border-dashed border-indigo-500/30">
                  <label className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1"><Icons.Key size={10} /> Chave Gemini</label>
                  <input type="password" value={settings.geminiApiKey} onChange={e => updateSettings({ geminiApiKey: e.target.value })} placeholder="Cole aqui para ativar IA..." className="w-full bg-transparent outline-none p-1 text-xs border-b border-indigo-500/20 focus:border-indigo-500" />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[8px] text-indigo-400 mt-1 block">Obter chave gratuita</a>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-emerald-500 uppercase">Varejo %</label><input type="number" value={settings.retailMargin} onChange={e => updateSettings({ retailMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-emerald-500" /></div>
                  <div className="bg-orange-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-orange-500 uppercase">Atacado %</label><input type="number" value={settings.wholesaleMargin} onChange={e => updateSettings({ wholesaleMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-orange-500" /></div>
                </div>
              </div>
            </div>

            {/* Listas Auxiliares */}
            <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
              <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 opacity-50"><Icons.Layers /> Materiais</h3>
              <form onSubmit={handleAddFilament} className="mb-4 space-y-2">
                <input placeholder="Nome..." value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-2 text-xs rounded-xl ${theme.input}`} />
                <div className="flex gap-1">
                    <input placeholder="Tipo" value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-1/3 p-2 text-xs rounded-xl ${theme.input}`} />
                    <input type="number" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => setNewFilament({...newFilament, priceKg: parseFloat(e.target.value)})} className={`w-1/3 p-2 text-xs rounded-xl ${theme.input}`} />
                    <button type="submit" className="w-1/3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold">{editingFilamentId ? "OK" : "Add"}</button>
                </div>
              </form>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {filaments.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-3 rounded-2xl border bg-slate-500/5 text-[10px]">
                    <span className="font-bold">{f.name}</span>
                    <div className="flex gap-1">
                        <button onClick={() => startEditFilament(f)} className="text-blue-500"><Icons.Pencil size={12} /></button>
                        <button onClick={() => del('filaments', f.id)} className="text-red-500"><Icons.Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
             <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
              <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 opacity-50"><Icons.Printer /> Máquinas</h3>
              <form onSubmit={handleAddPrinter} className="mb-4 flex gap-2">
                  <input placeholder="Nome..." value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`flex-1 p-2 text-xs rounded-xl ${theme.input}`} />
                  <input type="number" placeholder="kW" value={newPrinter.powerKw || ''} onChange={e => setNewPrinter({...newPrinter, powerKw: parseFloat(e.target.value)})} className={`w-14 p-2 text-xs rounded-xl ${theme.input}`} />
                  <button type="submit" className="bg-slate-800 text-white px-3 rounded-xl"><Icons.PlusCircle size={14} /></button>
              </form>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {printers.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl border bg-slate-500/5 text-[10px]">
                    <span className="font-bold">{p.name}</span>
                    <button onClick={() => del('printers', p.id)} className="text-red-500"><Icons.Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Principal */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`p-8 rounded-[3rem] border ${theme.card}`}>
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter"><Icons.PlusCircle /> {editingPartId ? 'Ajustar Projeto' : 'Novo Projeto Master'}</h2>
              <form onSubmit={handleAddPart} className="space-y-8">
                <div className="flex gap-2">
                  <input type="text" placeholder="Nome da Peça..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`flex-1 p-6 rounded-[2rem] text-2xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 ${theme.input}`} />
                  <button type="button" onClick={async () => { setAiLoading(true); const t = await callGeminiAPI(`Descrição vendedora para ${newPart.name}`, settings.geminiApiKey); setNewPart(p => ({...p, description: t})); setAiLoading(false); }} className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] shadow-lg">
                    {aiLoading ? <Icons.Loader /> : <Icons.Sparkles />}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black opacity-40 uppercase ml-4 flex items-center gap-1"><Icons.Clock size={10} /> Impressão (HH:MM)</label>
                    <input type="text" placeholder="00:00" value={newPart.printTime} onChange={e => setNewPart(p => ({...p, printTime: e.target.value}))} onBlur={e => { if(!e.target.value.includes(':')) setNewPart(p => ({...p, printTime: "00:00"})); }} className={`w-full p-4 rounded-2xl text-center font-black text-xl outline-none ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black opacity-40 uppercase ml-4 flex items-center gap-1"><Icons.Clock size={10} /> Trabalho (HH:MM)</label>
                    <input type="text" placeholder="00:00" value={newPart.extraLaborHours} onChange={e => setNewPart(p => ({...p, extraLaborHours: e.target.value}))} onBlur={e => { if(!e.target.value.includes(':')) setNewPart(p => ({...p, extraLaborHours: "00:00"})); }} className={`w-full p-4 rounded-2xl text-center font-black text-xl outline-none ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black opacity-40 uppercase ml-4">Extra Fixo (R$)</label>
                    <input type="number" step="0.01" value={newPart.manualAdditionalCosts || ''} onChange={e => setNewPart(p => ({...p, manualAdditionalCosts: parseFloat(e.target.value)}))} className={`w-full p-4 rounded-2xl text-center font-black text-xl outline-none ${theme.input}`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-7 rounded-[2rem] border-2 border-dashed border-slate-500/10">
                    <div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase text-indigo-500">Filamentos</span><button type="button" onClick={() => setNewPart(p => ({...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: 0 }] }))} className="bg-indigo-600 text-white rounded-full p-1"><Icons.PlusCircle /></button></div>
                    {newPart.usedFilaments.map((u, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <select value={u.filamentId} onChange={e => { const updated = [...newPart.usedFilaments]; updated[i].filamentId = e.target.value; setNewPart(p => ({...p, usedFilaments: updated})); }} className={`flex-1 p-3 rounded-2xl text-[10px] font-bold ${theme.input}`}>
                          <option value="">Escolher...</option>
                          {filaments.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <input type="number" placeholder="g" value={u.grams || ''} onChange={e => { const updated = [...newPart.usedFilaments]; updated[i].grams = parseFloat(e.target.value); setNewPart(p => ({...p, usedFilaments: updated})); }} className={`w-20 p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                      </div>
                    ))}
                  </div>
                  <div className="p-7 rounded-[2rem] border-2 border-dashed border-slate-500/10">
                    <div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase text-emerald-500">Almoxarifado</span><button type="button" onClick={() => setNewPart(p => ({...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }))} className="bg-emerald-600 text-white rounded-full p-1"><Icons.PlusCircle /></button></div>
                    {newPart.usedComponents.map((u, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <select value={u.componentId} onChange={e => { const updated = [...newPart.usedComponents]; updated[i].componentId = e.target.value; setNewPart(p => ({...p, usedComponents: updated})); }} className={`flex-1 p-3 rounded-2xl text-[10px] font-bold ${theme.input}`}>
                          <option value="">Escolher...</option>
                          {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" placeholder="Qtd" value={u.quantity || ''} onChange={e => { const updated = [...newPart.usedComponents]; updated[i].quantity = parseInt(e.target.value); setNewPart(p => ({...p, usedComponents: updated})); }} className={`w-20 p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-7 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-all">
                    {editingPartId ? "Confirmar Edição" : "Adicionar ao Catálogo"}
                  </button>
                  {editingPartId && <button type="button" onClick={() => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", manualAdditionalCosts: 0, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] }); }} className="px-12 rounded-[2.5rem] font-black text-xs uppercase opacity-50">Cancelar</button>}
                </div>
              </form>
            </div>

            {/* Catálogo de Projetos */}
            <div className={`rounded-[3rem] border overflow-hidden ${theme.card}`}>
              <div className="p-10 border-b flex items-center justify-between"><h2 className="text-2xl font-black">Portfólio 3D</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[10px] uppercase font-black border-b ${theme.tableHeader}`}>
                      <th className="px-10 py-6">Projeto & Custos</th>
                      <th className="px-10 py-6 text-center text-emerald-500">Varejo</th>
                      <th className="px-10 py-6 text-center text-orange-500">Atacado</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {parts.map(p => {
                      const res = calculate(p);
                      return (
                        <tr key={p.id} className={`group ${theme.tableRowHover}`}>
                          <td className="px-10 py-8">
                            <span className="font-black block text-lg uppercase mb-2">{p.name}</span>
                            
                            {/* Barra Visual com Paleta Vibrante */}
                            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner mt-4">
                              <div style={{ width: `${res.breakdown.material}%` }} className="bg-blue-600 h-full border-r border-black/10" title="Filamento"></div>
                              <div style={{ width: `${res.breakdown.energy}%` }} className="bg-amber-400 h-full border-r border-black/10" title="Energia/Máquina"></div>
                              <div style={{ width: `${res.breakdown.labor}%` }} className="bg-purple-600 h-full border-r border-black/10" title="Mão de Obra"></div>
                              <div style={{ width: `${res.breakdown.extras}%` }} className="bg-rose-500 h-full" title="Extras"></div>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                               <button onClick={() => { const {id, ...d} = p; setNewPart({...d, name: `${d.name} (Cópia)`}); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1"><Icons.CopyPlus size={12} /> Clonar</button>
                               <button onClick={async () => { setAiLoading(true); setAiModalOpen(true); const t = await callGeminiAPI(`Analisa lucro de ${p.name}: Custo ${res.totalCost.toFixed(2)}, Preço ${res.retail.toFixed(2)}`, settings.geminiApiKey); setAiContent({title: p.name, text: t}); setAiLoading(false); }} className="text-[9px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-1 rounded flex items-center gap-1"><Icons.Sparkles size={12} /> IA</button>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center text-xl font-black text-emerald-500">R$ {res.retail.toFixed(2)}</td>
                          <td className="px-10 py-8 text-center text-xl font-black text-orange-500">R$ {res.wholesale.toFixed(2)}</td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex gap-2 justify-end">
                               <button onClick={() => handleCopyQuote(p, res)} className={`p-2.5 rounded-xl border transition-all ${copiedId === p.id ? 'bg-green-600 text-white' : 'hover:bg-blue-600 hover:text-white'}`}>{copiedId === p.id ? <Icons.CheckCheck size="16" /> : <Icons.Clipboard size="16" />}</button>
                               <button onClick={() => startEditPart(p)} className="p-2.5 rounded-xl border hover:bg-indigo-600 hover:text-white"><Icons.Pencil size="16" /></button>
                               <button onClick={() => del('parts', p.id)} className="p-2.5 rounded-xl border hover:bg-red-600 hover:text-white"><Icons.Trash2 size="16" /></button>
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
      </div>
    </div>
  );
};

export default App;
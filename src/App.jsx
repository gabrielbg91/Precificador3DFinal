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
 * Ícones SVG estáveis.
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
  Tag: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
  )
};

// --- CONFIGURAÇÃO FIREBASE ---
// Use o objeto de configuração que você já tem no seu projeto local.
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

// --- HELPERS DE TEMPO (CONVERSÃO HH:MM) ---
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
    alert("⚠️ Você precisa configurar sua API Key do Gemini nas Configurações (Card 4) para usar a IA.");
    return "API Key não configurada.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error("Erro API Gemini:", errData);
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Erro ao consultar a IA. Verifique sua chave ou conexão.";
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState({ title: "", text: "" });
  const [copiedId, setCopiedId] = useState(null);

  const [settings, setSettings] = useState({
    energyKwhPrice: 0.90,
    machineHourlyRate: 3.50,
    myHourlyRate: 50,
    retailMargin: 100,
    wholesaleMargin: 40,
    activePrinterId: "",
    logoUrl: null,
    geminiApiKey: "" 
  });

  const fileInputRef = useRef(null);

  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);

  // Estados de Formulários (Agora com strings para HH:MM e quantidadeProduzida)
  const [newPart, setNewPart] = useState({ 
    name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", plates: 1, manualAdditionalCosts: 0,
    quantityProduced: 1, // Novo campo para quantidade do lote
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const basePath = ['artifacts', APP_ID, 'users', user.uid];
    
    const unsubSettings = onSnapshot(doc(db, ...basePath, 'config', 'global'), (snap) => snap.exists() && setSettings(prev => ({...prev, ...snap.data()})));
    const unsubPrinters = onSnapshot(collection(db, ...basePath, 'printers'), (snap) => setPrinters(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubFilaments = onSnapshot(collection(db, ...basePath, 'filaments'), (snap) => setFilaments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubComponents = onSnapshot(collection(db, ...basePath, 'components'), (snap) => setComponents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubParts = onSnapshot(collection(db, ...basePath, 'parts'), (snap) => setParts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubSettings(); unsubPrinters(); unsubFilaments(); unsubComponents(); unsubParts(); };
  }, [user]);

  const saveToDb = async (coll, id, data) => {
    if (!user) return;
    const docId = id ? id.toString() : Date.now().toString();
    try { await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, docId), data); } catch (e) { console.error(e); }
  };

  const deleteFromDb = async (coll, id) => {
    if (!user) return;
    try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString())); } catch (e) { console.error(e); }
  };

  const updateGlobalSettings = async (newData) => {
    if (!user) return;
    const merged = { ...settings, ...newData };
    setSettings(merged);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged);
  };

  const handleGenerateDescription = async () => {
    if (!newPart.name) return alert("Preencha o nome da peça primeiro!");
    setAiLoading(true);
    const materialNames = newPart.usedFilaments.map(uf => {
        const fil = filaments.find(f => f.id == uf.filamentId);
        return fil ? fil.name : 'PLA';
    }).join(', ');
    const prompt = `Atue como um especialista em marketing de impressão 3D. Crie uma descrição curta, vendedora e atrativa (máximo 3 frases) para um produto chamado '${newPart.name}'. O produto é feito de ${materialNames || 'PLA'} e leva ${newPart.printTime} horas. Destaque a durabilidade.`;
    const text = await callGeminiAPI(prompt, settings.geminiApiKey);
    setNewPart(prev => ({ ...prev, description: text }));
    setAiLoading(false);
  };

  const handleAnalyzeProfit = async (part, costs) => {
    setAiLoading(true);
    setAiModalOpen(true);
    setAiContent({ title: `Análise de Lucro: ${part.name}`, text: "Consultando a IA..." });
    const prompt = `Consultor financeiro 3D. Analise: Nome ${part.name}, Custo UNIDADE R$ ${costs.totalProductionCost.toFixed(2)}, Venda UNIDADE R$ ${costs.retailPrice.toFixed(2)}, Margem ${settings.retailMargin}%, Tempo Unidade ${costs.unitPrintTimeDecimal.toFixed(2)}h. Dê feedback curto.`;
    const text = await callGeminiAPI(prompt, settings.geminiApiKey);
    setAiContent({ title: `Análise: ${part.name}`, text });
    setAiLoading(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateGlobalSettings({ logoUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAddPrinter = (e) => { e.preventDefault(); if(!newPrinter.name) return; saveToDb('printers', editingPrinterId, newPrinter); setEditingPrinterId(null); setNewPrinter({ name: "", powerKw: 0.3 }); };
  const handleAddFilament = (e) => { e.preventDefault(); if(!newFilament.name) return; saveToDb('filaments', editingFilamentId, newFilament); setEditingFilamentId(null); setNewFilament({ name: "", type: "PLA", color: "", priceKg: 120 }); };
  const handleAddComponent = (e) => { e.preventDefault(); if(!newComponent.name) return; saveToDb('components', editingComponentId, newComponent); setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: 0 }); };
  
  const handleAddPart = (e) => { 
    e.preventDefault(); 
    if(!newPart.name) return; 
    saveToDb('parts', editingPartId, newPart); 
    setEditingPartId(null); 
    setNewPart({ name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", plates: 1, manualAdditionalCosts: 0, quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] }); 
  };

  const addFilamentRow = () => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: 0 }] }));
  const updateFilamentRow = (idx, field, val) => { const updated = [...newPart.usedFilaments]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedFilaments: updated })); };
  const addComponentRow = () => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }));
  const updateComponentRow = (idx, field, val) => { const updated = [...newPart.usedComponents]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedComponents: updated })); };
  
  const startEditPart = (p) => { 
    setEditingPartId(p.id); 
    const partToEdit = {
        ...p,
        quantityProduced: p.quantityProduced || 1, // Garante compatibilidade
        printTime: typeof p.printTime === 'number' ? decimalToTime(p.printTime) : p.printTime,
        extraLaborHours: typeof p.extraLaborHours === 'number' ? decimalToTime(p.extraLaborHours) : p.extraLaborHours
    };
    setNewPart(partToEdit); 
  };
  
  const cancelEditPart = () => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "00:00", extraLaborHours: "00:00", plates: 1, manualAdditionalCosts: 0, quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: 0 }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  
  const duplicatePart = (p) => {
    const { id, ...partData } = p;
    setNewPart({ 
        ...partData, 
        name: `${partData.name} (Cópia)`,
        quantityProduced: partData.quantityProduced || 1,
        printTime: typeof partData.printTime === 'number' ? decimalToTime(partData.printTime) : partData.printTime,
        extraLaborHours: typeof partData.extraLaborHours === 'number' ? decimalToTime(partData.extraLaborHours) : partData.extraLaborHours
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditFilament = (f) => { setEditingFilamentId(f.id); setNewFilament({ name: f.name, type: f.type, color: f.color, priceKg: f.priceKg }); };
  const cancelEditFilament = () => { setEditingFilamentId(null); setNewFilament({ name: "", type: "PLA", color: "", priceKg: 120 }); };

  const calculateCosts = (part) => {
    const printer = printers.find(p => p.id.toString() === settings.activePrinterId) || { powerKw: 0, name: "---" };
    
    // Converte HH:MM para decimal (Total do Lote)
    const pTimeTotal = timeToDecimal(part.printTime);
    const lTimeTotal = timeToDecimal(part.extraLaborHours);
    
    // Pega a quantidade do lote (padrão 1 se não existir)
    const quantity = part.quantityProduced && part.quantityProduced > 0 ? parseFloat(part.quantityProduced) : 1;

    let totalMaterialCost = 0, totalWeight = 0, totalComponentsCost = 0;
    
    (part.usedFilaments || []).forEach(item => {
      const fil = filaments.find(f => f.id.toString() === item.filamentId?.toString());
      if (fil) {
        totalMaterialCost += (parseFloat(item.grams || 0) / 1000) * fil.priceKg;
        totalWeight += parseFloat(item.grams || 0);
      }
    });

    (part.usedComponents || []).forEach(item => {
      const comp = components.find(c => c.id.toString() === item.componentId?.toString());
      if (comp) totalComponentsCost += (comp.unitPrice * (item.quantity || 0));
    });

    // Custos TOTAIS do lote
    const energyCost = pTimeTotal * (parseFloat(printer.powerKw) || 0) * (settings.energyKwhPrice || 0);
    const machineWearCost = pTimeTotal * (settings.machineHourlyRate || 0);
    const laborCost = lTimeTotal * (settings.myHourlyRate || 0);
    const extraCosts = (parseFloat(part.manualAdditionalCosts) || 0) + totalComponentsCost;
    
    const batchTotalCost = totalMaterialCost + energyCost + machineWearCost + laborCost + extraCosts;

    // Valores UNITÁRIOS (divididos pela quantidade)
    const unitCost = batchTotalCost / quantity;
    const unitWeight = totalWeight / quantity;
    
    const total = batchTotalCost || 1;
    const breakdown = {
      material: (totalMaterialCost / total) * 100,
      energy: ((energyCost + machineWearCost) / total) * 100,
      labor: (laborCost / total) * 100,
      extras: (extraCosts / total) * 100
    };
    
    return {
      totalProductionCost: unitCost, // Exibe custo unitário na tabela
      batchTotalCost, // Custo total do lote (interno)
      retailPrice: unitCost * (1 + (settings.retailMargin || 0) / 100),
      wholesalePrice: unitCost * (1 + (settings.wholesaleMargin || 0) / 100),
      totalWeight: unitWeight, 
      unitPrintTimeDecimal: pTimeTotal / quantity, // Tempo por unidade
      printerName: printer.name, 
      breakdown,
      quantity // Quantidade usada no cálculo
    };
  };

  const handleCopyQuote = (part, costs) => {
    const formattedPrice = formatCurrency(costs.retailPrice);
    const date = new Date().toLocaleDateString('pt-BR');
    
    const filamentsList = (part.usedFilaments || []).map(uf => {
      const fil = filaments.find(f => f.id.toString() === uf.filamentId?.toString());
      return fil ? `${fil.name} (${fil.color})` : null;
    }).filter(Boolean).join(', ');

    const text = `🚀 *ORÇAMENTO PROFISSIONAL 3D* 🚀
📅 Data: ${date}

📦 *Projeto:* ${part.name.toUpperCase()}
${part.description ? `📝 *Descrição:* ${part.description}\n` : ''}
------------------------------------
⚙️ *ESPECIFICAÇÕES UNITÁRIAS*
🔢 Quantidade Cotada: ${costs.quantity} un.
⏱️ Tempo/unid: ${decimalToTime(costs.unitPrintTimeDecimal)}h
⚖️ Peso/unid: ${costs.totalWeight.toFixed(1)}g
🎨 Material: ${filamentsList || 'Padrão'}
------------------------------------
💰 *VALOR UNITÁRIO:* ${formattedPrice}
⚠️ _Orçamento válido por 15 dias._`;

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopiedId(part.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert("Não foi possível copiar automaticamente. Por favor, copie manualmente.");
    }

    document.body.removeChild(textArea);
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
        
        {/* MODAL AI */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${theme.card}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black flex items-center gap-2 text-indigo-500">
                  <Icons.Sparkles /> {aiContent.title}
                </h3>
                <button onClick={() => setAiModalOpen(false)}><Icons.XCircle /></button>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                {aiLoading ? <div className="flex items-center gap-2"><Icons.Loader /> Analisando dados...</div> : aiContent.text}
              </div>
            </div>
          </div>
        )}

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
              <p className={`text-xs md:text-sm font-bold tracking-widest ${theme.textMuted}`}>Industrial Ecosystem v2.5</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-3xl transition-all duration-300 border flex items-center gap-3 ${darkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
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
            {/* MÁQUINAS */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase"><Icons.Printer /> 1. Máquinas</h2>
              <form onSubmit={handleAddPrinter} className="space-y-4 mb-5">
                <div className="space-y-1">
                   <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest">Modelo da Impressora</label>
                   <input type="text" placeholder="Ex: Ender 3 V2" value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest">Consumo Médio (kW)</label>
                    <input type="number" step="0.01" placeholder="Ex: 0.3" value={newPrinter.powerKw || ''} onChange={e => setNewPrinter({...newPrinter, powerKw: parseFloat(e.target.value) || 0})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                  </div>
                  <button type="submit" className="bg-slate-800 text-white px-5 h-[42px] rounded-2xl shadow-lg flex items-center justify-center mb-0.5"><Icons.PlusCircle /></button>
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

            {/* FILAMENTOS */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase"><Icons.Layers /> 2. Filamentos</h2>
              <form onSubmit={handleAddFilament} className="space-y-3 mb-5">
                <input type="text" placeholder="Marca/Nome..." value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Material" value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                  <input type="number" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => setNewFilament({...newFilament, priceKg: parseFloat(e.target.value) || 0})} className={`w-full p-3.5 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                </div>
                <div className="flex gap-1">
                  <button type="submit" className={`w-full ${editingFilamentId ? 'bg-green-600' : 'bg-indigo-600'} text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:opacity-90`}>
                    {editingFilamentId ? "Atualizar" : "Guardar Filamento"}
                  </button>
                  {editingFilamentId && <button type="button" onClick={cancelEditFilament} className="bg-slate-200 text-slate-600 px-4 rounded-2xl"><Icons.XCircle /></button>}
                </div>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {filaments.map(f => (
                  <div key={f.id} className={`flex justify-between items-center p-3.5 rounded-2xl text-[10px] border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div><span className="font-bold block text-blue-500 uppercase">{String(f.name)}</span><p>{String(f.type)} • {formatCurrency(f.priceKg)}</p></div>
                    <div className="flex gap-2 text-slate-500">
                      <button onClick={() => startEditFilament(f)} className="hover:text-blue-500 transition-colors"><Icons.Pencil size="14" /></button>
                      <button onClick={() => deleteFromDb('filaments', f.id)} className="hover:text-red-500 transition-colors"><Icons.Trash2 size="14" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ALMOXARIFADO */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase"><Icons.Box /> 3. Almoxarifado</h2>
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

            {/* CONFIGURAÇÕES */}
            <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-slate-500/10 pb-3 uppercase"><Icons.Settings /> 4. Configurações</h2>
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                  <label className="text-[10px] font-black uppercase block mb-2 opacity-60">Máquina Ativa:</label>
                  <select value={settings.activePrinterId} onChange={e => updateGlobalSettings({ activePrinterId: e.target.value })} className="w-full p-2 text-sm font-black bg-transparent outline-none">
                    <option value="">Selecione...</option>
                    {printers.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{String(p.name)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest">Preço kWh</label>
                    <input type="number" step="0.01" value={settings.energyKwhPrice} onChange={e => updateGlobalSettings({ energyKwhPrice: parseFloat(e.target.value) || 0 })} className={`w-full p-3.5 rounded-2xl text-xs font-black outline-none ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest text-nowrap">Desgaste/h</label>
                    <input type="number" step="0.1" value={settings.machineHourlyRate} onChange={e => updateGlobalSettings({ machineHourlyRate: parseFloat(e.target.value) || 0 })} className={`w-full p-3.5 rounded-2xl text-xs font-black outline-none ${theme.input}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-black uppercase ml-1 tracking-widest text-nowrap">Minha Hora (R$)</label>
                    <input type="number" step="0.1" value={settings.myHourlyRate} onChange={e => updateGlobalSettings({ myHourlyRate: parseFloat(e.target.value) || 0 })} className={`w-full p-3.5 rounded-2xl text-xs font-black outline-none ${theme.input}`} />
                  </div>
                </div>
                
                {/* CAMPO DE API KEY PARA IA */}
                <div className={`p-4 rounded-2xl border border-dashed ${darkMode ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                  <label className="text-[9px] font-black uppercase block mb-1 tracking-widest text-indigo-500 flex items-center gap-1">
                    <Icons.Key size={10} /> Chave API Gemini (IA)
                  </label>
                  <input 
                    type="password" 
                    placeholder="Cole sua API Key aqui..." 
                    value={settings.geminiApiKey || ''} 
                    onChange={e => updateGlobalSettings({ geminiApiKey: e.target.value })} 
                    className={`w-full p-2 bg-transparent text-xs font-bold outline-none border-b border-indigo-500/20 focus:border-indigo-500 transition-colors ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}
                  />
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[8px] text-indigo-400 hover:text-indigo-300 mt-1 block hover:underline">Obter chave gratuita</a>
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
            
            {/* FORMULÁRIO PRINCIPAL */}
            <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${theme.card}`}>
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter">
                <Icons.PlusCircle /> {editingPartId ? 'Ajustar Projeto' : 'Novo Projeto Master'}
              </h2>
              <form onSubmit={handleAddPart} className="space-y-8">
                <div className="flex gap-2">
                  <input type="text" placeholder="Nome da Peça..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`flex-1 p-6 rounded-[2rem] text-2xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 transition-all ${theme.input}`} />
                  <button type="button" onClick={handleGenerateDescription} disabled={aiLoading} className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-transform">
                    {aiLoading ? <Icons.Loader /> : <Icons.Sparkles />} 
                  </button>
                </div>

                {newPart.description && (
                  <div className={`p-4 rounded-2xl text-xs font-medium border-l-4 border-purple-500 ${darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
                    <p className="opacity-70 mb-1 font-bold uppercase">Sugestão de Marketing AI ✨</p>
                    {newPart.description}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1 ml-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Quantidade (Lote)
                      </label>
                      <div className="group relative">
                        <div className="cursor-help text-slate-400 hover:text-blue-500 transition-colors"><Icons.Info size={12} /></div>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                          Total de peças feitas com os materiais abaixo.<br/>O custo será dividido por este número.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </div>
                    <input 
                      type="number" 
                      placeholder="1" 
                      value={newPart.quantityProduced} 
                      onChange={e => setNewPart(p => ({...p, quantityProduced: parseInt(e.target.value) || 1}))} 
                      className={`w-full p-4 rounded-2xl outline-none font-black text-center text-xl bg-blue-500/5 border-blue-500/20 border ${theme.input}`} 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-1"><Icons.Clock size={10} /> Tempo Total (HH:MM)</label>
                    <input 
                      type="text" 
                      placeholder="00:00" 
                      value={newPart.printTime} 
                      onChange={e => setNewPart(p => ({...p, printTime: e.target.value}))} 
                      onBlur={e => { if(!e.target.value.includes(':')) setNewPart(p => ({...p, printTime: "00:00"})); }} 
                      className={`w-full p-4 rounded-2xl outline-none font-black text-center text-xl ${theme.input}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest flex items-center gap-1"><Icons.Clock size={10} /> Trabalho Total (HH:MM)</label>
                    <input 
                      type="text" 
                      placeholder="00:00" 
                      value={newPart.extraLaborHours} 
                      onChange={e => setNewPart(p => ({...p, extraLaborHours: e.target.value}))} 
                      onBlur={e => { if(!e.target.value.includes(':')) setNewPart(p => ({...p, extraLaborHours: "00:00"})); }} 
                      className={`w-full p-4 rounded-2xl outline-none font-black text-center text-xl ${theme.input}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Extra Fixo Total (R$)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newPart.manualAdditionalCosts || ''} 
                      onChange={e => setNewPart(p => ({...p, manualAdditionalCosts: parseFloat(e.target.value) || 0}))} 
                      className={`w-full p-4 rounded-2xl outline-none font-black text-xl text-center ${theme.input}`} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-7 rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase text-indigo-500">Filamentos (Total do Lote)</h3>
                      <button type="button" onClick={addFilamentRow} className="p-2 bg-indigo-600 text-white rounded-full"><Icons.PlusCircle /></button>
                    </div>
                    {newPart.usedFilaments.map((row, idx) => (
                      <div key={idx} className="flex gap-3 mb-3">
                        <select value={row.filamentId} onChange={(e) => updateFilamentRow(idx, 'filamentId', e.target.value)} className={`flex-1 p-3 rounded-2xl text-[10px] font-bold outline-none ${theme.input}`}>
                          <option value="">Escolher...</option>
                          {filaments.map(f => <option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>)}
                        </select>
                        <input type="number" placeholder="g Total" value={row.grams || ''} onChange={(e) => updateFilamentRow(idx, 'grams', parseFloat(e.target.value) || 0)} className={`w-24 p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                        <button type="button" onClick={() => setNewPart(p => ({...p, usedFilaments: p.usedFilaments.filter((_, i) => i !== idx)}))} className="text-red-500"><Icons.Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>

                   <div className={`p-7 rounded-[2rem] border-2 border-dashed ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase text-emerald-500">Almoxarifado (Total do Lote)</h3>
                      <button type="button" onClick={addComponentRow} className="p-2 bg-emerald-600 text-white rounded-full"><Icons.PlusCircle /></button>
                    </div>
                    {newPart.usedComponents.map((row, idx) => (
                      <div key={idx} className="flex gap-3 mb-3">
                        <select value={row.componentId} onChange={(e) => updateComponentRow(idx, 'componentId', e.target.value)} className={`flex-1 p-3 rounded-2xl text-[10px] font-bold outline-none ${theme.input}`}>
                          <option value="">Escolher...</option>
                          {components.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                        </select>
                        <input type="number" placeholder="Qtd Total" value={row.quantity || ''} onChange={(e) => updateComponentRow(idx, 'quantity', parseInt(e.target.value) || 0)} className={`w-24 p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`} />
                        <button type="button" onClick={() => setNewPart(p => ({...p, usedComponents: p.usedComponents.filter((_, i) => i !== idx)}))} className="text-red-500"><Icons.Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-7 rounded-[2rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-all">
                    {editingPartId ? "Confirmar" : "Registar no Catálogo"}
                  </button>
                  {editingPartId && <button type="button" onClick={cancelEditPart} className="px-12 rounded-[2rem] font-black text-[10px] uppercase">Cancelar</button>}
                </div>
              </form>
            </div>

            {/* TABELA */}
            <div className={`rounded-[3rem] border overflow-hidden transition-all duration-500 ${theme.card}`}>
               <div className="p-10 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-2xl font-black">Portfólio</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[10px] uppercase font-black border-b ${theme.tableHeader} ${theme.tableBorder}`}>
                      <th className="px-10 py-6">Projeto</th>
                      <th className="px-10 py-6 text-center text-blue-500">Custo Unit.</th>
                      <th className="px-10 py-6 text-center text-green-500">Varejo Unit.</th>
                      <th className="px-10 py-6 text-center text-orange-500">Atacado Unit.</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.tableBorder}`}>
                    {parts.map(part => {
                      const res = calculateCosts(part);
                      return (
                        <tr key={part.id} className={`transition-all ${theme.tableRowHover} group`}>
                          <td className="px-10 py-8">
                            <span className="font-black block text-lg uppercase leading-none mb-2">{String(part.name)}</span>
                            <div className="flex items-center gap-2 mb-3">
                                {part.quantityProduced > 1 && (
                                    <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-1 rounded uppercase tracking-wider">Lote de {part.quantityProduced}</span>
                                )}
                                <span className="text-[9px] font-black opacity-50 uppercase tracking-widest">{res.totalWeight.toFixed(1)}g • {decimalToTime(res.unitPrintTimeDecimal)}h</span>
                            </div>

                            {/* MINI GRÁFICO DE CUSTOS (CORES VIBRANTES) */}
                            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden mt-3 shadow-inner">
                              <div style={{ width: `${res.breakdown.material}%` }} className="bg-blue-600 h-full border-r border-black/10" title="Material"></div>
                              <div style={{ width: `${res.breakdown.energy}%` }} className="bg-amber-400 h-full border-r border-black/10" title="Energia/Máquina"></div>
                              <div style={{ width: `${res.breakdown.labor}%` }} className="bg-purple-600 h-full border-r border-black/10" title="Mão de Obra"></div>
                              <div style={{ width: `${res.breakdown.extras}%` }} className="bg-rose-500 h-full" title="Extras"></div>
                            </div>

                            <div className="flex gap-2 mt-3">
                               <button onClick={() => duplicatePart(part)} className="text-[9px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                 <Icons.PlusCircle size={12} /> Clonar
                               </button>
                               <button onClick={() => handleAnalyzeProfit(part, res)} className="text-[9px] bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-1 rounded font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1">
                                 <Icons.Sparkles size={14} /> Analisar Lucro IA
                               </button>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center text-sm font-black opacity-60">{formatCurrency(res.totalProductionCost)}</td>
                          <td className="px-10 py-8 text-center text-xl font-black text-green-500">{formatCurrency(res.retailPrice)}</td>
                          <td className="px-10 py-8 text-center text-xl font-black text-orange-500">{formatCurrency(res.wholesalePrice)}</td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex gap-2 justify-end">
                               <button 
                                 onClick={() => handleCopyQuote(part, res)}
                                 className={`p-2.5 rounded-xl border transition-colors ${copiedId === part.id ? 'bg-green-500 text-white border-green-500' : 'hover:bg-blue-500 hover:text-white'}`}
                                 title="Copiar Orçamento Unitário"
                               >
                                 {copiedId === part.id ? <Icons.CheckCheck size="16" /> : <Icons.Clipboard size="16" />}
                               </button>
                               <button onClick={() => startEditPart(part)} className="p-2.5 rounded-xl border hover:bg-blue-500 hover:text-white transition-colors"><Icons.Pencil size="16" /></button>
                               <button onClick={() => deleteFromDb('parts', part.id)} className="p-2.5 rounded-xl border hover:bg-red-500 hover:text-white transition-colors"><Icons.Trash2 size="16" /></button>
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
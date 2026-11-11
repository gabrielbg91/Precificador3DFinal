import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc,
  setDoc, 
  getDoc,
  getDocs,
  writeBatch,
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';

// --- ÍCONES SVG PERSONALIZADOS E LIMPOS ---
const Icons = {
  Dashboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  Printer: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>,
  Layers: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Box: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  Settings: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Plus: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Pencil: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Copy: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Search: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  LogOut: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Quote: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  Sparkles: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  Check: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  Close: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Cpu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M9 2v2"/><path d="M15 20v2"/><path d="M9 20v2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M2 15h2"/><path d="M2 9h2"/></svg>,
  Image: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  FileText: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Google: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
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
      appId: "1:159233039426:web:e05620fcc92c21345121db"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = (typeof __app_id !== 'undefined' ? __app_id : "meu-estudio-3d").replace(/\//g, '_');
const TEMPLATE_ID = "ivaYLHlFWWXq0kBSkoC4pjRNByA3";

// --- FUNÇÕES UTILITÁRIAS ---
const parseNum = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
};

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const createEmptyPart = () => ({
  name: "",
  fileName: "",
  imageUrl: "",
  notes: "",
  printTime: "01:00",
  extraLaborHours: "00:30",
  quantityProduced: 1,
  manualAdditionalCosts: "0",
  usedFilaments: [{ filamentId: "", grams: "" }],
  usedComponents: []
});

const timeToHours = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

// --- COMPONENTES DA UI ---

const MetricCard = ({ title, value, subtitle, icon: Icon, highlightColor = "blue" }) => {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50",
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1 tracking-tight">{value}</div>
        {subtitle && <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">{subtitle}</span>}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[highlightColor]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

// --- TELA DE LOGIN ---
const LoginScreen = ({ darkMode }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Erro ao autenticar com Google:", err);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Erro no acesso anônimo:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Icons.Cpu size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Printa Logo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Precificação & Gestão Profissional para Impressão 3D</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleGoogle} 
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-sm shadow-sm"
          >
            <Icons.Google size={18} /> Entrar com Google
          </button>
          
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-widest font-semibold absolute">ou</span>
          </div>

          <button 
            onClick={handleGuest} 
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all text-sm"
          >
            {loading ? "Iniciando..." : "Entrar como Convidado (Modo Teste)"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'printers', 'filaments', 'components', 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Estado para minimizar a sidebar

  // Estados dos Dados
  const [settings, setSettings] = useState({
    energyKwhPrice: "0.90",
    machineHourlyRate: "3.50",
    myHourlyRate: "50",
    retailMargin: 100,
    wholesaleMargin: 40,
    activePrinterId: ""
  });
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);

  // Form local states
  const [newPart, setNewPart] = useState(createEmptyPart());
  const [editingPartId, setEditingPartId] = useState(null);

  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: "0.3" });
  const [editingPrinterId, setEditingPrinterId] = useState(null);

  const [newFilament, setNewFilament] = useState({ name: "", brand: "", type: "", priceKg: "110" });
  const [editingFilamentId, setEditingFilamentId] = useState(null);

  const [newComponent, setNewComponent] = useState({ name: "", unitPrice: "1.00" });
  const [editingComponentId, setEditingComponentId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPartForQuote, setSelectedPartForQuote] = useState(null);
  const [viewPartModal, setViewPartModal] = useState(null);
  // Efeito DarkMode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Listener & Seeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Firestore Data
  useEffect(() => {
    if (!user) return;
    const path = ['artifacts', APP_ID, 'users', user.uid];

    const unsubS = onSnapshot(doc(db, ...path, 'config', 'global'), (s) => s.exists() && setSettings(p => ({ ...p, ...s.data() })));
    const unsubP = onSnapshot(collection(db, ...path, 'printers'), (s) => setPrinters(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubF = onSnapshot(collection(db, ...path, 'filaments'), (s) => setFilaments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubC = onSnapshot(collection(db, ...path, 'components'), (s) => setComponents(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubParts = onSnapshot(collection(db, ...path, 'parts'), (s) => setParts(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubS(); unsubP(); unsubF(); unsubC(); unsubParts(); };
  }, [user]);

  // Operações no Banco de Dados
  const saveToDb = async (coll, id, data) => {
    if (!user) return;
    const docId = id || Date.now().toString();
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, docId), data);
  };

  const deleteFromDb = async (coll, id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString()));
  };

  const updateGlobalSettings = async (newData) => {
    if (!user) return;
    const merged = { ...settings, ...newData };
    setSettings(merged);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged);
  };

  // Cálculo Geral de Custos de uma Peça
  const calculateCosts = useMemo(() => (part) => {
    const activePrinter = printers.find(p => p.id.toString() === settings.activePrinterId) || printers[0] || { powerKw: 0.3 };
    const pTimeHours = timeToHours(part.printTime);
    const lTimeHours = timeToHours(part.extraLaborHours);
    const qty = Math.max(1, parseNum(part.quantityProduced));

    let matCostTotal = 0;
    (part.usedFilaments || []).forEach(item => {
      const fil = filaments.find(f => f.id.toString() === item.filamentId?.toString());
      if (fil) {
        matCostTotal += (parseNum(item.grams) / 1000) * parseNum(fil.priceKg);
      }
    });

    let compCostTotal = 0;
    (part.usedComponents || []).forEach(item => {
      const comp = components.find(c => c.id.toString() === item.componentId?.toString());
      if (comp) {
        compCostTotal += parseNum(comp.unitPrice) * parseNum(item.quantity);
      }
    });

    const energyCost = pTimeHours * parseNum(activePrinter.powerKw) * parseNum(settings.energyKwhPrice);
    const wearCost = pTimeHours * parseNum(settings.machineHourlyRate);
    const laborCost = lTimeHours * parseNum(settings.myHourlyRate);
    const extraFixed = parseNum(part.manualAdditionalCosts) + compCostTotal;

    const totalBatchCost = matCostTotal + energyCost + wearCost + laborCost + extraFixed;
    const unitCost = totalBatchCost / qty;

    const retailPrice = unitCost * (1 + parseNum(settings.retailMargin) / 100);
    const wholesalePrice = unitCost * (1 + parseNum(settings.wholesaleMargin) / 100);

    return {
      totalBatchCost,
      unitCost,
      retailPrice,
      wholesalePrice,
      breakdownUnit: {
        filament: matCostTotal / qty,
        energy: energyCost / qty,
        depreciation: wearCost / qty,
        labor: laborCost / qty,
        fixed: extraFixed / qty
      }
    };
  }, [printers, filaments, components, settings]);

  // Handler para Upload de Foto do Projeto
  const handleProjectImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem é muito grande! Escolha uma de até 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPart(p => ({ ...p, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
        Carregando Printa Logo...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen darkMode={darkMode} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-300">
      
      {/* SIDEBAR LATERAL DESKTOP (EXPANSÍVEL / MINIMIZÁVEL) */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-20 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div>
          {/* Logo Brand com Botão de Minimizar */}
          <div className={`p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 shrink-0">
                  <Icons.Cpu size={20} />
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">Printa Logo</h1>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Estúdio 3D</span>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
                <Icons.Cpu size={20} />
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? "Expandir menu" : "Minimizar menu"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points={sidebarCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} /></svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Projetos / Dashboard', icon: Icons.Dashboard },
              { id: 'printers', label: 'Impressoras', icon: Icons.Printer },
              { id: 'filaments', label: 'Filamentos', icon: Icons.Layers },
              { id: 'components', label: 'Almoxarifado', icon: Icons.Box },
              { id: 'settings', label: 'Configurações', icon: Icons.Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
                  title={sidebarCollapsed ? tab.label : ""}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-2 rounded-lg"
              title={darkMode ? "Ativar Light Mode" : "Ativar Dark Mode"}
            >
              {darkMode ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
              {!sidebarCollapsed && <span>{darkMode ? "Light" : "Dark"}</span>}
            </button>
            <button
              onClick={() => signOut(auth)}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg"
              title="Sair da conta"
            >
              <Icons.LogOut size={16} />
            </button>
          </div>
          {!sidebarCollapsed && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate px-2">
              {user.isAnonymous ? "Visitante" : user.email}
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (ADAPTÁVEL À SIDEBAR) */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <div className="max-w-7xl w-full mx-auto p-8 space-y-8">

          {/* TELA: DASHBOARD / PROJETOS */}
          {activeTab === 'dashboard' && (
            <>
              {/* Header com Resumo */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Gestão de Projetos</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Calcule custos de impressão, margens de lucro e gere orçamentos instantâneos.</p>
                </div>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Projetos Ativos" value={parts.length} subtitle="No catálogo" icon={Icons.Dashboard} highlightColor="blue" />
                <MetricCard title="Estoque Filamentos" value={filaments.length} subtitle="Cores/Tipos cadastrados" icon={Icons.Layers} highlightColor="indigo" />
                <MetricCard title="Impressoras" value={printers.length} subtitle="Prontas para calcular" icon={Icons.Printer} highlightColor="amber" />
                <MetricCard title="Margem Varejo" value={`${settings.retailMargin}%`} subtitle="Margem de lucro atual" icon={Icons.Sparkles} highlightColor="emerald" />
              </div>

              {/* Form de Criação/Edição de Projetos - Redesenhado e Organizado */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Icons.Plus className="text-blue-600 dark:text-blue-400" size={18} />
                    {editingPartId ? "Editar Projeto" : "Novo Projeto de Impressão"}
                  </h3>
                  {editingPartId && (
                    <button 
                      type="button" 
                      onClick={() => { setEditingPartId(null); setNewPart(createEmptyPart()); }}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if(!newPart.name) return;
                    saveToDb('parts', editingPartId, newPart);
                    setEditingPartId(null);
                    setNewPart(createEmptyPart());
                  }} 
                  className="space-y-6"
                >
                  {/* Seção 1: Identificação e Foto (Compacta) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Foto / Thumbnail */}
                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Foto da Peça</label>
                      <div className="relative group w-full h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 transition-all">
                        {newPart.imageUrl ? (
                          <>
                            <img src={newPart.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity">
                              Trocar
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 space-y-1">
                            <Icons.Image size={22} />
                            <span className="text-[10px] font-medium">Carregar foto</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      {newPart.imageUrl && (
                        <button type="button" onClick={() => setNewPart(p => ({ ...p, imageUrl: "" }))} className="mt-1 text-[10px] text-red-500 font-semibold hover:underline block text-center w-full">
                          Remover foto
                        </button>
                      )}
                    </div>

                    {/* Campos de Nome, Arquivo e Qtd */}
                    <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome do Projeto *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Suporte Headset"
                          value={newPart.name} 
                          onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nome do Arquivo 3D</label>
                        <input 
                          type="text" 
                          placeholder="Ex: modelo.stl"
                          value={newPart.fileName || ""} 
                          onChange={e => setNewPart(p => ({ ...p, fileName: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Qtd Lote</label>
                        <input 
                          type="number" 
                          min="1"
                          value={newPart.quantityProduced} 
                          onChange={e => setNewPart(p => ({ ...p, quantityProduced: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none text-center"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Observações da Peça / Modelo</label>
                        <textarea 
                          rows={2}
                          placeholder="Ex: Parâmetros de impressão, tipo de suporte, acabamento necessário..."
                          value={newPart.notes || ""} 
                          onChange={e => setNewPart(p => ({ ...p, notes: e.target.value }))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Seção 2: Tempos e Custos Operacionais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tempo de Impressão (HH:MM)</label>
                      <input 
                        type="text" 
                        placeholder="02:30"
                        value={newPart.printTime} 
                        onChange={e => setNewPart(p => ({ ...p, printTime: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tempo de Trabalho (HH:MM)</label>
                      <input 
                        type="text" 
                        placeholder="00:30"
                        value={newPart.extraLaborHours} 
                        onChange={e => setNewPart(p => ({ ...p, extraLaborHours: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Custo Fixo Adicional (R$)</label>
                      <input 
                        type="text" 
                        placeholder="0.00"
                        value={newPart.manualAdditionalCosts} 
                        onChange={e => setNewPart(p => ({ ...p, manualAdditionalCosts: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Seção 3: Insumos (Filamentos e Componentes) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    
                    {/* Filamentos */}
                    <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Filamentos Utilizados</span>
                        <button 
                          type="button" 
                          onClick={() => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: "" }] }))}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Icons.Plus size={14} /> Adicionar
                        </button>
                      </div>
                      {newPart.usedFilaments.map((uf, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select 
                            value={uf.filamentId}
                            onChange={e => {
                              const updated = [...newPart.usedFilaments];
                              updated[idx].filamentId = e.target.value;
                              setNewPart(p => ({ ...p, usedFilaments: updated }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="">Selecione o filamento...</option>
                            {filaments.map(f => (
                              <option key={f.id} value={f.id}>{f.name} ({f.brand} - R$ {f.priceKg}/kg)</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            placeholder="Gramos" 
                            value={uf.grams}
                            onChange={e => {
                              const updated = [...newPart.usedFilaments];
                              updated[idx].grams = e.target.value;
                              setNewPart(p => ({ ...p, usedFilaments: updated }));
                            }}
                            className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none text-center"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Componentes */}
                    <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Itens do Almoxarifado</span>
                        <button 
                          type="button" 
                          onClick={() => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }))}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Icons.Plus size={14} /> Adicionar
                        </button>
                      </div>
                      {newPart.usedComponents.map((uc, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select 
                            value={uc.componentId}
                            onChange={e => {
                              const updated = [...newPart.usedComponents];
                              updated[idx].componentId = e.target.value;
                              setNewPart(p => ({ ...p, usedComponents: updated }));
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="">Selecione o componente...</option>
                            {components.map(c => (
                              <option key={c.id} value={c.id}>{c.name} (R$ {c.unitPrice}/un)</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            min="1"
                            placeholder="Qtd" 
                            value={uc.quantity}
                            onChange={e => {
                              const updated = [...newPart.usedComponents];
                              updated[idx].quantity = parseInt(e.target.value) || 1;
                              setNewPart(p => ({ ...p, usedComponents: updated }));
                            }}
                            className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none text-center"
                          />
                        </div>
                      ))}
                    </div>

                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
                    >
                      {editingPartId ? "Salvar Alterações do Projeto" : "Salvar Projeto no Catálogo"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabela de Projetos Cadastrados */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Catálogo de Projetos</h3>
                </div>

                {parts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    Nenhum projeto cadastrado ainda. Preencha o formulário acima para calcular.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-6">Nome do Projeto</th>
                          <th className="py-3.5 px-4 text-center">Tempo</th>
                          <th className="py-3.5 px-4 text-right">Custo Produção (Un)</th>
                          <th className="py-3.5 px-4 text-right">Preço Varejo</th>
                          <th className="py-3.5 px-4 text-right">Preço Atacado</th>
                          <th className="py-3.5 px-6 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {parts.map(part => {
                          const calc = calculateCosts(part);
                          return (
                            <tr key={part.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setViewPartModal({ ...part, calc })}>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {/* Thumbnail Preview da Imagem */}
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    {part.imageUrl ? (
                                      <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Icons.Box size={18} className="text-slate-400 dark:text-slate-500" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">{part.name}</span>
                                    {part.fileName && (
                                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block">
                                        📄 {part.fileName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center text-slate-500 dark:text-slate-400 text-xs">{part.printTime} h</td>
                              <td className="py-4 px-4 text-right font-medium text-slate-700 dark:text-slate-300">{formatCurrency(calc.unitCost)}</td>
                              <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calc.retailPrice)}</td>
                              <td className="py-4 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(calc.wholesalePrice)}</td>
                              <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedPartForQuote({ ...part, calc });
                                      setQuoteModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                                    title="Gerar Orçamento"
                                  >
                                    <Icons.Quote size={16} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingPartId(part.id);
                                      setNewPart(part);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                    title="Editar"
                                  >
                                    <Icons.Pencil size={16} />
                                  </button>
                                  <button 
                                    onClick={() => deleteFromDb('parts', part.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                  >
                                    <Icons.Trash size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TELA: IMPRESSORAS */}
          {activeTab === 'printers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Gestão de Máquinas</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cadastre o parque de impressoras 3D e seus consumos energéticos.</p>
              </div>

              {/* Form Impressora */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if(!newPrinter.name) return;
                    saveToDb('printers', editingPrinterId, newPrinter);
                    setEditingPrinterId(null);
                    setNewPrinter({ name: "", powerKw: "0.3" });
                  }}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Modelo da Impressora</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Bambu Lab X1-Carbon, Ender 3 V2"
                      value={newPrinter.name} 
                      onChange={e => setNewPrinter(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Consumo Médio (kW/h)</label>
                    <input 
                      type="text" 
                      placeholder="0.30"
                      value={newPrinter.powerKw} 
                      onChange={e => setNewPrinter(p => ({ ...p, powerKw: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all">
                    {editingPrinterId ? "Salvar" : "Adicionar Máquina"}
                  </button>
                </form>
              </div>

              {/* Lista Impressoras */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {printers.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{p.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Consumo: {p.powerKw} kW/h</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingPrinterId(p.id); setNewPrinter(p); }}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Icons.Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => deleteFromDb('printers', p.id)}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        <Icons.Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA: FILAMENTOS */}
          {activeTab === 'filaments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Estoque de Filamentos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie rolos de filamento, marcas e preços por quilo.</p>
              </div>

              {/* Form Filamentos */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if(!newFilament.name) return;
                    saveToDb('filaments', editingFilamentId, newFilament);
                    setEditingFilamentId(null);
                    setNewFilament({ name: "", brand: "", type: "", priceKg: "110" });
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Cor / Identificação</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Preto Silk, Vermelho"
                      value={newFilament.name} 
                      onChange={e => setNewFilament(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Marca</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Creality, Voolt3D"
                      value={newFilament.brand} 
                      onChange={e => setNewFilament(f => ({ ...f, brand: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Tipo (Material)</label>
                    <input 
                      type="text" 
                      placeholder="PLA, PETG, ABS"
                      value={newFilament.type} 
                      onChange={e => setNewFilament(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Preço / Kg (R$)</label>
                    <input 
                      type="text" 
                      placeholder="110.00"
                      value={newFilament.priceKg} 
                      onChange={e => setNewFilament(f => ({ ...f, priceKg: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all">
                      {editingFilamentId ? "Salvar" : "Cadastrar Filamento"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista Filamentos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filaments.map(f => (
                  <div key={f.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{f.name}</h4>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">{f.type || 'PLA'}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">{f.brand} • R$ {f.priceKg}/Kg</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingFilamentId(f.id); setNewFilament(f); }} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <Icons.Pencil size={16} />
                      </button>
                      <button onClick={() => deleteFromDb('filaments', f.id)} className="p-2 text-slate-400 hover:text-red-500">
                        <Icons.Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA: ALMOXARIFADO */}
          {activeTab === 'components' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Almoxarifado & Insumos</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Componentes não-impressos (Parafusos, rolamentos, porcas, embalagens).</p>
              </div>

              {/* Form Almoxarifado */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if(!newComponent.name) return;
                    saveToDb('components', editingComponentId, newComponent);
                    setEditingComponentId(null);
                    setNewComponent({ name: "", unitPrice: "1.00" });
                  }}
                  className="flex gap-4 items-end"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Nome do Item / Componente</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Parafuso M3x10mm, Imã de Neodímio 5x2mm"
                      value={newComponent.name} 
                      onChange={e => setNewComponent(c => ({ ...c, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Preço Unitário (R$)</label>
                    <input 
                      type="text" 
                      placeholder="0.50"
                      value={newComponent.unitPrice} 
                      onChange={e => setNewComponent(c => ({ ...c, unitPrice: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all">
                    {editingComponentId ? "Salvar" : "Adicionar Item"}
                  </button>
                </form>
              </div>

              {/* Lista Almoxarifado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {components.map(c => (
                  <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{c.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{formatCurrency(parseNum(c.unitPrice))} / un</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingComponentId(c.id); setNewComponent(c); }} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <Icons.Pencil size={16} />
                      </button>
                      <button onClick={() => deleteFromDb('components', c.id)} className="p-2 text-slate-400 hover:text-red-500">
                        <Icons.Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELA: CONFIGURAÇÕES GLOBAIS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Configurações Globais de Precificação</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Parâmetros base utilizados no cálculo automático do seu estúdio.</p>
              </div>

              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Custo Energia (R$ / kWh)</label>
                    <input 
                      type="text" 
                      value={settings.energyKwhPrice} 
                      onChange={e => updateGlobalSettings({ energyKwhPrice: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Depreciação Máquina (R$ / hora)</label>
                    <input 
                      type="text" 
                      value={settings.machineHourlyRate} 
                      onChange={e => updateGlobalSettings({ machineHourlyRate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Sua Mão de Obra (R$ / hora)</label>
                    <input 
                      type="text" 
                      value={settings.myHourlyRate} 
                      onChange={e => updateGlobalSettings({ myHourlyRate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Margem Padrão de Varejo (%)</label>
                    <input 
                      type="number" 
                      value={settings.retailMargin} 
                      onChange={e => updateGlobalSettings({ retailMargin: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Margem Padrão de Atacado (%)</label>
                    <input 
                      type="number" 
                      value={settings.wholesaleMargin} 
                      onChange={e => updateGlobalSettings({ wholesaleMargin: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL SIMPLIFICADO DE ORÇAMENTO */}
      {quoteModalOpen && selectedPartForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Icons.Quote className="text-blue-600 dark:text-blue-400" /> Orçamento Pronto
              </h3>
              <button onClick={() => setQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icons.Close size={20} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-slate-100">📋 Orçamento - {selectedPartForQuote.name}</p>
              <p>• Qtd Produzida: {selectedPartForQuote.quantityProduced} un</p>
              <p>• Tempo de Produção: {selectedPartForQuote.printTime} h</p>
              <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">• Valor Varejo (Un): {formatCurrency(selectedPartForQuote.calc.retailPrice)}</p>
              <p className="text-amber-600 dark:text-amber-400 font-bold">• Valor Atacado (Un): {formatCurrency(selectedPartForQuote.calc.wholesalePrice)}</p>
            </div>

            <button
              onClick={() => {
                const text = `📋 *ORÇAMENTO 3D - PRINTA LOGO*\n\n*Item:* ${selectedPartForQuote.name}\n*Tempo:* ${selectedPartForQuote.printTime}h\n*Valor Unitário (Varejo):* ${formatCurrency(selectedPartForQuote.calc.retailPrice)}\n*Valor Unitário (Atacado):* ${formatCurrency(selectedPartForQuote.calc.wholesalePrice)}`;
                navigator.clipboard.writeText(text);
                setQuoteModalOpen(false);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Copy size={16} /> Copiar Texto para WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES E CONSULTA DO PROJETO */}
      {viewPartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {viewPartModal.imageUrl ? (
                    <img src={viewPartModal.imageUrl} alt={viewPartModal.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icons.Box size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{viewPartModal.name}</h3>
                  {viewPartModal.fileName && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                      Arquivo: {viewPartModal.fileName}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setViewPartModal(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <Icons.Close size={20} />
              </button>
            </div>

            {/* Resumo de Preços */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo Unitário</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.unitCost)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Varejo Unitário</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(viewPartModal.calc.retailPrice)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Atacado Unitário</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(viewPartModal.calc.wholesalePrice)}</span>
              </div>
            </div>

            {/* Detalhamento de Custos Unitários */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Detalhamento de Custos (Por Unidade)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Custo Filamentos</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{formatCurrency(viewPartModal.calc.breakdownUnit.filament)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Tempo Impressão (Energia)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{formatCurrency(viewPartModal.calc.breakdownUnit.energy)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Depreciação Máquina</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{formatCurrency(viewPartModal.calc.breakdownUnit.depreciation)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Mão de Obra</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{formatCurrency(viewPartModal.calc.breakdownUnit.labor)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase">Custo Fixo / Insumos</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{formatCurrency(viewPartModal.calc.breakdownUnit.fixed)}</span>
                </div>
              </div>
            </div>

            {/* Informações Técnicas */}
            <div className="grid grid-cols-3 gap-4 text-xs p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Lote Produzido</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{viewPartModal.quantityProduced || 1} un</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Tempo Impressão</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{viewPartModal.printTime} h</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Mão de Obra</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{viewPartModal.extraLaborHours} h</span>
              </div>
            </div>

            {/* Filamentos Usados */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filamentos Utilizados</h4>
              <div className="space-y-1.5">
                {viewPartModal.usedFilaments?.map((uf, idx) => {
                  const fil = filaments.find(f => f.id.toString() === uf.filamentId?.toString());
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{fil ? `${fil.name} (${fil.brand} - ${fil.type})` : 'Filamento não especificado'}</span>
                      <span className="text-slate-500 font-medium">{uf.grams}g</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Almoxarifado Usado */}
            {viewPartModal.usedComponents?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Almoxarifado & Insumos</h4>
                <div className="space-y-1.5">
                  {viewPartModal.usedComponents.map((uc, idx) => {
                    const comp = components.find(c => c.id.toString() === uc.componentId?.toString());
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{comp ? comp.name : 'Item não encontrado'}</span>
                        <span className="text-slate-500 font-medium">{uc.quantity} un ({formatCurrency(parseNum(comp?.unitPrice) * uc.quantity)})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Observações */}
            {viewPartModal.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Observações</h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {viewPartModal.notes}
                </div>
              </div>
            )}

            {/* Botão de Fechar */}
            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setViewPartModal(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
              >
                Fechar Consulta
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
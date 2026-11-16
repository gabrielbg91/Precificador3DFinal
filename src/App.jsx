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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const [catalogSearch, setCatalogSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedPartForQuote, setSelectedPartForQuote] = useState(null);
  const [viewPartModal, setViewPartModal] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  const saveToDb = async (coll, id, data) => {
    if (!user) return;
    try {
      const docId = id || Date.now().toString();
      await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, docId), data);
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      alert("Não foi possível salvar no banco de dados. Verifique o tamanho da imagem ou sua conexão.");
    }
  };

  const deleteFromDb = async (coll, id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString()));
  };

  // Estado para o preview flutuante da imagem na tabela (com coordenadas)
  const [hoveredImage, setHoveredImage] = useState(null);

  const updateGlobalSettings = async (newData) => {
    const updated = { ...settings, ...newData };
    setSettings(updated);
    await saveToDb('config', 'global', updated);
  };

  const calculateCosts = useMemo(() => {
    return (part) => {
      const pKw = parseNum(settings.energyKwhPrice);
      const mRate = parseNum(settings.machineHourlyRate);
      const lRate = parseNum(settings.myHourlyRate);
      
      const printHours = timeToHours(part.printTime);
      const laborHours = timeToHours(part.extraLaborHours);

      const activePrinter = printers.find(p => p.id === settings.activePrinterId);
      const powerKw = activePrinter ? parseNum(activePrinter.powerKw) : 0.3;

      const energyCost = printHours * powerKw * pKw;
      const machineDepreciation = printHours * mRate;
      const laborCost = laborHours * lRate;

      let filamentsTotalCost = 0;
      if (part.usedFilaments && Array.isArray(part.usedFilaments)) {
        part.usedFilaments.forEach(uf => {
          const fil = filaments.find(f => f.id === uf.filamentId);
          if (fil) {
            const grams = parseNum(uf.grams);
            const priceKg = parseNum(fil.priceKg);
            filamentsTotalCost += (grams / 1000) * priceKg;
          }
        });
      }

      let componentsTotalCost = 0;
      if (part.usedComponents && Array.isArray(part.usedComponents)) {
        part.usedComponents.forEach(uc => {
          const comp = components.find(c => c.id === uc.componentId);
          if (comp) {
            const qty = parseNum(uc.quantity);
            componentsTotalCost += qty * parseNum(comp.unitPrice);
          }
        });
      }

      const manualAdditional = parseNum(part.manualAdditionalCosts);
      const qty = Math.max(1, parseNum(part.quantityProduced));

      const totalProductionCost = energyCost + machineDepreciation + laborCost + filamentsTotalCost + componentsTotalCost + manualAdditional;
      const unitCost = totalProductionCost / qty;

      const retailMarkup = 1 + (settings.retailMargin / 100);
      const wholesaleMarkup = 1 + (settings.wholesaleMargin / 100);

      const retailPrice = unitCost * retailMarkup;
      const wholesalePrice = unitCost * wholesaleMarkup;

      return {
        energyCost: energyCost / qty,
        machineDepreciation: machineDepreciation / qty,
        laborCost: laborCost / qty,
        filamentsTotalCost: filamentsTotalCost / qty,
        componentsTotalCost: componentsTotalCost / qty,
        manualAdditional: manualAdditional / qty,
        unitCost,
        retailPrice,
        wholesalePrice
      };
    };
  }, [settings, printers, filaments, components]);

  const handleProjectImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setNewPart(p => ({ ...p, imageUrl: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedParts = useMemo(() => {
    const filtered = parts.filter(p => p.name.toLowerCase().includes(catalogSearch.toLowerCase()));
    return [...filtered].sort((a, b) => {
      let aVal, bVal;
      const calcA = calculateCosts(a);
      const calcB = calculateCosts(b);

      if (sortConfig.key === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (sortConfig.key === 'time') {
        aVal = timeToHours(a.printTime);
        bVal = timeToHours(b.printTime);
      } else if (sortConfig.key === 'cost') {
        aVal = calcA.unitCost;
        bVal = calcB.unitCost;
      } else if (sortConfig.key === 'retail') {
        aVal = calcA.retailPrice;
        bVal = calcB.retailPrice;
      } else if (sortConfig.key === 'wholesale') {
        aVal = calcA.wholesalePrice;
        bVal = calcB.wholesalePrice;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [parts, catalogSearch, sortConfig, calculateCosts]);

  const saveProjectPart = async (e) => {
    e.preventDefault();
    if (!newPart.name) return;

    const partId = editingPartId || Date.now().toString();
    const dataToSave = { ...newPart, updatedAt: Date.now() };

    await saveToDb('parts', partId, dataToSave);
    setNewPart(createEmptyPart());
    setEditingPartId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-800 dark:text-slate-200 flex transition-colors duration-300 font-sans">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 select-none shrink-0`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Icons.Cpu size={22} />
              </div>
              <div>
                <h1 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">Printa Logo</h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Estúdio 3D</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-xl mx-auto flex items-center justify-center shadow-md shadow-blue-500/20">
              <Icons.Cpu size={22} />
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {[
            { id: 'dashboard', label: 'Projetos & Precificação', icon: Icons.Dashboard },
            { id: 'printers', label: 'Impressoras', icon: Icons.Printer },
            { id: 'filaments', label: 'Filamentos', icon: Icons.Layers },
            { id: 'components', label: 'Almoxarifado', icon: Icons.Box },
            { id: 'settings', label: 'Configurações', icon: Icons.Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition-colors"
            title="Alternar Tema"
          >
            {darkMode ? <Icons.Sun size={18} className="text-amber-400" /> : <Icons.Moon size={18} className="text-slate-600" />}
            {!sidebarCollapsed && <span>{darkMode ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>

          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-sm transition-colors"
            title="Sair"
          >
            <Icons.LogOut size={18} />
            {!sidebarCollapsed && <span>Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          
          {/* TELA: DASHBOARD / CADASTRO DE PROJETOS */}
          {activeTab === 'dashboard' && (
            <>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Cálculo & Gestão de Projetos 3D</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Preencha os dados do modelo para calcular com precisão os custos e margens de venda.</p>
              </div>

              {/* FORMULÁRIO DE PROJETO */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Icons.Plus className="text-blue-600 dark:text-blue-400" /> 
                    {editingPartId ? "Editar Projeto de Impressão" : "Novo Projeto de Impressão"}
                  </h3>
                  {editingPartId && (
                    <button 
                      onClick={() => { setEditingPartId(null); setNewPart(createEmptyPart()); }}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <form onSubmit={saveProjectPart} className="space-y-6">
                  
                  {/* FOTO DA PEÇA (LARGURA TOTAL NO TOPO) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Foto da Peça</label>
                    {newPart.imageUrl ? (
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner group">
                        <img src={newPart.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-semibold cursor-pointer shadow-lg transition-transform hover:scale-105">
                            Trocar foto
                            <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="hidden" />
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setNewPart(p => ({ ...p, imageUrl: "" }))}
                            className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-transform hover:scale-105"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center cursor-pointer transition-all group">
                        <div className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors mb-2">
                          <Icons.Image size={22} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Clique para enviar a foto da peça</span>
                        <input type="file" accept="image/*" onChange={handleProjectImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* IDENTIFICAÇÃO E DADOS BÁSICOS */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Nome do Projeto *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Suporte Headset"
                        value={newPart.name}
                        onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Nome do Arquivo 3D</label>
                      <input 
                        type="text" 
                        placeholder="Ex: modelo.stl"
                        value={newPart.fileName}
                        onChange={e => setNewPart(p => ({ ...p, fileName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Qtd Lote</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newPart.quantityProduced}
                        onChange={e => setNewPart(p => ({ ...p, quantityProduced: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* OBSERVAÇÕES */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Observações da Peça / Modelo</label>
                    <textarea 
                      rows="2"
                      placeholder="Ex: Parâmetros de impressão, tipo de suporte, acabamento necessário..."
                      value={newPart.notes}
                      onChange={e => setNewPart(p => ({ ...p, notes: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none"
                    />
                  </div>

                  {/* TEMPOS E CUSTOS OPERACIONAIS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Tempo de Impressão (HH:MM)</label>
                      <input 
                        type="text" 
                        placeholder="04:30"
                        value={newPart.printTime}
                        onChange={e => setNewPart(p => ({ ...p, printTime: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Tempo de Trabalho (HH:MM)</label>
                      <input 
                        type="text" 
                        placeholder="00:30"
                        value={newPart.extraLaborHours}
                        onChange={e => setNewPart(p => ({ ...p, extraLaborHours: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Custo Fixo Adicional (R$)</label>
                      <input 
                        type="text" 
                        placeholder="0.00"
                        value={newPart.manualAdditionalCosts}
                        onChange={e => setNewPart(p => ({ ...p, manualAdditionalCosts: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* FILAMENTOS E INSUMOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    
                    {/* FILAMENTOS UTILIZADOS */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Filamentos Utilizados</label>
                        <button 
                          type="button"
                          onClick={() => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: "" }] }))}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          + Adicionar
                        </button>
                      </div>

                      {newPart.usedFilaments.map((uf, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select 
                            value={uf.filamentId}
                            onChange={e => {
                              const val = e.target.value;
                              setNewPart(p => {
                                const list = [...p.usedFilaments];
                                list[idx].filamentId = val;
                                return { ...p, usedFilaments: list };
                              });
                            }}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Selecione o filamento...</option>
                            {filaments.map(f => (
                              <option key={f.id} value={f.id}>{f.name} ({f.brand} - R$ {f.priceKg}/kg)</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            placeholder="g"
                            value={uf.grams}
                            onChange={e => {
                              const val = e.target.value;
                              setNewPart(p => {
                                const list = [...p.usedFilaments];
                                list[idx].grams = val;
                                return { ...p, usedFilaments: list };
                              });
                            }}
                            className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              setNewPart(p => ({ ...p, usedFilaments: p.usedFilaments.filter((_, i) => i !== idx) }));
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remover linha"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ITENS DO ALMOXARIFADO */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Itens do Almoxarifado</label>
                        <button 
                          type="button"
                          onClick={() => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }))}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          + Adicionar
                        </button>
                      </div>

                      {newPart.usedComponents.map((uc, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select 
                            value={uc.componentId}
                            onChange={e => {
                              const val = e.target.value;
                              setNewPart(p => {
                                const list = [...p.usedComponents];
                                list[idx].componentId = val;
                                return { ...p, usedComponents: list };
                              });
                            }}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Selecione o item...</option>
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
                              const val = e.target.value;
                              setNewPart(p => {
                                const list = [...p.usedComponents];
                                list[idx].quantity = val;
                                return { ...p, usedComponents: list };
                              });
                            }}
                            className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              setNewPart(p => ({ ...p, usedComponents: p.usedComponents.filter((_, i) => i !== idx) }));
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remover linha"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
                      {editingPartId ? "Salvar Alterações do Projeto" : "Salvar no Catálogo"}
                    </button>
                  </div>

                </form>
              </div>

              {/* Tabela de Projetos Cadastrados (Preview na Dashboard) */}
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 
                    onClick={() => setActiveTab('catalog')} 
                    className="text-base font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 transition-colors"
                    title="Clique para ir ao Catálogo Completo"
                  >
                    Projetos Recentes
                  </h3>
                  <button 
                    onClick={() => setActiveTab('catalog')} 
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver catálogo completo →
                  </button>
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
                        {parts.slice(0, 5).map(part => {
                          const calc = calculateCosts(part);
                          return (
                            <tr key={part.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setViewPartModal({ ...part, calc })}>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0"
                                    onMouseEnter={(e) => {
                                      if (!part.imageUrl) return;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredImage({ url: part.imageUrl, name: part.name, top: rect.top - 10, left: rect.left + 50 });
                                    }}
                                    onMouseLeave={() => setHoveredImage(null)}
                                  >
                                    {part.imageUrl ? (
                                      <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover rounded-xl" />
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
                                      setActiveTab('dashboard');
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

          {/* TELA: CATÁLOGO COMPLETO */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mb-1 inline-flex items-center gap-1"
                  >
                    ← Voltar ao Início / Cadastro
                  </button>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Catálogo Completo de Projetos</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pesquise, filtre e visualize todos os seus modelos salvos.</p>
                </div>

                <div className="relative w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Icons.Search size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Buscar por nome do projeto..." 
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                {sortedParts.length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <Icons.Search size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold">Nenhum projeto encontrado para "{catalogSearch}"</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 select-none">
                        <tr>
                          <th className="py-3.5 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('name')}>
                            <div className="flex items-center gap-1.5">
                              Nome do Projeto
                              {sortConfig.key === 'name' && (<span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('time')}>
                            <div className="flex items-center justify-center gap-1.5">
                              Tempo
                              {sortConfig.key === 'time' && (<span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('cost')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Custo Produção (Un)
                              {sortConfig.key === 'cost' && (<span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('retail')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Preço Varejo
                              {sortConfig.key === 'retail' && (<span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" onClick={() => handleSort('wholesale')}>
                            <div className="flex items-center justify-end gap-1.5">
                              Preço Atacado
                              {sortConfig.key === 'wholesale' && (<span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>)}
                            </div>
                          </th>
                          <th className="py-3.5 px-6 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {sortedParts.map(part => {
                          const calc = calculateCosts(part);
                          return (
                            <tr key={part.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setViewPartModal({ ...part, calc })}>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0"
                                    onMouseEnter={(e) => {
                                      if (!part.imageUrl) return;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredImage({ url: part.imageUrl, name: part.name, top: rect.top - 10, left: rect.left + 50 });
                                    }}
                                    onMouseLeave={() => setHoveredImage(null)}
                                  >
                                    {part.imageUrl ? (
                                      <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover rounded-xl" />
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
                                      setActiveTab('dashboard');
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
            </div>
          )}

          {/* TELA: IMPRESSORAS */}
          {activeTab === 'printers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Gestão de Máquinas</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cadastre o parque de impressoras 3D e seus consumos energéticos.</p>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {printers.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{p.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Consumo: {p.powerKw} kW/h</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingPrinterId(p.id); setNewPrinter(p); }} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <Icons.Pencil size={16} />
                      </button>
                      <button onClick={() => deleteFromDb('printers', p.id)} className="p-2 text-slate-400 hover:text-red-500">
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

      {/* MODAL ORÇAMENTO */}
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

      {/* MODAL DE DETALHES DO PROJETO */}
      {viewPartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* FOTO DE TOPO COM DEGRADÊ */}
            <div className="relative w-full h-56 bg-slate-900 overflow-hidden">
              {viewPartModal.imageUrl ? (
                <>
                  <img src={viewPartModal.imageUrl} alt={viewPartModal.name} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-slate-900/30 to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-900/40 to-indigo-900/40 flex items-center justify-center">
                  <Icons.Box size={48} className="text-slate-400 opacity-50" />
                </div>
              )}

              <button 
                onClick={() => setViewPartModal(null)} 
                className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            <div className="p-8 -mt-12 relative space-y-6">
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{viewPartModal.name}</h2>
                {viewPartModal.fileName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Arquivo: {viewPartModal.fileName}</p>
                )}
              </div>

              {/* CARDS DE PREÇOS UNITÁRIOS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Custo Unitário</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(viewPartModal.calc.unitCost)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Varejo Unitário</span>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{formatCurrency(viewPartModal.calc.retailPrice)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Atacado Unitário</span>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{formatCurrency(viewPartModal.calc.wholesalePrice)}</div>
                </div>
              </div>

              {/* DETALHAMENTO DE CUSTOS POR UNIDADE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhamento de Custos (Por Unidade)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Custo Filamentos</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.filamentsTotalCost)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Tempo Impressão (Energia)</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.energyCost)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Depreciação Máquina</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.machineDepreciation)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Mão de Obra</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.laborCost)}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Custo Fixo / Insumos</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(viewPartModal.calc.componentsTotalCost + viewPartModal.calc.manualAdditional)}</span>
                  </div>
                </div>
              </div>

              {viewPartModal.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observações</h4>
                  <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {viewPartModal.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setViewPartModal(null)}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold text-sm"
                >
                  Fechar Consulta
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TOOLTIP FLUTUANTE ABSOLUTO (FIXED NO VIEWPORT PARA NUNCA SER CORTADO) */}
      {hoveredImage && (
        <div 
          className="fixed z-[99999] p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            top: `${Math.max(20, hoveredImage.top - 120)}px`, 
            left: `${Math.min(window.innerWidth - 250, hoveredImage.left)}px` 
          }}
        >
          <img src={hoveredImage.url} alt={hoveredImage.name} className="w-56 h-56 object-cover rounded-xl" />
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mt-2 px-1 text-center truncate max-w-[224px]">{hoveredImage.name}</span>
        </div>
      )}

    </div>
  );
}
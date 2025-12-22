import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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

/**
 * Ícones SVG estáveis.
 */
const Icons = {
  Settings: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  PlusCircle: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Pencil: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash2: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Sparkles: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 19v2"/><path d="M21 20h-4"/></svg>,
  XCircle: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Loader: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  LogOut: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Cpu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Layers: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Printer: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  CopyPlus: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/><path d="M12 11h6"/><path d="M15 8v6"/></svg>,
  CheckCheck: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>,
  Clipboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  CreditCard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Mail: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Lock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Google: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
};

// --- CONFIG ---
const firebaseConfig = {
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
const APP_ID = "meu-estudio-3d";
const TEMPLATE_ID = "ivaYLHlFWWXq0kBSkoC4pjRNByA3";

// --- HELPERS ---
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
const parseNum = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
};
const handleNumChange = (setter, field, valStr, obj) => {
  const cleanVal = valStr.replace(',', '.');
  if (!isNaN(cleanVal) || cleanVal === '' || cleanVal === '.') {
      setter({...obj, [field]: valStr});
  }
};

// --- COMPONENTS ---

const LoginScreen = ({ onLogin, darkMode }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = { bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900' };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isRegistering) { await createUserWithEmailAndPassword(auth, email, password); } 
      else { await signInWithEmailAndPassword(auth, email, password); }
    } catch (err) { setError("Falha na autenticação. Verifique os dados."); setLoading(false); }
  };

  const handleGoogle = async () => {
    try { const provider = new GoogleAuthProvider(); await signInWithPopup(auth, provider); } 
    catch (err) { console.error(err); }
  };

  const handleGuest = async () => {
    setLoading(true);
    try { await signInAnonymously(auth); } catch (err) { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 font-sans text-slate-100`}>
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-4 text-blue-500 border border-slate-700 shadow-inner">
            <Icons.Cpu size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">PrintaLogo 3D</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Estúdio Profissional Cloud</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold mb-6 text-center">{error}</div>}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-3 tracking-widest">E-mail</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Mail size={18} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 transition-colors font-bold" placeholder="seu@email.com" required />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-3 tracking-widest">Senha</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Lock size={18} /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-4 pl-12 rounded-2xl outline-none focus:border-blue-600 transition-colors font-bold" placeholder="******" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95">
            {loading ? <Icons.Loader /> : (isRegistering ? "Criar Conta" : "Entrar no Studio")}
          </button>
        </form>
        <div className="my-6 flex items-center gap-4 opacity-50">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-[10px] font-black uppercase text-slate-500">Ou continue com</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>
        <div className="space-y-3">
          <button onClick={handleGoogle} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-md">
            <Icons.Google size={24} /> <span className="uppercase text-xs tracking-wider">Google Account</span>
          </button>
          <button onClick={handleGuest} className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-slate-700 transition-colors">
            Acesso Rápido (Convidado)
          </button>
        </div>
        <p className="text-center mt-8 text-xs text-slate-500 font-medium uppercase tracking-widest">
          {isRegistering ? "Já tem conta?" : "Novo por aqui?"}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-500 font-bold ml-2 hover:underline underline-offset-4">
            {isRegistering ? "Fazer Login" : "Criar Agora"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' ou 'subscription'

  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState({ title: "", text: "" });
  const [copiedId, setCopiedId] = useState(null);

  const [settings, setSettings] = useState({ energyKwhPrice: 0.90, machineHourlyRate: 3.50, myHourlyRate: 50, retailMargin: 100, wholesaleMargin: 40, activePrinterId: "", logoUrl: null, geminiApiKey: "" });
  const [subscription, setSubscription] = useState({ plan: "Free", status: "active", expiresAt: null });
  
  const fileInputRef = useRef(null);
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);

  const [newPart, setNewPart] = useState({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] });
  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: 0.3 });
  const [newFilament, setNewFilament] = useState({ name: "", brand: "", type: "", priceKg: "" });
  const [newComponent, setNewComponent] = useState({ name: "", description: "", unitPrice: "" });
  
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [editingFilamentId, setEditingFilamentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [editingPartId, setEditingPartId] = useState(null);

  // --- API FUNCTIONS ---
  async function callGeminiAPI(prompt, apiKey) {
    if (!apiKey) {
      alert("⚠️ Configure sua chave Gemini em Configurações.");
      return "Falta chave.";
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro.";
    } catch (e) { return "Erro API."; }
  }

  const handleGenerateDescription = async () => {
    if (!newPart.name) return;
    setAiLoading(true);
    const t = await callGeminiAPI(`Descrição curta e vendedora para peça 3D: ${newPart.name}`, settings.geminiApiKey);
    setNewPart(p => ({...p, description: t}));
    setAiLoading(false);
  };

  const handleAnalyzeProfit = async (p, res) => {
    setAiLoading(true); setAiModalOpen(true);
    const t = await callGeminiAPI(`Analise lucro da peça ${p.name}, Custo R$${res.totalProductionCost.toFixed(2)}, Venda R$${res.retailPrice.toFixed(2)}. Sem LaTeX ($).`, settings.geminiApiKey);
    setAiContent({title: p.name, text: t}); setAiLoading(false);
  };

  // --- CORE LOGIC ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const seedGuestData = async (uid) => {
    try {
      const checkRef = doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'global');
      const snap = await getDoc(checkRef);
      if (snap.exists()) return;
      const batch = writeBatch(db);
      const collectionsToCopy = ['printers', 'filaments', 'components', 'parts'];
      for (const collName of collectionsToCopy) {
          const sourceRef = collection(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, collName);
          const snapshot = await getDocs(sourceRef);
          snapshot.forEach(d => batch.set(doc(db, 'artifacts', APP_ID, 'users', uid, collName, d.id), d.data()));
      }
      const sourceConfigRef = doc(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, 'config', 'global');
      const configSnap = await getDoc(sourceConfigRef);
      if (configSnap.exists()) batch.set(doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'global'), configSnap.data());
      await batch.commit();
      window.location.reload();
    } catch (e) { console.error("Seed failed", e); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (u.isAnonymous) {
            const created = new Date(u.metadata.creationTime).getTime();
            if ((Date.now() - created) / 36e5 >= 24) {
               await signOut(auth); setUser(null); alert("Sessão expirada."); setLoading(false); return;
            }
            await seedGuestData(u.uid);
        }
        setUser(u);
      } else { setUser(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const path = ['artifacts', APP_ID, 'users', user.uid];
    const unsubS = onSnapshot(doc(db, ...path, 'config', 'global'), (s) => s.exists() && setSettings(p => ({...p, ...s.data()})));
    // Listener de Assinatura
    const unsubSub = onSnapshot(doc(db, ...path, 'config', 'subscription'), (s) => s.exists() && setSubscription(s.data()));
    
    const unsubP = onSnapshot(collection(db, ...path, 'printers'), (s) => setPrinters(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubF = onSnapshot(collection(db, ...path, 'filaments'), (s) => setFilaments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubC = onSnapshot(collection(db, ...path, 'components'), (s) => setComponents(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubParts = onSnapshot(collection(db, ...path, 'parts'), (s) => setParts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubS(); unsubSub(); unsubP(); unsubF(); unsubC(); unsubParts(); };
  }, [user]);

  const saveToDb = async (coll, id, data) => { if (!user) return; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id || Date.now().toString()), data); };
  const deleteFromDb = async (coll, id) => { if (!user) return; await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString())); };
  const updateGlobalSettings = async (newData) => { if (!user) return; const merged = { ...settings, ...newData }; setSettings(merged); await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged); };
  const handleLogoUpload = (e) => { const r = new FileReader(); r.onloadend = () => updateGlobalSettings({ logoUrl: r.result }); r.readAsDataURL(e.target.files[0]); };
  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  // --- CRUD HANDLERS ---
  const handleAddPart = (e) => { e.preventDefault(); if(!newPart.name) return; saveToDb('parts', editingPartId, newPart); setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  const startEditPart = (p) => { setEditingPartId(p.id); const pt = { ...p, printTime: typeof p.printTime === 'number' ? decimalToTime(p.printTime) : p.printTime, extraLaborHours: typeof p.extraLaborHours === 'number' ? decimalToTime(p.extraLaborHours) : p.extraLaborHours }; setNewPart(pt); };
  const cancelEditPart = () => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  const duplicatePart = (p) => { const { id, ...d } = p; setNewPart({ ...d, name: `${d.name} (Cópia)`, printTime: typeof d.printTime === 'number' ? decimalToTime(d.printTime) : d.printTime, extraLaborHours: typeof d.extraLaborHours === 'number' ? decimalToTime(d.extraLaborHours) : d.extraLaborHours }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const calculateCosts = (part) => {
    const printer = printers.find(p => p.id.toString() === settings.activePrinterId) || { powerKw: 0 };
    const pTime = timeToDecimal(part.printTime);
    const lTime = timeToDecimal(part.extraLaborHours);
    const qty = part.quantityProduced > 0 ? parseFloat(part.quantityProduced) : 1;
    let matCost = 0, weight = 0, compCost = 0;
    (part.usedFilaments || []).forEach(i => { const f = filaments.find(fi => fi.id.toString() === i.filamentId?.toString()); if (f) { matCost += (parseNum(i.grams)/1000)*parseNum(f.priceKg); weight += parseNum(i.grams); }});
    (part.usedComponents || []).forEach(i => { const c = components.find(ci => ci.id.toString() === i.componentId?.toString()); if (c) compCost += parseNum(c.unitPrice) * i.quantity; });
    const energy = pTime * parseNum(printer.powerKw || 0) * parseNum(settings.energyKwhPrice);
    const wear = pTime * parseNum(settings.machineHourlyRate);
    const labor = lTime * parseNum(settings.myHourlyRate);
    const extra = parseNum(part.manualAdditionalCosts) + compCost;
    const batchTotal = matCost + energy + wear + labor + extra;
    const unitCost = batchTotal / qty;
    const totalForBreakdown = batchTotal || 1;
    const breakdown = { material: (matCost / totalForBreakdown) * 100, energy: ((energy + wear) / totalForBreakdown) * 100, labor: (labor / totalForBreakdown) * 100, extras: (extra / totalForBreakdown) * 100 };
    return { totalProductionCost: unitCost, retailPrice: unitCost * (1 + settings.retailMargin/100), wholesalePrice: unitCost * (1 + settings.wholesaleMargin/100), totalWeight: weight / qty, unitPrintTimeDecimal: pTime / qty, breakdown, quantity: qty };
  };

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const theme = {
    bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    input: darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
    tableHeader: darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50/50 text-slate-400',
    tableRowHover: darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase bg-slate-950 text-white tracking-widest">Sincronizando Studio...</div>;
  if (!user) return <LoginScreen onLogin={setUser} darkMode={darkMode} />;

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-all duration-500 ${theme.bg}`}>
      <div className="max-w-7xl mx-auto">
        {/* MODAL IA */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] border shadow-2xl overflow-hidden ${theme.card}`}>
              <div className="p-6 border-b flex justify-between items-center bg-inherit sticky top-0 z-10">
                <h3 className="text-xl font-black text-indigo-500 flex items-center gap-2"><Icons.Sparkles /> Análise: {aiContent.title}</h3>
                <button onClick={() => setAiModalOpen(false)} className="p-2 hover:bg-slate-500/10 rounded-full text-slate-500"><Icons.XCircle size={28} /></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="text-base leading-relaxed whitespace-pre-wrap font-medium opacity-90 text-slate-300">
                  {aiLoading ? <div className="flex flex-col items-center py-12 gap-4"><Icons.Loader size={40} className="text-indigo-500" /><span className="text-xs uppercase font-black tracking-widest animate-pulse">Consultando Gemini...</span></div> : aiContent.text}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <header className="mb-12 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-[2rem] border-2 flex items-center justify-center overflow-hidden cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
              {settings.logoUrl ? <img src={String(settings.logoUrl)} className="h-full w-full object-contain" /> : <div className="text-blue-600 scale-150"><Icons.Cpu size={40}/></div>}
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Icons.Pencil size={24} /></div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">PrintaLogo Pro</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${subscription.plan === 'Pro' ? 'bg-indigo-600 text-white' : 'bg-slate-500/20 text-slate-400'}`}>Plano {subscription.plan}</span>
                <span className="text-[10px] font-bold text-slate-500 select-all tracking-tighter">ID: {user.uid}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-[2rem] border border-slate-800">
             <button onClick={() => setActiveTab('studio')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Studio</button>
             <button onClick={() => setActiveTab('subscription')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'subscription' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Assinatura</button>
             <div className="w-px h-6 bg-slate-800 mx-2"></div>
             <button onClick={handleLogout} className="p-3 text-red-500 hover:bg-red-500/10 rounded-full transition-all"><Icons.LogOut size={20}/></button>
          </div>
        </header>

        {activeTab === 'studio' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in">
              <div className="lg:col-span-4 space-y-8">
                  {/* CARDS ESQUERDA (MÁQUINAS, FILAMENTOS, CONFIGS) */}
                  <div className={`p-7 rounded-[2.5rem] border ${theme.card}`}>
                    <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Printer /> Máquinas</h2>
                    <form onSubmit={(e) => {e.preventDefault(); if(!newPrinter.name) return; saveToDb('printers', editingPrinterId, newPrinter); setEditingPrinterId(null); setNewPrinter({name:"", powerKw:0.3}); }} className="space-y-3 mb-4">
                       <input value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} placeholder="Modelo" />
                       <div className="flex gap-2"><input type="text" value={newPrinter.powerKw || ''} onChange={e => handleNumChange(setNewPrinter, 'powerKw', e.target.value, newPrinter)} className={`flex-1 p-3 rounded-2xl text-xs font-bold ${theme.input}`} placeholder="kW" /><button className="bg-slate-800 text-white px-4 rounded-2xl"><Icons.PlusCircle /></button></div>
                    </form>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                       {printers.map(p => (<div key={p.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><span><strong>{p.name}</strong> • {p.powerKw} kW</span><div className="flex gap-1"><button onClick={() => {setEditingPrinterId(p.id); setNewPrinter(p);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('printers', p.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}
                    </div>
                  </div>

                  <div className={`p-7 rounded-[2.5rem] border ${theme.card}`}>
                    <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Layers /> Filamentos</h2>
                    <form onSubmit={(e) => {e.preventDefault(); if(!newFilament.name) return; saveToDb('filaments', editingFilamentId, newFilament); setEditingFilamentId(null); setNewFilament({name:"", brand:"", type:"", priceKg:""}); }} className="space-y-3 mb-4">
                        <input placeholder="Nome / Cor" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Marca" value={newFilament.brand} onChange={e => setNewFilament({...newFilament, brand: e.target.value})} className={`p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                          <input type="text" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => handleNumChange(setNewFilament, 'priceKg', e.target.value, newFilament)} className={`p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                        </div>
                        <button className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg">Guardar</button>
                    </form>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                       {filaments.map(f => (<div key={f.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><div><span className="font-bold text-indigo-500 uppercase">{f.name}</span><p className="text-[10px] opacity-70">{f.brand} • {formatCurrency(parseNum(f.priceKg))}</p></div><button onClick={() => deleteFromDb('filaments', f.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div>))}
                    </div>
                  </div>

                  <div className={`p-7 rounded-[2.5rem] border ${theme.card}`}>
                    <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Settings /> Configurações</h2>
                    <div className="space-y-4">
                      <select value={settings.activePrinterId} onChange={e => updateGlobalSettings({ activePrinterId: e.target.value })} className={`w-full p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`}><option value="">Impressora Ativa...</option>{printers.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}</select>
                      <div className="grid grid-cols-3 gap-2">
                         <div className="space-y-1"><label className="text-[8px] font-black uppercase opacity-50">kWh</label><input type="text" value={settings.energyKwhPrice} onChange={e => handleNumChange(setSettings, 'energyKwhPrice', e.target.value, settings)} onBlur={() => updateGlobalSettings({ energyKwhPrice: settings.energyKwhPrice })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} /></div>
                         <div className="space-y-1"><label className="text-[8px] font-black uppercase opacity-50">Máq/h</label><input type="text" value={settings.machineHourlyRate} onChange={e => handleNumChange(setSettings, 'machineHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ machineHourlyRate: settings.machineHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} /></div>
                         <div className="space-y-1"><label className="text-[8px] font-black uppercase opacity-50">Eu/h</label><input type="text" value={settings.myHourlyRate} onChange={e => handleNumChange(setSettings, 'myHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ myHourlyRate: settings.myHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} /></div>
                      </div>
                      <div className={`p-3 rounded-xl border border-dashed flex items-center gap-2 ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                         <Icons.Key size={14} className="text-slate-500" />
                         <input type="password" value={settings.geminiApiKey} onChange={e => updateGlobalSettings({ geminiApiKey: e.target.value })} placeholder="Gemini API Key" className="bg-transparent text-xs outline-none w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-emerald-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-emerald-500 uppercase">Varejo %</label><input type="number" value={settings.retailMargin} onChange={e => updateGlobalSettings({ retailMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-emerald-500 outline-none" /></div>
                         <div className="bg-orange-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-orange-500 uppercase">Atacado %</label><input type="number" value={settings.wholesaleMargin} onChange={e => updateSettings({ wholesaleMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-orange-500 outline-none" /></div>
                      </div>
                    </div>
                  </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                {/* FORMULÁRIO DE PROJETO */}
                <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${theme.card}`}>
                   <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase"><Icons.PlusCircle /> {editingPartId ? 'Ajustar Projeto' : 'Novo Projeto Master'}</h2>
                   <form onSubmit={handleAddPart} className="space-y-6">
                      <div className="flex gap-2">
                         <input type="text" placeholder="Nome da Peça..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`flex-1 p-5 rounded-[2rem] text-xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 ${theme.input}`} />
                         <button type="button" onClick={handleGenerateDescription} disabled={aiLoading || subscription.plan === 'Free'} className={`p-4 rounded-[2rem] shadow-lg transition-all ${subscription.plan === 'Free' ? 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white active:scale-95'}`}>
                            {aiLoading ? <Icons.Loader /> : <Icons.Sparkles />}
                         </button>
                      </div>
                      {newPart.description && <div className={`p-4 rounded-2xl text-xs font-medium border-l-4 border-purple-500 ${darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}><p className="opacity-70 mb-1 font-black uppercase tracking-widest text-[8px]">Propaganda IA ✨</p>{newPart.description}</div>}
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3">Lote Qtd</label><input type="number" value={newPart.quantityProduced} onChange={e => setNewPart(p => ({...p, quantityProduced: parseInt(e.target.value)}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                         <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3">Impressão (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.printTime} onChange={e => setNewPart(p => ({...p, printTime: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                         <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3">Humano (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.extraLaborHours} onChange={e => setNewPart(p => ({...p, extraLaborHours: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                         <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3">Extras R$</label><input type="text" placeholder="0.00" value={newPart.manualAdditionalCosts} onChange={e => handleNumChange(setNewPart, 'manualAdditionalCosts', e.target.value, newPart)} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-indigo-500">Filamentos Usados</span><button type="button" onClick={addFilamentRow} className="bg-indigo-600 text-white rounded-full p-1 active:scale-90 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                            {newPart.usedFilaments.map((u, i) => (
                               <div key={i} className="flex gap-2 mb-2">
                                  <select value={u.filamentId} onChange={e => updateFilamentRow(i, 'filamentId', e.target.value)} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${theme.input}`}><option value="">Material...</option>{filaments.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
                                  <input type="text" placeholder="g" value={u.grams} onChange={e => updateFilamentRow(i, 'grams', e.target.value)} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${theme.input}`} />
                               </div>
                            ))}
                         </div>
                         <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-emerald-500">Almoxarifado</span><button type="button" onClick={addComponentRow} className="bg-emerald-600 text-white rounded-full p-1 active:scale-90 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                            {newPart.usedComponents.map((u, i) => (
                               <div key={i} className="flex gap-2 mb-2">
                                  <select value={u.componentId} onChange={e => updateComponentRow(i, 'componentId', e.target.value)} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${theme.input}`}><option value="">Item...</option>{components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                  <input type="number" placeholder="Qtd" value={u.quantity} onChange={e => updateComponentRow(i, 'quantity', parseInt(e.target.value))} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${theme.input}`} />
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex gap-2">
                         <button className="flex-1 bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-all active:scale-95">
                            {editingPartId ? "Confirmar Mudança" : "Salvar no Portfólio Cloud"}
                         </button>
                         {editingPartId && <button type="button" onClick={cancelEditPart} className="px-8 rounded-[2.5rem] font-black text-xs uppercase opacity-50">Cancelar</button>}
                      </div>
                   </form>
                </div>

                {/* TABELA DE RESULTADOS */}
                <div className={`rounded-[3rem] border overflow-hidden ${theme.card}`}>
                   <div className="p-10 border-b flex justify-between items-center"><h2 className="text-2xl font-black uppercase tracking-tighter">Resultados Studio</h2></div>
                   <div className="w-full">
                      <table className="w-full text-left table-fixed">
                         <thead>
                            <tr className={`text-[10px] uppercase font-black border-b ${theme.tableHeader}`}>
                               <th className="px-10 py-6 w-[35%]">Projeto</th>
                               <th className="px-4 py-6 text-center w-[10%] text-slate-500">Qtd</th>
                               <th className="px-4 py-6 text-center w-[15%] text-blue-500">Custo Base</th>
                               <th className="px-4 py-6 text-center w-[15%] text-emerald-500">Varejo</th>
                               <th className="px-4 py-6 text-center w-[15%] text-orange-500">Atacado</th>
                               <th className="px-6 py-6 w-[10%]"></th>
                            </tr>
                         </thead>
                         <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {parts.map(p => {
                               const res = calculateCosts(p);
                               return (
                                  <tr key={p.id} className={`group ${theme.tableRowHover}`}>
                                     <td className="px-10 py-8">
                                        <span className="font-black block text-lg uppercase mb-2 tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</span>
                                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner mb-3">
                                          <div style={{ width: `${res.breakdown.material}%` }} className="bg-blue-600 h-full border-r border-black/5"></div>
                                          <div style={{ width: `${res.breakdown.energy}%` }} className="bg-amber-400 h-full border-r border-black/5"></div>
                                          <div style={{ width: `${res.breakdown.labor}%` }} className="bg-purple-600 h-full border-r border-black/5"></div>
                                          <div style={{ width: `${res.breakdown.extras}%` }} className="bg-rose-500 h-full"></div>
                                        </div>
                                        <div className="flex gap-2">
                                           <button onClick={() => duplicatePart(p)} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors active:scale-95"><Icons.CopyPlus size={12} /> Clonar</button>
                                           <button onClick={() => handleAnalyzeProfit(p, res)} className="text-[9px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/40 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors active:scale-95"><Icons.Sparkles size={12} /> IA</button>
                                        </div>
                                     </td>
                                     <td className="px-4 py-8 text-center text-sm font-black text-slate-500">{p.quantityProduced || 1}</td>
                                     <td className="px-4 py-8 text-center"><span className="text-xl font-black text-blue-500 leading-tight">{formatCurrency(res.totalProductionCost)}</span></td>
                                     <td className="px-4 py-8 text-center"><span className="text-xl font-black text-emerald-500 leading-tight">{formatCurrency(res.retailPrice)}</span></td>
                                     <td className="px-4 py-8 text-center"><span className="text-xl font-black text-orange-500 leading-tight">{formatCurrency(res.wholesalePrice)}</span></td>
                                     <td className="px-6 py-8 text-right">
                                        <div className="flex flex-col gap-2 items-center">
                                           <button onClick={() => startEditPart(p)} className="p-2 rounded-xl border hover:bg-indigo-600 hover:text-white transition-all"><Icons.Pencil size={14} /></button>
                                           <button onClick={() => deleteFromDb('parts', p.id)} className="p-2 rounded-xl border hover:bg-red-600 hover:text-white transition-all"><Icons.Trash2 size={14} /></button>
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
        ) : (
          /* PÁGINA DE ASSINATURA / PLANOS */
          <div className="max-w-4xl mx-auto py-12 animate-in text-center">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-2">Gestão de Plano</h2>
            <p className="text-slate-500 uppercase tracking-widest text-sm mb-12">O seu estúdio profissional na nuvem</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PLANO ATUAL */}
              <div className={`p-10 rounded-[3rem] border-2 ${theme.card} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.CheckCheck size={80}/></div>
                <h3 className="text-sm font-black uppercase text-blue-500 mb-2 tracking-widest">Plano Ativo</h3>
                <div className="text-5xl font-black mb-6 uppercase tracking-tighter">{subscription.plan}</div>
                <div className="space-y-4 mb-10 text-left">
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 font-bold uppercase text-[10px]">Status</span> <span className="text-green-500 font-black text-xs uppercase">Ativo</span></div>
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 font-bold uppercase text-[10px]">Expira em</span> <span className="font-black text-xs">{subscription.expiresAt || 'Vitalício (Intro)'}</span></div>
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 font-bold uppercase text-[10px]">IA Gemini</span> <span className="font-black text-xs">{subscription.plan === 'Pro' ? 'Liberado' : 'Limitado'}</span></div>
                </div>
                {subscription.plan === 'Free' && (
                  <button className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Upgrade para Pro</button>
                )}
              </div>

              {/* UPGRADE / PAGAMENTO */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-[3rem] shadow-2xl">
                <div className="bg-slate-950 rounded-[2.9rem] p-10 h-full flex flex-col justify-center">
                  <Icons.CreditCard size={48} className="mx-auto mb-6 text-white" />
                  <h3 className="text-2xl font-black mb-2 uppercase">Maker Pro</h3>
                  <div className="text-4xl font-black mb-6">R$ 19,90 <span className="text-sm opacity-50 font-normal">/mês</span></div>
                  <p className="text-slate-400 text-sm mb-8">Libere o poder total da IA Gemini e projetos ilimitados no seu estúdio.</p>
                  
                  {/* SIMULAÇÃO DE LINK DE PAGAMENTO */}
                  <button onClick={() => window.open('https://checkout.asaas.com/v/exemplo-link-pix', '_blank')} className="w-full bg-white text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                    Assinar via PIX
                  </button>
                  <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ativação instantânea após o pagamento</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-900/30 rounded-[2.5rem] border border-slate-800 inline-block">
               <p className="text-slate-500 text-xs font-bold uppercase mb-4">Apoio ao Cliente</p>
               <a href="mailto:suporte@printalogo.com.br" className="text-blue-500 font-black text-lg hover:underline transition-all flex items-center gap-2">
                 <Icons.Mail size={20}/> suporte@printalogo.com.br
               </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
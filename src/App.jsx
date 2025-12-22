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
  Check: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  XCircle: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Trash2: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Package: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.28"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/><path d="M21 8.5v7c0 .66-.39 1.25-1 1.5l-7 4c-.61.35-1.39.35-2 0l-7-4c-.61-.25-1-.84-1-1.5v-7c0-.66.39-1.25 1-1.5l7-4c.61-.35 1.39-.35 2 0l7 4c.61.25 1 .84 1 1.5z"/></svg>,
  TrendingUp: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Cpu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Printer: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Layers: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Box: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sparkles: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 19v2"/><path d="M21 20h-4"/></svg>,
  MessageSquare: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Loader: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Info: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Clipboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  CheckCheck: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>,
  Key: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  CopyPlus: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/><path d="M12 11h6"/><path d="M15 8v6"/></svg>,
  Clock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Tag: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>,
  Google: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  LogOut: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Mail: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Lock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ShieldAlert: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  RotateCw: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Download: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Crown: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>
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

const APP_ID = (typeof __app_id !== 'undefined' ? __app_id : "meu-estudio-3d").replace(/\//g, '_');
const TEMPLATE_ID = "ivaYLHlFWWXq0kBSkoC4pjRNByA3"; 
// --- CHAVE MESTRA DO SISTEMA (Fallback) ---
// Se o usuário não tiver chave própria, usa esta.
const SYSTEM_GEMINI_KEY = "AIzaSyC0vrwO5PtkQKZE3-WP49Yxlb4-mSKPNOY"; 

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

// --- API DO GEMINI ---
const callGeminiAPI = async (prompt, userApiKey) => {
  const apiKey = userApiKey || SYSTEM_GEMINI_KEY;
  if (!apiKey) {
    alert("⚠️ Nenhuma chave de IA encontrada. Adicione a sua em Configurações ou contacte o suporte.");
    return "Falta chave de IA.";
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
    return "Erro ao consultar a IA.";
  }
};

// --- TELA DE PAGAMENTO (BLOCKER) ---
const PaymentScreen = ({ user, onLogout, renewalCount = 0 }) => {
  // Define o valor e o QR Code com base no número de renovações
  const isPromo = renewalCount === 0;
  const price = isPromo ? "9,90" : "19,90";
  // IDs de arquivo do Google Drive - Usando o formato direto de imagem
  const qrCodeId = isPromo 
    ? "1QTPzXKTkxWBNO6PgHAtmgQz1mm6Jvp0t" // QR Code 9.90
    : "1r5GrkdzCmqRRBza2kZ6az4kKODYmjRRA"; // QR Code 19.90

  // URL direta para imagem no Google Drive (evita problemas de CORS em alguns casos)
  const qrCodeUrl = `https://lh3.googleusercontent.com/d/${qrCodeId}`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
       <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-[2.5rem] shadow-2xl mb-6">
             <div className="bg-slate-900 rounded-[2.4rem] p-10">
                <div className="h-20 w-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6 text-yellow-400">
                    <Icons.Lock size={40} />
                </div>
                <h2 className="text-3xl font-black uppercase mb-2">Acesso Restrito</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Sua conta Google precisa de uma assinatura ativa para acessar o sistema.</p>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Plano Maker Pro</span>
                      <span className="text-xs font-bold uppercase text-green-400">R$ {price}/mês</span>
                   </div>
                   <div className="h-px bg-slate-700 my-4"></div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Pagamento via PIX</p>
                   
                   {/* QR CODE DA CHAVE PIX */}
                   <div className="bg-white p-3 rounded-xl mb-4 flex justify-center overflow-hidden relative">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code PIX" 
                        className="h-48 w-48 object-contain"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://via.placeholder.com/200x200?text=Erro+QR+Code"; // Fallback simples
                        }}
                      />
                   </div>
                   
                   <p className="text-[10px] text-slate-500 mb-2">Após pagar, envie o comprovante para liberação imediata.</p>
                </div>

                <button onClick={() => window.open(`https://wa.me/5535991198175?text=Olá, paguei o PIX de R$${price} para o email ${user.email} e quero liberar meu acesso.`, '_blank')} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all mb-4">
                   Enviar Comprovante (WhatsApp)
                </button>
                
                <button onClick={onLogout} className="text-xs text-slate-500 font-bold hover:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                   <Icons.LogOut size={14}/> Sair da Conta
                </button>
             </div>
          </div>
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">ID: {user.uid}</p>
       </div>
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, darkMode }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = { bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900' };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("Erro no login com Google.");
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError("Erro ao entrar como convidado.");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 font-sans`}>
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
        <div className="text-center mb-12">
          <div className="h-20 w-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-4 text-blue-500 border border-slate-700 shadow-inner">
            <Icons.Cpu size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">PRECIFICADOR 3D</h1>
          <p className="text-slate-400 text-sm font-medium">Gestão Profissional para Makers</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold mb-6 text-center">{error}</div>}

        <div className="space-y-4">
          <button onClick={handleGoogle} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
            <Icons.Google size={24} /> <span className="uppercase text-xs tracking-wider">Entrar com Google</span>
          </button>
          
          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-2 text-slate-500">Ou</span></div>
          </div>

          <button onClick={handleGuest} className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-slate-700 transition-colors">
            {loading ? <Icons.Loader /> : "Entrar como Convidado"}
          </button>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-slate-600 uppercase font-bold tracking-widest">
           Acesso seguro &bull; Dados na nuvem
        </p>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState({ title: "", text: "" });
  const [copiedId, setCopiedId] = useState(null);

  // SUBSCRIPTION STATE & WARNINGS
  const [subscription, setSubscription] = useState(null); // null = loading
  const [expiryWarning, setExpiryWarning] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  const [settings, setSettings] = useState({ energyKwhPrice: "0.90", machineHourlyRate: "3.50", myHourlyRate: "50", retailMargin: 100, wholesaleMargin: 40, activePrinterId: "", logoUrl: null, geminiApiKey: "" });
  const fileInputRef = useRef(null);
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);
  
  const [newPart, setNewPart] = useState({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] });
  
  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: "0.3" });
  const [newFilament, setNewFilament] = useState({ name: "", brand: "", type: "", priceKg: "" });
  const [newComponent, setNewComponent] = useState({ name: "", description: "", unitPrice: "" });
  
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [editingFilamentId, setEditingFilamentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [editingPartId, setEditingPartId] = useState(null);

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

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Seed Data Logic
  const seedGuestData = async (uid) => {
    const userConfigRef = doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'global');
    const userConfigSnap = await getDoc(userConfigRef);

    if (userConfigSnap.exists()) {
        return;
    }

    const batch = writeBatch(db);
    const collectionsToCopy = ['printers', 'filaments', 'components', 'parts'];

    try {
        console.log("Seeding data from template...");
        for (const collName of collectionsToCopy) {
            const sourceRef = collection(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, collName);
            const snapshot = await getDocs(sourceRef);
            snapshot.forEach(docSnap => {
                const destRef = doc(db, 'artifacts', APP_ID, 'users', uid, collName, docSnap.id);
                batch.set(destRef, docSnap.data());
            });
        }
        const sourceConfigRef = doc(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, 'config', 'global');
        const sourceConfigSnap = await getDoc(sourceConfigRef);
        if (sourceConfigSnap.exists()) {
            batch.set(userConfigRef, sourceConfigSnap.data());
        }
        // Set Default Free Plan for New Users
        batch.set(doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'subscription'), {
           plan: 'Free',
           status: 'active',
           expiresAt: null 
        });

        await batch.commit();
        window.location.reload();

    } catch (error) {
        console.error("Error seeding data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (u.isAnonymous) {
            const created = new Date(u.metadata.creationTime).getTime();
            const now = Date.now();
            if ((now - created) / 36e5 >= 24) {
               await signOut(auth); setUser(null); alert("Sessão expirada."); setLoading(false); return;
            }
            await seedGuestData(u.uid);
        }
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
    
    // Check Subscription Status & Dates
    const unsubSub = onSnapshot(doc(db, ...path, 'config', 'subscription'), (s) => {
       if (s.exists()) {
          const subData = s.data();
          setSubscription(subData);
          
          // Logic: Warning at 28 days, Block at 33 days (from expiresAt)
          if (subData.expiresAt) {
               // Safely parse date from Firestore Timestamp or String
               let expDate;
               if (subData.expiresAt.toDate) expDate = subData.expiresAt.toDate(); // Firestore Timestamp
               else expDate = new Date(subData.expiresAt); // ISO String

               const now = new Date();
               const diffTime = expDate - now; 
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               
               // diffDays > 0: Dias restantes
               // diffDays < 0: Dias vencidos
               
               // Block condition: 3 days PAST expiration (diffDays <= -3)
               if (diffDays <= -3) {
                   setIsOverdue(true);
                   setExpiryWarning(null);
               } 
               // Warning condition: 2 days LEFT or less (diffDays <= 2) AND not yet blocked
               else if (diffDays <= 2) {
                   setIsOverdue(false);
                   const daysOver = Math.abs(diffDays);
                   const msg = diffDays < 0 
                     ? `Sua assinatura venceu há ${daysOver} dias. Regularize para evitar bloqueio.` 
                     : `Sua assinatura vence em ${diffDays} dias.`;
                   setExpiryWarning(msg);
               } else {
                   setIsOverdue(false);
                   setExpiryWarning(null);
               }
          }
       }
       else setSubscription({ status: 'inactive' }); // Bloqueia se não tiver doc
    });

    const unsubS = onSnapshot(doc(db, ...path, 'config', 'global'), (s) => s.exists() && setSettings(p => ({...p, ...s.data()})), (err) => console.log("Sync waiting..."));
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

  // Handlers CRUD
  const handleAddPrinter = (e) => { e.preventDefault(); if(!newPrinter.name) return; saveToDb('printers', editingPrinterId, newPrinter); setEditingPrinterId(null); setNewPrinter({ name: "", powerKw: "0.3" }); };
  const handleAddFilament = (e) => { e.preventDefault(); if(!newFilament.name) return; saveToDb('filaments', editingFilamentId, newFilament); setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" }); };
  const handleAddComponent = (e) => { e.preventDefault(); if(!newComponent.name) return; saveToDb('components', editingComponentId, newComponent); setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: "" }); };
  const handleAddPart = (e) => { e.preventDefault(); if(!newPart.name) return; saveToDb('parts', editingPartId, newPart); setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };

  const startEditPrinter = (p) => { setEditingPrinterId(p.id); setNewPrinter(p); };
  const cancelEditPrinter = () => { setEditingPrinterId(null); setNewPrinter({ name: "", powerKw: "0.3" }); };
  const startEditFilament = (f) => { setEditingFilamentId(f.id); setNewFilament(f); };
  const cancelEditFilament = () => { setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" }); };
  const startEditComponent = (c) => { setEditingComponentId(c.id); setNewComponent(c); };
  const cancelEditComponent = () => { setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: "" }); };
  const startEditPart = (p) => { setEditingPartId(p.id); const partToEdit = { ...p, printTime: typeof p.printTime === 'number' ? decimalToTime(p.printTime) : p.printTime, extraLaborHours: typeof p.extraLaborHours === 'number' ? decimalToTime(p.extraLaborHours) : p.extraLaborHours }; setNewPart(partToEdit); };
  const cancelEditPart = () => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  
  const duplicatePart = (p) => { 
    const { id, ...d } = p; 
    setNewPart({ 
      ...d, 
      name: `${d.name} (Cópia)`, 
      printTime: typeof d.printTime === 'number' ? decimalToTime(d.printTime) : d.printTime, 
      extraLaborHours: typeof d.extraLaborHours === 'number' ? decimalToTime(d.extraLaborHours) : d.extraLaborHours 
    }); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  const addFilamentRow = () => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: "" }] }));
  const updateFilamentRow = (idx, field, val) => { const updated = [...newPart.usedFilaments]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedFilaments: updated })); };
  const addComponentRow = () => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }));
  const updateComponentRow = (idx, field, val) => { const updated = [...newPart.usedComponents]; updated[idx][field] = val; setNewPart(p => ({ ...p, usedComponents: updated })); };

  const handleGenerateDescription = async () => {
    if (!newPart.name) return;
    setAiLoading(true);
    const t = await callGeminiAPI(`Descrição vendedora para ${newPart.name}`, settings.geminiApiKey);
    setNewPart(p => ({...p, description: t}));
    setAiLoading(false);
  };

  const handleAnalyzeProfit = async (p, c) => { 
    setAiLoading(true); setAiModalOpen(true); 
    const prompt = `Analise detalhadamente o lucro da peça 3D "${p.name}". Custo: R$ ${c.totalProductionCost.toFixed(2)}, Varejo: R$ ${c.retailPrice.toFixed(2)}. IMPORTANT: DO NOT use LaTeX formatting (no $ tags). Use plain text. Portuguese.`;
    const t = await callGeminiAPI(prompt, settings.geminiApiKey); setAiContent({title: p.name, text: t}); setAiLoading(false); 
  };

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
    const breakdown = { material: (matCost / batchTotal) * 100, energy: ((energy + wear) / batchTotal) * 100, labor: (labor / batchTotal) * 100, extras: (extra / batchTotal) * 100 };
    return { totalProductionCost: unitCost, retailPrice: unitCost * (1 + settings.retailMargin/100), wholesalePrice: unitCost * (1 + settings.wholesaleMargin/100), totalWeight: weight / qty, unitPrintTimeDecimal: pTime / qty, breakdown, quantity: qty };
  };

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest bg-slate-950 text-white">Carregando Sistema...</div>;
  if (!user) return <LoginScreen onLogin={setUser} darkMode={darkMode} />;

  // --- BLOQUEIO DE PAGAMENTO (PAYWALL) ---
  // Se o utilizador não for anónimo (Google) e ((não tiver assinatura ativa) OU (estiver vencido há > 3 dias))
  if (!user.isAnonymous && ((subscription && subscription.status !== 'active') || isOverdue)) {
    return (
        <PaymentScreen user={user} onLogout={handleLogout} renewalCount={subscription?.renewalCount || 0} />
    );
  }

  // --- APP NORMAL ---
  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-all duration-500 ${theme.bg}`}>
      {/* BANNER DE AVISO DE VENCIMENTO */}
      {expiryWarning && !isOverdue && (
         <div className="max-w-7xl mx-auto mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center gap-4 text-yellow-500 shadow-lg animate-in fade-in slide-in-from-top-4">
            <Icons.ShieldAlert size={24} />
            <div>
               <p className="text-xs font-black uppercase tracking-widest">Atenção à Assinatura</p>
               <p className="text-sm font-medium">{expiryWarning}</p>
            </div>
            <button className="ml-auto bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-yellow-400" onClick={() => window.open('https://wa.me/55SEUNUMERO', '_blank')}>Renovar Agora</button>
         </div>
      )}

      {/* Todo o conteúdo do App aqui (igual à versão Master) */}
      <div className="max-w-7xl mx-auto">
        {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] border shadow-2xl overflow-hidden ${theme.card}`}>
              <div className="p-6 border-b flex justify-between items-center bg-inherit sticky top-0 z-10">
                <h3 className="text-xl font-black text-indigo-500 flex items-center gap-2"><Icons.Sparkles /> Análise IA: {aiContent.title}</h3>
                <button onClick={() => setAiModalOpen(false)} className="p-2 hover:bg-slate-500/10 rounded-full text-slate-500"><Icons.XCircle size={28} /></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="text-base leading-relaxed whitespace-pre-wrap font-medium opacity-90 text-slate-300">
                  {aiLoading ? <div className="flex flex-col items-center py-12 gap-4"><Icons.Loader size={40} className="text-indigo-500" /><span className="text-xs uppercase font-black tracking-widest animate-pulse">Processando dados...</span></div> : aiContent.text}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <header className="mb-12 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl border-2 flex items-center justify-center overflow-hidden cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
              {settings.logoUrl ? <img src={String(settings.logoUrl)} className="h-full w-full object-contain" /> : <div className="text-blue-600 scale-150"><Icons.Cpu size={40}/></div>}
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Icons.Pencil size={24} /></div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Precificador 3D Pro</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${user.isAnonymous ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                  {user.isAnonymous ? 'Modo Convidado' : 'Estúdio Profissional'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 select-all">ID: {user.uid}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={handleLogout} className="p-4 rounded-3xl border bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Icons.LogOut /></button>
             <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-3xl border ${darkMode ? 'text-yellow-400 bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}><Icons.Sun /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
                 <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
                  <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Printer /> Máquinas</h2>
                  <form onSubmit={handleAddPrinter} className="space-y-4 mb-4">
                     <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Modelo</label><input value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                     <div className="flex gap-2"><div className="flex-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Média kW</label><input type="text" inputMode="decimal" value={newPrinter.powerKw || ''} onChange={e => handleNumChange(setNewPrinter, 'powerKw', e.target.value, newPrinter)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div><button className="bg-slate-800 text-white px-4 rounded-2xl mt-4"><Icons.PlusCircle /></button></div>
                  </form>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                     {printers.map(p => (<div key={p.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><span><strong>{p.name}</strong> • {p.powerKw} kW</span><div className="flex gap-1"><button onClick={() => {setEditingPrinterId(p.id); setNewPrinter(p);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('printers', p.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}
                  </div>
                </div>

                <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
                   <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Layers /> Filamentos</h2>
                   <form onSubmit={handleAddFilament} className="space-y-3 mb-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-60 ml-2">Nome / Cor</label>
                        <input placeholder="Ex: Azul Escuro" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/3 space-y-1">
                           <label className="text-[9px] font-black uppercase opacity-60 ml-2">Tipo</label>
                           <input placeholder="Ex: PLA" value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                        </div>
                        <div className="w-1/3 space-y-1">
                           <label className="text-[9px] font-black uppercase opacity-60 ml-2">Marca</label>
                           <input placeholder="Ex: Voolt3D" value={newFilament.brand} onChange={e => setNewFilament({...newFilament, brand: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                        </div>
                        <div className="w-1/3 space-y-1">
                           <label className="text-[9px] font-black uppercase opacity-60 ml-2">Preço</label>
                           <input type="text" inputMode="decimal" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => handleNumChange(setNewFilament, 'priceKg', e.target.value, newFilament)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                        </div>
                      </div>
                      <div className="flex gap-1"><button type="submit" className={`w-full ${editingFilamentId ? 'bg-green-600' : 'bg-indigo-600'} text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:opacity-90`}>{editingFilamentId ? "Atualizar" : "Guardar"}</button>{editingFilamentId && <button type="button" onClick={() => {setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" });}} className="bg-slate-200 text-slate-600 px-4 rounded-2xl"><Icons.XCircle /></button>}</div>
                   </form>
                   <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                     {filaments.map(f => (
                       <div key={f.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}>
                          <div>
                            <span className="font-bold block text-indigo-500">{f.name}</span>
                            <p className="text-[10px] opacity-70">{f.brand ? `${f.brand} • ` : ''}{f.type} • {formatCurrency(parseNum(f.priceKg))}</p>
                          </div>
                          <div className="flex gap-1"><button onClick={() => {setEditingFilamentId(f.id); setNewFilament(f);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('filaments', f.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div>
                       </div>
                     ))}
                  </div>
                </div>

                <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
                   <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Box /> Almoxarifado</h2>
                   <form onSubmit={handleAddComponent} className="space-y-3 mb-4">
                      <input placeholder="Item..." value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} />
                      <div className="flex gap-2"><input type="text" inputMode="decimal" placeholder="R$ Unid." value={newComponent.unitPrice || ''} onChange={e => handleNumChange(setNewComponent, 'unitPrice', e.target.value, newComponent)} className={`flex-1 p-3 rounded-2xl text-xs font-bold ${theme.input}`} /><button className="bg-emerald-600 text-white px-4 rounded-2xl"><Icons.PlusCircle /></button></div>
                   </form>
                   <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                     {components.map(c => (<div key={c.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><div><span className="font-bold block text-emerald-500">{c.name}</span>{formatCurrency(parseNum(c.unitPrice))} p/unid.</div><div className="flex gap-1"><button onClick={() => {setEditingComponentId(c.id); setNewComponent(c);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('components', c.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}
                  </div>
                </div>

                <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
                  <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Settings /> Configs</h2>
                  <div className="space-y-4">
                    <select value={settings.activePrinterId} onChange={e => updateGlobalSettings({ activePrinterId: e.target.value })} className={`w-full p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`}><option value="">Impressora Ativa...</option>{printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <div className="grid grid-cols-3 gap-2">
                       <input type="text" inputMode="decimal" value={settings.energyKwhPrice} onChange={e => handleNumChange(setSettings, 'energyKwhPrice', e.target.value, settings)} onBlur={() => updateGlobalSettings({ energyKwhPrice: settings.energyKwhPrice })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="kWh" />
                       <input type="text" inputMode="decimal" value={settings.machineHourlyRate} onChange={e => handleNumChange(setSettings, 'machineHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ machineHourlyRate: settings.machineHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="Máq/h" />
                       <input type="text" inputMode="decimal" value={settings.myHourlyRate} onChange={e => handleNumChange(setSettings, 'myHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ myHourlyRate: settings.myHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="Eu/h" />
                    </div>
                    <div className={`p-3 rounded-xl border border-dashed flex items-center gap-2 ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                       <Icons.Key size={14} className="text-slate-500" />
                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Chave do Sistema Ativa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-emerald-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-emerald-500 uppercase">Varejo %</label><input type="number" value={settings.retailMargin} onChange={e => updateGlobalSettings({ retailMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-emerald-500 outline-none" /></div>
                       <div className="bg-orange-500/10 p-3 rounded-2xl text-center"><label className="text-[9px] font-black text-orange-500 uppercase">Atacado %</label><input type="number" value={settings.wholesaleMargin} onChange={e => updateSettings({ wholesaleMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-orange-500 outline-none" /></div>
                    </div>
                  </div>
                </div>
            </div>

           <div className="lg:col-span-8 space-y-8">
              <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${theme.card}`}>
                 <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter"><Icons.PlusCircle /> {editingPartId ? 'Editar Projeto' : 'Novo Projeto Master'}</h2>
                 <form onSubmit={handleAddPart} className="space-y-6">
                    <div className="flex gap-2">
                       <input type="text" placeholder="Nome da Peça..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`flex-1 p-5 rounded-[2rem] text-xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 ${theme.input}`} />
                       <button type="button" onClick={handleGenerateDescription} disabled={aiLoading} className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-transform">{aiLoading ? <Icons.Loader /> : <Icons.Sparkles />}</button>
                    </div>
                    {newPart.description && <div className={`p-4 rounded-2xl text-xs font-medium border-l-4 border-purple-500 ${darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}><p className="opacity-70 mb-1 font-bold uppercase tracking-widest text-[8px]">Marketing AI ✨</p>{newPart.description}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                       <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Qtd Lote</label><input type="number" value={newPart.quantityProduced} onChange={e => setNewPart(p => ({...p, quantityProduced: parseInt(e.target.value)}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Tempo (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.printTime} onChange={e => setNewPart(p => ({...p, printTime: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Trab (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.extraLaborHours} onChange={e => setNewPart(p => ({...p, extraLaborHours: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                       <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Extra Fixo</label><input type="text" inputMode="decimal" placeholder="0.00" value={newPart.manualAdditionalCosts} onChange={e => handleNumChange(setNewPart, 'manualAdditionalCosts', e.target.value, newPart)} className={`w-full p-3 rounded-2xl font-black text-center ${theme.input}`} /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-indigo-500">Filamentos Usados</span><button type="button" onClick={addFilamentRow} className="bg-indigo-600 text-white rounded-full p-1 hover:scale-110 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                          {newPart.usedFilaments.map((u, i) => (
                             <div key={i} className="flex gap-2 mb-2">
                                <select value={u.filamentId} onChange={e => updateFilamentRow(i, 'filamentId', e.target.value)} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${theme.input}`}><option value="">Material...</option>{filaments.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
                                <input type="text" inputMode="decimal" placeholder="g" value={u.grams} onChange={e => { const updated = [...newPart.usedFilaments]; handleNumChange((val) => { updated[i].grams = val.grams; setNewPart(p => ({...p, usedFilaments: updated})); }, 'grams', e.target.value, {grams: u.grams}); }} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${theme.input}`} />
                             </div>
                          ))}
                       </div>
                       <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-emerald-500">Peças Extras</span><button type="button" onClick={addComponentRow} className="bg-emerald-600 text-white rounded-full p-1 hover:scale-110 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                          {newPart.usedComponents.map((u, i) => (
                             <div key={i} className="flex gap-2 mb-2">
                                <select value={u.componentId} onChange={e => updateComponentRow(i, 'componentId', e.target.value)} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${theme.input}`}><option value="">Item...</option>{components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                <input type="number" placeholder="Qtd" value={u.quantity} onChange={e => updateComponentRow(i, 'quantity', parseInt(e.target.value))} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${theme.input}`} />
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:scale-[1.01] transition-all">{editingPartId ? "Atualizar" : "Salvar no Catálogo"}</button>
                       {editingPartId && <button type="button" onClick={cancelEditPart} className="px-8 rounded-[2.5rem] font-black text-xs uppercase opacity-50">Cancelar</button>}
                    </div>
                 </form>
              </div>

              {/* Tabela de Resultados Otimizada */}
              <div className={`rounded-[3rem] border overflow-hidden ${theme.card}`}>
                 <div className="p-10 border-b flex justify-between items-center"><h2 className="text-2xl font-black">Portfólio</h2></div>
                 <div className="w-full">
                    <table className="w-full text-left table-fixed">
                       <thead>
                          <tr className={`text-[10px] uppercase font-black border-b ${theme.tableHeader}`}>
                             <th className="px-10 py-6 w-[35%] text-left">Projeto</th>
                             <th className="px-4 py-6 text-center w-[10%] text-slate-500">Qtd</th>
                             <th className="px-4 py-6 text-center w-[15%] text-blue-500">Custo Base</th>
                             <th className="px-4 py-6 text-center w-[15%] text-emerald-500">Varejo</th>
                             <th className="px-4 py-6 text-center w-[15%] text-orange-500 text-nowrap">Atacado</th>
                             <th className="px-6 py-6 w-[10%]"></th>
                          </tr>
                       </thead>
                       <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                          {parts.map(p => {
                             const res = calculateCosts(p);
                             return (
                                <tr key={p.id} className={`group ${theme.tableRowHover}`}>
                                   <td className="px-10 py-8 text-left">
                                      <span className="font-black block text-lg uppercase mb-2 tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</span>
                                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner mb-3">
                                        <div style={{ width: `${res.breakdown.material}%` }} className="bg-blue-600 h-full border-r border-black/5" title="Material"></div>
                                        <div style={{ width: `${res.breakdown.energy}%` }} className="bg-amber-400 h-full border-r border-black/5" title="Energia/Desgaste"></div>
                                        <div style={{ width: `${res.breakdown.labor}%` }} className="bg-purple-600 h-full border-r border-black/5" title="Mão de Obra"></div>
                                        <div style={{ width: `${res.breakdown.extras}%` }} className="bg-rose-500 h-full"></div>
                                      </div>
                                      <div className="flex gap-2">
                                         <button onClick={() => duplicatePart(p)} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors"><Icons.CopyPlus size={12} /> Clonar</button>
                                         <button onClick={() => handleAnalyzeProfit(p, res)} className="text-[9px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/40 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors"><Icons.Sparkles size={12} /> IA</button>
                                      </div>
                                   </td>
                                   <td className="px-4 py-8 text-center text-sm font-black text-slate-500">{p.quantityProduced || 1}</td>
                                   <td className="px-4 py-8 text-center"><span className="text-xl font-black text-blue-500 leading-tight">{formatCurrency(res.totalProductionCost)}</span></td>
                                   <td className="px-4 py-8 text-center"><span className="text-xl font-black text-emerald-500 leading-tight">{formatCurrency(res.retailPrice)}</span></td>
                                   <td className="px-4 py-8 text-center"><span className="text-xl font-black text-orange-500 leading-tight">{formatCurrency(res.wholesalePrice)}</span></td>
                                   <td className="px-6 py-8 text-right">
                                      <div className="flex flex-col gap-2 items-center">
                                         <button onClick={() => handleCopyQuote(p, res)} className={`p-2 rounded-xl border transition-all ${copiedId === p.id ? 'bg-green-600 text-white border-green-600' : 'hover:bg-blue-600 hover:text-white'}`}>{copiedId === p.id ? <Icons.CheckCheck size={14} /> : <Icons.Clipboard size={14} />}</button>
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
      </div>
    </div>
  );
};

export default App;
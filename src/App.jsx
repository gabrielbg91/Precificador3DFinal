import React, { useState, useEffect, useRef } from 'react';
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

/**
 * Ícones SVG - Coleção Completa
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
  Crown: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>,
  User: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ShoppingBag: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Store: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>,
  Search: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ArrowLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ArrowUpRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>,
  Boat: (props) => <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3.5 16.5c6-2.5 12-2.5 17 0c.6.3 1.5 1.5 1.5 2.5c0 1.7-3.4 3-10 3s-10-1.3-10-3c0-1 .9-2.2 1.5-2.5" /><path d="M7 16.5V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7.5" /><path d="M6 7l1.5-2.5h9L18 7" /><path d="M12 4.5V2" /></svg>
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
const SYSTEM_GEMINI_KEY = ""; 

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

const callGeminiAPI = async (prompt, userApiKey) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na API');
    return data.text;
  } catch (error) {
    console.error("Erro AI:", error);
    return "Erro ao consultar a IA. Tente novamente.";
  }
};

// --- COMPONENTES AUXILIARES ---

const LabelWithTooltip = ({ label, tooltip }) => (
  <div className="flex items-center gap-1 mb-1 ml-1">
    <label className="text-[9px] font-black uppercase opacity-60">{label}</label>
    <div className="group relative flex items-center">
      <Icons.Info size={10} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-slate-100 text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-2xl border border-slate-700">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  </div>
);

const QuoteModal = ({ items, onClose, onCopy, formatCurrency, updateItem }) => {
    const total = items.reduce((acc, item) => {
        const price = item.priceType === 'wholesale' ? item.wholesalePrice : item.retailPrice;
        return acc + (price * item.quantity);
    }, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-2"><Icons.Clipboard className="text-blue-500" /> Configurar Orçamento</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Icons.XCircle size={24} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex-1">
                                <span className="text-xs font-bold uppercase opacity-50 block mb-1">Item</span>
                                <span className="font-black text-lg">{item.name}</span>
                                <p className="text-[10px] opacity-60">{item.filaments.join(', ')}</p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-24">
                                    <span className="text-[9px] font-bold uppercase opacity-50 block mb-1">Qtd</span>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantity} 
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="w-full p-2 rounded-xl text-center font-bold bg-white dark:bg-slate-800 border dark:border-slate-600"
                                    />
                                </div>
                                <div className="w-40">
                                    <span className="text-[9px] font-bold uppercase opacity-50 block mb-1">Preço Unitário</span>
                                    <div className="flex bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-600 p-1">
                                        <button 
                                            onClick={() => updateItem(index, 'priceType', 'retail')}
                                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${item.priceType === 'retail' ? 'bg-emerald-500 text-white shadow' : 'opacity-50 hover:opacity-100'}`}
                                        >
                                            Var {formatCurrency(item.retailPrice)}
                                        </button>
                                        <button 
                                            onClick={() => updateItem(index, 'priceType', 'wholesale')}
                                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${item.priceType === 'wholesale' ? 'bg-orange-500 text-white shadow' : 'opacity-50 hover:opacity-100'}`}
                                        >
                                            Atc {formatCurrency(item.wholesalePrice)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold uppercase opacity-60">Total do Orçamento</span>
                        <span className="text-3xl font-black text-blue-600">{formatCurrency(total)}</span>
                    </div>
                    <button onClick={onCopy} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-sm shadow-xl transition-all flex items-center justify-center gap-2">
                        <Icons.CheckCheck size={20} /> Copiar Orçamento WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

const PortfolioMiniCard = ({ theme, setCurrentView, count }) => (
      <div className={`p-7 rounded-[2rem] border cursor-pointer hover:scale-[1.02] transition-transform ${theme.card}`} onClick={() => setCurrentView('dashboard')}>
        <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.TrendingUp /> Portfólio</h2>
        <div className="space-y-4">
           <div className="bg-blue-500/10 p-4 rounded-2xl text-center">
              <span className="block text-3xl font-black text-blue-500">{count}</span>
              <span className="text-[10px] uppercase font-bold text-blue-400">Projetos Ativos</span>
           </div>
           <button className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2">
              <Icons.ArrowLeft size={16} /> Voltar p/ Home
           </button>
        </div>
      </div>
);

// --- COMPONENTES DE LISTA COMPLETOS ---

const PrintersView = ({ printers, searchTerm, setSearchTerm, handleAddPrinter, newPrinter, setNewPrinter, editingPrinterId, setEditingPrinterId, handleNumChange, duplicatePrinter, deleteFromDb, theme, darkMode }) => (
     <div className={`p-8 rounded-[3rem] border transition-all duration-500 min-h-[600px] ${theme.card}`}>
        <div className="flex justify-between items-center mb-8 border-b pb-6">
           <h2 className="text-3xl font-black uppercase flex items-center gap-4"><Icons.Printer size={32} /> Gestão de Máquinas</h2>
           <div className="relative">
              <Icons.Search className="absolute left-4 top-3 text-slate-500" size={18} />
              <input type="text" placeholder="Buscar..." onChange={(e) => setSearchTerm(e.target.value)} className={`pl-12 pr-6 py-3 rounded-2xl font-bold outline-none border-2 focus:border-blue-500 ${theme.input}`} />
           </div>
        </div>
        
        <div className={`bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-8 border-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className="text-sm font-black uppercase mb-4 opacity-50">{editingPrinterId ? 'Editar Item' : 'Nova Impressora'}</h3>
            <form onSubmit={handleAddPrinter} className="flex gap-4 items-end">
                <div className="flex-1 space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Modelo</label><input value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="w-32 space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Potência kW</label><input type="text" inputMode="decimal" value={newPrinter.powerKw || ''} onChange={e => handleNumChange(setNewPrinter, 'powerKw', e.target.value, newPrinter)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <button className="h-10 bg-blue-600 text-white px-6 rounded-2xl font-black text-xs uppercase shadow-lg">{editingPrinterId ? 'Salvar' : 'Adicionar'}</button>
                {editingPrinterId && <button type="button" onClick={() => { setEditingPrinterId(null); setNewPrinter({name: "", powerKw: "0.3"}); }} className="h-10 bg-slate-200 text-slate-600 px-4 rounded-2xl font-black text-xs uppercase">Cancelar</button>}
            </form>
        </div>

        <div className="space-y-4">
           {printers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? <p className="text-center opacity-50 py-10 font-bold">Nenhum item encontrado.</p> : 
             printers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <div key={p.id} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${theme.tableRowHover} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                   <div><span className="text-lg font-black block">{p.name}</span><span className="text-xs font-bold text-slate-500">Consumo: {p.powerKw} kW</span></div>
                   <div className="flex gap-2">
                      <button onClick={() => { setEditingPrinterId(p.id); setNewPrinter(p); }} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"><Icons.Pencil size={18} /></button>
                      <button onClick={() => duplicatePrinter(p)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Icons.CopyPlus size={18} /></button>
                      <button onClick={() => deleteFromDb('printers', p.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"><Icons.Trash2 size={18} /></button>
                   </div>
                </div>
             ))
           }
        </div>
     </div>
);

const FilamentsView = ({ filaments, searchTerm, setSearchTerm, handleAddFilament, newFilament, setNewFilament, editingFilamentId, setEditingFilamentId, handleNumChange, duplicateFilament, deleteFromDb, formatCurrency, parseNum, theme, darkMode }) => (
     <div className={`p-8 rounded-[3rem] border transition-all duration-500 min-h-[600px] ${theme.card}`}>
        <div className="flex justify-between items-center mb-8 border-b pb-6">
           <h2 className="text-3xl font-black uppercase flex items-center gap-4"><Icons.Layers size={32} /> Estoque de Filamentos</h2>
           <div className="relative">
              <Icons.Search className="absolute left-4 top-3 text-slate-500" size={18} />
              <input type="text" placeholder="Buscar..." onChange={(e) => setSearchTerm(e.target.value)} className={`pl-12 pr-6 py-3 rounded-2xl font-bold outline-none border-2 focus:border-blue-500 ${theme.input}`} />
           </div>
        </div>
        
        <div className={`bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-8 border-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className="text-sm font-black uppercase mb-4 opacity-50">{editingFilamentId ? 'Editar Item' : 'Novo Filamento'}</h3>
            <form onSubmit={handleAddFilament} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Cor/Nome</label><input value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Marca</label><input value={newFilament.brand} onChange={e => setNewFilament({...newFilament, brand: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Tipo (PLA/ABS)</label><input value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Preço (R$/Kg)</label><input type="text" inputMode="decimal" value={newFilament.priceKg || ''} onChange={e => handleNumChange(setNewFilament, 'priceKg', e.target.value, newFilament)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="md:col-span-4 flex gap-2">
                    <button className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg">{editingFilamentId ? 'Atualizar Estoque' : 'Adicionar ao Estoque'}</button>
                    {editingFilamentId && <button type="button" onClick={() => { setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" }); }} className="h-12 bg-slate-200 text-slate-600 px-6 rounded-2xl font-black text-xs uppercase">Cancelar</button>}
                </div>
            </form>
        </div>

        <div className="space-y-4">
           {filaments.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.brand.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? <p className="text-center opacity-50 py-10 font-bold">Nenhum item encontrado.</p> : 
             filaments.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.brand.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                <div key={f.id} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${theme.tableRowHover} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                   <div>
                       <span className="text-lg font-black block text-indigo-500">{f.name}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{f.brand} • {f.type}</span>
                   </div>
                   <div className="flex items-center gap-6">
                       <span className="text-xl font-black">{formatCurrency(parseNum(f.priceKg))}</span>
                       <div className="flex gap-2">
                            <button onClick={() => { setEditingFilamentId(f.id); setNewFilament(f); }} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"><Icons.Pencil size={18} /></button>
                            <button onClick={() => duplicateFilament(f)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Icons.CopyPlus size={18} /></button>
                            <button onClick={() => deleteFromDb('filaments', f.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"><Icons.Trash2 size={18} /></button>
                       </div>
                   </div>
                </div>
             ))
           }
        </div>
     </div>
);

const ComponentsView = ({ components, searchTerm, setSearchTerm, handleAddComponent, newComponent, setNewComponent, editingComponentId, setEditingComponentId, handleNumChange, duplicateComponent, deleteFromDb, formatCurrency, parseNum, theme, darkMode }) => (
     <div className={`p-8 rounded-[3rem] border transition-all duration-500 min-h-[600px] ${theme.card}`}>
        <div className="flex justify-between items-center mb-8 border-b pb-6">
           <h2 className="text-3xl font-black uppercase flex items-center gap-4"><Icons.Box size={32} /> Almoxarifado & Extras</h2>
           <div className="relative">
              <Icons.Search className="absolute left-4 top-3 text-slate-500" size={18} />
              <input type="text" placeholder="Buscar..." onChange={(e) => setSearchTerm(e.target.value)} className={`pl-12 pr-6 py-3 rounded-2xl font-bold outline-none border-2 focus:border-blue-500 ${theme.input}`} />
           </div>
        </div>
        
        <div className={`bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-8 border-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className="text-sm font-black uppercase mb-4 opacity-50">{editingComponentId ? 'Editar Item' : 'Novo Item'}</h3>
            <form onSubmit={handleAddComponent} className="flex gap-4 items-end">
                <div className="flex-1 space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Item</label><input value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <div className="w-40 space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-2">Custo Unitário</label><input type="text" inputMode="decimal" value={newComponent.unitPrice || ''} onChange={e => handleNumChange(setNewComponent, 'unitPrice', e.target.value, newComponent)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                <button className="h-10 bg-emerald-600 text-white px-6 rounded-2xl font-black text-xs uppercase shadow-lg">{editingComponentId ? 'Salvar' : 'Adicionar'}</button>
                {editingComponentId && <button type="button" onClick={() => { setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: "" }); }} className="h-10 bg-slate-200 text-slate-600 px-4 rounded-2xl font-black text-xs uppercase">Cancelar</button>}
            </form>
        </div>

        <div className="space-y-4">
           {components.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? <p className="text-center opacity-50 py-10 font-bold">Nenhum item encontrado.</p> : 
             components.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <div key={c.id} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${theme.tableRowHover} ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                   <span className="text-lg font-black block text-emerald-500">{c.name}</span>
                   <div className="flex items-center gap-6">
                       <span className="text-xl font-black">{formatCurrency(parseNum(c.unitPrice))} <span className="text-xs font-medium text-slate-400">/un</span></span>
                       <div className="flex gap-2">
                            <button onClick={() => { setEditingComponentId(c.id); setNewComponent(c); }} className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"><Icons.Pencil size={18} /></button>
                            <button onClick={() => duplicateComponent(c)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Icons.CopyPlus size={18} /></button>
                            <button onClick={() => deleteFromDb('components', c.id)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"><Icons.Trash2 size={18} /></button>
                       </div>
                   </div>
                </div>
             ))
           }
        </div>
     </div>
);

// --- VISUALIZAÇÃO PRINCIPAL (DASHBOARD) ---

const DashboardView = ({ 
    newPart, setNewPart, aiLoading, handleGenerateDescription, handleAddPart, handleNumChange, 
    filaments, components, darkMode, editingPartId, cancelEditPart, parts, calculateCosts, 
    formatCurrency, duplicatePart, handleAnalyzeProfit, handlePlatformContent, 
    startEditPart, deleteFromDb, theme, 
    selectedParts, togglePartSelection, handleBulkQuote
}) => (
    <>
    <div className={`p-8 rounded-[3rem] border transition-all duration-500 mb-8 ${darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
         <h2 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter"><Icons.PlusCircle /> {editingPartId ? 'Editar Projeto' : 'Novo Projeto'}</h2>
         <form onSubmit={handleAddPart} className="space-y-6">
            <div className="flex gap-2">
               <input type="text" placeholder="Nome da Peça..." value={newPart.name} onChange={e => setNewPart(p => ({...p, name: e.target.value}))} className={`flex-1 p-5 rounded-[2rem] text-xl font-black outline-none focus:ring-4 focus:ring-blue-600/10 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`} />
               <button type="button" onClick={handleGenerateDescription} disabled={aiLoading} className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] shadow-lg hover:scale-105 transition-transform">{aiLoading ? <Icons.Loader /> : <Icons.Sparkles />}</button>
            </div>
            {newPart.description && <div className={`p-4 rounded-2xl text-xs font-medium border-l-4 border-purple-500 ${darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}><p className="opacity-70 mb-1 font-bold uppercase tracking-widest text-[8px]">Marketing AI ✨</p>{newPart.description}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Qtd Lote</label><input type="number" min="1" value={newPart.quantityProduced} onChange={e => setNewPart(p => ({...p, quantityProduced: parseInt(e.target.value)}))} className={`w-full p-3 rounded-2xl font-black text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
               <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Tempo (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.printTime} onChange={e => setNewPart(p => ({...p, printTime: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
               <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Trab (HH:MM)</label><input type="text" placeholder="00:00" value={newPart.extraLaborHours} onChange={e => setNewPart(p => ({...p, extraLaborHours: e.target.value}))} className={`w-full p-3 rounded-2xl font-black text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
               <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-40 ml-3 text-nowrap">Extra Fixo</label><input type="text" inputMode="decimal" placeholder="0.00" value={newPart.manualAdditionalCosts} onChange={e => handleNumChange(setNewPart, 'manualAdditionalCosts', e.target.value, newPart)} className={`w-full p-3 rounded-2xl font-black text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-indigo-500">Filamentos Usados</span><button type="button" onClick={() => setNewPart(p => ({ ...p, usedFilaments: [...p.usedFilaments, { filamentId: "", grams: "" }] }))} className="bg-indigo-600 text-white rounded-full p-1 hover:scale-110 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                  {newPart.usedFilaments.map((u, i) => (
                     <div key={i} className="flex gap-2 mb-2">
                        <select value={u.filamentId} onChange={e => { const updated = [...newPart.usedFilaments]; updated[i].filamentId = e.target.value; setNewPart(p => ({...p, usedFilaments: updated})); }} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}><option value="">Material...</option>{filaments.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
                        <input type="text" inputMode="decimal" placeholder="g" value={u.grams} onChange={e => { const updated = [...newPart.usedFilaments]; handleNumChange((val) => { updated[i].grams = val.grams; setNewPart(p => ({...p, usedFilaments: updated})); }, 'grams', e.target.value, {grams: u.grams}); }} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                     </div>
                  ))}
               </div>
               <div className={`p-5 rounded-[2rem] border-2 border-dashed ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex justify-between mb-3"><span className="text-[10px] font-black uppercase text-emerald-500">Peças Extras</span><button type="button" onClick={() => setNewPart(p => ({ ...p, usedComponents: [...p.usedComponents, { componentId: "", quantity: 1 }] }))} className="bg-emerald-600 text-white rounded-full p-1 hover:scale-110 transition-transform"><Icons.PlusCircle size={14}/></button></div>
                  {newPart.usedComponents.map((u, i) => (
                     <div key={i} className="flex gap-2 mb-2">
                        <select value={u.componentId} onChange={e => { const updated = [...newPart.usedComponents]; updated[i].componentId = e.target.value; setNewPart(p => ({...p, usedComponents: updated})); }} className={`flex-1 p-2 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}><option value="">Item...</option>{components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <input type="number" placeholder="Qtd" value={u.quantity} onChange={e => { const updated = [...newPart.usedComponents]; updated[i].quantity = parseInt(e.target.value); setNewPart(p => ({...p, usedComponents: updated})); }} className={`w-16 p-2 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
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

    <div className={`rounded-[3rem] border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
         <div className="p-10 border-b flex justify-between items-center">
             <h2 className="text-2xl font-black">Portfólio</h2>
             <button 
                onClick={handleBulkQuote} 
                disabled={selectedParts.length === 0}
                className={`bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg flex items-center gap-2 transition-all ${selectedParts.length === 0 ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:scale-105'}`}
             >
                 <Icons.Clipboard size={16} /> Gerar Orçamento ({selectedParts.length})
             </button>
         </div>
         <div className="w-full">
            {parts.length === 0 ? (
               <div className="text-center py-12 opacity-50">
                  <Icons.Boat size={64} className="mx-auto mb-4 animate-bounce text-slate-700" />
                  <p className="text-sm font-bold">Ainda sem projetos?</p>
                  <p className="text-xs">Que tal começar com um #3DBenchy?</p>
               </div>
            ) : (
            <table className="w-full text-left table-fixed">
               <thead>
                  <tr className={`text-[10px] uppercase font-black border-b ${theme.tableHeader}`}>
                     <th className="px-6 py-6 w-[5%] text-center"><Icons.Check size={14}/></th>
                     <th className="px-4 py-6 w-[35%] text-left">Projeto</th>
                     <th className="px-4 py-6 text-center w-[10%] text-slate-500">Qtd</th>
                     <th className="px-4 py-6 text-center w-[15%] text-blue-500">Custo Unit.</th>
                     <th className="px-4 py-6 text-center w-[15%] text-emerald-500">Varejo (Un)</th>
                     <th className="px-4 py-6 text-center w-[15%] text-orange-500 text-nowrap">Atacado (Un)</th>
                     <th className="px-6 py-6 w-[10%]"></th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {parts.map(p => {
                     const res = calculateCosts(p);
                     const isSelected = selectedParts.includes(p.id);
                     return (
                        <tr key={p.id} className={`group ${theme.tableRowHover} ${isSelected ? (darkMode ? 'bg-blue-900/10' : 'bg-blue-50') : ''}`}>
                           <td className="px-6 py-8 text-center">
                               <input 
                                   type="checkbox" 
                                   checked={isSelected}
                                   onChange={() => togglePartSelection(p.id)}
                                   className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 checked:bg-blue-600 cursor-pointer accent-blue-600"
                               />
                           </td>
                           <td className="px-4 py-8 text-left">
                              <span className="font-black block text-lg uppercase mb-2 tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</span>
                              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full flex overflow-hidden shadow-inner mb-3">
                                <div style={{ width: `${res.breakdown.material}%` }} className="bg-blue-600 h-full border-r border-black/5" title="Material"></div>
                                <div style={{ width: `${res.breakdown.energy}%` }} className="bg-amber-400 h-full border-r border-black/5" title="Energia/Desgaste"></div>
                                <div style={{ width: `${res.breakdown.labor}%` }} className="bg-purple-600 h-full border-r border-black/5" title="Mão de Obra"></div>
                                <div style={{ width: `${res.breakdown.extras}%` }} className="bg-rose-500 h-full"></div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                 <button onClick={() => duplicatePart(p)} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors"><Icons.CopyPlus size={12} /> Clonar</button>
                                 <button onClick={() => handleAnalyzeProfit(p, res)} className="text-[9px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/40 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200 transition-colors"><Icons.Sparkles size={12} /> IA</button>
                                 <button onClick={() => handlePlatformContent(p, 'ML')} className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-yellow-200 transition-colors"><Icons.Tag size={12} /> ML</button>
                                 <button onClick={() => handlePlatformContent(p, 'Shopee')} className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-200 transition-colors"><Icons.ShoppingBag size={12} /> Shopee</button>
                                 <button onClick={() => handlePlatformContent(p, 'Marketplace')} className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200 transition-colors"><Icons.Store size={12} /> Face</button>
                              </div>
                           </td>
                           <td className="px-4 py-8 text-center text-sm font-black text-slate-500">{p.quantityProduced || 1}</td>
                           <td className="px-4 py-8 text-center"><span className="text-xl font-black text-blue-500">{formatCurrency(res.totalProductionCost)}</span></td>
                           <td className="px-4 py-8 text-center"><span className="text-xl font-black text-emerald-500">{formatCurrency(res.retailPrice)}</span></td>
                           <td className="px-4 py-8 text-center"><span className="text-xl font-black text-orange-500">{formatCurrency(res.wholesalePrice)}</span></td>
                           <td className="px-6 py-8 text-right">
                              <div className="flex flex-col gap-2 items-center">
                                 {/* BOTÃO INDIVIDUAL REMOVIDO, AGORA SÓ CHECKBOX */}
                                 <button onClick={() => startEditPart(p)} className="p-2 rounded-xl border hover:bg-indigo-600 hover:text-white transition-all"><Icons.Pencil size={14} /></button>
                                 <button onClick={() => deleteFromDb('parts', p.id)} className="p-2 rounded-xl border hover:bg-red-600 hover:text-white transition-all"><Icons.Trash2 size={14} /></button>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
            )}
         </div>
      </div>
    </>
);

// Block de pagamento e Login mantidos iguais
const PaymentScreen = ({ user, onLogout, renewalCount = 0 }) => {
  const isPromo = renewalCount === 0;
  const price = isPromo ? "9,90" : "19,90";
  const qrCodeId = isPromo ? "1QTPzXKTkxWBNO6PgHAtmgQz1mm6Jvp0t" : "1r5GrkdzCmqRRBza2kZ6az4kKODYmjRRA";
  const qrCodeUrl = `https://lh3.googleusercontent.com/d/${qrCodeId}`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
       <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-[2.5rem] shadow-2xl mb-6">
             <div className="bg-slate-900 rounded-[2.4rem] p-10">
                <div className="h-20 w-20 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6 text-yellow-400"><Icons.Lock size={40} /></div>
                <h2 className="text-3xl font-black uppercase mb-2">Acesso Restrito</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Sua conta Google precisa de uma assinatura ativa.</p>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
                   <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase text-slate-400">Plano Maker Pro</span><span className="text-xs font-bold uppercase text-green-400">R$ {price}/mês</span></div>
                   <div className="h-px bg-slate-700 my-4"></div>
                   <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Pagamento via PIX</p>
                   <div className="bg-white p-3 rounded-xl mb-4 flex justify-center overflow-hidden relative"><img src={qrCodeUrl} alt="QR Code PIX" className="h-48 w-48 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x200?text=Erro+Carregar+QR"; }}/></div>
                   <p className="text-[10px] text-slate-500 mb-2">Após pagar, envie o comprovante para liberação.</p>
                </div>
                <button onClick={() => window.open(`https://wa.me/5535991198175?text=Olá, paguei o PIX de R$${price} para o email ${user.email} e quero liberar meu acesso.`, '_blank')} className="w-full bg-green-500 hover:bg-green-400 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all mb-4">Enviar Comprovante (WhatsApp)</button>
                <button onClick={onLogout} className="text-xs text-slate-500 font-bold hover:text-white uppercase tracking-widest flex items-center justify-center gap-2"><Icons.LogOut size={14}/> Sair da Conta</button>
             </div>
          </div>
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">ID: {user.uid}</p>
       </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, darkMode }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = { bg: darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900' };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) { console.error(err); setError("Erro no login com Google."); }
  };
  const handleGuest = async () => {
    setLoading(true);
    try { await signInAnonymously(auth); } catch (err) { setError("Erro ao entrar como convidado."); setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 font-sans`}>
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
        <div className="text-center mb-12">
          <div className="h-24 w-24 bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-slate-700 shadow-inner overflow-hidden p-2">
            <img 
              src="hhttps://drive.google.com/file/d/1MPmsB_1tKxSX8-JvYubFhNm7yd_JCl09/view" 
              alt="Logo Printa Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Printa Logo</h1>
          <p className="text-slate-400 text-sm font-medium">Gestão Profissional para Makers</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold mb-6 text-center">{error}</div>}
        <div className="space-y-4">
          <button onClick={handleGoogle} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"><Icons.Google size={24} /> <span className="uppercase text-xs tracking-wider">Entrar com Google</span></button>
          <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div><div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-2 text-slate-500">Ou</span></div></div>
          <button onClick={handleGuest} className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-slate-700 transition-colors">{loading ? <Icons.Loader /> : "Entrar como Convidado"}</button>
        </div>
        <p className="text-center mt-8 text-[10px] text-slate-600 uppercase font-bold tracking-widest">Acesso seguro &bull; Dados na nuvem</p>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // NAV STATE
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, printers, filaments, components
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState({ title: "", text: "" });
  const [copiedId, setCopiedId] = useState(null);

  // DATA STATE
  const [subscription, setSubscription] = useState(null); 
  const [expiryWarning, setExpiryWarning] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  
  // GUEST TIMER STATE
  const [guestTimeRemaining, setGuestTimeRemaining] = useState("");

  const [settings, setSettings] = useState({ energyKwhPrice: "0.90", machineHourlyRate: "3.50", myHourlyRate: "50", retailMargin: 100, wholesaleMargin: 40, activePrinterId: "", logoUrl: null, geminiApiKey: "" });
  const fileInputRef = useRef(null);
  const [printers, setPrinters] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [components, setComponents] = useState([]);
  const [parts, setParts] = useState([]);
  
  // FORM STATES
  const [newPart, setNewPart] = useState({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] });
  const [newPrinter, setNewPrinter] = useState({ name: "", powerKw: "0.3" });
  const [newFilament, setNewFilament] = useState({ name: "", brand: "", type: "", priceKg: "" });
  const [newComponent, setNewComponent] = useState({ name: "", description: "", unitPrice: "" });
  
  const [editingPrinterId, setEditingPrinterId] = useState(null);
  const [editingFilamentId, setEditingFilamentId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [editingPartId, setEditingPartId] = useState(null);

  // QUOTE STATE (NOVO)
  const [selectedParts, setSelectedParts] = useState([]);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState([]);

  // SEARCH STATES FOR LIST VIEWS
  const [searchTerm, setSearchTerm] = useState("");

  const theme = {
    bg: darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900',
    card: darkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    input: darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-500',
    tableHeader: darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50/50 text-slate-400',
    tableRowHover: darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/50'
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Seeding logic
  const seedGuestData = async (uid, initialStatus = 'active') => {
    const userConfigRef = doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'global');
    const userConfigSnap = await getDoc(userConfigRef);
    if (userConfigSnap.exists()) return;

    const batch = writeBatch(db);
    try {
        const collectionsToCopy = ['printers', 'filaments', 'components', 'parts'];
        for (const collName of collectionsToCopy) {
            const sourceRef = collection(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, collName);
            const snapshot = await getDocs(sourceRef);
            snapshot.forEach(docSnap => batch.set(doc(db, 'artifacts', APP_ID, 'users', uid, collName, docSnap.id), docSnap.data()));
        }
        const sourceConfigRef = doc(db, 'artifacts', APP_ID, 'users', TEMPLATE_ID, 'config', 'global');
        const sourceConfigSnap = await getDoc(sourceConfigRef);
        if (sourceConfigSnap.exists()) batch.set(userConfigRef, sourceConfigSnap.data());
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); 
        batch.set(doc(db, 'artifacts', APP_ID, 'users', uid, 'config', 'subscription'), {
           plan: 'Free', status: initialStatus, renewalCount: 0, expiresAt: expiresAt 
        });
        await batch.commit();
        window.location.reload();
    } catch (error) { console.error("Error seeding data:", error); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (u.isAnonymous) {
            const created = new Date(u.metadata.creationTime).getTime();
            if ((Date.now() - created) / 36e5 >= 24) { 
                await signOut(auth); 
                setUser(null); 
                alert("Sessão de convidado expirada (24h)."); 
                setLoading(false); 
                return; 
            }
            await seedGuestData(u.uid, 'active');
        } else { await seedGuestData(u.uid, 'inactive'); }
        setUser(u);
      } else { setUser(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !user.isAnonymous) return;

    const interval = setInterval(() => {
        const created = new Date(user.metadata.creationTime).getTime();
        const expiresAt = created + (24 * 60 * 60 * 1000); 
        const now = Date.now();
        const diffMs = expiresAt - now;

        if (diffMs <= 0) {
            signOut(auth).then(() => window.location.reload());
        } else {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setGuestTimeRemaining(`${hours}h ${minutes}m`);
        }
    }, 60000); 

    const created = new Date(user.metadata.creationTime).getTime();
    const expiresAt = created + (24 * 60 * 60 * 1000);
    const diffMs = expiresAt - Date.now();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    setGuestTimeRemaining(`${hours}h ${minutes}m`);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const path = ['artifacts', APP_ID, 'users', user.uid];
    const unsubSub = onSnapshot(doc(db, ...path, 'config', 'subscription'), (s) => {
       if (s.exists()) {
          const subData = s.data();
          setSubscription(subData);
          if (subData.expiresAt) {
               let expDate = subData.expiresAt.toDate ? subData.expiresAt.toDate() : new Date(subData.expiresAt); 
               const diffDays = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24)); 
               if (diffDays <= -3) { setIsOverdue(true); setExpiryWarning(null); } 
               else if (diffDays <= 2) { setIsOverdue(false); setExpiryWarning(diffDays < 0 ? `Assinatura venceu.` : `Vence em ${diffDays} dias.`); } 
               else { setIsOverdue(false); setExpiryWarning(null); }
          }
       } else setSubscription({ status: 'inactive' }); 
    });
    const unsubS = onSnapshot(doc(db, ...path, 'config', 'global'), (s) => s.exists() && setSettings(p => ({...p, ...s.data()})));
    const unsubP = onSnapshot(collection(db, ...path, 'printers'), (s) => setPrinters(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubF = onSnapshot(collection(db, ...path, 'filaments'), (s) => setFilaments(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubC = onSnapshot(collection(db, ...path, 'components'), (s) => setComponents(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubParts = onSnapshot(collection(db, ...path, 'parts'), (s) => setParts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubS(); unsubSub(); unsubP(); unsubF(); unsubC(); unsubParts(); };
  }, [user]);

  const saveToDb = async (coll, id, data) => { if (!user) return; await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id || Date.now().toString()), data); };
  const deleteFromDb = async (coll, id) => { if (!user) return; await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, coll, id.toString())); };
  const updateGlobalSettings = async (newData) => { if (!user) return; const merged = { ...settings, ...newData }; setSettings(merged); await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'config', 'global'), merged); };
  
  const handleLogoUpload = (e) => { 
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert("A imagem é muito grande! Por favor, use uma imagem menor que 1MB."); return; }
    const r = new FileReader(); r.onloadend = () => { updateGlobalSettings({ logoUrl: r.result }); }; r.readAsDataURL(file); 
  };
  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  // CRUD Handlers
  const handleAddPrinter = (e) => { e.preventDefault(); if(!newPrinter.name) return; saveToDb('printers', editingPrinterId, newPrinter); setEditingPrinterId(null); setNewPrinter({ name: "", powerKw: "0.3" }); };
  const handleAddFilament = (e) => { e.preventDefault(); if(!newFilament.name) return; saveToDb('filaments', editingFilamentId, newFilament); setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" }); };
  const handleAddComponent = (e) => { e.preventDefault(); if(!newComponent.name) return; saveToDb('components', editingComponentId, newComponent); setEditingComponentId(null); setNewComponent({ name: "", description: "", unitPrice: "" }); };
  const handleAddPart = (e) => { e.preventDefault(); if(!newPart.name) return; saveToDb('parts', editingPartId, newPart); setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };

  const startEditPart = (p) => { setEditingPartId(p.id); setNewPart({ ...p, printTime: typeof p.printTime === 'number' ? decimalToTime(p.printTime) : p.printTime, extraLaborHours: typeof p.extraLaborHours === 'number' ? decimalToTime(p.extraLaborHours) : p.extraLaborHours }); setCurrentView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cancelEditPart = () => { setEditingPartId(null); setNewPart({ name: "", description: "", printTime: "", extraLaborHours: "", plates: 1, manualAdditionalCosts: "", quantityProduced: 1, usedFilaments: [{ filamentId: "", grams: "" }], usedComponents: [{ componentId: "", quantity: 1 }] }); };
  const duplicatePart = (p) => { const { id, ...d } = p; setNewPart({ ...d, name: `${d.name} (Cópia)`, printTime: typeof d.printTime === 'number' ? decimalToTime(d.printTime) : d.printTime, extraLaborHours: typeof d.extraLaborHours === 'number' ? decimalToTime(d.extraLaborHours) : d.extraLaborHours }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  // List Duplication
  const duplicatePrinter = (p) => saveToDb('printers', null, {...p, id: undefined, name: p.name + ' (Cópia)'});
  const duplicateFilament = (f) => saveToDb('filaments', null, {...f, id: undefined, name: f.name + ' (Cópia)'});
  const duplicateComponent = (c) => saveToDb('components', null, {...c, id: undefined, name: c.name + ' (Cópia)'});

  // AI & Content
  const handleGenerateDescription = async () => { if (!newPart.name) return; setAiLoading(true); const t = await callGeminiAPI(`Descrição vendedora para ${newPart.name}`, settings.geminiApiKey); setNewPart(p => ({...p, description: t})); setAiLoading(false); };
  const handleAnalyzeProfit = async (p, c) => { setAiLoading(true); setAiModalOpen(true); const prompt = `Analise detalhadamente o lucro da peça 3D "${p.name}". Custo: R$ ${c.totalProductionCost.toFixed(2)}, Varejo: R$ ${c.retailPrice.toFixed(2)}. Use Portuguese.`; const t = await callGeminiAPI(prompt, settings.geminiApiKey); setAiContent({title: p.name, text: t}); setAiLoading(false); };
  const handlePlatformContent = async (p, platform) => { if (subscription.plan !== 'Pro') { setPaywallOpen(true); return; } setAiLoading(true); setAiModalOpen(true); const t = await callGeminiAPI(`Gere anúncio para ${platform} do produto ${p.name}`, settings.geminiApiKey); setAiContent({ title: `Anúncio ${platform}: ${p.name}`, text: t }); setAiLoading(false); };

  const calculateCosts = (part) => {
    const printer = printers.find(p => p.id.toString() === settings.activePrinterId) || { powerKw: 0 };
    const pTime = timeToDecimal(part.printTime);
    const lTime = timeToDecimal(part.extraLaborHours);
    const qty = part.quantityProduced > 0 ? parseFloat(part.quantityProduced) : 1;
    let matCost = 0;
    (part.usedFilaments || []).forEach(i => { const f = filaments.find(fi => fi.id.toString() === i.filamentId?.toString()); if (f) { matCost += (parseNum(i.grams)/1000)*parseNum(f.priceKg); }});
    let compCost = 0;
    (part.usedComponents || []).forEach(i => { const c = components.find(ci => ci.id.toString() === i.componentId?.toString()); if (c) compCost += parseNum(c.unitPrice) * i.quantity; });
    const energy = pTime * parseNum(printer.powerKw || 0) * parseNum(settings.energyKwhPrice);
    const wear = pTime * parseNum(settings.machineHourlyRate);
    const labor = lTime * parseNum(settings.myHourlyRate);
    const extra = parseNum(part.manualAdditionalCosts) + compCost;
    const batchTotal = matCost + energy + wear + labor + extra;
    const unitCost = batchTotal / qty; 
    return { totalProductionCost: unitCost, retailPrice: unitCost * (1 + settings.retailMargin/100), wholesalePrice: unitCost * (1 + settings.wholesaleMargin/100), breakdown: { material: (matCost/batchTotal)*100, energy: ((energy+wear)/batchTotal)*100, labor: (labor/batchTotal)*100, extras: (extra/batchTotal)*100 }, quantity: qty };
  };

  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const handleCopyQuote = (part, calc) => {
    const text = `📋 *ORÇAMENTO 3D - ${part.name.toUpperCase()}*
    
🔹 *Peça:* ${part.name}
🔹 *Qtd:* ${part.quantityProduced} un.
🔹 *Material:* ${part.usedFilaments.map(f => {
      const fil = filaments.find(fi => fi.id === f.filamentId);
      return fil ? fil.name : 'Padrão';
    }).join(', ')}

💰 *Valor Unitário:* ${formatCurrency(calc.retailPrice)}
💳 *Valor Total:* ${formatCurrency(calc.retailPrice * part.quantityProduced)}

_Produzido com alta qualidade. Validade: 7 dias._
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
        setCopiedId(part.id);
        setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => console.error("Falha ao copiar", err));
  };

  // --- LÓGICA DE ORÇAMENTO (QUOTES) ---
  const togglePartSelection = (id) => {
      setSelectedParts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const prepareQuoteData = (ids) => {
      return ids.map(id => {
          const part = parts.find(p => p.id === id);
          if (!part) return null;
          const costs = calculateCosts(part);
          const matNames = part.usedFilaments.map(uf => filaments.find(f => f.id === uf.filamentId)?.name || 'Padrão').join(', ');
          return {
              id: part.id,
              name: part.name,
              filaments: [matNames], // Array expected in Modal
              quantity: 1, 
              priceType: 'retail', 
              retailPrice: costs.retailPrice,
              wholesalePrice: costs.wholesalePrice
          };
      }).filter(Boolean);
  };

  const handleBulkQuote = () => {
      setQuoteItems(prepareQuoteData(selectedParts));
      setQuoteModalOpen(true);
  };

  const handleSingleQuote = (part) => {
      setQuoteItems(prepareQuoteData([part.id]));
      setQuoteModalOpen(true);
  };

  const updateQuoteItem = (index, field, value) => {
      const updated = [...quoteItems];
      updated[index][field] = value;
      setQuoteItems(updated);
  };

  const generateAndCopyQuote = () => {
      const itemsText = quoteItems.map(item => {
          const unitPrice = item.priceType === 'wholesale' ? item.wholesalePrice : item.retailPrice;
          const subtotal = unitPrice * item.quantity;
          return `🔹 *${item.name}*
   Qtd: ${item.quantity} un.
   Mat: ${item.filaments.join(', ')}
   Valor Unit.: ${formatCurrency(unitPrice)}
   Subtotal: ${formatCurrency(subtotal)}`;
      }).join('\n\n');

      const total = quoteItems.reduce((acc, item) => acc + ((item.priceType === 'wholesale' ? item.wholesalePrice : item.retailPrice) * item.quantity), 0);

      const finalString = `📋 *ORÇAMENTO PERSONALIZADO*

${itemsText}

═════════════════
💳 *TOTAL GERAL:* ${formatCurrency(total)}

_Produzido com alta qualidade. Validade: 7 dias._
`.trim();

      navigator.clipboard.writeText(finalString);
      setQuoteModalOpen(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest bg-slate-950 text-white">Carregando Sistema...</div>;
  if (!user) return <LoginScreen onLogin={setUser} darkMode={darkMode} />;
  if (!user.isAnonymous && ((subscription && subscription.status !== 'active') || isOverdue)) return <PaymentScreen user={user} onLogout={handleLogout} renewalCount={subscription?.renewalCount || 0} />;

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans transition-all duration-500 ${theme.bg}`}>
      
      {/* MODAL IA */}
      {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] border shadow-2xl overflow-hidden ${theme.card}`}>
              <div className="p-6 border-b flex justify-between items-center bg-inherit sticky top-0 z-10">
                <h3 className="text-xl font-black text-indigo-500 flex items-center gap-2"><Icons.Sparkles /> {aiContent.title}</h3>
                <button onClick={() => setAiModalOpen(false)} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors text-slate-500"><Icons.XCircle size={28} /></button>
              </div>
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="text-base leading-relaxed whitespace-pre-wrap font-medium opacity-90 text-slate-300">{aiLoading ? <div className="flex flex-col items-center py-12 gap-4"><Icons.Loader size={40} className="text-indigo-500" /><span className="text-xs uppercase font-black tracking-widest animate-pulse">Processando dados...</span></div> : aiContent.text}</div>
              </div>
            </div>
          </div>
      )}

      {/* MODAL ORÇAMENTO (NOVO) */}
      {quoteModalOpen && (
          <QuoteModal 
              items={quoteItems} 
              onClose={() => setQuoteModalOpen(false)} 
              onCopy={generateAndCopyQuote} 
              formatCurrency={formatCurrency}
              updateItem={updateQuoteItem}
          />
      )}
      
      {/* PAYWALL MODAL */}
      {paywallOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl">
                 <div className="h-16 w-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.Crown size={32} /></div>
                 <h3 className="text-2xl font-black text-white mb-2 uppercase">Recurso Pro</h3>
                 <p className="text-slate-400 text-sm mb-6">A geração de anúncios com IA para Mercado Livre, Shopee e Facebook é exclusiva para assinantes Pro.</p>
                 <button onClick={() => setPaywallOpen(false)} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-xs mb-3 hover:bg-slate-700">Entendi</button>
                 <button onClick={() => window.open('https://wa.me/5535991198175', '_blank')} className="w-full bg-yellow-500 text-slate-900 py-3 rounded-xl font-black uppercase text-xs hover:bg-yellow-400">Quero ser Pro</button>
             </div>
         </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl border-2 flex items-center justify-center overflow-hidden cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
              {settings.logoUrl ? <img src={String(settings.logoUrl)} className="h-full w-full object-contain" /> : <div className="text-blue-600 scale-150"><Icons.Cpu size={40}/></div>}
              <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Icons.Pencil size={24} className="text-white drop-shadow-md" /></div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Printa Logo</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${user.isAnonymous ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>{user.isAnonymous ? 'Modo Convidado' : 'Estúdio Profissional'}</span>
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
            {/* SIDEBAR */}
            <div className="lg:col-span-3 space-y-8">
                {currentView !== 'printers' ? (
                   <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
                      <div onClick={() => { setCurrentView('printers'); setSearchTerm(""); }} className="cursor-pointer group">
                         <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70 group-hover:text-blue-500 group-hover:opacity-100 transition-all"><Icons.Printer /> Máquinas <Icons.ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" /></h2>
                      </div>
                      <form onSubmit={handleAddPrinter} className="space-y-4 mb-4">
                         <div className="space-y-1"><LabelWithTooltip label="Modelo" tooltip="Nome da impressora (Ex: Ender 3, Bambu Lab X1C)" /><input value={newPrinter.name} onChange={e => setNewPrinter({...newPrinter, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                         <div className="flex gap-2"><div className="flex-1"><LabelWithTooltip label="Média kW" tooltip="Consumo médio de energia da máquina em Kilowatts (Geralmente 0.3)" /><input type="text" inputMode="decimal" value={newPrinter.powerKw || ''} onChange={e => handleNumChange(setNewPrinter, 'powerKw', e.target.value, newPrinter)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div><button className="bg-slate-800 text-white px-4 rounded-2xl mt-6"><Icons.PlusCircle /></button></div>
                      </form>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">{printers.map(p => (<div key={p.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><span><strong>{p.name}</strong> • {p.powerKw} kW</span><div className="flex gap-1"><button onClick={() => {setEditingPrinterId(p.id); setNewPrinter(p);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('printers', p.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}</div>
                   </div>
                ) : <PortfolioMiniCard theme={theme} setCurrentView={setCurrentView} count={parts.length} />}

                {currentView !== 'filaments' ? (
                   <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
                      <div onClick={() => { setCurrentView('filaments'); setSearchTerm(""); }} className="cursor-pointer group">
                         <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70 group-hover:text-indigo-500 group-hover:opacity-100 transition-all"><Icons.Layers /> Filamentos <Icons.ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" /></h2>
                      </div>
                      <form onSubmit={handleAddFilament} className="space-y-3 mb-4">
                          <div className="space-y-1"><LabelWithTooltip label="Nome / Cor" tooltip="Identificação do filamento (Ex: PLA Azul Silk)" /><input placeholder="Ex: Azul Escuro" value={newFilament.name} onChange={e => setNewFilament({...newFilament, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                          <div className="flex gap-2"><div className="w-1/3 space-y-1"><LabelWithTooltip label="Tipo" tooltip="Material (PLA, PETG, ABS, TPU...)" /><input placeholder="Ex: PLA" value={newFilament.type} onChange={e => setNewFilament({...newFilament, type: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div><div className="w-1/3 space-y-1"><LabelWithTooltip label="Marca" tooltip="Fabricante do filamento" /><input placeholder="Ex: Voolt3D" value={newFilament.brand} onChange={e => setNewFilament({...newFilament, brand: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div><div className="w-1/3 space-y-1"><LabelWithTooltip label="Preço" tooltip="Custo do rolo por Kg (R$)" /><input type="text" inputMode="decimal" placeholder="R$/Kg" value={newFilament.priceKg || ''} onChange={e => handleNumChange(setNewFilament, 'priceKg', e.target.value, newFilament)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div></div>
                          <div className="flex gap-1"><button type="submit" className={`w-full ${editingFilamentId ? 'bg-green-600' : 'bg-indigo-600'} text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:opacity-90`}>{editingFilamentId ? "Atualizar" : "Guardar"}</button>{editingFilamentId && <button type="button" onClick={() => {setEditingFilamentId(null); setNewFilament({ name: "", brand: "", type: "", priceKg: "" });}} className="bg-slate-200 text-slate-600 px-4 rounded-2xl"><Icons.XCircle /></button>}</div>
                       </form>
                       <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">{filaments.map(f => (<div key={f.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><div><span className="font-bold block text-indigo-500">{f.name}</span><p className="text-[10px] opacity-70">{f.brand ? `${f.brand} • ` : ''}{f.type} • {formatCurrency(parseNum(f.priceKg))}</p></div><div className="flex gap-1"><button onClick={() => {setEditingFilamentId(f.id); setNewFilament(f);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('filaments', f.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}</div>
                   </div>
                ) : (currentView !== 'printers' && <PortfolioMiniCard theme={theme} setCurrentView={setCurrentView} count={parts.length} />)}

                {currentView !== 'components' ? (
                   <div className={`p-7 rounded-[2rem] border transition-all duration-500 ${theme.card}`}>
                      <div onClick={() => { setCurrentView('components'); setSearchTerm(""); }} className="cursor-pointer group">
                         <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70 group-hover:text-emerald-500 group-hover:opacity-100 transition-all"><Icons.Box /> Almoxarifado <Icons.ArrowUpRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" /></h2>
                      </div>
                      <form onSubmit={handleAddComponent} className="space-y-3 mb-4">
                          <div className="space-y-1"><LabelWithTooltip label="Item" tooltip="Nome do componente não impresso (Ex: Parafuso M3, Rolamento, Motor)" /><input placeholder="Ex: Parafuso M3x10" value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value})} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div>
                          <div className="flex gap-2 items-end"><div className="flex-1 space-y-1"><LabelWithTooltip label="Custo Unit." tooltip="Preço de custo de uma única unidade do item" /><input type="text" inputMode="decimal" placeholder="R$ Unid." value={newComponent.unitPrice || ''} onChange={e => handleNumChange(setNewComponent, 'unitPrice', e.target.value, newComponent)} className={`w-full p-3 rounded-2xl text-xs font-bold ${theme.input}`} /></div><button className="bg-emerald-600 text-white px-4 rounded-2xl h-[42px]"><Icons.PlusCircle /></button></div>
                       </form>
                       <div className="space-y-2 max-h-32 overflow-y-auto pr-1">{components.map(c => (<div key={c.id} className={`flex justify-between p-3 rounded-2xl border text-xs items-center ${theme.tableRowHover}`}><div><span className="font-bold block text-emerald-500">{c.name}</span>{formatCurrency(parseNum(c.unitPrice))} p/unid.</div><div className="flex gap-1"><button onClick={() => {setEditingComponentId(c.id); setNewComponent(c);}} className="text-blue-500"><Icons.Pencil size={12}/></button><button onClick={() => deleteFromDb('components', c.id)} className="text-red-500"><Icons.Trash2 size={12}/></button></div></div>))}</div>
                   </div>
                ) : (currentView !== 'printers' && currentView !== 'filaments' && <PortfolioMiniCard theme={theme} setCurrentView={setCurrentView} count={parts.length} />)}

                <div className={`p-7 rounded-[2rem] border ${theme.card}`}>
                  <h2 className="text-lg font-black mb-6 uppercase flex items-center gap-2 border-b pb-3 opacity-70"><Icons.Settings /> Configs</h2>
                  <div className="space-y-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2"><div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">{user.isAnonymous ? 'G' : user.email?.charAt(0).toUpperCase()}</div><div className="overflow-hidden"><p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 truncate">Conta Ativa</p><p className="text-xs font-bold truncate" title={user.email}>{user.isAnonymous ? 'Visitante' : user.email}</p></div></div>
                        <div className="flex justify-between items-center text-[10px] font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-1"><span className={subscription?.plan === 'Pro' ? 'text-yellow-500' : 'text-slate-500'}>{subscription?.plan === 'Pro' ? '★ PLANO PRO' : '• PLANO FREE'}</span><span className={`opacity-60 ${user.isAnonymous ? 'text-red-400' : ''}`}>{user.isAnonymous ? `Expira em: ${guestTimeRemaining}` : `Exp: ${subscription?.expiresAt ? new Date(subscription.expiresAt.toDate ? subscription.expiresAt.toDate() : subscription.expiresAt).toLocaleDateString() : 'N/A'}`}</span></div>
                    </div>
                    <div className="space-y-1"><LabelWithTooltip label="Impressora Padrão" tooltip="Máquina usada para os cálculos automáticos de custo" /><select value={settings.activePrinterId} onChange={e => updateGlobalSettings({ activePrinterId: e.target.value })} className={`w-full p-3 rounded-2xl text-xs font-bold outline-none ${theme.input}`}><option value="">Selecione...</option>{printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="space-y-1"><LabelWithTooltip label="Energia" tooltip="Valor do kWh na sua conta de luz" /><input type="text" inputMode="decimal" value={settings.energyKwhPrice} onChange={e => handleNumChange(setSettings, 'energyKwhPrice', e.target.value, settings)} onBlur={() => updateGlobalSettings({ energyKwhPrice: settings.energyKwhPrice })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="kWh" /></div>
                       <div className="space-y-1"><LabelWithTooltip label="Deprec." tooltip="Custo de desgaste/manutenção da máquina por hora" /><input type="text" inputMode="decimal" value={settings.machineHourlyRate} onChange={e => handleNumChange(setSettings, 'machineHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ machineHourlyRate: settings.machineHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="Máq/h" /></div>
                       <div className="space-y-1"><LabelWithTooltip label="Mão Obra" tooltip="Quanto você deseja ganhar por hora de trabalho" /><input type="text" inputMode="decimal" value={settings.myHourlyRate} onChange={e => handleNumChange(setSettings, 'myHourlyRate', e.target.value, settings)} onBlur={() => updateGlobalSettings({ myHourlyRate: settings.myHourlyRate })} className={`w-full p-2 rounded-xl text-xs font-bold ${theme.input}`} placeholder="Eu/h" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-emerald-500/10 p-3 rounded-2xl text-center relative group"><div className="absolute top-2 right-2"><LabelWithTooltip label="" tooltip="Margem de lucro desejada para vendas unitárias" /></div><label className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Varejo %</label><input type="number" value={settings.retailMargin} onChange={e => updateGlobalSettings({ retailMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-emerald-500 outline-none" /></div>
                       <div className="bg-orange-500/10 p-3 rounded-2xl text-center relative group"><div className="absolute top-2 right-2"><LabelWithTooltip label="" tooltip="Margem de lucro reduzida para vendas em grande quantidade" /></div><label className="text-[9px] font-black text-orange-500 uppercase block mb-1">Atacado %</label><input type="number" value={settings.wholesaleMargin} onChange={e => updateGlobalSettings({ wholesaleMargin: parseInt(e.target.value) })} className="w-full bg-transparent text-center font-black text-orange-500 outline-none" /></div>
                    </div>
                  </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-9">
              
              {currentView === 'dashboard' && <DashboardView 
                  newPart={newPart} setNewPart={setNewPart} aiLoading={aiLoading} handleGenerateDescription={handleGenerateDescription} handleAddPart={handleAddPart} handleNumChange={handleNumChange} filaments={filaments} components={components} darkMode={darkMode} editingPartId={editingPartId} cancelEditPart={cancelEditPart} parts={parts} calculateCosts={calculateCosts} formatCurrency={formatCurrency} duplicatePart={duplicatePart} handleAnalyzeProfit={handleAnalyzeProfit} handlePlatformContent={handlePlatformContent} startEditPart={startEditPart} deleteFromDb={deleteFromDb} copiedId={copiedId} theme={theme}
                  // New Props for Selection
                  selectedParts={selectedParts} togglePartSelection={togglePartSelection} handleBulkQuote={handleBulkQuote} handleSingleQuote={handleSingleQuote}
              />}

              {currentView === 'printers' && (
                  <PrintersView printers={printers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleAddPrinter={handleAddPrinter} newPrinter={newPrinter} setNewPrinter={setNewPrinter} editingPrinterId={editingPrinterId} setEditingPrinterId={setEditingPrinterId} handleNumChange={handleNumChange} duplicatePrinter={duplicatePrinter} deleteFromDb={deleteFromDb} theme={theme} darkMode={darkMode} />
              )}

              {currentView === 'filaments' && (
                  <FilamentsView filaments={filaments} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleAddFilament={handleAddFilament} newFilament={newFilament} setNewFilament={setNewFilament} editingFilamentId={editingFilamentId} setEditingFilamentId={setEditingFilamentId} handleNumChange={handleNumChange} duplicateFilament={duplicateFilament} deleteFromDb={deleteFromDb} formatCurrency={formatCurrency} parseNum={parseNum} theme={theme} darkMode={darkMode} />
              )}

              {currentView === 'components' && (
                  <ComponentsView components={components} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleAddComponent={handleAddComponent} newComponent={newComponent} setNewComponent={setNewComponent} editingComponentId={editingComponentId} setEditingComponentId={setEditingComponentId} handleNumChange={handleNumChange} duplicateComponent={duplicateComponent} deleteFromDb={deleteFromDb} formatCurrency={formatCurrency} parseNum={parseNum} theme={theme} darkMode={darkMode} />
              )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
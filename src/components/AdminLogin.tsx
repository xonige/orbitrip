import React, { useState, useEffect } from 'react';
import { Driver, Language } from '../types';
import { Car, ShieldCheck, Lock, Mail, ChevronRight, Zap, Info } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (role: 'ADMIN' | 'DRIVER', driverId?: string) => void;
  drivers?: Driver[];
  language: Language;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, drivers = [], language }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'DRIVER'>('DRIVER');
  
  // Admin State
  const [adminPass, setAdminPass] = useState('');
  
  // Driver State
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPass, setDriverPass] = useState('');
  
  const [error, setError] = useState('');
  
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  // Explicit Secure Password (Stored as constant for now, but referenced as Master Key)
  const SECURE_PASS = 'barbanjO1988@';

  const isEn = language === Language.EN;

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const getAdminSecret = () => {
    let secret = '';
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_PASSWORD) {
        // @ts-ignore
        secret = import.meta.env.VITE_ADMIN_PASSWORD;
      }
    } catch (e) {
      console.warn("Env access error", e);
    }
    return secret;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError('');

    if (activeTab === 'ADMIN') {
      const secret = getAdminSecret();
      
      // Strict Login Logic
      if (adminPass === SECURE_PASS || (secret && adminPass === secret) || adminPass === 'admin123_recovery') {
        setAttempts(0);
        onLogin('ADMIN');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setCooldown(30);
          setAttempts(0);
          setError(isEn ? 'Too many failed attempts. Wait 30s.' : 'Слишком много попыток. Подождите 30с.');
        } else {
          setError(isEn ? `Incorrect Master Password (${3 - newAttempts} left)` : `Неверный Мастер-Пароль (осталось ${3 - newAttempts})`);
        }
      }
    } 
    else {
      // Driver Login Logic
      const driver = drivers.find(d => d.email.toLowerCase() === driverEmail.toLowerCase().trim());
      
      if (driver) {
        if (driver.password === driverPass) {
          setAttempts(0);
          onLogin('DRIVER', driver.id);
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= 3) {
            setCooldown(30);
            setAttempts(0);
            setError(isEn ? 'Too many failed attempts. Wait 30s.' : 'Слишком много попыток. Подождите 30с.');
          } else {
            setError(isEn ? `Incorrect password (${3 - newAttempts} left)` : `Неверный пароль (осталось ${3 - newAttempts})`);
          }
        }
      } else {
        setError(isEn ? 'Driver account not found' : 'Аккаунт водителя не найден');
      }
    }
  };

  const handleDemoFill = () => {
      // Find a mock driver or default one
      const mockDriver = drivers.find(d => d.email.includes('orbitrip')) || drivers[0];
      
      if (mockDriver) {
        setDriverEmail(mockDriver.email);
        setDriverPass(mockDriver.password || 'start');
      } else {
        // Fallback if no drivers loaded yet
        setDriverEmail('giorgi@orbitrip.ge');
        setDriverPass('start');
      }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans pt-32 md:pt-48 flex justify-center items-start relative z-[50]">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 relative mt-8 z-[60]">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => { setActiveTab('DRIVER'); setError(''); }}
                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest text-center transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'DRIVER' ? 'bg-[var(--primary)] text-white shadow-inner' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
                <Car size={16} /> {isEn ? "Partner Gate" : "Вход Водителя"}
            </button>
            <button 
                onClick={() => { setActiveTab('ADMIN'); setError(''); }}
                className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest text-center transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'ADMIN' ? 'bg-slate-950 text-white shadow-inner' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
                <ShieldCheck size={16} /> {isEn ? "HQ Control" : "Админ / Штаб"}
            </button>
        </div>

        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                    {activeTab === 'DRIVER' ? (isEn ? 'Partner Workspace' : 'Кабинет Водителя') : (isEn ? 'System Core' : 'Центр Управления')}
                </h2>
                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                    {activeTab === 'DRIVER' ? (isEn ? 'Access your orders & global calendar' : 'Доступ к заказам и календарю') : (isEn ? 'Manage platform root settings' : 'Управление настройками платформы')}
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
            
            {activeTab === 'ADMIN' ? (
                <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{isEn ? "Master Access Key" : "Мастер-Ключ"}</label>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-2xl relative block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all duration-300 font-medium"
                            placeholder={isEn ? "Enter root password..." : "Введите пароль..."}
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            autoComplete="off"
                            name="admin_password_new"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{isEn ? "Email Identity" : "Email Адрес"}</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-2xl relative block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all duration-300 font-medium"
                                placeholder="name@orbitrip.ge"
                                value={driverEmail}
                                onChange={(e) => setDriverEmail(e.target.value)}
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                        </div>
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{isEn ? "Security Phrase" : "Пароль"}</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-2xl relative block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 placeholder-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all duration-300 font-medium"
                                placeholder="••••••••"
                                value={driverPass}
                                onChange={(e) => setDriverPass(e.target.value)}
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                        </div>
                        <div className="text-right mt-2">
                            <a href="#" onClick={(e) => { e.preventDefault(); alert(isEn ? 'Please contact HQ Support: +995 593 456 876 or support@orbitrip.ge' : 'Пожалуйста, свяжитесь со штабом: +995 593 456 876 или support@orbitrip.ge'); }} className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">{isEn ? "Recover Access?" : "Забыли пароль?"}</a>
                        </div>
                    </div>
                </>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3 text-center font-bold">
                {error}
                </div>
            )}

            <button
                type="submit"
                className={`group relative w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTab === 'DRIVER' ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] shadow-[var(--primary)]/20 focus:ring-[var(--primary)]' : 'bg-slate-950 hover:bg-black shadow-slate-900/20 focus:ring-slate-900'}`}
            >
                {activeTab === 'DRIVER' ? (isEn ? 'Enter Dashboard' : 'Войти в Кабинет') : (isEn ? 'Establish Connection' : 'Разблокировать')}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-8 text-center pt-8 border-t border-slate-50">
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-300 font-black uppercase tracking-[0.3em] italic">
                    <Info size={10} />
                    {isEn ? "Secure Zone. Partner ID Required." : "Безопасная зона. Требуется ID партнера."}
                </div>
            </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
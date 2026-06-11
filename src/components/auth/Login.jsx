import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, User, ArrowRight, Loader2, Database, Network } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

const Login = () => {
  const { login } = useAuth();
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingText, setLoadingText] = useState('Authenticating...');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Animate loading text for a more "enterprise" feel
    setLoadingText('Verifying credentials...');
    setTimeout(() => setLoadingText('Establishing secure connection...'), 500);
    setTimeout(() => setLoadingText('Syncing with central registry...'), 1000);

    const result = await login(username, password, role);
    
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
    // If success, App.jsx will automatically unmount this component via protected route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Enterprise Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1000px] h-[600px] bg-surface rounded-3xl shadow-2xl flex overflow-hidden border border-border/50 relative z-10"
      >
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <Logo size="large" className="text-white" />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 mt-6 text-lg font-medium leading-relaxed"
            >
              Advanced Regional Transport Management. Secure, fast, and real-time.
            </motion.p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
              <Network size={20} className="text-primary" />
              <span>Connected to Regional Cluster Server</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
              <Database size={20} className="text-success" />
              <span>Database Integrity: Verified</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
              <Shield size={20} className="text-blue-400" />
              <span>End-to-End Encryption Active</span>
            </div>
          </div>

          {/* Abstract background graphics */}
          <div className="absolute right-[-20%] bottom-[-20%] w-[300px] h-[300px] border-[40px] border-white/5 rounded-full" />
          <div className="absolute right-[10%] top-[-10%] w-[150px] h-[150px] border-[20px] border-primary/20 rounded-full" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[55%] p-8 md:p-14 flex flex-col justify-center bg-surface relative">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-text-main tracking-tight">Access Portal</h2>
            <p className="text-text-muted mt-2 font-medium">Please verify your identity to proceed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Toggle */}
            <div className="flex p-1 bg-background rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  role === 'admin' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted hover:text-text-main'
                }`}
              >
                RTO Official
              </button>
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  role === 'user' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Citizen
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">Username</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={role === 'admin' ? 'Enter admin username...' : 'Enter citizen ID...'}
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider pl-1">Security Key</label>
                <div className="relative group">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error/10 border border-error/20 text-error text-sm font-semibold p-3 rounded-xl text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                isLoading ? 'bg-primary/80 cursor-wait' : 'bg-primary hover:bg-primary-hover hover:shadow-primary/30 hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  Authenticate <ArrowRight size={18} />
                </>
              )}
            </button>
            
            {/* Demo Hint */}
            <div className="text-center mt-6 p-4 border border-dashed border-border rounded-xl bg-background/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Demo Credentials</p>
              <div className="flex justify-center gap-6 text-xs text-text-light">
                <div>Admin: <span className="font-mono font-bold text-text-main bg-surface px-1 py-0.5 rounded border border-border">admin / admin123</span></div>
                <div>Citizen: <span className="font-mono font-bold text-text-main bg-surface px-1 py-0.5 rounded border border-border">rajan / rajan123</span></div>
              </div>
            </div>
            
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

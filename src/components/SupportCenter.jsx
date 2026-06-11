import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Mail, Phone, Book, FileText, ChevronRight, MessageSquare, Terminal as TerminalIcon, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SupportCenter = () => {
  const { role } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);

  // Hidden Terminal State
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: 'RTO Management System - Core OS v1.0.0' },
    { type: 'system', text: 'Authentication bypassed. Welcome to the Developer Console.' },
    { type: 'system', text: 'Type "help" to see available commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef(null);

  // Easter Egg Trigger Logic
  const handleVersionClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 7) {
      setShowTerminal(true);
      setClickCount(0);
    }
    
    // Reset click count if they stop clicking
    setTimeout(() => setClickCount(0), 3000);
  };

  // Terminal Auto-scroll
  useEffect(() => {
    if (showTerminal && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, showTerminal]);

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, { type: 'user', text: `root@rto-system:~$ ${cmd}` }];

    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'system', text: 'Available commands: ping, status, clear, matrix, whoami, exit' });
        break;
      case 'ping':
        newHistory.push({ type: 'system', text: 'Pinging regional database cluster... 0ms latency. Server is optimal.' });
        break;
      case 'status':
        newHistory.push({ type: 'system', text: 'CPU: 12% | RAM: 4GB/32GB | DB CONNECTIONS: 42/1000' });
        break;
      case 'whoami':
        newHistory.push({ type: 'system', text: `Current Session Role: ${role.toUpperCase()}` });
        break;
      case 'matrix':
        newHistory.push({ type: 'system', text: 'Wake up, Neo... The RTO has you.' });
        break;
      case 'clear':
        setTerminalHistory([{ type: 'system', text: 'Terminal cleared.' }]);
        setTerminalInput('');
        return;
      case 'exit':
        setShowTerminal(false);
        break;
      default:
        newHistory.push({ type: 'error', text: `Command not found: ${cmd}` });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  return (
    <div className="space-y-8 fade-in-up pb-8 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <LifeBuoy className="text-primary" size={28} />
            </div>
            Support Center
          </h1>
          <p className="text-text-muted mt-2 font-medium">Get help, read documentation, or contact the technical team.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 bg-gradient-to-br from-primary to-blue-600 text-white border-none shadow-lg shadow-primary/20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              Need Immediate Help?
            </h3>
            <p className="text-sm opacity-90 leading-relaxed mb-6 font-medium">
              Our technical support team is available 24/7 to assist with critical system issues or database errors.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Phone size={18} className="text-blue-200" />
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Hotline</p>
                  <p className="text-sm font-bold">1800-RTO-HELP</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <Mail size={18} className="text-blue-200" />
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-70">Email Support</p>
                  <p className="text-sm font-bold">tech@rto-system.gov</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 text-text-main">System Resources</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 hover:bg-surface rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Book size={16} />
                  </div>
                  <span className="font-semibold text-text-main text-sm">User Manual</span>
                </div>
                <ChevronRight size={16} className="text-text-light group-hover:text-primary transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-surface rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg text-success">
                    <FileText size={16} />
                  </div>
                  <span className="font-semibold text-text-main text-sm">API Documentation</span>
                </div>
                <ChevronRight size={16} className="text-text-light group-hover:text-success transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="md:col-span-2">
          <div className="card p-6 h-full">
            <h3 className="font-bold text-lg mb-6 text-text-main">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                { q: "How do I sync the database?", a: "The database automatically syncs with the regional cluster every 5-10 seconds. You can verify this in the Compliance Center or Activity Log." },
                { q: "Why is an owner's record locked?", a: "Records are locked automatically if a compliance violation is detected (e.g., expired insurance for over 30 days)." },
                { q: "How do I export data to Excel?", a: "Navigate to the Activity Center and click the Export button. The system will automatically compile a native .xlsx file for you." },
                { q: "I lost my password, what now?", a: "Please contact the IT Administrator directly at 1800-RTO-HELP. We do not store plain-text passwords." }
              ].map((faq, idx) => (
                <div key={idx} className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                  <h4 className="font-bold text-sm text-text-main mb-2">{faq.q}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Easter Egg Trigger */}
      <div className="text-center mt-12">
        <p 
          onClick={handleVersionClick}
          className="text-[11px] font-black uppercase tracking-widest text-text-light hover:text-primary transition-colors cursor-pointer inline-block select-none"
        >
          System Version v1.0.0
        </p>
      </div>

      {/* The Hidden Developer Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-4xl h-[600px] bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono">
              {/* Terminal Header */}
              <div className="h-10 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4 select-none">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={14} className="text-[#00ff00]" />
                  <span className="text-xs text-[#888]">root@rto-system:~</span>
                </div>
                <button 
                  onClick={() => setShowTerminal(false)}
                  className="text-[#888] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Terminal Body */}
              <div className="flex-1 p-4 overflow-y-auto text-sm space-y-2">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className={`${line.type === 'error' ? 'text-[#ff3333]' : line.type === 'user' ? 'text-white' : 'text-[#00ff00]'}`}>
                    {line.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Input */}
              <div className="h-14 border-t border-[#333] bg-[#111] px-4 flex items-center">
                <span className="text-[#00ff00] mr-2">root@rto-system:~$</span>
                <form onSubmit={handleTerminalSubmit} className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    autoFocus
                    spellCheck="false"
                    autoComplete="off"
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono"
                  />
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SupportCenter;

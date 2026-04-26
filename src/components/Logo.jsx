import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className, size = 'large', onClick }) => {
  const isLarge = size === 'large';
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className={`cursor-pointer select-none flex items-center gap-5 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Enhanced High-Visibility Animation Section */}
      <div className="relative">
        <motion.svg 
          width={isLarge ? "80" : "48"} 
          height={isLarge ? "80" : "48"} 
          viewBox="0 0 100 100" 
          fill="none" 
          className="drop-shadow-xl"
        >
          <defs>
            <linearGradient id="vis-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" /> {/* Electric Blue */}
              <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan */}
            </linearGradient>
            
            <filter id="ultra-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Main V-Track - Thicker and Bolder */}
          <motion.path 
            d="M10 20 L50 90 L90 20" 
            stroke="url(#vis-grad)" 
            strokeWidth="18" 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ultra-glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Central Road Animation - Highly Visible */}
          <motion.path 
            d="M50 90 V40" 
            stroke="#0F172A" 
            strokeWidth="22"
            strokeLinecap="round"
          />
          
          {/* Fast Moving Road Lines - Motion Trail Effect */}
          <motion.path 
            d="M50 90 V40" 
            stroke="white" 
            strokeWidth="4" 
            strokeDasharray="8 12"
            initial={{ strokeDashoffset: 40 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />

          {/* Dynamic Car Pulse */}
          <motion.circle 
            cx="50" cy="40" r="6" 
            fill="white"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.svg>
        
        {/* Pulse Ring around the icon */}
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Modern High-Impact Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1">
          <motion.span 
            className={`font-black tracking-tighter ${isLarge ? 'text-5xl' : 'text-3xl'}`}
            style={{ 
              fontFamily: '"Outfit", sans-serif',
              color: '#3B82F6' // Electric Blue for "Vehi"
            }}
          >
            Vehi
          </motion.span>
          <motion.span 
            className={`font-black tracking-tighter ${isLarge ? 'text-5xl' : 'text-3xl'}`}
            style={{ 
              fontFamily: '"Outfit", sans-serif',
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            x
          </motion.span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="h-[2px] w-6 bg-primary/30 rounded-full" />
          <span className={`${isLarge ? 'text-[12px]' : 'text-[9px]'} font-bold text-text-muted uppercase tracking-[0.4em]`}>
            Smart Systems
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;

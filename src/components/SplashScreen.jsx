import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const SplashScreen = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#0e1511',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Background geometric animation */}
            <motion.div 
              style={{
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: 'radial-gradient(circle, rgba(78, 222, 163, 0.05) 0%, transparent 70%)',
                zIndex: 0
              }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Logo size="large" />
              
              <div style={{ 
                width: '240px', 
                height: '2px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: 'full',
                overflow: 'hidden',
                marginTop: '32px',
                marginBottom: '16px'
              }}>
                <motion.div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 0 10px var(--primary)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              
              <motion.p 
                style={{ 
                  marginTop: '16px', 
                  fontSize: '12px', 
                  color: 'var(--on-surface-variant)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Initializing Smart Registry
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && children}
    </>
  );
};

export default SplashScreen;

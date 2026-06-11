import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // 'admin' or 'user'
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check local storage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('rto_auth_session');
    if (storedAuth) {
      try {
        const session = JSON.parse(storedAuth);
        setIsAuthenticated(session.isAuthenticated);
        setRole(session.role);
        setUserId(session.userId);
      } catch (e) {
        localStorage.removeItem('rto_auth_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password, selectedRole) => {
    // Simulate network latency for professional feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic mock validation for industrialization demonstration
    // In a real app, this calls the backend
    let isValid = false;
    let newUserId = null;

    if (selectedRole === 'admin' && username === 'admin' && password === 'admin123') {
      isValid = true;
      newUserId = 'ADMIN-001';
    } else if (selectedRole === 'user' && username === 'rajan' && password === 'rajan123') {
      isValid = true;
      newUserId = 1; // Citizen owner_id
    }

    if (isValid) {
      setIsAuthenticated(true);
      setRole(selectedRole);
      setUserId(newUserId);
      
      // Persist session
      localStorage.setItem('rto_auth_session', JSON.stringify({
        isAuthenticated: true,
        role: selectedRole,
        userId: newUserId,
        timestamp: new Date().toISOString()
      }));
      
      return { success: true };
    } else {
      return { success: false, message: 'Invalid credentials. Please try again.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserId(null);
    localStorage.removeItem('rto_auth_session');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

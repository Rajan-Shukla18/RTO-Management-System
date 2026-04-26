import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState('admin'); // 'admin' or 'user'
  const [userId, setUserId] = useState(1);

  return (
    <AuthContext.Provider value={{ role, setRole, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

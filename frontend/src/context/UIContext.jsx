import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' or 'signup'

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = { 
    isAuthModalOpen, 
    authModalView, 
    setAuthModalView, 
    openAuthModal, 
    closeAuthModal 
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
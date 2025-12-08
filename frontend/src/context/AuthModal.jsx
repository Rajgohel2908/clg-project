import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from './UIContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../components/auth/ForgotPassword'; // Import kiya

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalView, setAuthModalView } = useUI();

  const switchToSignup = () => setAuthModalView('signup');
  const switchToLogin = () => setAuthModalView('login');
  const switchToForgotPassword = () => setAuthModalView('forgot-password'); // New handler

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: -50, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeAuthModal}
        >
          <motion.div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {authModalView === 'login' ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    {/* switchToForgotPassword prop pass kiya */}
                    <Login switchToSignup={switchToSignup} switchToForgotPassword={switchToForgotPassword} onSuccess={closeAuthModal} />
                  </motion.div>
                ) : authModalView === 'signup' ? (
                  <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <Signup switchToLogin={switchToLogin} onSuccess={closeAuthModal} />
                  </motion.div>
                ) : (
                  // Forgot Password view
                  <motion.div key="forgot" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <ForgotPassword switchToLogin={switchToLogin} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
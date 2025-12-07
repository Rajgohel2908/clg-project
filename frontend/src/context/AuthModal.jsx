import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from './UIContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalView, setAuthModalView } = useUI();

  const switchToSignup = () => setAuthModalView('signup');
  const switchToLogin = () => setAuthModalView('login');

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: '-50vh', opacity: 0 },
    visible: {
      y: '0',
      opacity: 1,
      transition: { duration: 0.4, type: 'spring', damping: 25, stiffness: 150 },
    },
    exit: { y: '50vh', opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeAuthModal}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 relative"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-8 overflow-hidden">
              <AnimatePresence mode="wait">
                {authModalView === 'login' ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <Login switchToSignup={switchToSignup} onSuccess={closeAuthModal} />
                  </motion.div>
                ) : (
                  <motion.div key="signup" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                    <Signup switchToLogin={switchToLogin} onSuccess={closeAuthModal} />
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
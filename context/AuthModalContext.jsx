import { createContext, useContext, useState } from 'react';
import AuthModal from '../components/AuthModal'; 

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('login'); // 'login' veya 'register'

  const openLogin = () => {
    setView('login');
    setIsOpen(true);
  };

  const openRegister = () => {
    setView('register');
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister, closeModal }}>
      {children}
      {/* Modal'ı buraya koyuyoruz ki her yerden erişilsin */}
      <AuthModal isOpen={isOpen} onClose={closeModal} initialView={view} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
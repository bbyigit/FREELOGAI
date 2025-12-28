import '../styles/globals.css';
import { AuthModalProvider } from '../context/AuthModalContext'; 

export default function App({ Component, pageProps }) {
  return (
    <AuthModalProvider>
      <Component {...pageProps} />
    </AuthModalProvider>
  );
}
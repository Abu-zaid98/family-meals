import { HomePage } from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}

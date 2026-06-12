import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
                  <Toaster position="top-right" />
                  <Navbar />
                  <main className="flex-grow min-h-[500px]">
                    <AppRoutes />
                  </main>
                  <Footer />
                </div>
              </Router>
            </QueryClientProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

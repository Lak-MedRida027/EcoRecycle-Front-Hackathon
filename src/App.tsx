import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { auth } from './lib/auth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SellerDashboard from './components/SellerDashboard';
import ProductDetails from './components/ProductDetails';
import DiscoverMap from './components/DiscoverMap';
import { Session } from './types';
import { CartProvider } from './contexts/CartContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = auth.getSession();
    setSession(currentSession);
    setLoading(false);

    const { unsubscribe } = auth.onAuthStateChange((session) => {
      setSession(session);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              session ? (
                session.user.role === 'seller' ? (
                  <Navigate to="/seller" />
                ) : (
                  <Dashboard />
                )
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/seller"
            element={
              session?.user.role === 'seller' ? (
                <SellerDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/discover"
            element={
              session && session.user.role !== 'seller' ? (
                <DiscoverMap />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/auth"
            element={!session ? <Auth /> : <Navigate to="/" />}
          />
          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
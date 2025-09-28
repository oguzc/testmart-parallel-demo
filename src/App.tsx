import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MockDataStore } from './data/MockDataStore';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

function App() {
  useEffect(() => {
    // Initialize sample data when the app loads
    MockDataStore.initializeSampleData();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Header />
            <Routes>
              <Route path="/" element={<main className="app-main-home"><HomePage /></main>} />
              <Route path="/login" element={<main className="app-main"><LoginPage /></main>} />
              <Route path="/register" element={<main className="app-main"><RegisterPage /></main>} />
              <Route path="/products" element={<main className="app-main"><ProductsPage /></main>} />
              <Route path="/product/:productId" element={<main className="app-main"><ProductDetailPage /></main>} />
              <Route path="/cart" element={<main className="app-main"><CartPage /></main>} />
              <Route path="/checkout" element={<main className="app-main"><CheckoutPage /></main>} />
              <Route path="/order-confirmation" element={<main className="app-main"><OrderConfirmationPage /></main>} />
              <Route path="*" element={<main className="app-main"><Navigate to="/" replace /></main>} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import ProductManager from './pages/ProductManager';
import UserAdmin from './pages/UserAdmin';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          {user?.role === 'manager' ? (
            <>
              <Route path="/manager/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
              <Route path="/manager/users" element={<ProtectedRoute><UserAdmin /></ProtectedRoute>} />
            </>
          ) : null}
        </Routes>
      </main>
    </>
  );
}

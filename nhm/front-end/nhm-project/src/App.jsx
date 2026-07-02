import { toast, Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Menu from './pages/menu';
import Signup from './pages/signup';
import { data } from './components/app-sidebar';

// 2. Import tất cả các Pages (Giao diện tính năng)
import NhapNguoiHien from "./pages/nhapnguoihien";
import { useAuthStore } from './stores/useAuthStore';
import Dashboard from './pages/dashboard';
// 3. Tạo bảng ánh xạ: URL nào -> Component đó
const componentMapping = {
  "/nguoi-hien-mau/nhap-thong-tin": <NhapNguoiHien />,
  "/tong-quan/dashboard": <Dashboard />
};

function App() {
  const { user } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          /* KHỐI KHI ĐÃ ĐĂNG NHẬP */
          <>
            <Route path="/" element={<Navigate to="/tong-quan/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/tong-quan/dashboard" replace />} />
            
            <Route element={<Menu />}>
              {data?.navMain?.map((parent) => 
                parent.items?.map((child) => (
                  <Route
                    key={child.url}
                    path={child.url.replace(/^\//, "")}
                    element={componentMapping[child.url] || <div>Đang phát triển...</div>}
                  />
                ))
              )}
            </Route>
            {/* Nếu đang đăng nhập mà gõ bậy bạ, đẩy về dashboard */}
            <Route path="*" element={<Navigate to="/tong-quan/dashboard" replace />} />
          </>
        ) : (
          /* KHỐI KHI CHƯA ĐĂNG NHẬP */
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* THẦN CHÚ QUAN TRỌNG: Khi user = null, bất kể URL hiện tại là gì 
                (kể cả /tong-quan/dashboard), nó sẽ rơi vào dấu * này và bị ép về /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

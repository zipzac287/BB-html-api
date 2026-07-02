import { toast, Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Menu from './pages/menu';
import Signup from './pages/signup';
import { data } from './components/app-sidebar';

// 2. Import tất cả các Pages (Giao diện tính năng)
import NhapNguoiHien from "./pages/nhapnguoihien";
// 3. Tạo bảng ánh xạ: URL nào -> Component đó
const componentMapping = {
  "/nguoi-hien-mau/nhap-thong-tin": <NhapNguoiHien />
};

function App() {
  return (
    <>
    <BrowserRouter>
      {/*auth*/} 
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"  element={<Menu />}>
        
      {/*menu-nguoi-hien-mau*/}
        {/* Khi người dùng vào trang chủ "/", tự động chuyển hướng sang trang nhập thông tin */}
          <Route index element={<Navigate to="/nguoi-hien-mau/nhap-thong-tin" replace />} />

          {/* LƯU Ý 2: Đây là các trang con (Sub-routes). 
              Vì nó nằm lồng bên trong Route Cha (path="/") nên khi chạy, 
              React Router sẽ giữ nguyên Sidebar của Menu và chỉ nạp ruột trang này vào ô <Outlet />.
          
              Mẹo: Ở đây thuộc tính 'path' bạn KHÔNG để dấu "/" ở đầu chuỗi nhé.
          */}
          <Route path="nguoi-hien-mau/nhap-thong-tin" element={<NhapNguoiHien />}/>
          
          {/* Sau này thêm các trang khác thì viết tiếp ở đây, vẫn nằm TRONG thẻ đóng </Route> của Menu */}
          {/* <Route path="quan-ly-kho-tho/chiet-tach" element={<ChietTachKhoTho />} /> */}
        </Route>
        {/* Trang 404 nằm ngoài hệ thống nếu cần */}
        <Route path="*" element={<div>Trang không tồn tại</div>} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

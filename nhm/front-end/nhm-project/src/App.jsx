import { toast, Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Menu from './pages/menu';
import Signup from './pages/signup';

function App() {
  return (
    <>
    <BrowserRouter>
      {/*auth*/} 
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/menu"  element={<Menu />} />
        <Route path="/signup" element={<Signup />} />
      {/*menu-nguoi-hien-mau*/}
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

import { toast, Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Menu from './pages/menu';

function App() {
  return (
    <>
    <BrowserRouter>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/menu"  element={<Menu />} />

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;

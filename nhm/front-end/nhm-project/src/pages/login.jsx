import React from 'react';
import { Toaster, toast } from 'sonner';

const Login = () => {
    return (

<div className="min-h-screen w-full relative bg-black">
    {/* X Organizations Black Background with Top Glow */}
    <div
      className="absolute inset-0 z-0"
      style={{
       background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
      }}
    />
  
    {/* Your Content/Components */}
   <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
      <div className="text-center bg-clip-text">
  
          <h1 className="font-mono p-6 mb-2">
            Hệ Thống Ngân Hàng Máu
          </h1>
      </div>
      <div className="card-glass w-full max-w-md p-8 relative z-10">
        
          <p className="text-content-secondary text-sm">
            Đăng nhập để quản lý kho máu và điều phối
          </p>
        

        {/* Form Đăng Nhập */}
        <form className="flex flex-col gap-5">
          
          {/* Input Nhóm 1 */}
          <div className="flex flex-col gap-2">
            <label className="font-display text-sm font-medium text-content-secondary">
              Tài khoản / Email <span className="text-blood">*</span>
            </label>
            {/* Sử dụng class .input có sẵn trong index.css của bạn */}
            <input 
              type="email" 
              className="input" 
              placeholder="admin@bloodbank.com"
            />
          </div>

          {/* Input Nhóm 2 */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-display text-sm font-medium text-content-secondary">
                Mật khẩu <span className="text-blood">*</span>
              </label>
              <a href="#" className="text-xs text-blood hover:text-blood-bright transition-colors">
                Quên mật khẩu?
              </a>
            </div>
            {/* Sử dụng class .input */}
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
            />
          </div>

          {/* Nút Đăng nhập - Sử dụng class .btn-primary, .btn-xl, .w-full từ CSS của bạn */}
          <button type="button" className="btn btn-primary btn-xl w-full mt-4">
            Đăng Nhập Vào Hệ Thống
          </button>

        </form>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-content-muted shadow-glow">
            Bảo mật y tế cấp độ cao nhất. Mọi truy cập đều được ghi log.
          </p>
        </div>

      </div>
    </div>
  </div>

   
  );
};

export default Login;
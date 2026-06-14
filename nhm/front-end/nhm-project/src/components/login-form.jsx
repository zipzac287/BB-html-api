import React from 'react';
import { GalleryVerticalEnd } from "lucide-react";

// Hàm bổ trợ kết hợp class tương tự như cn() của Shadcn
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// --- MOCK CÁC COMPONENT SHADCN UI ĐƯỢC TỐI ƯU HÓA ĐỘ TƯƠNG PHẢN (DARK MODE) ---

const Button = ({ className, variant, children, ...props }) => {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer w-full",
        variant === "outline"
          ? "border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-200 hover:text-zinc-50 shadow-sm"
          : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      {...props}
    />
  );
};

const FieldGroup = ({ className, ...props }) => {
  return <div className={cn("flex flex-col gap-5", className)} {...props} />;
};

const Field = ({ className, ...props }) => {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
};

const FieldLabel = ({ className, ...props }) => {
  return (
    <label
      className={cn("text-xs font-medium text-zinc-300 tracking-wide", className)}
      {...props}
    />
  );
};

const FieldSeparator = ({ className, children, ...props }) => {
  return (
    <div className={cn("relative flex py-1 items-center justify-center", className)} {...props}>
      <div className="flex-grow border-t border-zinc-800/80"></div>
      <span className="flex-shrink mx-4 text-xs text-zinc-500 font-normal">{children}</span>
      <div className="flex-grow border-t border-zinc-800/80"></div>
    </div>
  );
};

const FieldDescription = ({ className, ...props }) => {
  return (
    <div
      className={cn("text-xs text-zinc-400 mt-2", className)}
      {...props}
    />
  );
};

// --- COMPONENT LOGIN FORM CHUẨN SHADCN CỦA BẠN ---

export function LoginForm({ className, ...props }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý sự kiện submit ở đây
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Đăng nhập tài khoản
          </h1>
          <p className="text-sm text-balance text-zinc-400">
            Nhập email của bạn bên dưới để đăng nhập vào hệ thống
          </p>
        </div>
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700"
          />
        </Field>
        
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <a href="#" className="ml-auto text-xs text-sky-400 hover:text-sky-300 transition-colors underline-offset-4 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700" 
          />
        </Field>
        
        <Field>
          <Button type="submit">Đăng nhập</Button>
        </Field>
        
        <FieldSeparator>Hoặc tiếp tục với</FieldSeparator>
        
        <Field>
          <Button variant="outline" type="button">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            Đăng nhập với GitHub
          </Button>
          
          <FieldDescription className="text-center text-zinc-400">
            Chưa có tài khoản?{" "}
            <a href="#" className="text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-4">
              Đăng ký ngay
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

// --- TRANG LAYOUT CHÍNH ---

export default function App() {
  return (
    <div className="dark min-h-screen w-full relative bg-black text-zinc-100 flex flex-col font-sans overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Glow Hiệu Ứng Nền (Top Glow & Ambient Radial) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56, 189, 248, 0.15), transparent 60%), radial-gradient(circle 50vw at 50% 100vw, rgba(15, 23, 42, 0.5), #000000)",
        }}
      />
      
      {/* Grid Pattern tạo chiều sâu cho nền */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Layout Grid */}
      <div className="grid min-h-screen lg:grid-cols-2 relative z-10">
        
        {/* Cột trái: Form & Brand */}
        <div className="flex flex-col gap-6 p-6 md:p-10 justify-between">
          
          {/* Logo & Brand */}
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2.5 font-semibold text-lg text-zinc-100 hover:text-zinc-200 transition-colors group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-200">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="tracking-tight">Acme Inc.</span>
            </a>
          </div>

          {/* Form Container với Card bao ngoài có tương phản cao */}
          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-sm p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-2xl">
              <LoginForm />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center md:text-left text-xs text-zinc-600">
            &copy; 2026 Acme Inc. Bảo lưu mọi quyền.
          </div>
        </div>

        {/* Cột phải: Panel trang trí */}
        <div className="relative hidden lg:block bg-zinc-950 border-l border-zinc-900/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex flex-col items-center justify-center p-12 text-center">
            
            <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-md flex flex-col gap-6 items-center">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`size-12 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                      i === 4 
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {i === 4 && <GalleryVerticalEnd className="size-5" />}
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                Giải pháp quản trị tổ chức tối ưu
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tích hợp nền tảng phân tích nâng cao giúp vận hành và phân phối cơ sở dữ liệu doanh nghiệp một cách an toàn, linh hoạt và nhanh chóng hơn bao giờ hết.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
import React from 'react';
import { Toaster, toast } from 'sonner';
import { LoginForm } from '@/components/login-form';
import { GalleryVerticalEnd } from "lucide-react"

const Login = () => {
    return (
<div className="min-h-screen w-full relative">
  {/* Radial Gradient Background from Top */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
    }}
  />

    <div className='min-h-screen flex w-full items-center justify-center relative z-10'>
      <div className='w-full max-w-xl p-10 mx-auto space-y-6'>
        <LoginForm />
      </div>
    </div>
  </div>

   
  );
};

export default Login;
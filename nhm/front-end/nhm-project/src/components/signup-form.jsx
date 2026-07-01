"use client"
import React, { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore";
import {z} from 'zod';
import { useNavigate } from "react-router-dom";

const signupSchema = z.object({
  username: z.string().min(3,'Tên đăng nhập có ít nhất 3 ký tự'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có 6 ký tự trở lên')
    .regex(/[A-Z]/,'Mật khẩu phải có ký tự in hoa')
    .regex(/[a-z]/,'Mật khẩu phải có ký tự in thường')
    .regex(/[@#$%!&?*]/,'Mật khẩu phải có ký tự đặc biệt')
});

export function SignupForm({
  className,
  ...props
}) {
  const [formData, setformData] = useState({
    username: '',
    password: ''
  });
  const [err, seterr] = useState([]);
  const { signUp, loading } = useAuthStore();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name, value} = e.target;
    setformData({...formData, [name]: value});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    seterr('');
  
  const validation = signupSchema.safeParse(formData);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const allError = Object.values(fieldErrors).flat();
    seterr(allError);
    return;
  }
  try {
    const result = await signUp(validation.data);
    navigate('/login');
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
    seterr(errorMessage)
  }
};

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a href="#" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
            </a>
            <h1 className="text-xl font-bold">Đăng ký tài khoản Ngân hàng máu</h1>
            <FieldDescription>
              Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input 
              name="username" 
              type="text" 
              placeholder="Tên tài khoản" 
              required
              value= {formData.username}
              onChange={handleChange}/>
          </Field>
          <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                </div>
                <Input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required
                value= {formData.password}
                onChange={handleChange}/>
          </Field>
          <Field>
            <Button type="submit">Tạo tài khoản</Button>
          </Field>
          {/* 🔴 Nơi hiển thị thông báo lỗi của Zod hoặc của Backend */}
      {err?.length>0 &&
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-600 text-sm font-medium text-left whitespace-pre-line space-y-1">
        ⚠️ {err}
        </div>}
          <FieldSeparator>hoặc</FieldSeparator>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

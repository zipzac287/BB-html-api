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
import { authApi } from "@/api/authApi.js";

export function SignupForm({
  className,
  ...props
}) {
  const [formData, setformData] = useState({
    username: '',
    password: ''
  });
  const [err, seterr] = useState('');
  const [loading,setLoading] = useState(false);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setformData({...formData, [name]: value});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    seterr('');
    
  try {
    
    setLoading(true);

    const result = await authApi.signup({
      username: formData.username,
      password: formData.password
    })
    alert(result.message || "Đăng ký thành công");

  } catch (error) {
    console.error(`Chi tiết lỗi API:`, error.response?.data);
    const errMassage = error.response?.data?.message || "Đăng ký thất bại!";
    alert(errMassage);
  } finally {
    setLoading(false);
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

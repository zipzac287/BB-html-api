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
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';


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
  const navigate = useNavigate();

  const { signUp } = useAuthStore();
    const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting}} = useForm({
      resolver: zodResolver(signupSchema),
      defaultValues: { username: "", password: ""},
    });
    const onSubmit = async (data) => {
      // goi backend để signup
      try {
        await signUp(data);
        navigate("/menu"); 
      } catch (error) {
        console.error("Đăng nhập thất bại tại Form:", error);
      }
      
    };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              {...register("username")}
              />
              {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
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
                {...register("password")}/>
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>Tạo tài khoản</Button>
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

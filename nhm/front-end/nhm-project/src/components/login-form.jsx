import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button.jsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/useAuthStore";
import axiosClient from "@/api/axiosClient";
import { useState } from "react";
import { useNavigate } from "react-router"
import {z} from 'zod';
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

const signInSchema = z.object({
  username: z.string().min(3,"Tên đăng nhập có ít nhất 3 ký tự"),
  password: z.string().min(6, "Password có ít nhất 6 ký tự")
});

export function LoginForm({
  className,
  ...props
}) {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const {
  register,
  handleSubmit,
  formState: {errors, isSubmitting}} = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: ""},
  });
  const onSubmit = async (data) => {
    // goi backend để signin
    try {
      await signIn(data);
    navigate("/menu"); 
    } catch (error) {
      console.error("Đăng nhập thất bại tại Form:", error);
    }
    
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Đăng nhập phần mềm Ngân hàng máu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Tên tài khoản</FieldLabel>
                <Input 
                id="username" 
                type="text" 
                placeholder="Số tài khoản" 
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
                  <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
                <Input 
                id="password" 
                type="password" 
                placeholder="Password" 
                required
                {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button 
                type="submit"
                disabled={isSubmitting}
                >
                  Đăng nhập
                  </Button>
                <FieldDescription className="text-center">
                  Chưa có tài khoản? <a href="/signup">Đăng ký</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}


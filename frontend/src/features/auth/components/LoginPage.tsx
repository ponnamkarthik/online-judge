import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await mutateAsync(values);
      navigate("/");
    } catch (err) {
      type ApiError = {
        response?: { data?: { error?: { message?: string } } };
      };
      const message =
        (err as ApiError)?.response?.data?.error?.message || "Login failed";
      setServerError(message);
    }
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="mx-auto w-full max-w-sm">
            <div className="px-6 pt-6">
              <div className="font-brand text-2xl font-semibold tracking-tight">
                CodeArena
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onSubmit} noValidate>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                    <FieldError errors={[errors.email]} />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                    />
                    <FieldError errors={[errors.password]} />
                  </FieldContent>
                </Field>
                {serverError && <FieldError>{serverError}</FieldError>}
                <Button className="w-full" disabled={isPending} type="submit">
                  Sign in
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link className="underline" to="/register">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerUser } from "@/hooks/api/auth/RegisterUser";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { FormField } from "@/components/auth/FormField";

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError("");

    try {
      await registerUser(data);
      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <FormField
        id="username"
        label="Username"
        placeholder="johndoe"
        register={register}
        errors={errors}
        disabled={isLoading}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
        register={register}
        errors={errors}
        disabled={isLoading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        register={register}
        errors={errors}
        disabled={isLoading}
      />

      <FormField
        id="confirmPassword"
        label="Konfirmasi Password"
        type="password"
        placeholder="••••••••"
        register={register}
        errors={errors}
        disabled={isLoading}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mendaftar...
          </>
        ) : (
          "Daftar"
        )}
      </Button>

      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Login di sini
        </Link>
      </p>
    </form>
  );
};

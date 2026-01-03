"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SuccessAlert } from "@/components/auth/SuccessAlert";
import { LoginForm } from "./components/LoginForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(
    () => searchParams.get("registered") === "true",
  );

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <AuthCard
      title="Selamat Datang Kembali"
      subtitle="Login untuk melanjutkan percakapan"
    >
      {showSuccess && (
        <div className="mb-4">
          <SuccessAlert message="Registrasi berhasil! Silakan login." />
        </div>
      )}
      <LoginForm />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "./components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Buat Akun Baru"
      subtitle="Daftar untuk mulai chatting dengan teman-teman"
    >
      <RegisterForm />
    </AuthCard>
  );
}

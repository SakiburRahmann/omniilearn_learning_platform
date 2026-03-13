"use client";

import RegisterForm from "@/components/auth/register-form";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Refined clean layout - logo removed as per user request */}

      <RegisterForm />
    </div>
  );
}

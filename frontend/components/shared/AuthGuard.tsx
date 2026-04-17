"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || checked) return;
    if (!token || !user) {
      router.replace("/login");
      setChecked(true);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their own panel
      if (user.role === "ADMIN") router.replace("/admin");
      else if (user.role === "HR") router.replace("/hr");
      else if (user.role === "MD") router.replace("/md");
      else router.replace("/candidate");
      setChecked(true);
      return;
    }
    setChecked(true);
  }, [token, user?.role, allowedRoles, router, mounted]);

  if (!mounted) return null;
  if (!token || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}

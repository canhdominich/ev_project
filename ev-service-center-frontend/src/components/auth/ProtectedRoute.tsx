"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthLoading from "./AuthLoading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [] 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Không có user hoặc token, redirect sang signin
        router.push("/signin");
        return;
      }

      // Kiểm tra role nếu có yêu cầu
      if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        // Không có role cần thiết, redirect về trang chủ
        router.push("/");
        return;
      }
    }
  }, [isLoading, isAuthenticated, hasRole, requiredRoles, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return <AuthLoading />;
  }

  // Nếu có user và đã pass validation, hiển thị children
  if (isAuthenticated && (requiredRoles.length === 0 || hasRole(requiredRoles))) {
    return <>{children}</>;
  }

  // Fallback - không hiển thị gì khi đang redirect
  return null;
}

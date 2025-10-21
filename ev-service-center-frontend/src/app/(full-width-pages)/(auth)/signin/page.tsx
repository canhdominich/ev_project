import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Nền tảng quản lý đề tài & hợp tác nghiên cứu trong trường đại học",
};

export default function SignIn() {
  return <SignInForm />;
}

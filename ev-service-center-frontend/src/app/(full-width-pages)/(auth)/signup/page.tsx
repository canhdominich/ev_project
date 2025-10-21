import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Nền tảng quản lý đề tài & hợp tác nghiên cứu trong trường đại học",
};

export default function SignUp() {
  return <SignUpForm />;
}

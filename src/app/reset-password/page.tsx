import type { Metadata } from "next";
import { ResetPassword } from "@/components/reset-password/reset-password";

export const metadata: Metadata = {
  title: "Reset password · Zero",
  description: "Choose a new password for your N-Zero account.",
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}

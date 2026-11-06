import type { Metadata } from "next";
import { LinkExpired } from "@/components/link-expired/link-expired";

export const metadata: Metadata = {
  title: "Link expired · Zero",
  description: "This verification link has expired. Sign up again to get a new one.",
};

export default function LinkExpiredPage() {
  return <LinkExpired />;
}

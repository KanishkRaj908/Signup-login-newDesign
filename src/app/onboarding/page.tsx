import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = {
  title: "Onboarding · Zero",
  description: "Tell us a little about you to set up N-Zero.",
};

export default function OnboardingPage() {
  return <Onboarding />;
}

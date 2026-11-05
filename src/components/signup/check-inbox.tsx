"use client";

import { useEffect, useState } from "react";
import { GmailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/page-title";
import { Spinner } from "@/components/ui/spinner";
import { TextButton, TextPrompt } from "@/components/ui/text-button";

/** Seconds before another link can be sent. */
const RESEND_AFTER_S = 60;
const SEND_MS = 900;

type Props = {
  email: string;
  onBack: () => void;
  /** stands in for following the emailed link in this prototype */
  onOpenLink: () => void;
};

/** "Check your inbox" after asking for a password reset link, with a resend cooldown. */
export function CheckInbox({ email, onBack, onOpenLink }: Props) {
  const [left, setLeft] = useState(RESEND_AFTER_S);
  const [sending, setSending] = useState(false);
  const gmail = /@(gmail|googlemail)\.com$/i.test(email);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  function resend() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setLeft(RESEND_AFTER_S);
    }, SEND_MS);
  }

  const cooling = left > 0;

  return (
    <div className="w-[360px] max-w-full flex flex-col items-center text-center">
      <PageTitle>Check your inbox</PageTitle>
      <p className="m-0 mt-3 text-[14px] leading-5 text-tertiary">
        We’ve sent a verification link to
        <br />
        <strong className="font-semibold text-ink break-all">{email}</strong>
      </p>

      <div className="w-full mt-8 flex flex-col gap-3">
        {gmail && (
          <Button variant="blockSoft" onClick={onOpenLink}>
            <GmailIcon />
            Open Gmail
          </Button>
        )}
        <Button
          variant="block"
          className="disabled:opacity-50"
          disabled={cooling || sending}
          aria-busy={sending}
          aria-live="polite"
          onClick={resend}
        >
          {sending ? <Spinner className="size-5" /> : cooling ? `Resend in ${left}s` : "Resend Email"}
        </Button>
      </div>

      <TextPrompt>
        {"Back to "}
        <TextButton onClick={onBack}>Log in</TextButton>
      </TextPrompt>
    </div>
  );
}

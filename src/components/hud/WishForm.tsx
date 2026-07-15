"use client";

import { useState, type FormEvent } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { submitWish } from "@/lib/burialApi";
import { STR } from "@/lib/strings.ru";
import { Button } from "./ui";

type Status = "idle" | "sending" | "done" | "rejected" | "failed";

/** Пожелание паре — прямо из модалки сертификата */
export function WishForm() {
  const burial = useRitualStore((s) => s.burial);
  const markWishSent = useRitualStore((s) => s.markWishSent);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (!burial || burial.approx) return null; // без честного id пожелание не привязать
  if (burial.wishSent || status === "done") {
    return (
      <p className="mt-2 text-center text-sm font-medium text-grass-dark">
        {STR.wishForm.thanks}
      </p>
    );
  }

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const wish = value.trim();
    if (!wish || status === "sending") return;
    setStatus("sending");
    const outcome = await submitWish(burial.id, wish);
    if (outcome === "ok" || outcome === "duplicate") {
      markWishSent();
      setStatus("done");
    } else if (outcome === "rejected") {
      setStatus("rejected");
    } else {
      setStatus("failed");
    }
  };

  return (
    <form onSubmit={send} className="mt-3 border-t border-ink/10 pt-3">
      <label className="block text-sm font-bold" htmlFor="wish-input">
        {STR.wishForm.title}
      </label>
      <p className="text-xs opacity-60">{STR.wishForm.hint}</p>
      <div className="mt-2 flex gap-2">
        <input
          id="wish-input"
          value={value}
          maxLength={140}
          onChange={(e) => {
            setValue(e.target.value);
            if (status === "rejected" || status === "failed") setStatus("idle");
          }}
          placeholder={STR.wishForm.placeholder}
          className="min-w-0 flex-1 rounded-2xl border-2 border-ink/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-sausage"
        />
        <Button type="submit" disabled={status === "sending" || !value.trim()}>
          {STR.wishForm.submit}
        </Button>
      </div>
      {status === "rejected" && (
        <p className="mt-1 text-xs font-medium text-sausage-dark">
          {STR.wishForm.rejected}
        </p>
      )}
      {status === "failed" && (
        <p className="mt-1 text-xs font-medium text-sausage-dark">
          {STR.errors.offline}
        </p>
      )}
    </form>
  );
}

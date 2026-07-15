"use client";

import { useState, type FormEvent } from "react";
import { useRitualStore } from "@/store/ritualStore";
import { STR } from "@/lib/strings.ru";
import { Button } from "./ui";

/** Опциональное имя гостя — попадёт в сертификат и на стену */
export function NameForm() {
  const [value, setValue] = useState(
    () => useRitualStore.getState().guestName,
  );
  const setGuestName = useRitualStore((s) => s.setGuestName);
  const advance = useRitualStore((s) => s.advance);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    setGuestName(value);
    advance();
  };

  const submitAnonymous = () => {
    setGuestName("");
    advance();
  };

  return (
    <form
      onSubmit={submit}
      className="pointer-events-auto w-full max-w-md animate-fade-up rounded-3xl bg-cream/95 p-5 shadow-xl backdrop-blur"
    >
      <h2 className="text-lg font-bold">{STR.nameForm.title}</h2>
      <p className="mt-0.5 text-sm opacity-70">{STR.nameForm.hint}</p>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={40}
        placeholder={STR.nameForm.placeholder}
        aria-label={STR.nameForm.placeholder}
        className="mt-3 w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-base outline-none transition focus:border-sausage"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={submitAnonymous}
          className="pointer-events-auto text-xs font-medium text-ink/60 underline underline-offset-2 hover:text-ink"
        >
          {STR.nameForm.anonymous}
        </button>
        <Button type="submit">{STR.nameForm.submit}</Button>
      </div>
    </form>
  );
}

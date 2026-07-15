"use client";

import { useRitualStore } from "@/store/ritualStore";
import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";
import { SausageFace } from "@/components/SausageFace";
import { Button } from "./ui";
import { NameForm } from "./NameForm";

const LINES = STR.dialogue.lines(wedding.coupleLabel);

/** Приветственный диалог маскота; после реплик — форма имени */
export function DialogueBubble() {
  const step = useRitualStore((s) => s.dialogueStep);
  const nextDialogue = useRitualStore((s) => s.nextDialogue);
  const skipDialogue = useRitualStore((s) => s.skipDialogue);

  if (step >= LINES.length) {
    return <NameForm />;
  }

  const isLast = step === LINES.length - 1;

  return (
    <div
      key={step}
      className="pointer-events-auto w-full max-w-md animate-fade-up rounded-3xl bg-cream/95 p-4 shadow-xl backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <SausageFace className="w-16 shrink-0 -scale-x-100" />
        <p className="pt-1 text-[15px] font-medium leading-snug">
          {LINES[step] ?? ""}
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        {!isLast && (
          <Button variant="ghost" onClick={skipDialogue}>
            {STR.dialogue.skip}
          </Button>
        )}
        <Button onClick={nextDialogue}>
          {isLast ? STR.dialogue.start : STR.dialogue.next}
        </Button>
      </div>
    </div>
  );
}

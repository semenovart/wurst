import { describe, it, expect, beforeEach } from "vitest";
import { createStore, type StoreApi } from "zustand";
import {
  createRitualState,
  TAMP_GOAL,
  type RitualState,
} from "./ritualStore";

let store: StoreApi<RitualState>;

beforeEach(() => {
  store = createStore<RitualState>(createRitualState);
});

const s = () => store.getState();

describe("машина фаз ритуала", () => {
  it("hello → chooseSpot по advance", () => {
    s().advance();
    expect(s().phase).toBe("chooseSpot");
  });

  it("chooseSpot не пропускает без выбранного места", () => {
    s().advance();
    s().advance(); // guard: spot === null
    expect(s().phase).toBe("chooseSpot");
  });

  it("confirmSpot фиксирует место и переводит в dig", () => {
    s().advance();
    s().setCandidateSpot([1.2, -0.8]);
    s().confirmSpot();
    expect(s().phase).toBe("dig");
    expect(s().spot).toEqual([1.2, -0.8]);
    expect(s().candidateSpot).toBeNull();
  });

  it("dig не выпускает, пока яма не выкопана", () => {
    s().advance();
    s().setCandidateSpot([0, 0]);
    s().confirmSpot();
    s().setDigProgress(0.7);
    s().advance();
    expect(s().phase).toBe("dig");
    s().setDigProgress(1);
    s().advance();
    expect(s().phase).toBe("place");
  });

  it("полный путь до сертификата", () => {
    s().advance();
    s().setCandidateSpot([0, 0]);
    s().confirmSpot();
    s().setDigProgress(1);
    s().advance(); // place
    s().advance(); // fill (у place нет guard'а — сосиска уложена скриптом)
    s().setFillProgress(1);
    s().advance(); // tamp
    for (let i = 0; i < TAMP_GOAL; i++) s().tamp();
    expect(s().phase).toBe("ceremony"); // tamp сам вызывает advance на цели
    s().advance();
    expect(s().phase).toBe("certificate");
    s().advance(); // из certificate пути нет — no-op
    expect(s().phase).toBe("certificate");
  });

  it("tamp вне фазы tamp — no-op", () => {
    s().tamp();
    expect(s().tampCount).toBe(0);
  });

  it("диалог: skip уводит сразу к форме имени", () => {
    s().skipDialogue();
    expect(s().dialogueStep).toBeGreaterThanOrEqual(3);
    expect(s().phase).toBe("hello");
  });

  it("имя обрезается до 40 символов и триммится", () => {
    s().setGuestName("  " + "а".repeat(60) + "  ");
    expect(s().guestName.length).toBe(40);
  });
});

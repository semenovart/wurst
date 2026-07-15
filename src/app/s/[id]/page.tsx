import type { Metadata } from "next";
import Link from "next/link";
import { getRedis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { wedding } from "@/config/wedding.config";
import { STR } from "@/lib/strings.ru";

type BurialHash = { n?: number | string; name?: string };

async function getBurial(id: string): Promise<{ n: number } | null> {
  if (!/^[0-9a-f]{10}$/.test(id)) return null;
  try {
    const burial = await getRedis().hgetall<BurialHash>(keys().burial(id));
    if (!burial) return null;
    return { n: Number(burial.n ?? 0) };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const burial = await getBurial(id);
  const title = burial
    ? STR.meta.shareTitle(burial.n, wedding.coupleGenitive)
    : STR.meta.title(wedding.coupleLabel);
  return {
    title,
    description: STR.meta.shareDescription,
  };
}

/** Страница шаринга: большой сертификат + приглашение закопать свою */
export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const burial = await getBurial(id);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky to-sky-deep px-4 py-10 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cream/80">
        {STR.splash.agency}
      </p>
      {burial && (
        <h1 className="max-w-xl text-2xl font-bold text-cream drop-shadow sm:text-3xl">
          {STR.meta.shareTitle(burial.n, wedding.coupleGenitive)}
        </h1>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/s/${id}/opengraph-image`}
        alt={STR.certificate.title}
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
      />
      <p className="max-w-md text-sm text-cream/85">
        {STR.meta.shareDescription}
      </p>
      <Link
        href="/"
        className="touch-manipulation rounded-full bg-sausage px-7 py-3.5 text-base font-bold text-cream shadow-lg transition hover:bg-sausage-dark active:scale-95"
      >
        {STR.meta.shareCta}
      </Link>
    </main>
  );
}

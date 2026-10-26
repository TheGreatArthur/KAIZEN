import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Calligraphie — Kanji" };

export default function Page() {
  return <ComingSoon title="Calligraphie — Kanji" glyph="字" />;
}

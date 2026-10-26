import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Lecture — Kanji" };

export default function Page() {
  return <ComingSoon title="Lecture — Kanji" glyph="字" />;
}

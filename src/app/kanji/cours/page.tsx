import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Cours de kanji" };

export default function Page() {
  return <ComingSoon title="Cours de kanji" glyph="字" />;
}

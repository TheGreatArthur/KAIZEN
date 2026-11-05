import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Calligraphie des kanji" };

export default function Page() {
  return <ComingSoon title="Calligraphie des kanji" glyph="字" />;
}

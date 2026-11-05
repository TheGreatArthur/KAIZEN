import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Kanji" };

export default function Page() {
  return <ComingSoon title="Kanji" glyph="字" />;
}

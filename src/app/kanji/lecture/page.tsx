import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Lecture des kanji" };

export default function Page() {
  return <ComingSoon title="Lecture des kanji" glyph="字" />;
}

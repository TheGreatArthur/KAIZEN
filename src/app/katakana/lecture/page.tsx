import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Lecture — Katakana" };

export default function Page() {
  return <ComingSoon title="Lecture — Katakana" glyph="ア" />;
}

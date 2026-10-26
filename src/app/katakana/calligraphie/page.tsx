import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Calligraphie — Katakana" };

export default function Page() {
  return <ComingSoon title="Calligraphie — Katakana" glyph="ア" />;
}

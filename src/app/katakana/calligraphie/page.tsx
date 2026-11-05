import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Calligraphie des katakana" };

export default function Page() {
  return <ComingSoon title="Calligraphie des katakana" glyph="ア" />;
}

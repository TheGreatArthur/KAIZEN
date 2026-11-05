import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Cours de katakana" };

export default function Page() {
  return <ComingSoon title="Cours de katakana" glyph="ア" />;
}

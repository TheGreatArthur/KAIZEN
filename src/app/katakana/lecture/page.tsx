import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Lecture des katakana" };

export default function Page() {
  return <ComingSoon title="Lecture des katakana" glyph="ア" />;
}

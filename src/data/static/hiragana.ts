import type { Character } from "@/domain/character";
import { buildCharacters, type KanaRowDef } from "./kana";

/** Stroke counts as defined by the KanjiVG files in /public/kanjivg. */
const STROKES: Record<string, number> = {
  あ: 3, い: 2, う: 2, え: 2, お: 3,
  か: 3, き: 4, く: 1, け: 3, こ: 2,
  さ: 3, し: 1, す: 2, せ: 3, そ: 1,
  た: 4, ち: 2, つ: 1, て: 1, と: 2,
  な: 4, に: 3, ぬ: 2, ね: 2, の: 1,
  は: 3, ひ: 1, ふ: 4, へ: 1, ほ: 4,
  ま: 3, み: 2, む: 3, め: 2, も: 3,
  や: 3, ゆ: 2, よ: 2,
  ら: 2, り: 2, る: 1, れ: 2, ろ: 1,
  わ: 2, を: 3, ん: 1,
  が: 5, ぎ: 6, ぐ: 3, げ: 5, ご: 4,
  ざ: 5, じ: 3, ず: 4, ぜ: 5, ぞ: 3,
  だ: 6, ぢ: 4, づ: 3, で: 3, ど: 4,
  ば: 5, び: 3, ぶ: 6, べ: 3, ぼ: 6,
  ぱ: 4, ぴ: 2, ぷ: 5, ぺ: 2, ぽ: 5,
  ゃ: 3, ゅ: 2, ょ: 2,
};

const ROWS: KanaRowDef[] = [
  // Main kana (gojūon)
  { row: "a", group: "main", cells: [["あ", ["a"]], ["い", ["i"]], ["う", ["u"]], ["え", ["e"]], ["お", ["o"]]] },
  { row: "ka", group: "main", cells: [["か", ["ka"]], ["き", ["ki"]], ["く", ["ku"]], ["け", ["ke"]], ["こ", ["ko"]]] },
  { row: "sa", group: "main", cells: [["さ", ["sa"]], ["し", ["shi", "si"]], ["す", ["su"]], ["せ", ["se"]], ["そ", ["so"]]] },
  { row: "ta", group: "main", cells: [["た", ["ta"]], ["ち", ["chi", "ti"]], ["つ", ["tsu", "tu"]], ["て", ["te"]], ["と", ["to"]]] },
  { row: "na", group: "main", cells: [["な", ["na"]], ["に", ["ni"]], ["ぬ", ["nu"]], ["ね", ["ne"]], ["の", ["no"]]] },
  { row: "ha", group: "main", cells: [["は", ["ha"]], ["ひ", ["hi"]], ["ふ", ["fu", "hu"]], ["へ", ["he"]], ["ほ", ["ho"]]] },
  { row: "ma", group: "main", cells: [["ま", ["ma"]], ["み", ["mi"]], ["む", ["mu"]], ["め", ["me"]], ["も", ["mo"]]] },
  { row: "ya", group: "main", cells: [["や", ["ya"]], null, ["ゆ", ["yu"]], null, ["よ", ["yo"]]] },
  { row: "ra", group: "main", cells: [["ら", ["ra"]], ["り", ["ri"]], ["る", ["ru"]], ["れ", ["re"]], ["ろ", ["ro"]]] },
  { row: "wa", group: "main", cells: [["わ", ["wa"]], null, null, null, ["を", ["wo", "o"]], ["ん", ["n", "nn"]]] },
  // Dakuten / handakuten
  { row: "ga", group: "dakuten", cells: [["が", ["ga"]], ["ぎ", ["gi"]], ["ぐ", ["gu"]], ["げ", ["ge"]], ["ご", ["go"]]] },
  { row: "za", group: "dakuten", cells: [["ざ", ["za"]], ["じ", ["ji", "zi"]], ["ず", ["zu"]], ["ぜ", ["ze"]], ["ぞ", ["zo"]]] },
  { row: "da", group: "dakuten", cells: [["だ", ["da"]], ["ぢ", ["ji", "di"], "di"], ["づ", ["zu", "du"], "du"], ["で", ["de"]], ["ど", ["do"]]] },
  { row: "ba", group: "dakuten", cells: [["ば", ["ba"]], ["び", ["bi"]], ["ぶ", ["bu"]], ["べ", ["be"]], ["ぼ", ["bo"]]] },
  { row: "pa", group: "dakuten", cells: [["ぱ", ["pa"]], ["ぴ", ["pi"]], ["ぷ", ["pu"]], ["ぺ", ["pe"]], ["ぽ", ["po"]]] },
  // Combinations (yōon)
  { row: "kya", group: "combination", cells: [["きゃ", ["kya"]], ["きゅ", ["kyu"]], ["きょ", ["kyo"]]] },
  { row: "sha", group: "combination", cells: [["しゃ", ["sha", "sya"]], ["しゅ", ["shu", "syu"]], ["しょ", ["sho", "syo"]]] },
  { row: "cha", group: "combination", cells: [["ちゃ", ["cha", "tya", "cya"]], ["ちゅ", ["chu", "tyu", "cyu"]], ["ちょ", ["cho", "tyo", "cyo"]]] },
  { row: "nya", group: "combination", cells: [["にゃ", ["nya"]], ["にゅ", ["nyu"]], ["にょ", ["nyo"]]] },
  { row: "hya", group: "combination", cells: [["ひゃ", ["hya"]], ["ひゅ", ["hyu"]], ["ひょ", ["hyo"]]] },
  { row: "mya", group: "combination", cells: [["みゃ", ["mya"]], ["みゅ", ["myu"]], ["みょ", ["myo"]]] },
  { row: "rya", group: "combination", cells: [["りゃ", ["rya"]], ["りゅ", ["ryu"]], ["りょ", ["ryo"]]] },
  { row: "gya", group: "combination", cells: [["ぎゃ", ["gya"]], ["ぎゅ", ["gyu"]], ["ぎょ", ["gyo"]]] },
  { row: "ja", group: "combination", cells: [["じゃ", ["ja", "zya", "jya"]], ["じゅ", ["ju", "zyu", "jyu"]], ["じょ", ["jo", "zyo", "jyo"]]] },
  { row: "bya", group: "combination", cells: [["びゃ", ["bya"]], ["びゅ", ["byu"]], ["びょ", ["byo"]]] },
  { row: "pya", group: "combination", cells: [["ぴゃ", ["pya"]], ["ぴゅ", ["pyu"]], ["ぴょ", ["pyo"]]] },
];

export const HIRAGANA: Character[] = buildCharacters("hiragana", ROWS, STROKES);

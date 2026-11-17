// Test character mapping for "きょうは いい てんきですね"
// Expected: kyo u wa i i te n ki de su ne

const testWord = {
  japanese: "きょうは いい てんきですね",
  romanji: "kyou wa ii tenki desu ne"
};

// Simulate the mapping
const japaneseChars = Array.from(testWord.japanese);
console.log("Japanese chars:", japaneseChars);
console.log("Romanji:", testWord.romanji);

// Expected mapping:
// き ょ -> kyo (compound)
// う -> u
// は -> wa
// (space)
// い -> i
// い -> i
// (space)
// て -> te
// ん -> n
// き -> ki
// で -> de
// す -> su
// ね -> ne

console.log("\nExpected character map:");
const expected = [
  { japanese: "きょ", romanji: "kyo" },
  { japanese: "う", romanji: "u" },
  { japanese: "は", romanji: "wa" },
  { japanese: " ", romanji: " " },
  { japanese: "い", romanji: "i" },
  { japanese: "い", romanji: "i" },
  { japanese: " ", romanji: " " },
  { japanese: "て", romanji: "te" },
  { japanese: "ん", romanji: "n" },
  { japanese: "き", romanji: "ki" },
  { japanese: "で", romanji: "de" },
  { japanese: "す", romanji: "su" },
  { japanese: "ね", romanji: "ne" }
];

expected.forEach((item, i) => {
  console.log(`${i}: "${item.japanese}" -> "${item.romanji}"`);
});
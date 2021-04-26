import * as hangul from "hangul-js";

// https://www.npmjs.com/package/hangul-js
// https://ko.wiktionary.org/wiki/%EB%B6%80%EB%A1%9D:%EB%A1%9C%EB%A7%88%EC%9E%90_%ED%91%9C%EA%B8%B0%EB%B2%95/%EA%B5%AD%EC%96%B4

export const engHanguel = (word) => {
  const english = hangul
    .disassemble(word)
    .map((letter) =>
      Object.keys(findEng).includes(letter) ? findEng[letter] : letter
    )
    .join("");
  console.log(english);
  return english || "";
};

export default engHanguel;

const findEng = {
  ㅏ: "a",
  ㅓ: "eo",
  ㅗ: "o",
  ㅜ: "u",
  ㅡ: "eu",
  ㅣ: "i",
  ㅐ: "ae",
  ㅔ: "e",
  ㅚ: "oe",
  ㅟ: "wi",
  ㅑ: "ya",
  ㅕ: "yeo",
  ㅛ: "yo",
  ㅠ: "yu",
  // ㅐ: "yae",
  ㅖ: "ye",
  ㅘ: "wa",
  ㅙ: "wae",
  ㅝ: "wo",
  ㅞ: "we",
  ㅢ: "ui",
  ㄱ: "g",
  ㄲ: "kk",
  ㅋ: "k",
  ㄷ: "d",
  ㄸ: "tt",
  ㅌ: "t",
  ㅂ: "b",
  ㅃ: "pp",
  ㅍ: "p",
  ㅈ: "j",
  ㅉ: "jj",
  ㅊ: "ch",
  ㅅ: "s",
  ㅆ: "ss",
  ㅎ: "h",
  ㄴ: "n",
  ㅁ: "m",
  ㅇ: "ng",
  ㄹ: "r",
  ㄳ: "k",
  ㄵ: "n",
  ㄶ: "n",
  ㄺ: "k",
  ㄻ: "m",
  ㄼ: "p",
  ㄽ: "l",
  ㄾ: "l",
  ㄿ: "p",
  ㅀ: "l",
  ㅄ: "p",
};

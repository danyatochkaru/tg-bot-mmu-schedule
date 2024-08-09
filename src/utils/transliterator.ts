type TranslitAlphabet = {
  [key: string]: string;
};

class Transliterator {
  private readonly alphabet: TranslitAlphabet;
  private readonly reverseAlphabet: TranslitAlphabet;

  constructor(alphabet: TranslitAlphabet) {
    this.alphabet = alphabet;
    this.reverseAlphabet = this.createReverseAlphabet(alphabet);
  }

  private createReverseAlphabet(alphabet: TranslitAlphabet): TranslitAlphabet {
    const reverseAlphabet: TranslitAlphabet = {};
    for (const key in alphabet) {
      if (alphabet.hasOwnProperty(key)) {
        reverseAlphabet[alphabet[key]] = key;
      }
    }
    return reverseAlphabet;
  }

  public encode(text: string): string {
    return this.transliterateWithRegExp(text.toLowerCase(), this.alphabet);
  }

  public decode(text: string): string {
    return this.transliterateWithRegExp(
      text.toLowerCase(),
      this.reverseAlphabet,
    );
  }

  private transliterateWithRegExp(
    text: string,
    alphabet: TranslitAlphabet,
  ): string {
    const sortedKeys = Object.keys(alphabet).sort(
      (a, b) => b.length - a.length,
    );
    const regexPattern = sortedKeys
      .map((key) => `(${this.escapeRegExp(key)})`)
      .join('|');
    const regex = new RegExp(regexPattern, 'g');

    return text.replace(regex, (match) => alphabet[match] || match);
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default Transliterator;

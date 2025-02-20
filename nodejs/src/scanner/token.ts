import {TokenType} from './token-type.enum';

export class Token {
  constructor(public type: TokenType,
              public lexeme: string,
              public literal: string | number | boolean | null,
              public line: number) {
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
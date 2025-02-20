import {Token} from '../scanner';

export class ParserError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
    this.name = 'ParserError';
  }
}
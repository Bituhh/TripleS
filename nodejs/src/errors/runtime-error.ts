import {Token} from '../scanner';

export class RuntimeError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}
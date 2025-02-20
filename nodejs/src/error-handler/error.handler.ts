import {Token, TokenType} from '../scanner';
import {RuntimeError} from '../errors/runtime-error';
import {ErrorInstance} from '../built-ins/classes/error.class';

export class ErrorHandler {

  public hasError = false;

  constructor() {
  }

  error(line: number, message: string): void;
  error(token: Token, message: string): void;
  error(obj: Token | number, message: string) {
    if (typeof obj === 'number') {
      this.report(obj, '', message);
      return;
    }

    const token = obj as Token;
    if (token.type == TokenType.EOF) {
      this.report(token.line, 'at end', message);
    } else {
      this.report(token.line, 'at \'' + token.lexeme + '\'', message);
    }
  }

  report(line: number, where: string, message: string) {
    this.hasError = true;
    console.error(`[line ${line}] Error ${where}: ${message}`);
  }

  runtimeError(error: Error | ErrorInstance) {
    this.hasError = true;
    if (error instanceof ErrorInstance) {
      if (error.token) {
        this.error(error.token, error.toString());
        return;
      }
      console.error(error.toString());
      return;
    }

    if (error instanceof RuntimeError) {
      this.error(error.token, error.message);
      return;
    }

    console.error(error.message);
  }
}
import {Token} from '../scanner';
import {RuntimeError} from '../errors/runtime-error';
import {Value} from '../triples';

export class Environment<T = Value> {
  public values = new Map<string, T>();

  constructor(public enclosing: Environment<T> | null) {
    this.enclosing = enclosing === undefined ? null : enclosing;
  }

  define(token: Token, value: T): void;
  define(name: string, value: T): void;
  define(name: Token | string, value: T) {
    const key = typeof name === 'string' ? name : name.lexeme;
    if (this.values.has(key)) {
      if (name instanceof Token) {
        throw new RuntimeError(name, `Variable already exists with the name '${name.lexeme}'.`);
      }
      throw new Error(`Variable already exists with the name '${key}'.`);
    }
    this.values.set(key, value);
  }

  get(name: Token): T {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme) as T;
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: T) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new Error(`Undefined variable '${name.lexeme}'.`);
  }

  getAt(distance: number, lexeme: string): T {
    const value = this.ancestor(distance).values.get(lexeme);
    return (value === undefined ? null : value) as T;
  }

  ancestor(distance: number) {
    let environment: Environment<T> = this;
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing === null) {
        throw new Error('No enclosing environment found.');
      }

      environment = environment.enclosing;
    }
    return environment;
  }

  assignAt(distance: number, name: Token, value: T) {
    const environment = this.ancestor(distance);
    if (environment.values.has(name.lexeme)) {
      environment.values.set(name.lexeme, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
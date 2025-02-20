import {Callable} from '../interpreter/callable';
import {Value} from '../triples';
import {Interpreter} from '../interpreter';
import {Token} from '../scanner';
import _ from 'lodash';
import {RuntimeError} from '../errors/runtime-error';
import {Instance} from '../interpreter/instance';

export class BuiltInFunction extends Callable<Value> {
  constructor(private name: string, private func: Function, private token: Token | null) {
    super();
  }

  call(interpreter: Interpreter, args: Value[]): Value {
    try {
      return this.func(...args);
    } catch (error: any) {
      if (error instanceof RuntimeError || !this.token) {
        throw error;
      }

      throw new RuntimeError(this.token, error.message);
    }
  }

  arity(): number {
    return this.func.length;
  }

  bindInstance(instance: Instance): BuiltInFunction {
    return new BuiltInFunction(this.name, this.func.bind(instance), this.token);
  }

  toString(): string {
    return `<${this.name} function>`;
  }
}

export abstract class BuiltInInstance {
  abstract readonly name: string;
  abstract fields: { [fieldName: string]: () => Value };
  abstract methods: { [functionName: string]: Function };

  abstract __equal__(other: Value): unknown;

  abstract __notequal__(other: Value): unknown;

  clone(): BuiltInInstance {
    return _.cloneDeep(this);
  }

  hasMethod(name: string): boolean {
    return !!this.methods[name];
  }

  getMethod(name: string): BuiltInFunction;
  getMethod(token: Token): BuiltInFunction;
  getMethod(token: Token | string): BuiltInFunction {
    const name = typeof token === 'string' ? token : token.lexeme;
    const method = this.methods[name];
    if (method) {
      return new BuiltInFunction(`${this.name}.${name}`, method.bind(this), typeof token === 'string' ? null : token);
    }

    if (typeof token !== 'string') {
      throw new RuntimeError(token, `Undefined method '${name}'.`);
    }

    throw new Error(`Undefined method '${name}'.`);
  }

  _get(token: Token): Value {
    if (this.fields[token.lexeme]) {
      return this.fields[token.lexeme]();
    }

    // Methods
    const method = this.methods[token.lexeme];
    if (method) {
      return new BuiltInFunction(`${this.name}.${token.lexeme}`, method.bind(this), token);
    }

    throw new RuntimeError(token, `Undefined property '${token.lexeme}'.`);
  }

  toString(): string {
    return `<${this.name} instance>`;
  }
}

export abstract class BuiltInClass extends Callable<Value> {
  abstract readonly name: string;
  abstract readonly instance: BuiltInInstance;

  call(interpreter: Interpreter, args: Value[]): BuiltInInstance {
    if (this.instance.hasMethod('init')) {
      this.instance.getMethod('init').call(interpreter, args);
    }
    return this.instance;
  }

  arity(): number {
    if (this.instance.hasMethod('init')) {
      return this.instance.getMethod('init').arity();
    }
    return 0;
  }

  hasMethod(name: string) {
    return this.instance.hasMethod(name);
  }

  findMethod(name: string) {
    if (this.instance.hasMethod(name)) {
      return this.instance.getMethod(name);
    }

    return null;
  }

  toString(): string {
    return `<${this.name} class>`;
  }
}

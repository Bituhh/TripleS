import {Class} from './class';
import {Token} from '../scanner';
import {RuntimeError} from '../errors/runtime-error';
import {Value} from '../triples';
import {BuiltInClass} from '../built-ins';

export enum InitStatus {
  NOT_INITIALIZED,
  INITIALIZING,
  INITIALIZED,
}

class Status {
  public initialized: InitStatus = InitStatus.NOT_INITIALIZED;

  constructor(public key: string, public klass: Class | BuiltInClass) {
  }

  setInitialized() {
    this.initialized = InitStatus.INITIALIZED;
    return this;
  }

  setInitializing() {
    this.initialized = InitStatus.INITIALIZING;
    return this;
  }

  setNotInitialized() {
    this.initialized = InitStatus.NOT_INITIALIZED;
    return this;
  }
}

export class Instance {
  public fields = new Map<string, Value>();
  public statuses: Status[] = [];

  constructor(public klass: Class, public superclasses: (Class | BuiltInClass)[]) {
    this.statuses.push(new Status(klass.name, klass).setInitialized());
    for (const superclass of superclasses) {
      this.statuses.push(new Status(superclass.name, superclass));
    }
  }

  hasMethod(name: string) {
    return this.klass.hasMethod(name);
  }

  getMethod(token: Token) {
    const method = this.klass.findMethod(token.lexeme);
    if (method) return method.bindInstance(this);

    throw new RuntimeError(token, 'Undefined method \'' + token.lexeme + '\'.');
  }

  _get(name: Token) {
    // Look for a property first
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme) as Value;
    }

    // We didn't find any property so we look for a method.
    const method = this.klass.findMethod(name.lexeme);
    if (method) return method.bindInstance(this);

    throw new RuntimeError(name, 'Undefined property \'' + name.lexeme + '\'.');
  }

  set(name: Token, value: any) {
    this.fields.set(name.lexeme, value);
  }

  toString() {
    const entries: string[] = [];
    for (const [key, value] of this.fields.entries()) {
      if (key === 'className') continue;
      entries.push(`${key}: ${value == null ? 'null' : value.toString()}`);
    }
    if (entries.length === 0) return `<${this.klass.name} instance>`;
    return `<${this.klass.name} instance> ${entries.join(', ')}`;
  }
}
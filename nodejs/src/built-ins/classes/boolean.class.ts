import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {StringInstance} from './string.class';
import {NumberInstance} from './number.class';

export class BooleanInstance extends BuiltInInstance {

  static isBoolean(value: Value): value is BooleanInstance {
    return value instanceof BooleanInstance;
  }

  static toBoolean(value: Value, error?: string): boolean {
    if (value instanceof BooleanInstance) {
      return value.value!;
    }

    throw new Error(error ?? 'Expected boolean.');
  }

  readonly name = 'Boolean';

  fields = {
    value: () => this,
  };

  methods = {
    init: this.init,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  };
  private value!: boolean;

  constructor(value: boolean | undefined) {
    super();
    if (value !== undefined) {
      this.init(value);
    }
  }

  init(value: Value | boolean) {
    if (value === undefined) throw new Error('Expected boolean.');

    if (typeof value === 'boolean') {
      this.value = value;
      return this;
    }

    if (BooleanInstance.isBoolean(value)) {
      this.value = BooleanInstance.toBoolean(value);
      return this;
    }

    if (NumberInstance.isNumber(value)) {
      const number = NumberInstance.toNumber(value);
      this.value = number !== 0;
    }

    if (StringInstance.isString(value)) {
      const string = StringInstance.toString(value);
      this.value = string !== 'false' && string !== '0' && string !== '';
      return this;
    }

    if (value === null) {
      this.value = false;
      return this;
    }

    throw new Error('Expected a number, string, boolean or null.');
  }

  __equal__(other: Value): BooleanInstance {
    if (BooleanInstance.isBoolean(other)) {
      return new BooleanInstance(this.value === BooleanInstance.toBoolean(other));
    }

    return new BooleanInstance(false);
  }

  __notequal__(other: Value): BooleanInstance {
    if (BooleanInstance.isBoolean(other)) {
      return new BooleanInstance(this.value !== BooleanInstance.toBoolean(other));
    }

    return new BooleanInstance(true);
  }

  clone(): BooleanInstance {
    return new BooleanInstance(this.value);
  }

  toString(): string {
    return this.value!.toString();
  }
}

export class BooleanClass extends BuiltInClass {
  readonly instance = new BooleanInstance(undefined);
  readonly name = 'Boolean';
}

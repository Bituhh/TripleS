import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {StringInstance} from './string.class';
import {BooleanInstance} from './boolean.class';

export class NumberInstance extends BuiltInInstance {

  static isNumber(value: Value): value is NumberInstance {
    return value instanceof NumberInstance;
  }

  static toNumber(value: Value, error?: string): number {
    if (value instanceof NumberInstance) {
      return value.value;
    }

    throw new Error(error ?? 'Expected number.');
  }

  readonly name = 'Number';

  fields = {
    value: () => this,
  };
  methods = {
    init: this.init,
    __power__: this.__power__,
    __modulus__: this.__modulus__,
    __multiply__: this.__multiply__,
    __divide__: this.__divide__,
    __add__: this.__add__,
    __subtract__: this.__subtract__,
    __pipe__: this.__pipe__,
    __ampersand__: this.__ampersand__,

    // Comparison
    __less__: this.__less__,
    __lessequal__: this.__lessequal__,
    __greater__: this.__greater__,
    __greaterequal__: this.__greaterequal__,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    __negate__: this.__negate__,
    clone: this.clone,
    toString: this.toString,
  };

  private value!: number;

  constructor(value: number | undefined) {
    super();
    if (value !== undefined) {
      this.init(value);
    }
  }


  init(value: Value | number) {
    if (value === undefined) throw new Error('Expected number.');

    if (typeof value === 'number') {
      this.value = value;
      return;
    }

    if (NumberInstance.isNumber(value)) {
      this.value = NumberInstance.toNumber(value);
      return;
    }

    if (StringInstance.isString(value)) {
      const number = Number(StringInstance.toString(value));
      if (!isNaN(number)) {
        this.value = number;
        return;
      }
    }

    if (BooleanInstance.isBoolean(value)) {
      this.value = value ? 1 : 0;
      return;
    }

    if (value === null) {
      this.value = 0;
      return;
    }

    throw new Error('Expected a number, string, boolean or null.');
  }

  __power__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value ** NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __modulus__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      const number = NumberInstance.toNumber(other);
      if (number === 0) {
        throw new Error('Division by zero.');
      }
      return new NumberInstance(this.value % number);
    }

    throw new Error('Expected number.');
  }

  __multiply__(other: Value) {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value * NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __divide__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      const number = NumberInstance.toNumber(other);
      if (number === 0) {
        throw new Error('Division by zero.');
      }
      return new NumberInstance(this.value / number);
    }

    throw new Error('Expected number.');
  }

  __add__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value + NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __subtract__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value - NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __pipe__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value | NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __ampersand__(other: Value): Value {
    if (NumberInstance.isNumber(other)) {
      return new NumberInstance(this.value & NumberInstance.toNumber(other));
    }

    throw new Error('Expected number.');
  }

  __less__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      throw new Error('Expected number.');
    }

    return new BooleanInstance(this.value < NumberInstance.toNumber(other));
  }

  __lessequal__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      throw new Error('Expected number.');
    }

    return new BooleanInstance(this.value <= NumberInstance.toNumber(other));
  }

  __greater__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      throw new Error('Expected number.');
    }

    return new BooleanInstance(this.value > NumberInstance.toNumber(other));
  }

  __greaterequal__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      throw new Error('Expected number.');
    }

    return new BooleanInstance(this.value >= NumberInstance.toNumber(other));
  }

  __equal__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      return new BooleanInstance(false);
    }

    return new BooleanInstance(this.value === NumberInstance.toNumber(other));
  }

  __notequal__(other: Value): BooleanInstance {
    if (!NumberInstance.isNumber(other)) {
      return new BooleanInstance(true);
    }

    return new BooleanInstance(this.value !== NumberInstance.toNumber(other));
  }

  __negate__(): Value {
    return new NumberInstance(-this.value);
  }

  clone(): NumberInstance {
    return new NumberInstance(this.value);
  }

  toString(): string {
    return this.value.toString();
  }
}

export class NumberClass extends BuiltInClass {
  readonly instance = new NumberInstance(undefined);
  readonly name = 'Number';
}

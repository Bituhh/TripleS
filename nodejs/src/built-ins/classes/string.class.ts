import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {BooleanInstance} from './boolean.class';
import {NumberInstance} from './number.class';

export class StringInstance extends BuiltInInstance {

  static isString(value: Value): value is StringInstance {
    return value instanceof StringInstance;
  }

  static toString(value: Value, error?: string): string {
    if (value instanceof StringInstance) {
      return value.value;
    }

    throw new Error(error ?? 'Expected string.');
  }

  readonly name = 'String';

  fields = {
    value: () => this,
  };
  methods = {
    init: this.constructor,
    length: this.length,
    toUpperCase: this.toUpperCase,
    toLowerCase: this.toLowerCase,
    concat: this.concat,
    replace: this.replace,
    __add__: this.__add__,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  };

  private value!: string;

  constructor(value: string | undefined) {
    super();
    if (value !== undefined) {
      this.init(value);
    }
  }

  init(value: Value | string) {
    if (value === undefined) throw new Error('Expected string.');

    if (typeof value === 'string') {
      this.value = value;
      return;
    }

    if (StringInstance.isString(value)) {
      this.value = StringInstance.toString(value);
      return;
    }

    throw new Error('Expected string.');
  }

  length(): NumberInstance {
    return new NumberInstance(this.value.length);
  }

  toUpperCase(): StringInstance {
    return new StringInstance(this.value.toUpperCase());
  }

  toLowerCase(): StringInstance {
    return new StringInstance(this.value.toLowerCase());
  }

  concat(other: StringInstance): StringInstance {
    return new StringInstance(this.value.concat(StringInstance.toString(other)));
  }

  replace(search: StringInstance, replacement: StringInstance): StringInstance {
    return new StringInstance(this.value.replace(StringInstance.toString(search), StringInstance.toString(replacement)));
  }

  __add__(other: Value): StringInstance {
    return new StringInstance(this.value.concat(StringInstance.toString(other)));
  }

  __equal__(other: Value): BooleanInstance {
    if (StringInstance.isString(other)) {
      return new BooleanInstance(this.value === StringInstance.toString(other));
    }

    return new BooleanInstance(false);
  }

  __notequal__(other: Value): BooleanInstance {
    if (StringInstance.isString(other)) {
      return new BooleanInstance(this.value !== StringInstance.toString(other));
    }

    return new BooleanInstance(true);
  }

  clone(): StringInstance {
    return new StringInstance(this.value);
  }

  toString(): string {
    return this.value;
  }
}

export class StringClass extends BuiltInClass {
  readonly instance = new StringInstance(undefined);
  readonly name = 'String';
}

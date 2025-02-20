import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {BooleanInstance} from './boolean.class';
import _ from 'lodash';
import {Token} from '../../scanner';
import {StringInstance} from './string.class';

export class ErrorInstance extends BuiltInInstance {

  static isError(value: Value): value is ErrorInstance {
    return value instanceof ErrorInstance;
  }

  static toValue(value: Value, error?: string): Value {
    if (value instanceof ErrorInstance) {
      return value.message;
    }

    throw new Error(error ?? 'Expected boolean.');
  }

  name = 'Error';

  message: Value = null;

  fields = {
    message: () => this.message,
  };
  methods = {
    init: this.init,
    getMessage: this.getMessage,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  };

  public token: Token | null = null;

  constructor(value: string | undefined) {
    super();
    if (value !== undefined) {
      this.init(new StringInstance(value));
    }
  }

  init(value: Value) {
    if (value === undefined) throw new Error('Expected a error message!');
    this.message = value;
  }

  getMessage(): Value {
    return this.message;
  }

  attachToken(token: Token) {
    this.token = token;
  }

  __equal__(other: Value): BooleanInstance {
    if (!ErrorInstance.isError(other)) {
      return new BooleanInstance(false);
    }
    return new BooleanInstance(_.isEqual(this.message, ErrorInstance.toValue(other)));
  }

  __notequal__(other: Value): BooleanInstance {
    if (!ErrorInstance.isError(other)) {
      return new BooleanInstance(true);
    }
    return new BooleanInstance(!_.isEqual(this.message, ErrorInstance.toValue(other)));
  }

  toString(): string {
    if (this.message === null) {
      return 'null';
    }
    return this.message.toString();
  }
}

export class ErrorClass extends BuiltInClass {
  instance = new ErrorInstance(undefined);
  name = 'Error';
}
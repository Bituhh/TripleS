import {Value} from '../../triples';
import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Instance} from '../../interpreter/instance';
import _ from 'lodash';
import {BooleanInstance} from './boolean.class';


class LoggerInstance extends BuiltInInstance {
  readonly name = 'Logger';

  fields = { };
  methods = {
    log: this.log,
    init: this.constructor,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  };

  log(message: Value) {
    if (message instanceof Instance || message instanceof BuiltInInstance) {
      console.log(message.toString());
      return;
    }

    console.log(message);
  }

  __equal__(other: Value): BooleanInstance {
    return new BooleanInstance(_.isEqual(this, other));
  }

  __notequal__(other: Value): BooleanInstance {
    return new BooleanInstance(!_.isEqual(this, other));
  }
}

export class LoggerClass extends BuiltInClass {
  readonly instance = new LoggerInstance();
  readonly name = 'Logger';
}



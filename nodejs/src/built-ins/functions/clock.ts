import {BuiltInFunction} from '../built-in';
import {NumberInstance} from '../classes/number.class';
import {Value} from '../../triples';
import {StringInstance} from '../classes/string.class';


export const getClockFunction = () => {
  return new BuiltInFunction('clock', (value?: Value): NumberInstance => {
    let operation = 'milli';
    if (value !== null && value !== undefined) {
      operation = StringInstance.toString(value);
    }

    const hrTime = process.hrtime.bigint();

    switch (operation) {
      case 'hour':
        return new NumberInstance(Number(hrTime / BigInt(1e9) / BigInt(3600)));
      case 'second':
        return new NumberInstance(Number(hrTime / BigInt(1e9)));
      case 'micro':
        return new NumberInstance(Number(hrTime / BigInt(1e3)));
      case 'milli':
        return new NumberInstance(Number(hrTime / BigInt(1e6)));
      case 'nano':
        return new NumberInstance(Number(hrTime));
    }

    throw new Error('Invalid clock operation.');
  }, null);

};
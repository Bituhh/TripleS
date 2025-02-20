import {Environment} from '../environment';
import {getClockFunction} from './functions';
import {LoggerClass} from './classes/logger.class';
import {StringClass} from './classes/string.class';
import {NumberClass} from './classes/number.class';
import {ArrayClass} from './classes/arrray.class';
import {MapClass} from './classes/map.class';
import {BooleanClass} from './classes/boolean.class';
import {ErrorClass} from './classes/error.class';

export const defineBuiltIns = (env: Environment) => {
  env.define('String', new StringClass());
  env.define('Number', new NumberClass());
  env.define('Boolean', new BooleanClass());
  env.define('Array', new ArrayClass());
  env.define('Map', new MapClass());
  env.define('Logger', new LoggerClass());
  env.define('Error', new ErrorClass());
  env.define('clock', getClockFunction());
};

export * from './built-in';
import {Interpreter} from './interpreter';
import {Value} from '../triples';

export abstract class Callable<TCallOutput> {
  abstract call(interpreter: Interpreter, args: Value[]): TCallOutput;

  abstract arity(): number;

  abstract toString(): string;
}
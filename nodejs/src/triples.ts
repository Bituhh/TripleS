import * as fs from 'fs';
import * as path from 'path';
import {Scanner} from './scanner';
import {Parser} from './parser';
import {Interpreter} from './interpreter';
import {ErrorHandler} from './error-handler';
import {Class} from './interpreter/class';
import {Function} from './interpreter/function';
import {Instance} from './interpreter/instance';
import {ImportedValue} from './interpreter/imported-value';
import {BuiltInClass, BuiltInFunction, BuiltInInstance} from './built-ins';

export type Value = Class
  | Instance
  | Function
  | ImportedValue
  | BuiltInClass
  | BuiltInInstance
  | BuiltInFunction
  | null;

export class TripleS {
  cwd: string = path.resolve('.');
  rootPath: string = path.resolve('.', 'index.sss');
  private errorHandler = new ErrorHandler();
  interpreter = new Interpreter(this, this.errorHandler);

  runFile(filePath: string) {
    this.rootPath = path.resolve('.', filePath);
    this.cwd = path.dirname(this.rootPath);
    const source = fs.readFileSync(filePath, 'utf8');
    this.run(source);
  }

  run(source: string) {
    const tokens = new Scanner(this.errorHandler).scan(source);
    const stmts = new Parser(this.errorHandler).parse(tokens);

    if (this.errorHandler.hasError) return;

    this.interpreter.interpret(this.rootPath, stmts);
  };
}
import {Interpreter} from './index';
import {Callable} from './callable';
import {FunctionStmt} from '../stmt';
import {Value} from '../triples';
import {Environment} from '../environment';
import {InitStatus, Instance} from './instance';
import {Token} from '../scanner';

export abstract class CallableFunction<TOutput> extends Callable<TOutput> {
  public abstract bindInstance(instance: Instance): CallableFunction<TOutput>;
}

export class Function extends CallableFunction<unknown> {

  constructor(public declaration: FunctionStmt,
              public closure: Environment,
              public isInitializer: boolean) {
    super();
  }

  public call(interpreter: Interpreter, args: Value[]): Value {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      const param = this.declaration.params[i] as Token;
      environment.define(param, args[i]);
    }

    const ret = interpreter.executeBlock(this.declaration.body, environment);

    if (this.isInitializer) {
      const instance = this.closure.getAt(0, 'this') as Instance;
      instance.statuses.find((c) => c.initialized === InitStatus.INITIALIZING)?.setInitialized();
      return instance;
    }

    if (ret) return ret.value;

    return null;
  }


  public arity(): number {
    return this.declaration.params.length;
  }

  public bindInstance(instance: Instance): Function {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new Function(this.declaration, environment, this.isInitializer);
  }

  public toString(): string {
    const name = this.declaration.name.lexeme;
    if (isUuid(name)) {
      return `<anonymous function>`;
    }
    return `<${name} function>`;
  }
}

const isUuid = (uuid: string): uuid is string => !!uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

import {Interpreter} from './interpreter';
import {Callable} from './callable';
import {InitStatus, Instance} from './instance';
import {Function} from './function';
import {Value} from '../triples';
import {StringInstance} from '../built-ins/classes/string.class';
import {BuiltInClass, BuiltInFunction} from '../built-ins';

export class Class extends Callable<Instance> {
  constructor(public name: string, public superclasses: (Class | BuiltInClass)[], public methods: Map<string, Function>) {
    super();
  }

  call(interpreter: Interpreter, args: Value[]): Instance {
    const instance = new Instance(this, this.superclasses);
    instance.fields.set('className', new StringInstance(this.name));

    const init = this.findMethod('init', false);
    if (init) {
      init.bindInstance(instance).call(interpreter, args);
      const notInit = instance.statuses.find(i => i.initialized === InitStatus.NOT_INITIALIZED);
      if (notInit) {
        throw new Error(`Superclass '${notInit.klass.name}' not initialized`);
      }
    } else {
      for (const superclass of this.superclasses.reverse()) {
        const superInit = superclass.findMethod('init', false);
        if (superInit) {
          instance.statuses.find(i => i.klass.name === superclass.name)?.setInitializing();
          superInit.bindInstance(instance).call(interpreter, args);
        }
      }
    }

    return instance;
  }

  arity(): number {
    const initializer = this.findMethod('init', false);
    if (!initializer) return 0;

    return initializer.arity();
  }

  hasMethod(name: string) {
    return this.methods.has(name);
  }

  findMethod(name: string, includeInheritance = true): BuiltInFunction | Function | null {
    if (this.methods.has(name)) {
      return this.methods.get(name) as Function;
    }

    if (includeInheritance) {
      for (const superclass of this.superclasses) {
        if (superclass.hasMethod(name)) {
          return superclass.findMethod(name);
        }
      }
    }

    return null;
  }

  toString() {
    return `<${this.name} class>`;
  }
}
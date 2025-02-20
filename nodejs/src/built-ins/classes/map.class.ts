import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {StringInstance} from './string.class';
import _ from 'lodash';
import {BooleanInstance} from './boolean.class';

export class MapInstance extends BuiltInInstance {

  static isMap(value: Value): value is MapInstance {
    return value instanceof MapInstance;
  }

  static toMap(value: Value, error?: string): Map<Value, Value> {
    if (value instanceof MapInstance) {
      return value.map;
    }

    throw new Error(error ?? 'Expected a Map.');
  }

  readonly name = 'Map';

  fields = {
    value: () => this,
  };
  methods = {
    init: this.init,
    __getitem__: this.__getitem__,
    __setitem__: this.__setitem__,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  };

  private map: Map<Value, Value> = new Map();

  constructor(value: Map<Value, Value> | undefined) {
    super();
    if (value !== undefined) {
      this.init(value);
    }
  }

  init(value: Value | Map<Value, Value>) {
    if (value === null || value === undefined) {
      this.map = new Map();
      return;
    }

    if (value instanceof Map) {
      this.map = value;
      return;
    }

    if (MapInstance.isMap(value)) {
      this.map = MapInstance.toMap(value);
      return;
    }

    throw new Error('Expected a Map.');
  }

  /**
   * @description
   * As key can be just a copy of the original key, we need to find the original key
   * to get the value from the map.
   */
  private getOriginalKey(key: Value): Value {
    for (const elm of this.map) {
      if (elm[0] instanceof BuiltInInstance) {
        if (BooleanInstance.toBoolean(elm[0].__equal__(key) as BooleanInstance)) {
          return elm[0];
        }
      }
      if (_.isEqual(elm[0], key)) {
        return elm[0];
      }
    }

    return null;
  }

  __getitem__(key: Value): Value {
    if (key === undefined) throw new Error('Expected a key.');
    return this.map.get(this.getOriginalKey(key)) ?? null;
  }

  __setitem__(key: Value, value: Value): void {
    if (key === undefined) throw new Error('Expected a key.');
    if (value === undefined) throw new Error('Expected a value.');

    const originalKey = this.getOriginalKey(key);
    if (originalKey === null) {
      this.map.set(key, value);
      return;
    }

    this.map.set(originalKey, value);
  }

  __equal__(other: Value): BooleanInstance {
    if (!MapInstance.isMap(other)) {
      return new BooleanInstance(false);
    }

    return new BooleanInstance(_.isEqual(this.map, MapInstance.toMap(other)));
  }

  __notequal__(other: Value): BooleanInstance {
    if (!MapInstance.isMap(other)) {
      return new BooleanInstance(true);
    }

    return new BooleanInstance(!_.isEqual(this.map, MapInstance.toMap(other)));
  }

  clone(): MapInstance {
    return _.cloneDeep(this);
  }

  toString(): string {
    if (this.map.size === 0) {
      return '{}';
    }

    const getString = (value: Value) => {
      if (value === null) {
        return 'null';
      }

      if (StringInstance.isString(value)) {
        return `'${value.toString()}'`;
      }

      if (value instanceof BuiltInInstance || value instanceof BuiltInClass) {
        return value.toString();
      }

      return value.toString();
    };

    const result: string[] = [];
    for (const [key, value] of this.map) {
      result.push(`${getString(key)}: ${getString(value)}`);
    }
    return `{${result.join(', ')}}`;
  }
}

export class MapClass extends BuiltInClass {
  readonly instance = new MapInstance(undefined);
  readonly name = 'Map';
}

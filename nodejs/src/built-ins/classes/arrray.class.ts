import {BuiltInClass, BuiltInInstance} from '../built-in';
import {Value} from '../../triples';
import {StringInstance} from './string.class';
import {NumberInstance} from './number.class';
import _ from 'lodash';
import {BooleanInstance} from './boolean.class';

export class ArrayInstance extends BuiltInInstance {

  static isArray(value: Value): value is ArrayInstance {
    return value instanceof ArrayInstance;
  }

  static toArray(value: Value, error?: string): Value[] {
    if (value instanceof ArrayInstance) {
      return value.array;
    }

    throw new Error(error ?? 'Expected array.');
  }

  readonly name = 'Array';

  fields = {
    value: () => this,
  };
  methods =  {
    init: this.init,
    setMaxSize: this.setMaxSize,
    // Queue Representation
    enqueue: this.enqueue,
    dequeue: this.dequeue,
    peek: this.peek,
    front: this.front,
    // Stack Representation
    push: this.push,
    pop: this.pop,
    top: this.top,
    isFull: this.isFull,
    isEmpty: this.isEmpty,
    size: this.size,
    // Array Representation
    add: this.add,
    get: this.get,
    set: this.set,
    insertAt: this.insertAt,
    removeAt: this.removeAt,
    remove: this.remove,
    contains: this.contains,
    indexOf: this.indexOf,
    clear: this.clear,
    length: this.length,
    __getitem__: this.__getitem__,
    __setitem__: this.__setitem__,
    __equal__: this.__equal__,
    __notequal__: this.__notequal__,
    clone: this.clone,
    toString: this.toString,
  }

  private array: Value[] = [];
  private maxSize: number = Infinity;

  constructor(value: Value[]) {
    super();
    this.init(value);
  }

  init(value: Value | Value[]) {
    if (!value) {
      this.array = [];
      return;
    }

    if (Array.isArray(value)) {
      this.array = value;
      return;
    }

    if (ArrayInstance.isArray(value)) {
      this.array = ArrayInstance.toArray(value);
      return;
    }

    throw new Error('Expected an Array.');
  }

  setMaxSize(size: Value): void {
    if (size === undefined) throw new Error('Expected a size.');
    if (size === null) {
      this.maxSize = Infinity;
      return;
    }
    if (!(size instanceof NumberInstance)) throw new Error('Expected an number.');
    this.maxSize = NumberInstance.toNumber(size);
  }

  // Queue Representation

  enqueue(value: Value) {
    this.add(value);
  }
  dequeue(): Value {
    if (this.array.length === 0) {
      throw new Error('Array is empty.');
    }
    return this.array.shift() ?? null;
  }

  peek(): Value {
    return this.array[0] ?? null;
  }

  /**
   * @description
   * Alias to peek
   */
  front(): Value {
    return this.peek();
  }

  // Stack Representation

  push(value: Value): void {
    if (value === undefined) throw new Error('Expected a value.');
    if (this.array.length >= this.maxSize) {
      throw new Error('Array is full.');
    }
    this.array.push(value);
  }

  pop(): Value {
    if (this.array.length === 0) throw new Error('Array is empty.');
    return this.array.pop() ?? null;
  }
  top(): Value {
    if (this.array.length === 0) throw new Error('Array is empty.');
    return this.array[this.array.length - 1] ?? null;
  }

  isFull(): BooleanInstance {
    return new BooleanInstance(this.array.length >= this.maxSize);
  }

  isEmpty(): BooleanInstance {
    return new BooleanInstance(this.array.length === 0);
  }

  size(): NumberInstance {
    return this.length();
  }

  // Array Representation


  add(value: Value): void {
    if (value === undefined) throw new Error('Expected a value.');
    if (this.array.length >= this.maxSize) {
      throw new Error('Array is full.');
    }
    this.array.push(value);
  }
  get(index: Value): Value {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    return this.array[NumberInstance.toNumber(index)] ?? null;
  }

  set(index: Value, value: Value): void {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    this.array[NumberInstance.toNumber(index)] = value;
  }

  insertAt(index: Value, value: Value): void {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (value === undefined) throw new Error('Expected a value.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    this.array.splice(NumberInstance.toNumber(index), 0, value);
  }

  remove(value: Value): void {
    const index = this.array.indexOf(value);
    if (index === -1) throw new Error('Value not found.');
    this.array.splice(index, 1);
  }

  removeAt(index: Value): void {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    this.array.splice(NumberInstance.toNumber(index), 1);
  }

  contains(value: Value): BooleanInstance {
    return new BooleanInstance(this.array.includes(value));
  }

  indexOf(value: Value): NumberInstance {
    return new NumberInstance(this.array.indexOf(value));
  }

  clear(): void {
    this.array.splice(0, this.array.length);
  }

  length(): NumberInstance {
    return new NumberInstance(this.array.length);
  }

  __getitem__(index: Value) {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    const i = NumberInstance.toNumber(index);
    if (i < 0) {
      return this.array[this.array.length + i]
    }
    return this.array[NumberInstance.toNumber(index)]
  }

  __setitem__(index: Value, value: Value) {
    if (index === null || index === undefined) throw new Error('Expected an index.');
    if (!(index instanceof NumberInstance)) throw new Error('Expected an number.');
    const i = NumberInstance.toNumber(index);
    if (i < 0) {
      this.array[this.array.length + i] = value;
      return;
    }
    this.array[NumberInstance.toNumber(index)] = value;
  }

  __equal__(other: Value): BooleanInstance {
    if (!ArrayInstance.isArray(other)) {
      return new BooleanInstance(false);
    }

    if (this.array.length !== other.array.length) {
      return new BooleanInstance(false);
    }

    return new BooleanInstance(_.isEqual(this.array, other.array));
  }

  __notequal__(other: Value): BooleanInstance {
    if (!ArrayInstance.isArray(other)) {
      return new BooleanInstance(true);
    }

    if (this.array.length !== other.array.length) {
      return new BooleanInstance(true);
    }

    return new BooleanInstance(!_.isEqual(this.array, other.array));
  }


  clone(): ArrayInstance {
    return _.cloneDeep(this);
  }

  toString(): string {
    if (this.array.length === 0) {
      return '[]';
    }

    const result: string[] = [];
    for (const value of this.array) {
      if (value instanceof StringInstance) {
        result.push(`'${value.toString()}'`);
        continue;
      }

      if (value == null) {
        result.push('null');
        continue;
      }

      result.push(value.toString());
    }
    return `[${result.join(', ')}]`;
  }
}

export class ArrayClass extends BuiltInClass {
  readonly instance = new ArrayInstance([]);
  readonly name = 'Array';
}

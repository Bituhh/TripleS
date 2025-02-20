import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('array', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should return a new array', () => {
    triples.run('print [];');
    expect(log).toHaveBeenCalledWith('[]');
  });

  it('should return a new array with one element', () => {
    triples.run('print [1];');
    expect(log).toHaveBeenCalledWith('[1]');
  });

  it('should return a new array with multiple elements', () => {
    triples.run('print [1, 2, 3];');
    expect(log).toHaveBeenCalledWith('[1, 2, 3]');
  });

  it('should return a new array with multiple elements of different types', () => {
    triples.run('print [1, "2", 3];');
    expect(log).toHaveBeenCalledWith('[1, \'2\', 3]');
  });

  describe('nested arrays', () => {
    it('should return a new array with nested arrays', () => {
      triples.run('print [[1, 2], [3, 4]];');
      expect(log).toHaveBeenCalledWith('[[1, 2], [3, 4]]');
    });

    it('should return a new array with nested arrays and elements', () => {
      triples.run('print [[1, 2], [3, 4], 5];');
      expect(log).toHaveBeenCalledWith('[[1, 2], [3, 4], 5]');
    });
  });

  describe('push', () => {
    it('should push a value to an array', () => {
      triples.run('var arr = [1]; arr.push(2); print arr;');
      expect(log).toHaveBeenCalledWith('[1, 2]');
      triples.run('var arr = [1].push(2); print arr;');
      expect(log).toHaveBeenCalledWith('[1, 2]');
    });
  });

  describe('pop', () => {
    it('should pop a value from an array', () => {
      triples.run('var arr = [1, 2]; print arr.pop(); print arr;');
      expect(log).toHaveBeenCalledWith('2');
      expect(log).toHaveBeenCalledWith('[1]');
    });

    it('should pop null as a value from an array with null', () => {
      triples.run('var arr = [null].pop(); print arr;');
      expect(log).toHaveBeenCalledWith('null');
    });
  });

  describe('length', () => {
    it('should return the length of an array', () => {
      triples.run('var arr = [1, 2]; print arr.length();');
      expect(log).toHaveBeenCalledWith('2');
    });

    it('should return the length of an empty array', () => {
      triples.run('var arr = [].length(); print arr;');
      expect(log).toHaveBeenCalledWith('0');
    });
  });

  describe('__getitem__', () => {
    it('should return the value at a given index', () => {
      triples.run('var arr = [1, 2]; print arr[0];');
      expect(log).toHaveBeenCalledWith('1');
    });

    it('should return the value at a given index with a negative index', () => {
      triples.run('var arr = [1, 2]; print arr[-1];');
      expect(log).toHaveBeenCalledWith('2');
    });

    it('should return the value at a given index with a negative index and a positive index', () => {
      triples.run('var arr = [1, 2]; print arr[-1]; print arr[1];');
      expect(log).toHaveBeenCalledWith('2');
      expect(log).toHaveBeenCalledWith('2');
    });
  });

  describe('__setitem__', () => {
    it('should set the value at a given index', () => {
      triples.run('var arr = [1, 2]; arr[0] = 3; print arr;');
      expect(log).toHaveBeenCalledWith('[3, 2]');
    });

    it('should set the value at a given index with a negative index', () => {
      triples.run('var arr = [1, 2]; arr[-1] = 3; print arr;');
      expect(log).toHaveBeenCalledWith('[1, 3]');
    });

    it('should set the value at a given index with a negative index and a positive index', () => {
      triples.run('var arr = [1, 2]; arr[-1] = 3; arr[1] = 4; print arr;');
      expect(log).toHaveBeenCalledWith('[1, 4]');
    });
  });


  // TODO: add array operations
  // TODO: add queue operations
  // TODO: add stack operations

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
})

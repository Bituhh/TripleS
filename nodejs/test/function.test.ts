import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('function', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should return a function', () => {
    triples.run(`
      function a() {
      }
      print a;
    `);
    expect(log).toHaveBeenCalledWith('<a function>');
  });

  it('should return a function with parameters', () => {
    triples.run(`
      function a(b) {
      }
      print a;
    `);
    expect(log).toHaveBeenCalledWith('<a function>');
  });

  it('should return a function with parameters and body', () => {
    triples.run(`
      function a(b) {
        return b;
      }
      print a;
    `);
    expect(log).toHaveBeenCalledWith('<a function>');
  });

  describe('return', () => {
    it('should print a string', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a('Hello World');
      `);
      expect(log).toHaveBeenCalledWith('Hello World');
    });

    it('should print a number', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a(1);
      `);
      expect(log).toHaveBeenCalledWith('1');
    });

    it('should print a boolean', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a(true);
      `);
      expect(log).toHaveBeenCalledWith('true');
    });

    it('should print a null', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a(null);
      `);
      expect(log).toHaveBeenCalledWith('null');
    });

    it('should print an array', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a([1, 2, 3]);
      `);
      expect(log).toHaveBeenCalledWith('[1, 2, 3]');
    });

    it('should print an object', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        print a({a: 1, b: 2, c: 3});
      `);
      expect(log).toHaveBeenCalledWith('{\'a\': 1, \'b\': 2, \'c\': 3}');
    });

    it('should print a function', () => {
      triples.run(`
        function a(b) {
          return b;
        }
        
        function b() {
        }
        
        print a(b);
      `);
      expect(log).toHaveBeenCalledWith('<b function>');
    });

    it('should return a function within a function', () => {
      triples.run(`
        function a(b) {
          function c() {
            return b;
          }
          return c;
        }
        print a('Hello World')();
      `);
      expect(log).toHaveBeenCalledWith('Hello World');
    });

    it('should return a function within a function with parameters', () => {
      triples.run(`
        function a(b) {
          function c(d) {
            return d;
          }
          return c;
        }
        print a('Hello World')('Hello World');
      `);
      expect(log).toHaveBeenCalledWith('Hello World');
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

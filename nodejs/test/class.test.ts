import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('class', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should return a class', () => {
    triples.run(`
      class a {
      }
      print a;
    `);
    expect(log).toHaveBeenCalledWith('<a class>');
  });

  it('should print a instance of a class', () => {
    triples.run(`
      class a {
      }
      print a();
    `);
    expect(log).toHaveBeenCalledWith('<a instance>');
  });

  it('should print from a class with a method', () => {
    triples.run(`
      class a {
        b() {
          print "hello";
        }
      }
      a().b();
    `);
    expect(log).toHaveBeenCalledWith('hello');
  });

  it('should print from a class with a method with parameters', () => {
    triples.run(`
      class a {
        b(x) {
          print x;
        }
      }
      a().b("hello");
    `);
    expect(log).toHaveBeenCalledWith('hello');
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

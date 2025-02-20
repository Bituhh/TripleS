import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('error', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should throw error', () => {
    triples.run('throw Error(\'This is a error\');');
    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('[line 1] Error at \'throw\': This is a error');
  });

  it('should catch error', () => {
    triples.run(`
      try {
        throw Error('This is a error');
      } catch (e) {
        print(e.getMessage());
      }
    `);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('This is a error');
    expect(error).not.toHaveBeenCalled();
  });

  it('should catch error and throw error', () => {
    triples.run(`
      try {
        throw Error('This is a error');
      } catch (e) {
        throw Error('This is a rethrown error');
      }
    `);
    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('[line 5] Error at \'throw\': This is a rethrown error');
  });

  describe('function', () => {
    it('should throw error inside function', () => {
      triples.run(`
      function throwError() {
        throw Error('This is a error');
      }
      throwError();
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 3] Error at \'throw\': This is a error');
    });

    it('should catch error inside function', () => {
      triples.run(`
      function throwError() {
        throw Error('This is a error');
      }
      try {
        throwError();
      } catch (e) {
        print(e.getMessage());
      }
    `);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith('This is a error');
      expect(error).not.toHaveBeenCalled();
    });

    it('should catch error inside function and throw error', () => {
      triples.run(`
      function throwError() {
        throw Error('This is a error');
      }
      try {
        throwError();
      } catch (e) {
        throw Error('This is a rethrown error');
      }
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 8] Error at \'throw\': This is a rethrown error');
    });
  });

  describe('class', () => {
    it('should throw error inside class', () => {
      triples.run(`
      class ThrowError {
        init() {
          throw Error('This is a error');
        }
      }
      ThrowError();
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 4] Error at \'throw\': This is a error');
    });

    it('should catch error inside class', () => {
      triples.run(`
      class ThrowError {
        init() {
          throw Error('This is a error');
        }
      }
      try {
        ThrowError();
      } catch (e) {
        print(e.getMessage());
      }
    `);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith('This is a error');
      expect(error).not.toHaveBeenCalled();
    });

    it('should catch error inside class and throw error', () => {
      triples.run(`
      class ThrowError {
        init() {
          throw Error('This is a error');
        }
      }
      try {
        ThrowError();
      } catch (e) {
        throw Error('This is a rethrown error');
      }
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 10] Error at \'throw\': This is a rethrown error');
    });

    it('should throw error inside class method', () => {
      triples.run(`
      class ThrowError {
        throwError() {
          throw Error('This is a error');
        }
      }
      ThrowError().throwError();
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 4] Error at \'throw\': This is a error');
    });
  });

  describe('extends Error', () => {
    it('should throw error inside class', () => {
      triples.run(`
      class ThrowError extends Error {
        init(namespace) {
          super(Error).init('[' + namespace + '] This is a error');
        }
      }
      throw ThrowError('Domain');
    `);
      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith('[line 7] Error at \'throw\': [Domain] This is a error\n<ThrowError instance>');
    });
  });


  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

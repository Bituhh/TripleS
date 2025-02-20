import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('boolean', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should print a true', () => {
    triples.run('print true;');
    expect(console.log).toHaveBeenCalledWith('true');
  });

  it('should print a false', () => {
    triples.run('print false;');
    expect(console.log).toHaveBeenCalledWith('false');
  });

  describe('operations', () => {
    it('should print a true when using and', () => {
      triples.run('print true and true;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should print a false when using and', () => {
      triples.run('print true and false;');
      expect(console.log).toHaveBeenCalledWith('false');
      triples.run('print false and true;');
      expect(console.log).toHaveBeenCalledWith('false');
      triples.run('print false and false;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should print a true when using or', () => {
      triples.run('print true or true;');
      expect(console.log).toHaveBeenCalledWith('true');
      triples.run('print true or false;');
      expect(console.log).toHaveBeenCalledWith('true');
      triples.run('print false or true;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should print a false when using or', () => {
      triples.run('print false or false;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should print a true when using &&', () => {
      triples.run('print true && true;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should print a false when using &&', () => {
      triples.run('print true && false;');
      expect(console.log).toHaveBeenCalledWith('false');
      triples.run('print false && true;');
      expect(console.log).toHaveBeenCalledWith('false');
      triples.run('print false && false;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should print a true when using ||', () => {
      triples.run('print true || true;');
      expect(console.log).toHaveBeenCalledWith('true');
      triples.run('print true || false;');
      expect(console.log).toHaveBeenCalledWith('true');
      triples.run('print false || true;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should print a false when using ||', () => {
      triples.run('print false || false;');
      expect(console.log).toHaveBeenCalledWith('false');
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

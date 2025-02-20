import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('number', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should print a number', () => {
    triples.run('print 1;');
    expect(console.log).toHaveBeenCalledWith('1');
  });

  it('should print a negative number', () => {
    triples.run('print -1;');
    expect(console.log).toHaveBeenCalledWith('-1');
  });

  it('should print a decimal number', () => {
    triples.run('print 1.5;');
    expect(console.log).toHaveBeenCalledWith('1.5');
  });

  it('should print a negative decimal number', () => {
    triples.run('print -1.5;');
    expect(console.log).toHaveBeenCalledWith('-1.5');
  });

  describe('arithmetic', () => {
    it('should add two numbers', () => {
      triples.run('print 1 + 2;');
      expect(console.log).toHaveBeenCalledWith('3');
    });

    it('should subtract two numbers', () => {
      triples.run('print 1 - 2;');
      expect(console.log).toHaveBeenCalledWith('-1');
    });

    it('should multiply two numbers', () => {
      triples.run('print 2 * 3;');
      expect(console.log).toHaveBeenCalledWith('6');
    });

    it('should divide two numbers', () => {
      triples.run('print 6 / 3;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    // TODO: Implement __power__
    it('should raise a number to a power', () => {
      triples.run('print 2 ^ 3;');
      expect(console.log).toHaveBeenCalledWith('8');
    });

    it('should modulo two numbers', () => {
      triples.run('print 5 % 3;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    it('should modulo a negative number', () => {
      triples.run('print -5 % 3;');
      expect(console.log).toHaveBeenCalledWith('-2');
    });

    it('should modulo a negative number', () => {
      triples.run('print 5 % -3;');
      expect(console.log).toHaveBeenCalledWith('2');
    });
  });

  describe('logical', () => {
    it('should return true on ==', () => {
      triples.run('print 1 == 1;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on ==', () => {
      triples.run('print 1 == 2;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true on !=', () => {
      triples.run('print 1 != 2;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on !=', () => {
      triples.run('print 1 != 1;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true on <', () => {
      triples.run('print 1 < 2;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on <', () => {
      triples.run('print 2 < 1;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true on <=', () => {
      triples.run('print 1 <= 2;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return true on <=', () => {
      triples.run('print 1 <= 1;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on <=', () => {
      triples.run('print 2 <= 1;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true on >', () => {
      triples.run('print 2 > 1;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on >', () => {
      triples.run('print 1 > 2;');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true on >=', () => {
      triples.run('print 2 >= 1;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return true on >=', () => {
      triples.run('print 1 >= 1;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false on >=', () => {
      triples.run('print 1 >= 2;');
      expect(console.log).toHaveBeenCalledWith('false');
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

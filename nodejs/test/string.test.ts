import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('string', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should print a string', () => {
    triples.run('print "hello world";');
    expect(console.log).toHaveBeenCalledWith('hello world');
  });

  describe('escape', () => {
    it('should escape single quotes', () => {
      triples.run('print \'hello "world"\';');
      expect(console.log).toHaveBeenCalledWith('hello "world"');
    });

    it('should escape double quotes', () => {
      triples.run('print "hello \'world\'";');
      expect(console.log).toHaveBeenCalledWith('hello \'world\'');
    });

    it('should escape backslash', () => {
      triples.run('print "hello \\\\world";');
      expect(console.log).toHaveBeenCalledWith('hello \\world');
    });

    it('should escape newline', () => {
      triples.run('print "hello \\nworld";');
      expect(console.log).toHaveBeenCalledWith('hello \nworld');
    });

    it('should escape carriage return', () => {
      triples.run('print "hello \\rworld";');
      expect(console.log).toHaveBeenCalledWith('hello \rworld');
    });

    it('should escape backspace', () => {
      triples.run('print "hello \\bworld";');
      expect(console.log).toHaveBeenCalledWith('hello \bworld');
    });

    it('should escape form feed', () => {
      triples.run('print "hello \\fworld";');
      expect(console.log).toHaveBeenCalledWith('hello \fworld');
    });

    it('should escape horizontal tab', () => {
      triples.run('print "hello \\tworld";');
      expect(console.log).toHaveBeenCalledWith('hello \tworld');
    });

    it('should escape vertical tab', () => {
      triples.run('print "hello \\vworld";');
      expect(console.log).toHaveBeenCalledWith('hello \vworld');
    });

    it('should escape null character', () => {
      triples.run('print "hello \\0world";');
      expect(console.log).toHaveBeenCalledWith('hello \0world');
    });
  });

  describe('emoji and unicode', () => {
    it('should print emoji', () => {
      triples.run('print "hello world 👋";');
      expect(console.log).toHaveBeenCalledWith('hello world 👋');
    });

    it('should print copy right logo', () => {
      triples.run('print "hello world \\u{00A9}";');
      expect(console.log).toHaveBeenCalledWith('hello world ©');
    });
  });

  describe('concatenating', () => {
    it('should concatenate strings', () => {
      triples.run('print "hello" + "world";');
      expect(console.log).toHaveBeenCalledWith('helloworld');
    });

    it('should concatenate strings with variables', () => {
      triples.run('var a = "hello"; var b = "world"; print a + b;');
      expect(console.log).toHaveBeenCalledWith('helloworld');
    });

    it('should concatenate strings with variables and escape characters', () => {
      triples.run('var a = "hello"; var b = "world"; print a + " \\"" + b + "\\"";');
      expect(console.log).toHaveBeenCalledWith('hello "world"');
    });

    it('should concatenate using concat', () => {
      triples.run('print "hello".concat("world");');
      expect(console.log).toHaveBeenCalledWith('helloworld');
    });

    it('should concatenate using concat in variables', () => {
      triples.run('var a = "hello"; var b = "world"; print a.concat(b);');
      expect(console.log).toHaveBeenCalledWith('helloworld');
    });

    it('should concatenate using concat in variables with escape characters', () => {
      triples.run('var a = "hello"; var b = "world"; print a.concat(" \\"" + b + "\\"");');
      expect(console.log).toHaveBeenCalledWith('hello "world"');
    });
  });

  describe('length', () => {
    it('should get the length of a string', () => {
      triples.run('var a = "hello"; print a.length();');
      expect(console.log).toHaveBeenCalledWith('5');
    });

    it('should get the length of a string with escape characters', () => {
      triples.run('var a = "hello \\"world\\""; print a.length();');
      expect(console.log).toHaveBeenCalledWith('13');
    });
  });

  describe('logical', () => {
    it('should return true when comparing equal strings', () => {
      triples.run('print "hello" == "hello";');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false when comparing unequal strings', () => {
      triples.run('print "hello" == "world";');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should return true when comparing unequal strings', () => {
      triples.run('print "hello" != "world";');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should return false when comparing equal strings', () => {
      triples.run('print "hello" != "hello";');
      expect(console.log).toHaveBeenCalledWith('false');
    });

    it('should compare strings with variables', () => {
      triples.run('var a = "hello"; var b = "hello"; print a == b;');
      expect(console.log).toHaveBeenCalledWith('true');
    });

    it('should compare strings with variables and escape characters', () => {
      triples.run('var a = "hello \\"world\\""; var b = "hello \\"world\\""; print a == b;');
      expect(console.log).toHaveBeenCalledWith('true');
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

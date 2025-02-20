import {beforeEach, describe, expect, jest, it, afterEach} from '@jest/globals';
import {TripleS} from '../src';
import {KEYWORDS} from '../src/scanner/keywords';

describe('var', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });
  describe('basic maths', () => {
    it('print 1;', () => {
      triples.run('print 1;');
      expect(console.log).toHaveBeenCalledWith('1');
    });

    it('print 1 + 1;', () => {
      triples.run('print 1 + 1;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    it('print 1 + 1 * 2;', () => {
      triples.run('print 1 + 1 * 2;');
      expect(console.log).toHaveBeenCalledWith('3');
    });

    it('print 1 + 1 * 2 / 2;', () => {
      triples.run('print 1 + 1 * 2 / 2;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    it('print 1 + 1 * 2 / 2 - 1;', () => {
      triples.run('print 1 + 1 * 2 / 2 - 1;');
      expect(console.log).toHaveBeenCalledWith('1');
    });

    it('print 1 + 1 * 2 / 2 - 1 + 1;', () => {
      triples.run('print 1 + 1 * 2 / 2 - 1 + 1;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    // With grouping
    it('print (1 + 1) * 2 / 2 - 1 + 1;', () => {
      triples.run('print (1 + 1) * 2 / 2 - 1 + 1;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    it('print (1 + 1) * (2 / 2) - 1 + 1;', () => {
      triples.run('print (1 + 1) * (2 / 2) - 1 + 1;');
      expect(console.log).toHaveBeenCalledWith('2');
    });

    it('print (1 + 1) * (2 / 2) - (1 + 1);', () => {
      triples.run('print (1 + 1) * (2 / 2) - (1 + 1);');
      expect(console.log).toHaveBeenCalledWith('0');
    });

    it('print (1 + 1) * (2 / 2) - (1 + 1) * 2;', () => {
      triples.run('print (1 + 1) * (2 / 2) - (1 + 1) * 2;');
      expect(console.log).toHaveBeenCalledWith('-2');
    });

    it('print (1 + 1) * (2 / 2) - (1 + 1) * 2 / 2;', () => {
      triples.run('print (1 + 1) * (2 / 2) - (1 + 1) * 2 / 2;');
      expect(console.log).toHaveBeenCalledWith('0');
    });
  });

  describe('basic string operations', () => {
    it('print "Hello" + " " + "World";', () => {
      triples.run('print "Hello" + " " + "World";');
      expect(console.log).toHaveBeenCalledWith('Hello World');
    });

    it('print "Hello" + " " + "World" + "!";', () => {
      triples.run('print "Hello" + " " + "World" + "!";');
      expect(console.log).toHaveBeenCalledWith('Hello World!');
    });

    it('print "Hello" + " " + "World" + "!" + " " + "I" + " " + "am" + " " + "triples";', () => {
      triples.run('print "Hello" + " " + "World" + "!" + " " + "I" + " " + "am" + " " + "triples";');
      expect(console.log).toHaveBeenCalledWith('Hello World! I am triples');
    });

    it('print "Hello" + " " + "World" + "!" + " " + "I" + " " + "am" + " " + "triples" + " " + "and" + " " + "I" + " " + "am" + " " + "a" + " " + "string" + " " + "with" + " " + "spaces";', () => {
      triples.run('print "Hello" + " " + "World" + "!" + " " + "I" + " " + "am" + " " + "triples" + " " + "and" + " " + "I" + " " + "am" + " " + "a" + " " + "string" + " " + "with" + " " + "spaces";');
      expect(console.log).toHaveBeenCalledWith('Hello World! I am triples and I am a string with spaces');
    });
  });

  describe('Errors if using keyword as variable names', () => {
    for (const keyword of Object.keys(KEYWORDS)) {
      it(`should throw an error if using keyword '${keyword}' as variable name`, () => {
        triples.run(`var ${keyword} = 1;`);
        expect(console.error).toHaveBeenCalledWith(`[line 1] Error at '${keyword}': Expect variable name.`);
      });
    }

    it(`should throw an error if using a number as variable name`, () => {
      triples.run(`var 1 = 2;`);
      expect(console.error).toHaveBeenCalledWith(`[line 1] Error at '1': Expect variable name.`);
    });

    it('should allow any other variable names', () => {
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randomVariableName = alphabet[Math.floor(Math.random() * alphabet.length)];
      triples.run(`var ${randomVariableName} = 1; print ${randomVariableName};`);
      expect(console.log).toHaveBeenCalledWith('1');
    });
  });

  describe('local variables', () => {
    it('should allow local variables', () => {
      triples.run(`
        var a = 1;
        var b = 2;
        var c = 3;
        print a + b + c;
      `);
      expect(console.log).toHaveBeenCalledWith('6');
    });

    it('should allow local variables with the same name as global variables with the same name', () => {
      triples.run(`
      {
        var a = 1;
        var b = 2;
        var c = 3;
        print a + b + c;
      }
      var a = 4;
      var b = 5;
      var c = 6;
      print a + b + c;
      `);
      expect(console.log).toHaveBeenCalledWith('6');
      expect(console.log).toHaveBeenCalledWith('15');
    });

    it('should not allow reassigning variables', () => {
      triples.run(`
        var a = 1;
        var a = 2;
        print a;
      `);
      expect(console.error).toHaveBeenCalledWith(`[line 3] Error at 'a': Variable already exists with the name 'a'.`);
    });

    it('should not allow reassigning variables in the same scope', () => {
      triples.run(`
        {
          var a = 2;
          var a = 3;
          print a;
        }
      `);
      expect(console.error).toHaveBeenCalledWith(`[line 4] Error at 'a': Already a variable with this name in this scope.`);
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});


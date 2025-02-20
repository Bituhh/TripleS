import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';
import fs from 'fs';

describe('import', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let fsFileExist: jest.SpiedFunction<(path: fs.PathLike) => boolean>;
  let fsReadFileSync: jest.SpiedFunction<(path: fs.PathOrFileDescriptor) => any>;
  let importedFile: string | null = null;
  let mainFile: string | null = null;

  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    fsFileExist = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    fsReadFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
      return (path.toString().endsWith('test-import.sss') ? importedFile : mainFile) ?? '';
    });
  });

  it('should print "Hello World" from imported variable', () => {
    importedFile = 'export var a = \'Hello World\';';
    mainFile = `
      from './test-import' import a;
      print a;
    `;

    triples.runFile('./main.sss');
    expect(console.log).toHaveBeenCalledWith('Hello World');
  });

  it('should print "Hello World" from imported function', () => {
    importedFile = `
      export function a() {
        return 'Hello World';
      }
    `;

    mainFile = `
      from './test-import' import a;
      print a();
    `;

    triples.runFile('./main.sss');

    expect(console.log).toHaveBeenCalledWith('Hello World');
  });

  it('should print "Hello World" from imported class', () => {
    importedFile = `
      export class a {
        b() {
          return 'Hello World';
        }
      }
    `;

    mainFile = `
      from './test-import' import a;
      print a().b();
    `;

    triples.runFile('./main.sss');
    expect(console.log).toHaveBeenCalledWith('Hello World');
  });

  describe('circular dependencies', () => {
    it('should print name', () => {
      importedFile = `
      from './main' import name;
      
      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;
      
      export var name = 'Victor';
      
      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
    });

    it('should print name after reassigning variable', () => {
      importedFile = `
      from './main' import name;
      
      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;
      
      export var name = 'Victor';
      
      print sayName();
      
      name = 'Oliver-Ali';
      
      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
      expect(console.log).toHaveBeenCalledWith('Oliver-Ali');
    });

    it('should print name after reassigning variable in function', () => {
      importedFile = `
      from './main' import name;

      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;

      export var name = 'Victor';

      print sayName();

      function changeName() {
        name = 'Oliver-Ali';
      }

      changeName();

      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
      expect(console.log).toHaveBeenCalledWith('Oliver-Ali');
    });

    it('should print name after reassigning variable in class', () => {
      importedFile = `
      from './main' import name;

      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;

      export var name = 'Victor';

      print sayName();

      class ChangeName {
        init() {
          name = 'Oliver-Ali';
        }
      }

      ChangeName();

      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
      expect(console.log).toHaveBeenCalledWith('Oliver-Ali');
    });

    it('should print name after reassigning variable in class method', () => {
      importedFile = `
      from './main' import name;

      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;

      export var name = 'Victor';

      print sayName();

      class ChangeName {
        change() {
          name = 'Oliver-Ali';
        }
      }

      ChangeName().change();

      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
      expect(console.log).toHaveBeenCalledWith('Oliver-Ali');
    });

    it('should print name after reassigning variable in class method with return', () => {
      importedFile = `
      from './main' import name;

      export function sayName() {
        return name;
      }
    `;

      mainFile = `
      from './test-import' import sayName;

      export var name = 'Victor';

      print sayName();

      class ChangeName {
        change() {
          name = 'Oliver-Ali';
          return name;
        }
      }

      name = ChangeName().change();

      print sayName();
    `;

      triples.runFile('./main.sss')
      expect(console.log).toHaveBeenCalledWith('Victor');
      expect(console.log).toHaveBeenCalledWith('Oliver-Ali');
    });
  });


  afterEach(() => {
    log.mockRestore();
    fsFileExist.mockRestore();
    fsReadFileSync.mockRestore();
    importedFile = null;
  });
});

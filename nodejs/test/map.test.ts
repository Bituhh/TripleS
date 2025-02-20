import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {TripleS} from '../src';

describe('map', () => {
  let triples: TripleS;
  let log: jest.SpiedFunction<(...messages: string[]) => void>;
  let error: jest.SpiedFunction<(...messages: string[]) => void>;
  beforeEach(() => {
    triples = new TripleS();
    log = jest.spyOn(global.console, 'log').mockImplementation(() => undefined);
    error = jest.spyOn(global.console, 'error').mockImplementation(() => undefined);
  });

  it('should print a {}', () => {
    triples.run('print {};');
    expect(console.log).toHaveBeenCalledWith('{}');
  });

  describe('number', () => {
    it('should print a {a:1}', () => {
      triples.run('print {a: 1};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': 1}');
    });

    it('should print a {a:1,b:2}', () => {
      triples.run('print {a:1,b:2};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': 1, \'b\': 2}');
    });
  });

  describe('string', () => {
    it('should print a {a:"1"}', () => {
      triples.run('print {a: "1"};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': \'1\'}');
    });

    it('should print a {a:"1",b:"2"}', () => {
      triples.run('print {a: "1", b: "2"};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': \'1\', \'b\': \'2\'}');
    });
  });

  describe('boolean', () => {
    it('should print a {a:true}', () => {
      triples.run('print {a: true};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': true}');
    });

    it('should print a {a:true,b:false}', () => {
      triples.run('print {a:true, b:false};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': true, \'b\': false}');
    });
  });

  describe('null', () => {
    it('should print a {a:null}', () => {
      triples.run('print {a: null};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': null}');
    });

    it('should print a {a:null,b:null}', () => {
      triples.run('print {a:null, b:null};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': null, \'b\': null}');
    });
  });

  describe('function', () => {
    it('should print {a: <anonymous function>}', () => {
      triples.run('print {a: -> 1};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': <anonymous function>}');
    });

    it('should print {a: <a function>}', () => {
      triples.run('function a() {} print {a: a};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': <a function>}');
    });

    it('should print a {a:->1,b:->2}', () => {
      triples.run('function a() {} function b() {} print {a: a, b: b};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': <a function>, \'b\': <b function>}');
    });
  });

  describe('array', () => {
    it('should print a {a:[]}', () => {
      triples.run('print {a: []};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': []}');
    });

    it('should print a {a:[1],b:[2]}', () => {
      triples.run('print {a:[1], b:[2]};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': [1], \'b\': [2]}');
    });
  });

  describe('object', () => {
    it('should print a {a:{}}', () => {
      triples.run('print {a: {}};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': {}}');
    });

    it('should print a {a:{a:1},b:{b:2}}', () => {
      triples.run('print {a: {a: 1}, b: {b: 2}};');
      expect(console.log).toHaveBeenCalledWith('{\'a\': {\'a\': 1}, \'b\': {\'b\': 2}}');
    });
  });

  describe('__getitem__', () => {
    it('should retrieve "value" from map', () => {
      triples.run('print {a: "value"}["a"];');
      expect(console.log).toHaveBeenCalledWith('value');
    });

    it('should retrieve "value" from nested map', () => {
      triples.run('print {a: {b: "value"}}["a"]["b"];');
      expect(console.log).toHaveBeenCalledWith('value');
    });

    it('should retrieve "value" from nested array and map', () => {
      triples.run('print {a: [1, 2, {b: "value"}]}["a"][2]["b"];');
      expect(console.log).toHaveBeenCalledWith('value');
    });
  });

  describe('__setitem__', () => {
    it('should set "value" to map', () => {
      triples.run('var map = {a: "value"}; map["a"] = "new value"; print map["a"];');
      expect(console.log).toHaveBeenCalledWith('new value');
    });

    it('should set "value" to nested map', () => {
      triples.run('var map = {a: {b: "value"}}; map["a"]["b"] = "new value"; print map["a"]["b"];');
      expect(console.log).toHaveBeenCalledWith('new value');
    });

    it('should set "value" to nested array and map', () => {
      triples.run('var map = {a: [1, 2, {b: "value"}]}; map["a"][2]["b"] = "new value"; print map["a"][2]["b"];');
      expect(console.log).toHaveBeenCalledWith('new value');
    });
  });

  afterEach(() => {
    log.mockRestore();
    error.mockRestore();
  });
});

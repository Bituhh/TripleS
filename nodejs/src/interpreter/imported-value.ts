import {Token} from '../scanner';
import {EnvironmentTree} from './environment-tree';
import {Value} from '../triples';

export class ImportedValue {
  value: Value | undefined = undefined;
  tree: EnvironmentTree;


  constructor(public path: string,
              public identifier: Token,
              parentTree: EnvironmentTree) {
    const tree = parentTree.findChild(path);
    if (!tree) throw new Error(`Could not find module ${path}`);
    this.tree = tree;
  }

  resolve() {
    if (this.value) return this.value;

    this.value = this.tree.environment.get(this.identifier);
    return this.value;
  }
}
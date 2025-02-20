import {Environment} from '../environment';
import {Expr} from '../expr';

export class EnvironmentTree {
  public parent: EnvironmentTree | null = null;
  public globals: Environment;
  public environment: Environment;
  public exports: Environment = new Environment(null);
  public locals: Map<Expr, number> = new Map();
  public children: EnvironmentTree[] = [];

  constructor(public id: string,
              public builtIns: Environment) {
    this.globals = new Environment(this.builtIns);
    this.environment = this.globals;
  }

  createChild(id: string): EnvironmentTree {
    const child =  new EnvironmentTree(id, this.builtIns)
    child.parent = this;
    return child;
  }

  addChild(child: EnvironmentTree) {
    this.children.push(child);
  }

  searchTree(id: string): EnvironmentTree | null {
    if (this.id === id) return this;

    // Search up.
    if (this.parent) {
      const result = this.parent.searchTree(id);
      if (result) return result;
    }

    for (const child of this.children) {
      const result = child.searchTree(id);
      if (result) return result;
    }

    return null;
  }

  findChild(id: string): EnvironmentTree | null {
    for (const child of this.children) {
      if (child.id === id) return child;
    }

    return null;
  }

  clone(tree: EnvironmentTree) {
    const newTree =new EnvironmentTree(tree.id, tree.builtIns);
    newTree.globals = tree.globals;
    newTree.environment = tree.environment;
    newTree.exports = tree.exports;
    newTree.locals = tree.locals;
    newTree.children = tree.children;
    return newTree;
  }
}
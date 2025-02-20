import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';

export class FunctionStmt extends Stmt {
  constructor(public name: Token, public params: Token[], public body: Stmt[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitFunctionStmt(this);
  }
}
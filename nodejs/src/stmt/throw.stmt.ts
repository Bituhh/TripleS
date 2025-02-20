import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';
import {Expr} from '../expr';

export class ThrowStmt extends Stmt {
  constructor(public keyword: Token, public value: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitThrowStmt(this);
  }
}
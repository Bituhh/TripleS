import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';
import {Expr} from '../expr';

export class ReturnStmt extends Stmt {
  constructor(public keyword: Token, public value: Expr | null) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}
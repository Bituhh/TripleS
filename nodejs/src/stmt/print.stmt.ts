import {Stmt, StmtVisitor} from './stmt'; 
import {Expr} from '../expr';

export class PrintStmt extends Stmt {
  constructor(public expression: Expr) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}
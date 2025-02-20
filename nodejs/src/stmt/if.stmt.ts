import {Stmt, StmtVisitor} from './stmt'; 
import {Expr} from '../expr';

export class IfStmt extends Stmt {
  constructor(public condition: Expr, public thenBranch: Stmt, public elseBranch: Stmt | null) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}
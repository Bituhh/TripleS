import {Stmt, StmtVisitor} from './stmt'; 
import {Expr} from '../expr';

export class WhileStmt extends Stmt {
  constructor(public condition: Expr, public body: Stmt) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}
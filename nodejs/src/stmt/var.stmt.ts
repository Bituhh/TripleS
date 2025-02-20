import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';
import {Expr} from '../expr';

export class VarStmt extends Stmt {
  constructor(public name: Token, public initializer: Expr | null) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}
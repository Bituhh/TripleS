import {Stmt, StmtVisitor} from './stmt'; 


export class BlockStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}
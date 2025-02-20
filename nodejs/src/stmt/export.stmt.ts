import {Stmt, StmtVisitor} from './stmt'; 


export class ExportStmt extends Stmt {
  constructor(public statement: Stmt) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExportStmt(this);
  }
}
import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';

export class ImportStmt extends Stmt {
  constructor(public path: Token, public items: {name: Token, alias: Token | null}[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitImportStmt(this);
  }
}
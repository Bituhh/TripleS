import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';

export class TryCatchStmt extends Stmt {
  constructor(public tryBlock: Stmt[], public catchBlock: Stmt[] | null, public catchParam: Token | null, public finallyBlock: Stmt[] | null) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitTryCatchStmt(this);
  }
}
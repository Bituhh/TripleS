import {Stmt, StmtVisitor} from './stmt'; 
import {Token} from '../scanner';
import {VariableExpr} from '../expr';
import {FunctionStmt} from './function.stmt';

export class ClassStmt extends Stmt {
  constructor(public name: Token, public superclass: VariableExpr | null, public methods: FunctionStmt[]) {
    super()
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitClassStmt(this);
  }
}
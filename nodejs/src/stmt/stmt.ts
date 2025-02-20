import {ExpressionStmt} from './expression.stmt';
import {PrintStmt} from './print.stmt';
import {VarStmt} from './var.stmt';
import {BlockStmt} from './block.stmt';
import {IfStmt} from './if.stmt';
import {WhileStmt} from './while.stmt';
import {FunctionStmt} from './function.stmt';
import {ReturnStmt} from './return.stmt';
import {ClassStmt} from './class.stmt';
import {ImportStmt} from './import.stmt';
import {ExportStmt} from './export.stmt';
import {ThrowStmt} from './throw.stmt';
import {TryCatchStmt} from './trycatch.stmt';

export abstract class Stmt {
  abstract accept<T>(visitor: StmtVisitor<T>): T;
}

export interface StmtVisitor<R> {
  visitExpressionStmt(stmt: ExpressionStmt): R;
  visitPrintStmt(stmt: PrintStmt): R;
  visitVarStmt(stmt: VarStmt): R;
  visitBlockStmt(stmt: BlockStmt): R;
  visitIfStmt(stmt: IfStmt): R;
  visitWhileStmt(stmt: WhileStmt): R;
  visitFunctionStmt(stmt: FunctionStmt): R;
  visitReturnStmt(stmt: ReturnStmt): R;
  visitClassStmt(stmt: ClassStmt): R;
  visitImportStmt(stmt: ImportStmt): R;
  visitExportStmt(stmt: ExportStmt): R;
  visitThrowStmt(stmt: ThrowStmt): R;
  visitTryCatchStmt(stmt: TryCatchStmt): R;
}
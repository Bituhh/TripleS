import {Interpreter} from './index';
import {
  ArrayExpr,
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor as ExprVisitor,
  GetExpr, GetItemExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr, MapExpr,
  SetExpr, SetItemExpr,
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
} from '../expr';
import {
  BlockStmt,
  ClassStmt, ExportStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt, ImportStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor, ThrowStmt, TryCatchStmt,
  VarStmt,
  WhileStmt,
} from '../stmt';
import {Token} from '../scanner';
import {ErrorHandler} from '../error-handler';
import winston from 'winston';

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
  SUBCLASS,
}

const logger = winston.createLogger({
  // level: 'verbose',
  defaultMeta: {module: 'Resolver'},
  format: winston.format.combine(
    winston.format.printf(({level, module, getIndent, message, data}: { [key: string]: any }) => {
      const text = `${level}: ${module} ${''.padStart(getIndent())}${message}`;
      if (data) {
        return `${text} ${JSON.stringify(data)}`;
      }
      return text;
    }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {

  private scopes: Map<string, boolean>[] = [];
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;
  private indent = -1;

  constructor(private interpreter: Interpreter, private errorHandler: ErrorHandler) {
    logger.defaultMeta = {...logger.defaultMeta, getIndent: () => (this.indent * 2)};
  }

  // Statement
  visitImportStmt(stmt: ImportStmt): void {
    logger.verbose('visitImportStmt');
    for (const item of stmt.items) {
      const name = item.alias ?? item.name;
      this.declare(name);
      this.define(name);
    }
  }

  visitExportStmt(stmt: ExportStmt): void {
    logger.verbose('visitExportStmt');
    this.resolve(stmt.statement);
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    logger.verbose('visitExpressionStmt');
    this.resolve(stmt.expression);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    logger.verbose('visitPrintStmt');
    this.resolve(stmt.expression);
  }

  visitVarStmt(stmt: VarStmt): void {
    logger.verbose('visitVarStmt');
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitBlockStmt(stmt: BlockStmt): void {
    logger.verbose('visitBlockStmt');
    this.beginScope();
    this.resolveStatements(stmt.statements);
    this.endScope();
  }

  visitIfStmt(stmt: IfStmt): void {
    logger.verbose('visitIfStmt');
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
  }

  visitWhileStmt(stmt: WhileStmt): void {
    logger.verbose('visitWhileStmt');
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    logger.verbose('visitFunctionStmt');
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitReturnStmt(stmt: ReturnStmt): void {
    logger.verbose('visitReturnStmt');
    if (this.currentFunction === FunctionType.NONE) {
      this.errorHandler.error(stmt.keyword, 'Can\'t return from top-level code.');
    }

    if (stmt.value !== null) {
      if (this.currentFunction === FunctionType.INITIALIZER) {
        this.errorHandler.error(stmt.keyword, 'Can\'t return a value from an initializer.');
      }
      this.resolve(stmt.value);
    }
  }

  visitClassStmt(stmt: ClassStmt): void {
    logger.verbose('visitClassStmt');
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass) {
      if (stmt.name.lexeme === stmt.superclass.name.lexeme) {
        this.errorHandler.error(stmt.superclass.name, 'A class can\'t inherit from itself.');
      }

      this.currentClass = ClassType.SUBCLASS;

      this.resolve(stmt.superclass);

      this.beginScope();
      this.scopes[this.scopes.length - 1].set('super', true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set('this', true);

    for (const method of stmt.methods) {
      const declaration = method.name.lexeme === 'init' ? FunctionType.INITIALIZER : FunctionType.METHOD;
      this.resolveFunction(method, declaration);
    }

    this.endScope();

    if (stmt.superclass) this.endScope();

    this.currentClass = enclosingClass;
  }

  visitThrowStmt(stmt: ThrowStmt): void {
    logger.verbose('visitThrowStmt');
    this.resolve(stmt.value);
  }

  visitTryCatchStmt(stmt: TryCatchStmt): void {
    this.beginScope();
    this.resolveStatements(stmt.tryBlock);
    this.endScope();

    if (stmt.catchBlock) {
      this.beginScope();
      if (stmt.catchParam) {
        this.declare(stmt.catchParam);
        this.define(stmt.catchParam);
      }
      this.resolveStatements(stmt.catchBlock);
      this.endScope();
    }
    if (stmt.finallyBlock) {
      this.beginScope();
      this.resolveStatements(stmt.finallyBlock);
      this.endScope();
    }
  }

  // Expression
  visitBinaryExpr(expr: BinaryExpr): void {
    logger.verbose('visitBinaryExpr');
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitGroupingExpr(expr: GroupingExpr): void {
    logger.verbose('visitGroupingExpr');
    this.resolve(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr): void {
    logger.verbose('visitLiteralExpr');
  }

  visitUnaryExpr(expr: UnaryExpr): void {
    logger.verbose('visitUnaryExpr');
    this.resolve(expr.right);
  }

  visitVariableExpr(expr: VariableExpr): void {
    logger.verbose('visitVariableExpr');
    if (this.scopes.length !== 0 && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false) {
      this.errorHandler.error(expr.name, 'Can\'t read local variable in its own initializer.');
    }

    this.resolveLocal(expr, expr.name);
  }

  visitAssignExpr(expr: AssignExpr): void {
    logger.verbose('visitAssignExpr');
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitLogicalExpr(expr: LogicalExpr): void {
    logger.verbose('visitLogicalExpr');
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: CallExpr): void {
    logger.verbose('visitCallExpr');
    this.resolve(expr.callee);

    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }

  visitGetExpr(expr: GetExpr): void {
    logger.verbose('visitGetExpr');
    this.resolve(expr.object);
  }

  visitSetExpr(expr: SetExpr): void {
    logger.verbose('visitSetExpr');
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitThisExpr(expr: ThisExpr): void {
    logger.verbose('visitThisExpr');
    if (this.currentClass === ClassType.NONE) {
      this.errorHandler.error(expr.keyword, 'Can\'t use \'this\' outside of a class.');
      return;
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitSuperExpr(expr: SuperExpr): void {
    logger.verbose('visitSuperExpr');
    switch (this.currentClass) {
      case ClassType.NONE:
        this.errorHandler.error(expr.keyword, 'Can\'t use \'super\' outside of a class.');
        break;
      case ClassType.CLASS:
        this.errorHandler.error(expr.keyword, 'Can\'t use \'super\' in a class with no superclass.');
        break;
    }

    this.resolveLocal(expr, expr.keyword);
  }

  visitArrayExpr(expr: ArrayExpr): void {
    logger.verbose('visitArrayExpr');
    for (const element of expr.elements) {
      this.resolve(element);
    }
  }

  visitGetItemExpr(expr: GetItemExpr): void {
    logger.verbose('visitGetIndexExpr');
    this.resolve(expr.array);
    this.resolve(expr.index);
  }

  visitSetItemExpr(expr: SetItemExpr): void {
    logger.verbose('visitSetIndexExpr');
    this.resolve(expr.array);
    this.resolve(expr.index);
    this.resolve(expr.value);
  }

  visitMapExpr(expr: MapExpr): void {
    logger.verbose('visitMapExpr');
    for (const [key, value] of expr.properties) {
      this.resolve(value);
    }
  }

  private resolve(stmt: Stmt): void;
  private resolve(expr: Expr): void;
  private resolve(res: Stmt | Expr) {
    this.indent++;
    res.accept(this);
    this.indent--;
  }

  resolveStatements(statements: Stmt[]) {
    for (const statement of statements) {
      this.resolve(statement);
    }
  }

  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private beginScope() {
    logger.verbose('beginScope');
    this.scopes.push(new Map());
  }

  private endScope() {
    logger.verbose('endScope');
    this.scopes.pop();
  }

  private declare(name: Token) {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      this.errorHandler.error(name, 'Already a variable with this name in this scope.');
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token) {
    if (this.scopes.length === 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private resolveFunction(stmt: FunctionStmt, type: FunctionType) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of stmt.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStatements(stmt.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }
}
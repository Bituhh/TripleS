import {
  ArrayExpr,
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GetExpr,
  GetItemExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  MapExpr,
  SetExpr,
  SetItemExpr,
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
} from '../expr';
import {
  BlockStmt,
  ClassStmt,
  ExportStmt,
  ExpressionStmt,
  FunctionStmt,
  IfStmt,
  ImportStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor,
  ThrowStmt,
  TryCatchStmt,
  VarStmt,
  WhileStmt,
} from '../stmt';
import {Scanner, Token, TokenType} from '../scanner';
import {Environment} from '../environment';
import {TripleS, Value} from '../triples';
import {Callable} from './callable';
import {RuntimeError} from '../errors/runtime-error';
import {Function} from './function';
import {BuiltInClass, BuiltInFunction, BuiltInInstance, defineBuiltIns} from '../built-ins';
import {Return} from './return';
import {Class} from './class';
import {Instance} from './instance';
import {ErrorHandler} from '../error-handler';
import path from 'path';
import fs from 'fs';
import {Parser} from '../parser';
import {EnvironmentTree} from './environment-tree';
import {Resolver} from './resolver';
import {ImportedValue} from './imported-value';
import winston from 'winston';
import {StringInstance} from '../built-ins/classes/string.class';
import {NumberInstance} from '../built-ins/classes/number.class';
import {ArrayInstance} from '../built-ins/classes/arrray.class';
import {MapInstance} from '../built-ins/classes/map.class';
import {BooleanInstance} from '../built-ins/classes/boolean.class';
import {ErrorClass, ErrorInstance} from '../built-ins/classes/error.class';


const logger = winston.createLogger({
  // level: 'verbose',
  defaultMeta: {module: 'Interpreter'},
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

export class Interpreter implements ExprVisitor<Value>, StmtVisitor<void | Return> {
  private builtIns = new Environment(null);
  tree: EnvironmentTree | null = null;
  private indent = -1;

  constructor(private triples: TripleS,
              private errorHandler: ErrorHandler) {
    logger.defaultMeta = {...logger.defaultMeta, getIndent: () => (this.indent * 2)};
    defineBuiltIns(this.builtIns);
  }

  interpret(sourcePath: string, statements: Stmt[]): void {
    let enclosingTree: EnvironmentTree | null = null;
    if (!this.tree) {
      this.tree = new EnvironmentTree(sourcePath, this.builtIns);
    } else {
      const existingTree = this.tree.searchTree(sourcePath);
      if (existingTree) {
        // Already exist so we don't need to resolve or interpret the values
        this.tree.addChild(existingTree);
        return;
      }

      // This is a previous not scanned file so we create a child
      enclosingTree = this.tree;
      const child = this.tree!.createChild(sourcePath);
      this.tree.addChild(child);
      this.tree = child;
    }

    new Resolver(this, this.errorHandler).resolveStatements(statements);

    if (this.errorHandler.hasError) return;

    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error: any) {
      this.errorHandler.runtimeError(error);
    } finally {
      if (enclosingTree) {
        this.tree = enclosingTree;
      }
    }
  }

  // Expressions
  visitBinaryExpr(expr: BinaryExpr): Value {
    logger.verbose(`visitBinaryExpr`);
    let left = this.evaluate(expr.left);
    let right = this.evaluate(expr.right);


    const getMagicMethod = () => {
      switch (expr.operator.type) {
        case TokenType.CARET:
          return '__power__';
        case TokenType.PERCENT:
          return '__modulus__';
        case TokenType.STAR:
          return '__multiply__';
        case TokenType.SLASH:
          return '__divide__';
        case TokenType.PLUS:
          return '__add__';
        case TokenType.MINUS:
          return '__subtract__';
        case TokenType.PIPE:
          return '__pipe__';
        case TokenType.AMPERSAND:
          return '__ampersand__';
        case TokenType.EQUAL_EQUAL:
          return '__equal__';
        case TokenType.BANG_EQUAL:
          return '__notequal__';
        case TokenType.GREATER:
          return '__greater__';
        case TokenType.GREATER_EQUAL:
          return '__greaterequal__';
        case TokenType.LESS:
          return '__less__';
        case TokenType.LESS_EQUAL:
          return '__lessequal__';
        default:
          throw new RuntimeError(expr.operator, 'Invalid binary operator.');
      }
    };

    const magicMethod = getMagicMethod();
    const token = new Token(TokenType.IDENTIFIER, magicMethod, null, expr.operator.line);
    if (left instanceof BuiltInInstance && left.hasMethod(magicMethod)) return left.getMethod(token).call(this, [right]);

    if (right instanceof BuiltInInstance && right.hasMethod(magicMethod)) {
      return right.getMethod(token).call(this, [left]);
    }

    if (right instanceof Instance && right.hasMethod(magicMethod)) {
      return right.getMethod(token).call(this, [left]);
    }

    if (left instanceof Instance && left.hasMethod(magicMethod)) {
      return left.getMethod(token).call(this, [right]);
    }

    if (right instanceof Instance && right.hasMethod(magicMethod)) {
      return right.getMethod(token).call(this, [left]);
    }

    if (left === null && right === null) {
      switch (magicMethod) {
        case '__equal__':
          return new BooleanInstance(true);
        case '__notequal__':
          return new BooleanInstance(false);
        default:
          throw new RuntimeError(expr.operator, 'Invalid binary operator on nulls.');
      }
    }

    throw new RuntimeError(expr.operator, 'Invalid binary operator.');
  }

  visitGroupingExpr(expr: GroupingExpr): Value {
    logger.verbose('visitGroupingExpr');
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr): Value {
    logger.verbose('visitLiteralExpr');
    if (typeof expr.value === 'string') return new StringInstance(expr.value);
    if (typeof expr.value === 'number') return new NumberInstance(expr.value);
    if (typeof expr.value === 'boolean') return new BooleanInstance(expr.value);
    return expr.value;
  }

  visitUnaryExpr(expr: UnaryExpr): Value {
    logger.verbose('visitUnaryExpr');
    let right = this.evaluate(expr.right);
    const getMagicMethod = () => {
      switch (expr.operator.type) {
        case TokenType.BANG:
          return '__not__';
        case TokenType.MINUS:
          return '__negate__';
        default:
          throw new RuntimeError(expr.operator, 'Invalid unary operator.');
      }
    };

    const magicMethod = getMagicMethod();
    const token = new Token(TokenType.IDENTIFIER, magicMethod, null, expr.operator.line);
    if (right instanceof BuiltInInstance && right.hasMethod(magicMethod)) {
      return right.getMethod(token).call(this, []);
    }

    if (right instanceof Instance && right.hasMethod(magicMethod)) {
      return right.getMethod(token).call(this, []);
    }

    // Unreachable, so we throw an error in case it happens
    throw new RuntimeError(expr.operator, 'Invalid unary operation.');
  }

  visitVariableExpr(expr: VariableExpr): Value {
    logger.verbose('visitVariableExpr');
    const res = this.lookUpVariable(expr.name, expr);
    if (res instanceof ImportedValue) {
      return res.resolve();
    }
    return res;
  }

  visitAssignExpr(expr: AssignExpr): Value {
    logger.verbose('visitAssignExpr');
    const value = this.evaluate(expr.value);

    const distance = this.tree!.locals.get(expr);
    if (distance !== undefined) {
      this.tree!.environment.assignAt(distance, expr.name, value);
    } else {
      this.tree!.globals.assign(expr.name, value);
    }

    return value;
  }

  visitLogicalExpr(expr: LogicalExpr) {
    logger.verbose('visitLogicalExpr');
    const left = this.evaluate(expr.left);

    switch (expr.operator.type) {
      case TokenType.AND:
        if (!this.isTruthy(left)) return left;
        break;
      case TokenType.OR:
        if (this.isTruthy(left)) return left;
        break;
    }

    return this.evaluate(expr.right);
  }

  visitCallExpr(expr: CallExpr): Value {
    logger.verbose('visitCallExpr');
    const value = this.evaluate(expr.callee);

    const args: Value[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    let callee = value;
    if (value instanceof ImportedValue) {
      callee = value.resolve();
    }

    if (!(callee instanceof Callable)) {
      throw new RuntimeError(expr.paren, 'Can only call functions and classes.');
    }

    if (args.length > callee.arity()) {
      throw new RuntimeError(expr.paren, `Expected at most ${callee.arity()} arguments but got ${args.length}.`);
    }


    try {
      if (value instanceof ImportedValue) {
        const enclosingTree = this.tree;
        this.tree = value.tree;
        value.value = callee.call(this, args);
        this.tree = enclosingTree;
        return value;
      }

      return callee.call(this, args);
    } catch (error: any) {
      // This situation only happens when a built-in function or class fails.
      // Built-ins are defined internally using Node.js, so a Token is not available at that time but is available here.
      if (callee instanceof BuiltInFunction) {
        throw new RuntimeError(expr.paren, error.message);
      }
      throw error;
    }
  }

  visitGetExpr(expr: GetExpr): Value {
    logger.verbose('visitGetExpr');
    const value = this.evaluate(expr.object);


    let enclosingTree: EnvironmentTree | null = null;
    let getter = value;
    if (value instanceof ImportedValue) {
      getter = value.resolve();
      enclosingTree = this.tree;
      this.tree = value.tree;
    }

    if (getter instanceof Instance || getter instanceof BuiltInInstance) {
      const item = getter._get(expr.name);
      if (value instanceof ImportedValue) {
        value.value = item;
        this.tree = enclosingTree;
        return value;
      }
      return item;
    }

    throw new RuntimeError(expr.name, 'Only instances have properties.');
  }

  visitSetExpr(expr: SetExpr): Value {
    logger.verbose('visitSetExpr');
    const object = this.evaluate(expr.object);

    let instance: Value = object;
    if (object instanceof ImportedValue) {
      instance = object.resolve();
    }

    if (!(instance instanceof Instance)) {
      throw new RuntimeError(expr.name, 'Only instances have fields.');
    }

    const value = this.evaluate(expr.value);
    instance.set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: ThisExpr): Value {
    logger.verbose('visitThisExpr');
    return this.lookUpVariable(expr.keyword, expr);
  }

  visitSuperExpr(expr: SuperExpr): Function | BuiltInFunction {
    logger.verbose('visitSuperExpr');
    const distance = this.tree!.locals.get(expr);
    if (!distance) throw new RuntimeError(expr.keyword, `Undefined superclass '${expr.keyword.lexeme}'`);

    const superclass = this.tree!.environment.getAt(distance, `super(${expr.className.lexeme})`) as Class | BuiltInClass;
    const instance = this.tree!.environment.getAt(distance - 1, 'this') as Instance;
    const method = superclass.findMethod(expr.method.lexeme);

    if (!method) {
      throw new RuntimeError(expr.method, `Undefined property '${expr.method.lexeme}'.`);
    }

    if (expr.method.lexeme === 'init') {
      const status = instance.statuses.find(s => s.klass.name === superclass.name);
      status?.setInitializing();
    }


    return method.bindInstance(instance);
  }

  visitArrayExpr(expr: ArrayExpr): Value {
    logger.verbose('visitArrayExpr');
    const values: Value[] = [];
    for (const element of expr.elements) {
      values.push(this.evaluate(element));
    }

    return new ArrayInstance(values);
  }

  visitGetItemExpr(expr: GetItemExpr): Value {
    logger.verbose('visitGetItemExpr');
    const object = this.evaluate(expr.array);
    const index = this.evaluate(expr.index);

    if (!(object instanceof Instance) && !(object instanceof BuiltInInstance)) {
      throw new RuntimeError(expr.bracket, 'Only instances have properties.');
    }

    const token = new Token(TokenType.IDENTIFIER, '__getitem__', null, expr.bracket.line);
    if (object.hasMethod('__getitem__')) {
      return object.getMethod(token).call(this, [index]);
    }

    throw new RuntimeError(expr.bracket, `Invalid get operation.`);
  }

  visitSetItemExpr(expr: SetItemExpr): Value {
    logger.verbose('visitSetItemExpr');
    const object = this.evaluate(expr.array);
    const index = this.evaluate(expr.index);
    const value = this.evaluate(expr.value);

    if (!(object instanceof Instance) && !(object instanceof BuiltInInstance)) {
      throw new RuntimeError(expr.equals, 'Only able to set indexed values on instances');
    }

    const token = new Token(TokenType.IDENTIFIER, '__setitem__', null, expr.equals.line);
    if (object.hasMethod('__setitem__')) {
      return object.getMethod(token).call(this, [index, value]);
    }

    throw new RuntimeError(expr.equals, `Invalid set operation.`);
  }

  visitMapExpr(expr: MapExpr): Value {
    logger.verbose('visitMapExpr');
    const map: Map<Value, Value> = new Map();
    for (const [key, value] of expr.properties) {
      map.set(new StringInstance(key.lexeme), this.evaluate(value));
    }

    return new MapInstance(map);
  }

  private evaluate(expr: Expr): Value {
    this.indent++;
    const res = expr.accept(this);
    this.indent--;
    return res;
  }

  private lookUpVariable(name: Token, expr: Expr): Value {
    logger.verbose('lookUpVariable');
    const distance = this.tree!.locals.get(expr);
    if (distance !== undefined) {
      return this.tree!.environment.getAt(distance, name.lexeme);
    } else {
      return this.tree!.globals.get(name);
    }
  }

  // Statements
  visitImportStmt(stmt: ImportStmt): void {
    logger.verbose('visitImportStmt');
    let filePath = stmt.path.lexeme.slice(1, -1);
    if (filePath.startsWith('.')) {
      filePath = path.resolve(this.triples.cwd, filePath);
      if (!filePath.endsWith('.sss')) {
        filePath += '.sss';
      }
    }

    if (!fs.existsSync(filePath)) {
      throw new RuntimeError(stmt.path, `Unable to find file '${filePath}'`);
    }
    const source = fs.readFileSync(filePath, 'utf-8');
    const tokens = new Scanner(this.errorHandler).scan(source);
    const statements = new Parser(this.errorHandler).parse(tokens);

    this.interpret(filePath, statements);

    if (this.errorHandler.hasError) {
      throw new RuntimeError(stmt.path, 'Unable to resolve import');
    }

    for (const item of stmt.items) {
      try {
        const name = item.alias ?? item.name;
        this.tree!.environment.define(name, new ImportedValue(filePath, item.name, this.tree!));
      } catch (err: any) {
        if (err instanceof RuntimeError && err.message.startsWith('Undefined variable')) {
          throw new RuntimeError(item.name, `Unable to find exported item '${item.name.lexeme}'`);
        }
        throw err;
      }
    }
  }


  visitExportStmt(stmt: ExportStmt): void | Return {
    logger.verbose('visitExportStmt', {indent: this.indent});
    this.execute(stmt.statement);
    if (this.tree!.parent) {
      if (stmt.statement instanceof VarStmt) {
        const value = this.tree!.environment.get(stmt.statement.name);
        this.tree!.exports.define(stmt.statement.name, value);
      }
      if (stmt.statement instanceof FunctionStmt) {
        const value = this.tree!.environment.get(stmt.statement.name);
        this.tree!.exports.define(stmt.statement.name, value);
      }
      if (stmt.statement instanceof ClassStmt) {
        const value = this.tree!.environment.get(stmt.statement.name);
        this.tree!.exports.define(stmt.statement.name, value);
      }
    }
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    logger.verbose('visitExpressionStmt');
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: PrintStmt): void {
    logger.verbose('visitPrintStmt');
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitVarStmt(stmt: VarStmt): void {
    logger.verbose('visitVarStmt');
    const value = stmt.initializer ? this.evaluate(stmt.initializer) : null;

    this.tree!.environment.define(stmt.name, value);
  }

  visitBlockStmt(stmt: BlockStmt): void | Return {
    logger.verbose('visitBlockStmt');
    const ret = this.executeBlock(stmt.statements, new Environment(this.tree!.environment));
    if (ret) return ret;
  }

  visitIfStmt(stmt: IfStmt): void | Return {
    logger.verbose('visitIfStmt');
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      const ret = this.execute(stmt.thenBranch);
      if (ret) return ret;
    } else if (stmt.elseBranch) {
      const ret = this.execute(stmt.elseBranch);
      if (ret) return ret;
    }
  }

  visitWhileStmt(stmt: WhileStmt): void | Return {
    logger.verbose('visitWhileStmt');
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      const ret = this.execute(stmt.body);
      if (ret) return ret;
    }
  }

  visitFunctionStmt(stmt: FunctionStmt): void {
    logger.verbose('visitFunctionStmt');
    const callable = new Function(stmt, this.tree!.environment, false);
    this.tree!.environment.define(stmt.name, callable);
  }

  visitReturnStmt(stmt: ReturnStmt): Return {
    logger.verbose('visitReturnStmt');
    const value: Value = stmt.value === null ? null : this.evaluate(stmt.value);
    return new Return(value);
  }

  visitClassStmt(stmt: ClassStmt): void | Return {
    logger.verbose('visitClassStmt');
    let superclasses: (Class | BuiltInClass)[] = [];
    if (stmt.superclass) {
      const value = this.evaluate(stmt.superclass);
      if (!(value instanceof Class || value instanceof BuiltInClass)) {
        throw new RuntimeError(stmt.superclass.name, 'Superclass must be a class.');
      }
      superclasses = [value];
    }
    this.tree!.environment.define(stmt.name, null);

    if (stmt.superclass) {
      this.tree!.environment = new Environment(this.tree!.environment);
      for (const superclass of superclasses) {
        this.tree!.environment.define(`super(${superclass.name})`, superclass);
      }
    }

    const methods = new Map<string, Function>();
    for (const method of stmt.methods) {
      const func = new Function(method, this.tree!.environment, method.name.lexeme === 'init');
      methods.set(method.name.lexeme, func);
    }

    const klass = new Class(stmt.name.lexeme, superclasses, methods);

    if (superclasses.length !== 0) {
      if (!this.tree!.environment.enclosing) throw new Error('No enclosing environment found, ensure that if superclasses is define a enclosing environment is also defined.');
      this.tree!.environment = this.tree!.environment.enclosing;
    }

    this.tree!.environment.assign(stmt.name, klass);
  }

  visitThrowStmt(stmt: ThrowStmt): void {
    logger.verbose('visitThrowStmt');
    const value = this.evaluate(stmt.value);


    if (value instanceof ErrorInstance) {
      value.attachToken(stmt.keyword);

      throw value;
    }

    if (value instanceof Instance) {
      for (const superclass of value.klass.superclasses) {
        if (superclass instanceof ErrorClass) {
          const token = new Token(TokenType.IDENTIFIER, 'getMessage', null, stmt.keyword.line);
          const message: Value = value.getMethod(token).call(this, []);
          const error  = new ErrorInstance(`${message}\n${value.toString()}`);
          error.attachToken(stmt.keyword);
          throw error;
        }
      }
    }

    throw new RuntimeError(stmt.keyword, 'Can only throw \'Error\' instance, or instances that inherit the \'Error\' class.');
  }

  visitTryCatchStmt(stmt: TryCatchStmt): void | Return {
    logger.verbose('visitTryCatchStmt');
    let ret: void | Return = undefined;
    try {
      ret = this.executeBlock(stmt.tryBlock, new Environment(this.tree!.environment));
    } catch (error: any) {
      if (!(error instanceof ErrorInstance)) {
        throw error;
      }
      if (stmt.catchBlock) {
        const environment = new Environment(this.tree!.environment);
        if (stmt.catchParam) {
          environment.define(stmt.catchParam, error);
        }
        ret = this.executeBlock(stmt.catchBlock, environment);
      }
      if (stmt.finallyBlock) {
        this.executeBlock(stmt.finallyBlock, new Environment(this.tree!.environment));
      }
    }
    if (ret) return ret;
  }

  executeBlock(statements: Stmt[], environment: Environment): void | Return {
    logger.verbose('executeBlock');
    const previous = this.tree!.environment;

    try {
      this.tree!.environment = environment;

      for (const statement of statements) {
        const stmt = this.execute(statement);
        if (stmt) return stmt;
      }
    } finally {
      this.tree!.environment = previous;
    }
  }

  private execute(stmt: Stmt): void | Return {
    this.indent++;
    const ret = stmt.accept<void | Return>(this);
    this.indent--;
    if (ret instanceof Return) return ret;
  }

  private stringify(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'null'; // Undefined should never happen, but if it does return null instead.

    if (typeof value === 'number') {
      let text = value.toString();
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return value.toString()
      .replace(/\\'/g, '\'')
      .replace(/\\"/g, '"');
  }

  private isTruthy(object: Value): boolean {
    if (object === null) return false;
    if (BooleanInstance.isBoolean(object)) return BooleanInstance.toBoolean(object);
    return true;
  }

  resolve(expr: Expr, number: number) {
    this.tree!.locals.set(expr, number);
  }
}
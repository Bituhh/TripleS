import {Token, TokenType} from '../scanner';
import {
  ArrayExpr,
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
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
  ThrowStmt,
  TryCatchStmt,
  VarStmt,
  WhileStmt,
} from '../stmt';
import {ParserError} from '../errors';
import {ErrorHandler} from '../error-handler';
import crypto from 'node:crypto';

type Pattern = {
  type: TokenType;
  oneOrMore?: boolean;
  separator?: TokenType;
  next?: Pattern;
}

export class Parser {
  private current = 0;
  private statements: Stmt[] = [];
  private tokens: Token[] = [];

  constructor(private errorHandler: ErrorHandler) {
  }

  parse(tokens: Token[]) {
    this.tokens = tokens;

    while (!this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) this.statements.push(declaration);
    }

    return this.statements;
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.EXPORT)) return this.exportDeclaration();
      if (this.match(TokenType.CLASS)) return this.classDeclaration();
      if (this.match(TokenType.FUNCTION)) return this.functionDeclaration('function');
      if (this.match(TokenType.VAR)) return this.varDeclaration();

      return this.statement();
    } catch (error: any) {
      if (error instanceof ParserError) {
        // Panic Mode, we try to advance to the next viable declaration to be able to check any other possible errors
        this.synchronize();
        this.errorHandler.error(error.token, error.message);
        return null;
      }
      throw error;
    }
  }

  private exportDeclaration(): Stmt {
    const getStatement = () => {
      if (this.match(TokenType.CLASS)) return this.classDeclaration();
      if (this.match(TokenType.FUNCTION)) return this.functionDeclaration('function');
      if (this.match(TokenType.VAR)) return this.varDeclaration();

      throw new ParserError(this.peek(), 'Expect class, function or variable declaration.');
    };
    const statement = getStatement();

    return new ExportStmt(statement);
  }

  private classDeclaration(): ClassStmt {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect class name.');

    let superclass: VariableExpr | null = null;
    if (this.match(TokenType.EXTENDS)) {
      this.consume(TokenType.IDENTIFIER, 'Expect superclass name.');
      superclass = new VariableExpr(this.previous());
    }

    this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' before class body.');

    const methods: FunctionStmt[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.functionDeclaration('method'));
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expect \'}\' after class body.');

    return new ClassStmt(name, superclass, methods);
  }

  private functionDeclaration(kind: string): FunctionStmt {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
    this.consume(TokenType.LEFT_PARENTHESIS, `Expect '(' after ${kind} name.`);

    const parameters: Token[] = this.getFunctionParameters();

    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);

    const body = this.block();

    return new FunctionStmt(name, parameters, body);
  }

  private varDeclaration(): VarStmt {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');

    let initializer: Expr | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, 'Expect \';\' after variable declaration');
    return new VarStmt(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenType.FROM)) return this.importStatement();
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.THROW)) return this.throwStatement();
    if (this.match(TokenType.TRY)) return this.tryCatchStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new BlockStmt(this.block());
    return this.expressionStatement();
  }

  private importStatement(): Stmt {
    const path = this.consume(TokenType.STRING, 'Expect string after \'from\'.');
    const items: { name: Token, alias: Token | null }[] = [];
    if (this.match(TokenType.IMPORT)) {
      do {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect identifier after \'import\'.');
        let alias: Token | null = null;
        if (this.match(TokenType.AS)) {
          alias = this.consume(TokenType.IDENTIFIER, 'Expect identifier after \'as\'.');
        }
        items.push({name, alias});
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.SEMICOLON, 'Expect \';\' after import statement.');
    if (items.length === 0) {
      throw new ParserError(path, 'Expect at least one import item.');
    }
    return new ImportStmt(path, items);
  }

  private ifStatement(): IfStmt {
    this.consume(TokenType.LEFT_PARENTHESIS, 'Expect \'(\' after \'if\'.');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after if condition.');

    const getBranches = () => {
      if (!this.match(TokenType.LEFT_BRACE)) {
        if (this.match(TokenType.RETURN)) return {thenBranch: this.returnStatement(), elseBranch: null};
        if (this.match(TokenType.PRINT)) return {thenBranch: this.printStatement(), elseBranch: null};
        if (this.match(TokenType.THROW)) return {thenBranch: this.throwStatement(), elseBranch: null};
        return {thenBranch: this.expressionStatement(), elseBranch: null};
      }

      const thenBranch = new BlockStmt(this.block());
      if (!this.match(TokenType.ELSE)) {
        return {thenBranch, elseBranch: null};
      }

      this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after \'else\'.');
      const elseBranch = new BlockStmt(this.block());
      return {thenBranch, elseBranch};
    };

    const {thenBranch, elseBranch} = getBranches();
    return new IfStmt(condition, thenBranch, elseBranch);
  }

  private whileStatement(): WhileStmt {
    this.consume(TokenType.LEFT_PARENTHESIS, 'Expect \'(\' after \'while\'.');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after while condition.');

    this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after while condition.');
    const body = new BlockStmt(this.block());

    return new WhileStmt(condition, body);
  }

  private forStatement(): Stmt {
    this.consume(TokenType.LEFT_PARENTHESIS, 'Expect \'(\' after \'for\'.');

    let initializer: Stmt | null = null;
    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr = new LiteralExpr(true);
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }

    this.consume(TokenType.SEMICOLON, 'Expect \';\' after loop condition.');

    let increment: Expr | null = null;
    if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after for clauses.');

    this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after for clauses.');
    let body = this.statement();

    if (increment !== null) {
      /**
       * Resulting code
       * @example
       * {
       *   ...body...
       *   ...increment...
       * }
       */
      body = new BlockStmt([body, new ExpressionStmt(increment)]);
    }


    /**
     * Resulting code
     * @example
     * while (...condition...) {
     *   ...body...
     *   ...increment...
     * }
     */
    body = new WhileStmt(condition, body);

    if (initializer !== null) {
      /**
       * Resulting code
       * @example
       * {
       *   ...initializer...
       *   while (...condition...) {
       *     ...body...
       *     ...increment...
       *   }
       * }
       */
      body = new BlockStmt([initializer, body]);
    }

    return body;
  }

  private printStatement(requireSemicolon = true): PrintStmt {
    const value = this.expression();
    if (requireSemicolon) {
      this.consume(TokenType.SEMICOLON, 'Expect \';\' after value.');
    }
    return new PrintStmt(value);
  }

  private returnStatement(requireSemicolon = true): ReturnStmt {
    const keyword = this.previous();
    let value: Expr | null;
    if (requireSemicolon) {
      value = this.check(TokenType.SEMICOLON) ? null : this.expression();
      this.consume(TokenType.SEMICOLON, 'Expect \';\' after return value.');
    } else {
      value = this.expression();
    }
    return new ReturnStmt(keyword, value);
  }

  private throwStatement(): Stmt {
    const keyword = this.previous();
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expect \';\' after throw value.');
    return new ThrowStmt(keyword, value);
  }

  private tryCatchStatement(): Stmt {
    this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after try.');
    const tryBlock = this.block();
    let catchBlock: Stmt[] | null = null;
    let finallyBlock: Stmt[] | null = null;
    let catchParam: Token | null = null;

    if (this.match(TokenType.CATCH)) {
      this.consume(TokenType.LEFT_PARENTHESIS, 'Expect \'(\' after catch.');
      if (this.match(TokenType.IDENTIFIER)) {
        catchParam = this.previous();
      }
      this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after catch parameter.');
      this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after catch parameter.');
      catchBlock = this.block();
    }

    if (this.match(TokenType.FINALLY)) {
      this.consume(TokenType.LEFT_BRACE, 'Expect \'{\' after finally.');
      finallyBlock = this.block();
    }

    if (catchBlock === null && finallyBlock === null) {
      throw new ParserError(this.peek(), 'Expect catch or finally block.');
    }

    return new TryCatchStmt(tryBlock, catchBlock, catchParam, finallyBlock);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) statements.push(declaration);
    }

    this.consume(TokenType.RIGHT_BRACE, 'Expect \'}\' after block.');
    return statements;
  }

  private expressionStatement(requireSemicolon = true): ExpressionStmt {
    const expr = this.expression();
    if (requireSemicolon) {
      this.consume(TokenType.SEMICOLON, 'Expect \';\' after expression.');
    }
    return new ExpressionStmt(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignExpr(expr.name, value);
      }

      if (expr instanceof GetExpr) {
        return new SetExpr(expr.object, expr.name, value);
      }

      if (expr instanceof GetItemExpr) {
        return new SetItemExpr(expr.array, expr.index, equals, value);
      }

      this.errorHandler.error(equals, 'Invalid assignment target.');
    }

    return expr;
  }

  private or(): Expr {
    let expr: Expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }


  private and(): Expr {
    let expr: Expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr: Expr = this.term();

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.exponents();

    while (this.match(TokenType.SLASH, TokenType.STAR, TokenType.PERCENT)) {
      const operator = this.previous();
      const right = this.exponents();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private exponents(): Expr {
    let expr: Expr = this.unary();

    while (this.match(TokenType.CARET)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.call();
  }

  private call(): Expr {
    let expr: Expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PARENTHESIS)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, 'Expect property name after \'.\'.');
        expr = new GetExpr(expr, name);
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        const index = this.expression();
        const bracket = this.consume(TokenType.RIGHT_BRACKET, 'Expect \']\' after array index.');
        expr = new GetItemExpr(expr, bracket, index);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): CallExpr {
    const args: Expr[] = [];

    if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
      do {
        if (args.length >= 255) {
          this.errorHandler.error(this.peek(), 'Can\'t have more than 255 arguments.');
        }

        args.push(this.expression());

      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after arguments.');

    return new CallExpr(callee, paren, args);
  }

  private primary(): ThisExpr | SuperExpr | LiteralExpr | GroupingExpr | VariableExpr | ArrayExpr | MapExpr {
    // Literal
    if (this.match(TokenType.FALSE)) return new LiteralExpr(false);
    if (this.match(TokenType.TRUE)) return new LiteralExpr(true);
    if (this.match(TokenType.NULL)) return new LiteralExpr(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpr(this.previous().literal);
    }

    // Super
    if (this.match(TokenType.SUPER)) {
      const keyword = this.previous();
      this.consume(TokenType.LEFT_PARENTHESIS, 'Expect \'(\' after super');
      const className = this.consume(TokenType.IDENTIFIER, 'Expect superclass name.')
      this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after superclass name.');
      this.consume(TokenType.DOT, 'Expect \'.\' after \'super\' call.');
      const method = this.consume(TokenType.IDENTIFIER, 'Expect superclass method name.');
      return new SuperExpr(keyword, className, method);
    }

    // This
    if (this.match(TokenType.THIS)) return new ThisExpr(this.previous());

    // Arrow Function
    // TODO: improve arrow function search so that it doesn't have to check at every expression.
    const arrowFunctionExpr = this.arrowFunctionExpr();
    if (arrowFunctionExpr) return arrowFunctionExpr;

    // Array
    if (this.match(TokenType.LEFT_BRACKET)) {
      const elements: Expr[] = [];
      if (!this.check(TokenType.RIGHT_BRACKET)) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RIGHT_BRACKET, 'Expect \']\' after array elements.');
      return new ArrayExpr(elements);
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpr(this.previous());
    }

    // Grouping
    if (this.match(TokenType.LEFT_PARENTHESIS)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after expression.');
      return new GroupingExpr(expr);
    }

    // Map
    if (this.match(TokenType.LEFT_BRACE)) {
      const properties: Map<Token, Expr> = new Map();
      if (!this.check(TokenType.RIGHT_BRACE)) {
        do {
          const key = this.consume(TokenType.IDENTIFIER, 'Expect property name.');
          this.consume(TokenType.COLON, 'Expect \':\' after property name.');
          const value = this.expression();
          properties.set(key, value);
        } while (this.match(TokenType.COMMA));
      }

      this.consume(TokenType.RIGHT_BRACE, 'Expect \'}\' after object properties.');
      return new MapExpr(properties);
    }

    throw new ParserError(this.peek(), 'Expect expression.');
  }

  private getFunctionParameters(): Token[] {
    const parameters: Token[] = [];
    if (!this.check(TokenType.RIGHT_PARENTHESIS)) {
      do {
        if (parameters.length >= 255) {
          this.errorHandler.error(this.peek(), 'Can\'t have more than 255 parameters.');
        }

        parameters.push(this.consume(TokenType.IDENTIFIER, 'Expect parameter name.'));
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PARENTHESIS, 'Expect \')\' after parameters.');

    return parameters;
  }

  /**
   * @private
   * @description
   *
   * If null is return then it's not an arrow function
   * otherwise a VariableExpr is returned that resolved to a arrow function
   */
  private arrowFunctionExpr(): VariableExpr | null {
    // Matches (...identifier) ->
    const isArrowFunctionWithParameters = this.checkPattern({
      type: TokenType.LEFT_PARENTHESIS,
      next: {
        type: TokenType.IDENTIFIER,
        oneOrMore: true,
        separator: TokenType.COMMA,
        next: {
          type: TokenType.RIGHT_PARENTHESIS,
          next: {
            type: TokenType.ARROW_FUNCTION,
          },
        },
      },
    });
    if (isArrowFunctionWithParameters) {
      this.advance(); // (
      const parameters: Token[] = this.getFunctionParameters();
      this.advance(); // ->

      return this.declareArrowFunction(parameters);
    }

    // Matches () ->
    const isArrowFunctionWithEmptyParameters = this.checkPattern({
      type: TokenType.LEFT_PARENTHESIS,
      next: {
        type: TokenType.RIGHT_PARENTHESIS,
        next: {
          type: TokenType.ARROW_FUNCTION,
        },
      },
    });
    if (isArrowFunctionWithEmptyParameters) {
      this.advance(); // (
      this.advance(); // )
      this.advance(); // ->

      return this.declareArrowFunction([]);
    }

    // Matches ->
    if (this.match(TokenType.ARROW_FUNCTION)) return this.declareArrowFunction([]);

    return null;
  }

  private declareArrowFunction(parameters: Token[]): VariableExpr {
    const getFunctionBody = () => {
      if (!this.match(TokenType.LEFT_BRACE)) { // Single line function
        if (this.match(TokenType.RETURN)) return [this.returnStatement(false)];
        if (this.match(TokenType.PRINT)) return [this.printStatement(false)];

        // Appending a new return token to the tokens list between current
        const keyword = new Token(TokenType.RETURN, 'return', null, this.previous().line);
        this.tokens.splice(this.current - 1, 0, keyword);
        this.current++;

        return [new ReturnStmt(keyword, this.expression())]; // Implicit return
      }

      return this.block();
    };

    const body = getFunctionBody();

    const name = new Token(TokenType.IDENTIFIER, crypto.randomUUID(), null, this.previous().line);

    const stmt = new FunctionStmt(name, parameters, body);
    // We need to declare the function first as an extra statement then assign it to a variable.

    // push to statements before last entry
    this.statements.push(stmt);
    return new VariableExpr(name);
  }


  // Helpers
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw new ParserError(this.peek(), message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private checkPattern(pattern: Pattern, i = 0): boolean {
    if (this.isAtEnd()) return false;
    const token = this.tokens[this.current + i];

    if (token.type !== pattern.type) return false;

    if (!pattern.next) return true;

    if (pattern.oneOrMore && pattern.separator) {
      const nextToken = this.tokens[this.current + i + 1];
      if (nextToken.type === pattern.separator) {
        return this.checkPattern(pattern, i + 2);
      }
    }
    return this.checkPattern(pattern.next, i + 1);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNCTION:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}
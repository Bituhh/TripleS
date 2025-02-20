import {Token} from './token';
import {TokenType} from './token-type.enum';
import {KEYWORDS} from './keywords';
import {ErrorHandler} from '../error-handler';

export class Scanner {
  private source: string = '';
  private current = 0;
  private start = 0;
  private line = 1;
  private tokens: Token[] = [];

  constructor(private errorHandler: ErrorHandler) {
  }

  scan(source: string): Token[] {
    this.source = source;


    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PARENTHESIS);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PARENTHESIS);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(this.match('>') ? TokenType.ARROW_FUNCTION : TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ':':
        this.addToken(TokenType.COLON);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '^':
        this.addToken(TokenType.CARET);
        break;
      case '%':
        this.addToken(TokenType.PERCENT);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '|':
        this.addToken(this.match('|') ? TokenType.OR : TokenType.PIPE);
        break;
      case '&':
        this.addToken(this.match('&') ? TokenType.AND : TokenType.AMPERSAND);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.line++;
        break;

      case '\'':
      case '"':
        this.string();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.errorHandler.error(this.line, `Unexpected character: ${c}`);
        }
        break;
    }
  }

  private string(): void {
    const quote = this.peekPrevious();

    let isEscaped = false;
    while (quote !== this.peek() && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      if (this.peek() === '\\') {
        if (quote === this.peekNext()) {
          isEscaped = true;
          this.advance();
        }
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.errorHandler.error(this.line, 'Unterminated string.');
      return;
    }

    // The closing quote.
    this.advance();


    // Trim the surrounding quotes.
    const literal = this.source.substring(this.start + 1, this.current - 1);

    const unescape = () => {
      return literal
        // Backspace
        .replace(/\\b/g, '\b')
        // Form Feed
        .replace(/\\f/g, '\f')
        // Carriage Return
        .replace(/\\r/g, '\r')
        // New Line
        .replace(/\\n/g, '\n')
        // Horizontal Tab
        .replace(/\\t/g, '\t')
        // Vertical Tab
        .replace(/\\v/g, '\v')
        // Backslash
        .replace(/\\\\/g, '\\')
        // Single quote
        .replace(/\\'/g, '\'')
        // Double quote
        .replace(/\\"/g, '\"')
        // Null
        .replace(/\\0/g, '\0')
        // Unicode
        .replace(/\\u\{([0-9a-fA-F]{4})\}/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        }).normalize();
    };


    this.addToken(TokenType.STRING, unescape());
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const float = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.NUMBER, float);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private addToken(type: TokenType): void;
  private addToken(type: TokenType, literal: string | number): void;
  private addToken(type: TokenType, literal?: string | number) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] != expected) return false;
    this.current++;
    return true;
  }

  private peekPrevious(): string {
    return this.source[this.current - 1];
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source[this.current + 1];
  }

  private isDigit(c: string): boolean {
    const number = parseInt(c);
    return !isNaN(number);
  }

  private isAlpha(c: string): boolean {
    const regex = /[a-zA-Z_]/;
    return regex.test(c);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const keyword = this.source.substring(this.start, this.current);
    const type: TokenType = KEYWORDS[keyword] ?? TokenType.IDENTIFIER;
    this.addToken(type);
  }
}
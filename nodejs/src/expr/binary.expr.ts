import {Expr, ExprVisitor} from './expr'; 
import {Token} from '../scanner';

export class BinaryExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super()
  }

  accept<T = number | string | boolean>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}
import {Expr, ExprVisitor} from './expr'; 
import {Token} from '../scanner';

export class UnaryExpr extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super()
  }

  accept<T = number | boolean>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}
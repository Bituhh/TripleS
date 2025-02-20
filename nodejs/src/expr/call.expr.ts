import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class CallExpr extends Expr {
  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}
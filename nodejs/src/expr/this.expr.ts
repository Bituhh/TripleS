import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class ThisExpr extends Expr {
  constructor(public keyword: Token) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitThisExpr(this);
  }
}
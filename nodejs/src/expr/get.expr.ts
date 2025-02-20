import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class GetExpr extends Expr {
  constructor(public object: Expr, public name: Token) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
  }
}
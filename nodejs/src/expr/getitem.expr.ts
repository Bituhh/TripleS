import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class GetItemExpr extends Expr {
  constructor(public array: Expr, public bracket: Token, public index: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetItemExpr(this);
  }
}
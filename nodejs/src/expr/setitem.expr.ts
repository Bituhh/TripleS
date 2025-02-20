import {Expr, ExprVisitor} from './expr'; 
import {Value} from '../triples';
import {Token} from '../scanner';

export class SetItemExpr extends Expr {
  constructor(public array: Expr, public index: Expr, public equals: Token, public value: Expr) {
    super()
  }

  accept<T = Value>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetItemExpr(this);
  }
}
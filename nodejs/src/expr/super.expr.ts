import {Expr, ExprVisitor} from './expr'; 
import {Function} from '../interpreter/function';
import {Token} from '../scanner';

export class SuperExpr extends Expr {
  constructor(public keyword: Token, public className: Token, public method: Token) {
    super()
  }

  accept<T = Function>(visitor: ExprVisitor<T>): T {
    return visitor.visitSuperExpr(this);
  }
}
import {generateAst, Type} from './generate-ast';

export const exprDefinition: Type[] = [
  {
    name: 'Binary',
    args: [
      {name: 'left', type: 'Expr'},
      {
        name: 'operator', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'right', type: 'Expr'},
    ],
    returnType: 'number | string | boolean',
  },
  {
    name: 'Grouping',
    args: [
      {name: 'expression', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Literal',
    args: [
      {
        name: 'value',
        type: 'number | string | boolean | null',
      },
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Unary',
    args: [
      {
        name: 'operator', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'right', type: 'Expr'},
    ],
    returnType: 'number | boolean',
  },
  {
    name: 'Variable',
    args: [
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Assign',
    args: [
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'value', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Logical',
    args: [
      {name: 'left', type: 'Expr'},
      {
        name: 'operator', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'right', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Call',
    args: [
      {name: 'callee', type: 'Expr'},
      {
        name: 'paren', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'args', type: 'Expr[]'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Get',
    args: [
      {name: 'object', type: 'Expr'},
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Set',
    args: [
      {name: 'object', type: 'Expr'},
      {
        name: 'name', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'value', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'This',
    args: [
      {
        name: 'keyword',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Super',
    args: [
      {
        name: 'keyword',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'className',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {
        name: 'method',
        type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
    ],
    returnType: {
      name: 'Function',
      importFrom: '../interpreter/function',
    },
  },
  {
    name: 'Array',
    args: [
      {name: 'elements', type: 'Expr[]'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'GetItem',
    args: [
      {name: 'array', type: 'Expr'},
      {
        name: 'bracket', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'index', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'SetItem',
    args: [
      {name: 'array', type: 'Expr'},
      {name: 'index', type: 'Expr'},
      {
        name: 'equals', type: {
          name: 'Token',
          importFrom: '../scanner',
        },
      },
      {name: 'value', type: 'Expr'},
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
  {
    name: 'Map',
    args: [
      {
        name: 'properties',
        type: {
          name: 'Map<Token, Expr>',
          importFrom: '../scanner',
          importAs: 'Token',
        },
      },
    ],
    returnType: {
      name: 'Value',
      importFrom: '../triples',
    },
  },
];

generateAst('../', 'Expr', exprDefinition);

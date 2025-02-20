import fs from 'fs';
import path from 'path';

export interface Type {
  name: string;
  args: TypeArg[];
  returnType?: string | DynamicType;
}

interface DynamicType {
  name: string;
  importAs?: string;
  importFrom: string;
}

interface TypeArg {
  name: string;
  type: DynamicType | string;
}


export function generateAst(outputPath: string, baseName: string, types: Type[]) {
  const fs = require('fs');
  const path = require('path');

  const dir = path.join(outputPath, baseName.toLowerCase());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  createBaseFile(baseName, types, dir);

  for (const type of types) {
    createClassFile(baseName, type, dir);
  }

  createIndexFile(baseName, types, dir);
}

function getImportContent(types: Type[]) {
  const allImports: {
    importTypes: string[]
    from: string
  }[] = [];

  const addToImportList = (type: string, from: string) => {
    const existing = allImports.find((imp) => imp.from === from);
    if (existing) {
      if (existing.importTypes.includes(type)) return; // Type already imported
      existing.importTypes.push(type);
    } else {
      allImports.push({importTypes: [type], from});
    }
  };


  for (const type of types) {
    if (type.returnType && typeof type.returnType !== 'string') {
      const returnType = type.returnType as DynamicType;
      const typeName = returnType?.importAs ?? returnType.name;
      const from = returnType.importFrom;

      addToImportList(typeName, from);
    }

    for (const arg of type.args) {
      if (typeof arg.type !== 'string') {
        const argType = arg.type as DynamicType;
        const typeName = argType?.importAs ?? argType.name;
        const from = argType.importFrom;

        addToImportList(typeName, from);
      }
    }
  }

  return allImports.map((imp) => `import {${imp.importTypes.join(', ')}} from '${imp.from}';`).join('\n');
}

function createBaseFile(baseName: string, types: Type[], dir: string) {
  const baseContent = `
${types.map((type) => `import {${type.name}${baseName}} from './${type.name.toLowerCase()}.${baseName.toLowerCase()}';`).join('\n')}

export abstract class ${baseName} {
  abstract accept<T>(visitor: ${baseName}Visitor<T>): T;
}

export interface ${baseName}Visitor<R> {
  ${types.map((type) => `visit${type.name}${baseName}(${baseName.toLowerCase()}: ${type.name}${baseName}): R${type.returnType ? ' extends (' + (typeof type.returnType !== 'string' ? type.returnType.name : type.returnType) + ') ? R : R' : ''};`).join('\n  ')}
}
`;
  fs.writeFileSync(path.join(dir, `${baseName.toLowerCase()}.ts`), baseContent.trim());
}


function createClassFile(baseName: string, type: Type, dir: string) {
  const className = type.name;
  const args = type.args;

  const classContent = `
import {${baseName}, ${baseName}Visitor} from './${baseName.toLowerCase()}'; 
${getImportContent([type])}

export class ${className}${baseName} extends ${baseName} {
  constructor(${args.map((arg) => `public ${arg.name}: ${(arg.type as DynamicType)?.name ?? arg.type}`).join(', ')}) {
    super()
  }

  accept<T${type.returnType ? ' = ' + (typeof type.returnType !== 'string' ? type.returnType.name : type.returnType) : ''}>(visitor: ${baseName}Visitor<T>): T {
    return visitor.visit${className}${baseName}(this);
  }
}
`;

  fs.writeFileSync(path.join(dir, `${className.toLowerCase()}.${baseName.toLowerCase()}.ts`), classContent.trim());
}

function createIndexFile(baseName: string, types: Type[], dir: string) {
  const indexContent = `
export * from './${baseName.toLowerCase()}';
${types.map((type) => `export * from './${type.name.toLowerCase()}.${baseName.toLowerCase()}';`).join('\n')}
`;
  fs.writeFileSync(path.join(dir, 'index.ts'), indexContent.trim());
}


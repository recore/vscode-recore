import * as fs from 'fs';
import * as babel from '@babel/parser';
import * as _ from 'lodash';

export interface IController {
  components: string[];
  properties: string[];
  methods: string[];
}

export function findController(): IController | null {
  let ret: IController | null;
  try {
    const code = fs.readFileSync('/Users/xht/xht/hello-babel/src/test.js', 'utf-8');
    const source: any = babel.parse(code, {
      // parse in strict mode and allow module declarations
      sourceType: "module",
      plugins: [
        "decorators-legacy",
        "classProperties"
      ]
    });
    ret = getInfoFromController(source);
  } catch (error) {
    console.info(error);
  }
   if (ret) {
     return ret;
   } else {
     return null;
   }
}

function getInfoFromController(source: any): IController | null {
  var body = source.program.body;
  if (!body.length) {
    return null;
  }

  const exportDefaultDeclaration = body.filter((node: any) => node.type === 'ExportDefaultDeclaration').shift();

  const exportDefaultBody = _.get(exportDefaultDeclaration, ['declaration', 'body']);
  if (exportDefaultBody) { // 优先分析默认导出类
    return parseClass(exportDefaultDeclaration.declaration);
  } else { // 分析默认导出指针同名类
    const exportDefaultName = _.get(exportDefaultDeclaration, ['declaration', 'name'], '');
    const classDeclarations = body.filter((node: any) => node.type === 'ClassDeclaration');
    const classDeclaration = classDeclarations.filter((cls: any) => {
      const name = _.get(cls, ['id', 'name'], '');
      return name === exportDefaultName;
    }).shift();
    return parseClass(classDeclaration);
  }
}

function parseClass(declaration: any): IController | null {
  if (!declaration) {
    return null;
  }

  const classBody = _.get(declaration, ['body', 'body'], []);
  const decorators = _.get(declaration, ['decorators'], []);

  const components: string[] = [];
  const helpers: string[] = [];
  let properties: string[];
  const methods: string[] = [];

  // 解析类
  if (classBody.length) {
    const classProps = classBody.filter((item: any) => {
      return item.type === 'ClassProperty';
    });
    const classMethods = classBody.filter((item: any) => {
      return item.type === 'ClassMethod';
    });

    // 属性
    const totalProps: string[] = [];
    classProps.forEach((item: any) => {
      const prop = _.get(item, ['key', 'name'], '');
      if (!!prop) {
        totalProps.push(prop);
      }
    });

    // 方法
    classMethods.forEach((item: any) => {
      // 使用了get和set的属性
      if (item.kind === 'get' || item.kind === 'set') {
        const extraProp = _.get(item, ['key', 'name'], '');
        if (!extraProp) {
          totalProps.push(extraProp);
        }
      } else {
        const method = _.get(item, ['key', 'name'], '');
        if (!!method && isPublic(method)) {
          methods.push(method);
        }
      }
    });
  
    // 属性去重
    properties = _.uniq(totalProps);
  }

  // 解析@inject
  const decorator = decorators.shift();
  const decoratorName = _.get(decorator, ['expression', 'callee', 'name'], '');
  const decoratorArgs = _.get(decorator, ['expression', 'arguments'], []).shift();
  const decoratorProps = _.get(decoratorArgs, 'properties', []);
  if (decoratorName === 'inject' && decoratorProps.length) {
    decoratorProps.forEach((item: any) => {
      const name = _.get(item, ['key', 'name'], '');
      const props = _.get(item, ['value', 'properties'], []);
      if (!props.length) {
        return;
      }
      props.forEach((prop: any) => {
        const injectProp = _.get(prop, ['key', 'name'], '');
        if (!injectProp) {
          return;
        }
        if (name === 'components') {
          components.push(injectProp);
        } else if (name === 'helpers') {
          helpers.push(injectProp);
        }
      });
    });
  }

  return {
    components,
    properties,
    methods: [...methods, ...helpers]
  };
}

function isPublic(method: string): Boolean {
  return method[0] !== '_';
}

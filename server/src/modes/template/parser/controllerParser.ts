import * as fs from 'fs';
import * as babel from '@babel/parser';
import * as _ from 'lodash';
import { basename, dirname, extname, resolve } from 'path';

export interface IController {
  components: string[];
  properties: string[];
  methods: string[];
}

export function findController(vxPath: string): IController {
  let ctlInfo: IController | null;
  let bsInfo: IController | null;

  // 探测controller
  const controller = readController(vxPath);
  try {
    const ctlSource: any = babel.parse(controller, {
      // parse in strict mode and allow module declarations
      sourceType: "module",
      plugins: [
        "decorators-legacy",
        "classProperties",
        "typescript"
      ]
    });
    ctlInfo = getInfoFromController(ctlSource);
  } catch (e) {
    console.info(e);
  }

  // 探测boostrap
  const bootstrap = readBootStrap(vxPath);
  try {
    const bsSource = babel.parse(bootstrap, {
      // parse in strict mode and allow module declarations
      sourceType: "module",
      plugins: [
        "decorators-legacy",
        "classProperties",
        "typescript"
      ]
    });
    bsInfo = getInfoFromBootStrap(bsSource);
  } catch (e) {}

  if (ctlInfo && bsInfo) {
    const ret = {
      components: [...ctlInfo.components, ...bsInfo.components],
      properties: [...ctlInfo.properties],
      methods: [...ctlInfo.methods, ...bsInfo.methods]
    };
    return uniq(ret);
  } else if (ctlInfo && !bsInfo) {
    return uniq(ctlInfo);
  } else if (!ctlInfo && bsInfo) {
    return uniq(bsInfo);
  }
  return null;
}

function readController(vxPath: string): string | null {
  const file = basename(vxPath);
  const ext = extname(file);
  const dirPath = dirname(vxPath);
  const dirName = basename(dirPath);

  const targetNames = [
    `${file.replace(ext, '')}.js`, `${file.replace(ext, '')}.ts`, // vx 文件同名
    'index.js', 'index.ts',
    `${dirName}.js`, `${dirName}.ts`, // 目录名
  ];
  const targetPaths = targetNames.map((item: string) => resolve(dirPath, item));
  const length = targetPaths.length;
  let code: string;
  for (let i = 0; i < length; i++) {
    const path = targetPaths[i];
    try {
      code = fs.readFileSync(path, 'utf-8');
      break;
    } catch (e) {}
  }
  return code;
}

function getInfoFromController(source: any): IController | null {
  const body = source.program.body;
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
  const properties: string[] = [];
  let methods: string[] = [];

  // 解析类
  if (classBody.length) {
    const classProps = classBody.filter((item: any) => {
      return item.type === 'ClassProperty';
    });
    const classMethods = classBody.filter((item: any) => {
      return item.type === 'ClassMethod';
    });

    // 属性
    classProps.forEach((item: any) => {
      const prop = _.get(item, ['key', 'name'], '');
      if (!!prop) {
        properties.push(prop);
      }
    });

    // 方法
    classMethods.forEach((item: any) => {
      // 使用了get和set的属性
      if (item.kind === 'get' || item.kind === 'set') {
        const extraProp = _.get(item, ['key', 'name'], '');
        if (!extraProp) {
          properties.push(extraProp);
        }
      } else {
        const method = _.get(item, ['key', 'name'], '');
        if (!!method && isPublic(method) && method[0] !== '$') {
          methods.push(method);
        }
      }
    });
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

function readBootStrap(vxPath: string): string {
  let code: string;
  const srcPath = getSrcPath(vxPath);
  const targets = [resolve(srcPath, './bootstrap.js'), resolve(srcPath, './bootstrap.ts')];
  for (let i = 0; i < targets.length; i++) {
    const path = targets[i];
    try {
      code = fs.readFileSync(path, 'utf-8');
      break;
    } catch (e) {}
  }
  return code;
}

function getInfoFromBootStrap(source: any): IController | null {
  const components: string[] = [];
  const methods: string[] = [];
  const body = source.program.body;
  if (!body.length) {
    return null;
  }

  const ExpressionStatement = body.filter((node: any) => node.type === 'ExpressionStatement').shift();
  const runAppArgs = _.get(ExpressionStatement, ['expression', 'arguments'], []).shift();
  const runAppProps = _.get(runAppArgs, 'properties', []);
  runAppProps.forEach((item: any) => {
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
      if (name === 'globalComponents') {
        components.push(injectProp);
      } else if (name === 'globalHelpers') {
        methods.push(injectProp);
      }
    });
  });

  return {
    components,
    properties: [],
    methods
  };
}

function isPublic(method: string): Boolean {
  return method[0] !== '_';
}

function getSrcPath(vxPath: string): string {
  const dirPath = dirname(vxPath);
  const dirName = basename(dirPath);
  if (dirName === 'src') {
    return dirPath;
  } else {
    return getSrcPath(dirPath);
  }
}

function uniq(info: IController): IController {
  const components = _.uniq(info.components);
  const properties = _.uniq(info.properties);
  const methods = _.uniq(info.methods);
  return {
    components,
    properties,
    methods
  };
}

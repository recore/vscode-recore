import * as _ from 'lodash';
import { FormattingOptions, TextEdit, Range } from 'vscode-languageserver-types';

import { ParserOption, Prettier, PrettierConfig, PrettierVSCodeConfig, PrettierEslintFormat } from './prettier';
import { indentSection } from '../strings';

export function prettierify(
  code: string,
  filePath: string,
  range: Range,
  initialIndent: boolean,
  formatParams: FormattingOptions,
  prettierVSCodeConfig: PrettierVSCodeConfig,
  parser: ParserOption
): TextEdit[] {
  try {
    const prettier = require('prettier') as Prettier;
    const prettierOptions = getPrettierOptions(prettierVSCodeConfig, parser, filePath);

    const prettierifiedCode = prettier.format(code, prettierOptions);
    return [toReplaceTextedit(prettierifiedCode, range, formatParams, initialIndent)];
  } catch (e) {
    console.log('Prettier format failed');
    console.error(e.message);
    return [];
  }
}

export function prettierEslintify(
  code: string,
  filePath: string,
  range: Range,
  initialIndent: boolean,
  formatParams: FormattingOptions,
  prettierVSCodeConfig: PrettierVSCodeConfig,
  parser: ParserOption
): TextEdit[] {
  try {
    const prettierEslint = require('prettier-eslint') as PrettierEslintFormat;
    const prettierOptions = getPrettierOptions(prettierVSCodeConfig, parser, filePath);

    const prettierifiedCode = prettierEslint({
      filePath: require('path').dirname(filePath),
      text: code,
      fallbackPrettierOptions: prettierOptions
    });
    return [toReplaceTextedit(prettierifiedCode, range, formatParams, initialIndent)];
  } catch (e) {
    console.log('Prettier-Eslint format failed');
    console.error(e.message);
    return [];
  }
}

function getPrettierOptions(
  prettierVSCodeConfig: PrettierVSCodeConfig,
  parser: ParserOption,
  filePath: string
): PrettierConfig {
  let trailingComma = prettierVSCodeConfig.trailingComma;
  if (trailingComma === true) {
    trailingComma = 'es5';
  } else if (trailingComma === false) {
    trailingComma = 'none';
  }

  const prettierOptions = {
    printWidth: prettierVSCodeConfig.printWidth,
    tabWidth: prettierVSCodeConfig.tabWidth,
    singleQuote: prettierVSCodeConfig.singleQuote,
    trailingComma,
    bracketSpacing: prettierVSCodeConfig.bracketSpacing,
    jsxBracketSameLine: prettierVSCodeConfig.jsxBracketSameLine,
    parser,
    semi: prettierVSCodeConfig.semi,
    useTabs: prettierVSCodeConfig.useTabs,
    arrowParens: prettierVSCodeConfig.arrowParens
  };

  const prettier = require('prettier') as Prettier;
  const prettierrcOptions = (prettier.resolveConfig as any).sync(filePath, { useCache: false });

  if (!prettierrcOptions) {
    return prettierOptions;
  } else {
    // The only alternative parser that can be specified is `flow` for <script>
    if (parser === 'babylon') {
      return _.assign(prettierOptions, prettierrcOptions);
    }

    // Otherwise, use the parser specified by Recore
    return _.assign(prettierOptions, prettierrcOptions, {
      parser
    });
  }
}

function toReplaceTextedit(
  prettierifiedCode: string,
  range: Range,
  formatParams: FormattingOptions,
  initialIndent: boolean
): TextEdit {
  if (initialIndent) {
    // Prettier adds newline at the end
    const formattedCode = '\n' + indentSection(prettierifiedCode, formatParams);
    return TextEdit.replace(range, formattedCode);
  } else {
    return TextEdit.replace(range, '\n' + prettierifiedCode);
  }
}

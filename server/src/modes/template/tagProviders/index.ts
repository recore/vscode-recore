import { IHTMLTagProvider } from './common';
import { getHTML5TagProvider } from './htmlTags';
import { getVisionXTagProvider } from './visionxTags';
export { getComponentTags } from './componentTags';
export { IHTMLTagProvider } from './common';

import * as ts from 'typescript';
import * as fs from 'fs';

export let allTagProviders: IHTMLTagProvider[] = [
  getHTML5TagProvider(),
  getVisionXTagProvider(),
];

export interface CompletionConfiguration {
  [provider: string]: boolean;
}

export function getTagProviderSettings() {
  const settings: CompletionConfiguration = {
    html5: true,
    visionx: true,
  };
  return settings;
}

export function getEnabledTagProviders(tagProviderSetting: CompletionConfiguration) {
  return allTagProviders.filter(p => tagProviderSetting[p.getId()] !== false);
}

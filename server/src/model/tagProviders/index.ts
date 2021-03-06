import { IHTMLTagProvider } from './common';
import { getHTML5TagProvider } from './htmlTags';
import { getVisionXTagProvider } from './visionxTags';
export { getControllerTags } from './controllerTags';
export { IHTMLTagProvider } from './common';

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

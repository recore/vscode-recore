import { IController } from '../parser/controllerParser';
import {
  HTMLTagSpecification,
  IHTMLTagProvider,
  ITagSet,
  IValueSets,
  collectTagsDefault,
  collectAttributesDefault,
  collectValuesDefault,
  // genAttribute,
  Priority
} from './common';

export function getControllerTags(controller: IController): IHTMLTagProvider {
  const tags: ITagSet = {};
  const valueSets: IValueSets = { g: [] };
  const { components, properties, methods } = controller;
  components.forEach((comp: string) => {
    tags[comp] = new HTMLTagSpecification('');
  });
  properties.forEach((prop: string) => {
    valueSets.g.push(prop);
  });
  methods.forEach((prop: string) => {
    valueSets.g.push(prop);
  });
  return {
    getId: () => 'controller',
    priority: Priority.UserCode,
    collectTags: collector => collectTagsDefault(collector, tags),
    collectAttributes: (tag: string, collector: (attribute: string, type?: string, documentation?: string) => void) => {
      collectAttributesDefault(tag, collector, tags, []);
    },
    collectValues: (tag: string, attribute: string, collector: (value: string) => void) => {
      collectValuesDefault(tag, attribute, collector, tags, [], valueSets);
    }
  };
}

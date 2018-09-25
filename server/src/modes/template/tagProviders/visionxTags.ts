/* tslint:disable:max-line-length */
import {
  HTMLTagSpecification,
  IHTMLTagProvider,
  collectTagsDefault,
  collectAttributesDefault,
  collectValuesDefault,
  genAttribute,
  AttributeCollector,
  Priority
} from './common';

const u = undefined;

const visionxDirectives = [
  genAttribute(
    'x-show',
    u,
    'Toggle’s the element’s `display` CSS property based on the truthy-ness of the expression value.'
  ),
  genAttribute('x-if', u, 'Conditionally renders the element based on the truthy-ness of the expression value.'),
  genAttribute('x-else', 'x', 'Denotes the “else block” for `x-if` or a `x-if`/`x-else-if` chain.'),
  genAttribute('x-else-if', u, 'Denotes the “else if block” for `x-if`. Can be chained.'),
  genAttribute('x-for', u, 'Renders the element or template block multiple times based on the source data.'),
  genAttribute('x-each', u, 'Specify an alias and an index alias of iteration item'),
  genAttribute('x-model', u, 'Creates a two-way binding on a form input element or a component.'),
  genAttribute('x-area', u, 'Creates a two-way binding on a form input element or a component.'),
  genAttribute('key', u, 'Hint at VNodes identity for VDom diffing, e.g. list rendering'),
  genAttribute('ref', u, 'Register a reference to an element or a child component.'),
];

const visionxTags = {
  block: new HTMLTagSpecification(
    'A wrapper tag without rendering itself'
  ),
};

const valueSets = {
  transMode: ['out-in', 'in-out'],
  transType: ['transition', 'animation'],
  b: ['true', 'false']
};

export function getVisionXTagProvider(): IHTMLTagProvider {
  return {
    getId: () => 'visionx',
    priority: Priority.Framework,
    collectTags: collector => collectTagsDefault(collector, visionxTags),
    collectAttributes: (tag: string, collector: AttributeCollector) => {
      collectAttributesDefault(tag, collector, visionxTags, visionxDirectives);
    },
    collectValues: (tag: string, attribute: string, collector: (value: string) => void) => {
      collectValuesDefault(tag, attribute, collector, visionxTags, visionxDirectives, valueSets);
    }
  };
}

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
    'jsx',
    'Toggle’s the element’s `display` CSS property based on the truthy-ness of the expression value.'
  ),
  genAttribute('x-if', 'jsx', 'Conditionally renders the element based on the truthy-ness of the expression value.'),
  genAttribute('x-else', 'v', 'Denotes the “else block” for `x-if` or a `x-if`/`x-else-if` chain.'),
  genAttribute('x-else-if', 'jsx', 'Denotes the “else if block” for `x-if`. Can be chained.'),
  genAttribute('x-for', 'jsx', 'Renders the element or template block multiple times based on the source data.'),
  genAttribute('x-each', u, 'Specify an alias and an index alias of iteration item'),
  genAttribute('x-model', 'jsx', 'Creates a two-way binding on a form input element or a component.'),
  genAttribute('x-area', 'v', 'Re-rendering when the dependent variable in the element and child element changes'),
  genAttribute('key', u, 'Hint at VNodes identity for VDom diffing, e.g. list rendering'),
  genAttribute('ref', 'jsx', 'Register a reference to an element or a child component.'),
  genAttribute('className', u, 'name of css class'),
];

const visionxTags = {
  Link: new HTMLTagSpecification('Declarative "link" for application navigation as substitute for "a" tag', [
    genAttribute('to', u, 'The target route of the link. It can be either a string or a location descriptor object.'),
    genAttribute(
      'replace',
      'v',
      'Setting replace prop will call history.replace() when clicked, so the navigation will not leave a history record.'
    )
  ]),
  NavLink: new HTMLTagSpecification('Link to navigate user. The target location is specified with the to prop.', [
    genAttribute('to', u, 'The target route of the link. It can be either a string or a location descriptor object.'),
    genAttribute('exact', 'v', 'Force the link into "exact match mode".'),
    genAttribute('strict', 'v', 'Force the link into "strict match mode".'),
    genAttribute('activeClassName', u, 'Configure the active CSS class applied when the link is active.'),
    genAttribute('activeStyle', 'jsx', 'active style'),
    genAttribute('isActive', 'jsx', 'Custom logic of activation decision'),
  ]),
  Route: new HTMLTagSpecification('The element renders page content by matching route path', [
    genAttribute('path', u, 'matching path'),
    genAttribute('exact', 'v', 'Force the link into "exact match mode".'),
    genAttribute('strict', 'v', 'Force the link into strict match mode".'),
    genAttribute('sensitive', 'v', 'Case sensitivity".'),
    genAttribute('children', 'jsx', 'Stateless Component".'),
  ]),
  Redirect: new HTMLTagSpecification('Declarative "link" for application navigation as substitute for "a" tag', [
    genAttribute('to', u, 'The target route of the link. It can be either a string or a location descriptor object.'),
    genAttribute('push','v','When true, use history.push')
  ]),
  RouterView: new HTMLTagSpecification(
    'A component that renders the matched component for the given path.'
  ),
  block: new HTMLTagSpecification(
    'A virtual component, equivalent to Fragment'
  ),
};

const valueSets = {
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

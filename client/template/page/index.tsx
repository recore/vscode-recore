import { Component } from 'react';
import { observer, obx } from '@ali/recore';
import './index.less';

@observer
export default class <%= Name %> extends Component<Recore.PageRequest> {
  @obx name = '<%= Name %>';

  render() {
    return <div>This is {this.name}</div>;
  }
}

import { Component } from 'react';
import { observer, obx } from '@ali/recore';
import './index.scss';

@observer
export default class <%= Name %> extends Component {
  @obx name = '<%= Name %>';

  render() {
    return <div>This is {this.name}</div>;
  }
}

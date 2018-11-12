import { ViewController, obx, inject } from '@ali/recore';

@inject({
  components: {},
  helpers: {}
})
export default class <%= Name %> extends ViewController {
  @obx name = '<%= Name %>';
}

import { createTest, destroyVM } from '../util';
import App from '../../../examples/App.vue';

describe('test App vue', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  it('组件加载后, 自动生成Viewer页面', done => {
    vm = createTest(App, true);
    let appElm = vm.$el;
    expect(appElm.childElementCount > 0).to.be.true;
    done();
  });
});

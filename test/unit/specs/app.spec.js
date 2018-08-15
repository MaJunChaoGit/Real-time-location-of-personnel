import Vue from 'vue';
import App from '../../../examples/App.vue';

describe('test App vue', () => {
  it('组件加载后,title是Hello World', () => {
    let vm = new Vue(App).$mount();
    expect(vm.title).to.equal('Hello World');
  });
});

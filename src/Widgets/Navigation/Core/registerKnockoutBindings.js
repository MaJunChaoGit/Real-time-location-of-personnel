import SvgPathBindingHandler from 'cesium/Widgets/SvgPathBindingHandler';
import * as Knockout from 'knockout-es5/dist/knockout-es5.min';

var registerKnockoutBindings = function() {
  SvgPathBindingHandler.register(Knockout);
  // KnockoutMarkdownBinding.register(Knockout);
  // KnockoutHammerBinding.register(Knockout);

  Knockout.bindingHandlers.embeddedComponent = {
    /* eslint-disable no-unused-vars */
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var component = Knockout.unwrap(valueAccessor());
      component.show(element);
      return { controlsDescendantBindings: true };
    },
    /* eslint-disable no-unused-vars */
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
  };
};

export default registerKnockoutBindings;

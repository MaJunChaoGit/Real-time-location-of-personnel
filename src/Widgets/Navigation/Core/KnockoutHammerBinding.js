import Knockout from 'knockout-es5/dist/knockout-es5.min';
import Hammer from 'Hammer';

var KnockoutHammerBinding = {
  register: function(Knockout) {
    Knockout.bindingHandlers.swipeLeft = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swipeleft', function(e) {
          var viewModel = bindingContext.$data;
          f.apply(viewModel, arguments);
        });
      }
    };

    Knockout.bindingHandlers.swipeRight = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swiperight', function(e) {
          var viewModel = bindingContext.$data;
          f.apply(viewModel, arguments);
        });
      }
    };
  }
};

export default KnockoutHammerBinding;

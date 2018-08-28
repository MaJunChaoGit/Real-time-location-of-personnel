import SvgPathBindingHandler from '../../../Widgets/SvgPathBindingHandler'
import * as Knockout from 'knockout-es5/dist/knockout-es5.min'
// import KnockoutMarkdownBinding from './KnockoutMarkdownBinding'
// import KnockoutHammerBinding from './KnockoutHammerBinding'

var registerKnockoutBindings = function () {
    SvgPathBindingHandler.register(Knockout);
    // KnockoutMarkdownBinding.register(Knockout);
    // KnockoutHammerBinding.register(Knockout);

    Knockout.bindingHandlers.embeddedComponent = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var component = Knockout.unwrap(valueAccessor());
            component.show(element);
            return { controlsDescendantBindings: true };
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        }
    };
};

export default registerKnockoutBindings;
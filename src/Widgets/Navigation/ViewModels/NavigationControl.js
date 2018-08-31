import UserInterfaceControl from './UserInterfaceControl';

/**
     * 实现UserInterfaceControl的派生类
     *
     * @alias NavigationControl
     * @constructor
     * @abstract
     *
     * @param {Terria} terria The Terria instance.
     */
/* eslint-disable no-unused-vars */
var NavigationControl = function(terria) {
  UserInterfaceControl.apply(this, arguments);
};

NavigationControl.prototype = Object.create(UserInterfaceControl.prototype);

export default NavigationControl;

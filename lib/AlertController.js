/* globals Zepto, alert */
"use strict";

/**
 * Controller to handle showing and hiding of server alert messages
 */
var AlertController = function () {};

AlertController.prototype = {
    /**
     * show the message
     * @param  {String} html message
     * @return {AlertController} instance of this class for chaining
     */
    show: function (html) {
        var me = this;
        me.message.html(html);
        me.container.addClass("showing");
        return me;
    },

    /**
     * hide the message
     * @return {AlertController} instance of this class for chaining
     */
    hide: function () {
        var me = this;
        me.container.removeClass("showing");
        return me;
    },

    /**
     * entry point into the controller, binds event listeners
     * @return {AlertController} instance of this class for chaining
     */
    bindListeners: function () {
        var me = this;
        me.container = $('.alertContainer');
        me.message = me.container.find('.message');

        $("#ok").on("click", me.hide.bind(me));
    }
};

// to pull into node namespace if included
if (typeof module !== "undefined" && module.exports !== undefined) {
    module.exports = AlertController;
}



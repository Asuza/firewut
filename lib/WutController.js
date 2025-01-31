/* globals Zepto, chrome, message, AlertController */
"use strict";
/**
 * Controller to handle the majority of the binding of events and actions for the user,
 * from clicking on various things to handling the copy to clipboard event and so forth.
 * @param {String} message the instance of AlertController class that this class needs
 */
var WutController = function (message) {
    var me = this;
    me.message = message;
};

WutController.prototype = {
    /**
     * method to 0 pad a number between 0-9 (for the purpose of date/time)
     * @param  {Number} n the number to pad
     * @return {Number} the padded number
     */
    pad: function(n){
        return n < 10 ? '0' + n : n;
    },

    /**
     * focuses on the select input and selects it
     * @return {Collection} collection containing just the link item
     */
    selectAll: function(){
        var $link = $("#link");
        $link.focus();
        $link.select();
        return $link;
    },

    /**
     * execute the copy to clipboard operation
     * @return {Collection} collection containing just the link item
     */
    executeCopy: function(){
        var me = this,
            input = document.createElement('textarea'),
            $link = $("#link");
        document.body.appendChild(input);
        input.value = $link.html();
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
        $(".linkHolder").addClass("copied");
        setTimeout(function() {
            $(".linkHolder").removeClass("copied");
        },2000);
        return $link;
    },

    /**
     * perform the ajax request to generate the link and delegate response callbacks
     * @return {Deferred} the deferred object generated by $.ajax
     */
    generateLink : function() {
        var me = this,
            url = $("#urlField").val() || $("#urlField").attr("placeholder"),
            activateDate = $("#activationDateField").val(),
            deactivateDate = $("#deactivationDateField").val(),
            button = $("#generateLink");

        if (button.hasClass("disabled")) {
            return false;
        }

        button.addClass("disabled").html("Generating...");

        return $.ajax({
            url:"https://wut.link/",
            type:"POST",
            dataType: "json",
            data:{
                url:url,
                activateDate: activateDate,
                deactivateDate: deactivateDate
            },
            success: me.handleResponse.bind(me)
        });

    },

    /**
     * handle the actual ajax response (route to success or error callback)
     * @param  {Object} response Response object
     * @return {Object} response Response object for potential chaining
     */
    handleResponse: function(response) {
        var me = this;
        if (response.errors) {
            me.onGenerateLinkError(response.errors);
        } else {
            me.onGenerateLinkSuccess(response);
        }

        me.resetGenerateLinkButton();
        return response;
    },

    /**
     * generate error message returned trying to make link
     * @param  {Object} errors object containing the errors
     * @return {Array} array of error Strings
     */
    onGenerateLinkError: function (errors) {
        var me = this,
            text = [],
            error;

        if (typeof errors === "object") {
            for (error in errors) {
                if (errors.hasOwnProperty(error)) {
                    text = text.concat(errors[error]);
                }
            }
        }

        if (text.length && me.message !== undefined) {
            text.unshift("A link wasn't created because:<br>");
            me.message.show(text.join('<br>'));
        }

        return text;
    },

    /**
     * clear out the form after a successful link generation, and if copyAsap
     * is checked, also copy that link to the clipboard
     * @param  {Object} response json response from server
     * @return {Object} json response from server
     */
    onGenerateLinkSuccess: function (response) {
        var me = this,
            button = $("#generateLink");
        $("#link").html(response.proxyUrl);
        $(".linkHolder").addClass("loaded");
        button.removeClass("disabled").html("Create Link");
        if ($('#copyAsap').is(':checked')) {
            me.executeCopy();
        }

        return me;
    },

    /**
     * on chrome tab query, set the urlField's placeholder to the url
     * @param  {Collection} tabs collection of chrome tabs
     * @return {Collection} collection of chrome tabs
     */
    onTabQuery: function(tabs) {
        $("#urlField").attr("placeholder",tabs[0].url);
        return tabs;
    },

    /**
     * entry point into the controller, binds event listeners and then
     * binds the event listeners on the child AlertController class.
     * @return {WutController} the instance for chaining
     */
    bindListeners: function() {
        var me = this;
        // set placeholder to current url (will use this if not provided by user)
        chrome.tabs.query({'active': true,'currentWindow':true}, me.onTabQuery);

        $("#generateLink").on("click", me.generateLink.bind(me));
        $("#link").on("click",this.selectAll);
        $("#copyButton").on("click",this.executeCopy);
        me.message.bindListeners();

        return me;
    },

    /**
     * after an ajax attempt, clear the generate link styles and text
     * @return {Collection} collection of Zepto objects containing the button
     */
    resetGenerateLinkButton: function () {
        $("#generateLink").removeClass("disabled");
        $("#generateLink").html("Create Link");
        return $("#generateLink");
    }
};

// to pull into node namespace if included
if (typeof module !== "undefined" && module.exports !== undefined) {
    module.exports = WutController;
}

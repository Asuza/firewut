/* globals Zepto, AlertController, WutController */

if (typeof Zepto === "function" && typeof WutController === "function" &&
    typeof AlertController === "function") {
    (function($, AlertController, WutController) {
        "use strict";
        $(document).ready(function () {
            var message = new AlertController(),
                wut = new WutController(message);
            wut.bindListeners();
        });
    })(Zepto, AlertController, WutController);
}

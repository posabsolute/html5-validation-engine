/*!
 * jQuery HTML5 Validation Engine
 * Original author: @posabsolute, Cedric Dugas
 * Licensed under the MIT license
 */

(function ( $, window, document, undefined ) {


    var pluginName = "html5ValidationEngine",
        defaults = {};

    function Plugin( element, options ) {
        this.$el = $(element);

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init(options);
    }

    Plugin.prototype = {

        init: function() {
            if(this.isHtml5()) {
                this.loadHtml5Validation();
            }else{
                this.loadFallback();
            }
        },
        isHtml5 : function(){
            // need to optimise
            if (!typeof document.createElement("input").checkValidity === "function") {
                return true;
            }else{
                return false;
            }
        },
        loadHtml5Validation : function () {
            var self = this;
            $("form").attr("novalidate", true);
            $(document).on("click", ":submit" , function(e){
                var $form = $(this).closest("form");
                if(!$form[0].checkValidity()){
                    self.checkIfValid($form);
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
                return true;
            });

        },
        loadFallback : function () {
            var self = this;
            if( this.$el[0].tagName === "form" ){
                this.$el.on("submit", function(){
                    return self.checkIfValid($(this));
                });
            }else if(this.$el.is(":input")){
                console.log("do something on input");
            }else{
                this.$el.on("click", ":submit" , function(e){
                    var valid = true,
                        $form = $(this).closest("form");

                    if(!self.checkIfValid($form)){
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }
                    return valid; self.checkIfValid($(this));
                });
            }
        },
        checkIfValid : function($form){
            var isValid = true, self = this;
            $form.find(".error").remove();
            $form.find("input[required]").each(function(){
                if(self.getErrortype($(this))){
                    isValid = false;
                }
            });
            return isValid;
        },
        getErrortype: function($input){
            if(this.isHtml5()){
                this.showError($input, $input[0].validationMessage);
            }else{
                return this.getErrortypeFallback($input);
            }
        },
        getErrortypeFallback : function($input){
            if(!$input.val()){
                this.showError($input, "This field is empty");
                return true;
            }
            return false;
        },
        showError : function($input, message){
            $input.before("<div class='error'>"+message+"</div>");
        },
        destroy : function(){
            $(document).off("invalid", this.loadHtml5Validation);
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );
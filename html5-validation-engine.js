/*!
 * jQuery HTML5 Validation Engine
 * Original author: @posabsolute, Cedric Dugas, http://www.position-absolute.com
 * Licensed under the MIT license
 */

(function ( $, window, document, undefined ) {


    var pluginName = "html5ValidationEngine",
        defaults = {
            currentLocal : "en_US"
        };

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
            if (typeof document.createElement("input").checkValidity === "function") {
                return true;
            }else{
                return false;
            }
        },
        loadHtml5Validation : function () {
            var self = this;
            $("form").attr("novalidate", true);
            this.$el.on("click", ":submit" , function(e){
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
            $("form").attr("novalidate", true);
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
                    return valid;
                });
            }
        },
        checkIfValid : function($form){
            var isValid = true, self = this;
            $form.find(".error").remove();
            $form.find(":input[required]").each(function(){
                if(self.getErrortype($(this))){
                    isValid = false;
                }
            });
            return isValid;
        },
        getErrortype: function($input){
            if(this.isHtml5()){
                return this.getError($input);
            }else{
                return this.getErrortypeFallback($input);
            }
        },
        getError : function($input){
            var isNotValid = false;
            if($input[0].validationMessage){
                this.showError($input);
                isNotValid = true;
            }else{
                isNotValid = false;
            }
            return isNotValid;
        },
        getErrortypeFallback : function($input){
            var inputType = $input.attr("type");
            var error = {
                type: "",
                isNotValid : false
            };
            if(inputType === "radio"){
                error = this.validate.radio($input);
            }else if(!$input.val()){
                error = {
                    type:"required",
                    isNotValid : true
                };
                
            }else if(inputType === "text" || inputType === "password" || inputType === "date"){
                error = this.validate.text($input);
                
            }
            if(error.isNotValid){
                this.showError($input);
            }
            return error.isNotValid;
        },
        showError : function($input){
            var message =   $.html5ValidationEngine.localisations[this._defaults.currentLocal][$input.data("error-message")] ||
                            $input.data("error-message") ||
                            $input[0].validationMessage ||
                            "This field is required";

            $input.after("<div class='error'><i class='fa fa-exclamation-triangle'></i>"+message+"</div>");
        },
        destroy : function(){
            $(document).off("invalid", this.loadHtml5Validation);
        },
        validate :{
            radio: function($input){
                var $group = $("[name='"+$input.attr("name")+"']:checked");
                return {
                    type:"radio",
                    isNotValid : !$group.val() ? true : false
                };
            },
            text : function($input){
                var pattern = $input.attr("pattern"),
                    matchElement = $input.attr("match"),
                    isNotValid = false,
                    type ="";
                if(pattern){
                    type="pattern";
                    var regex = new RegExp(pattern);
                    isNotValid = !regex.test($input.val()) ? true : false;
                }else if(matchElement){
                    type="match";
                    isNotValid = $(matchElement).val() !== $input.val() ? true : false;
                }
                return {
                    type:type,
                    isNotValid : isNotValid
                };
            }
        }
    };


    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };
    // Formating localisations
    $.html5ValidationEngine = {
        localisations : {},
        format : function( source, params ) {
            if ( arguments.length === 1 ) {
                return function() {
                    var args = $.makeArray(arguments);
                    args.unshift(source);
                    return $.validator.format.apply( this, args );
                };
            }
            if ( arguments.length > 2 && params.constructor !== Array  ) {
                params = $.makeArray(arguments).slice(1);
            }
            if ( params.constructor !== Array ) {
                params = [ params ];
            }
            $.each(params, function( i, n ) {
                source = source.replace( new RegExp("\\{" + i + "\\}", "g"), function() {
                    return n;
                });
            });
            return source;
        }
    };
})( jQuery, window, document );
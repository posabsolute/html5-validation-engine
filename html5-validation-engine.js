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
           
            this.loadValidation();
        },
        isHtml5 : function(){
            // need to optimise
            if (typeof document.createElement("input").checkValidity === "function") {
                return true;
            }else{
                return false;
            }
        },
        loadValidation : function () {
            var self = this;
            if( this.$el[0].tagName === "form" ){
                this.$el.on("submit", function(){
                    $("form").attr("novalidate", true);
                    return self.checkIfValid($(this));
                });
            }else{
                this.$el.on("click", ":submit" , function(e){
                    $("form").attr("novalidate", true);
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
            this.$el.on("blur", ":input" , function(){
                self.getErrortype($(this));
            });
        },
        checkIfValid : function($form){
            var isValid = true, self = this;
            $form.find(".error").remove();
            $form.find(":input[validate],:input[required]").each(function(){
                if(self.getErrortype($(this))){
                    isValid = false;
                }
            });

            return isValid;
        },
        getErrortype: function($input){
            var error = false;

            if((this.isHtml5() ? this.getError($input) : this.getErrortypeFallback($input)) || this.getErrorCustom($input)){
                error = true;
            }
            if(error){
                this.showError($input);
            }
            return error;
        },
        getError : function($input){
            var isNotValid = false;
            if($input[0].validationMessage){
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
            return error.isNotValid;
        },
        getErrorCustom : function($input){
            var inputType = $input.attr("type");
            var error = {
                type: "",
                isNotValid : false
            };
            if(inputType === "text" || inputType === "password" || inputType === "date"){
                error = this.validationCustom.text($input);
            }
            return error.isNotValid;
        },
        showError : function($input){
            var message =   $.html5ValidationEngine.localisations[this._defaults.currentLocal][$input.data("error-message")] ||
                            $input.data("error-message") ||
                            $input[0].validationMessage ||
                            "This field is required";
            $input.parent().find(".error").remove();
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
                    maxlength = $input.attr("maxlength"),
                    min = $input.attr("min"),
                    max = $input.attr("max"),
                    isNotValid = false,
                    type ="";

                if(pattern){
                    type="pattern";
                    var regex = new RegExp(pattern);
                    isNotValid = !regex.test($input.val()) ? true : false;
                }else if(matchElement){
                    type="match";
                    isNotValid = $(matchElement).val() !== $input.val() ? true : false;
                }else if(maxlength){
                    type="maxlength";
                    isNotValid = $input.val().length > parseFloat(maxlength) ? true : false;
                }else if(min && max){
                    type="minmax";
                    isNotValid = ($input.val().length < min || $input.val().length> max) ? true : false;
                }
                return {
                    type:type,
                    isNotValid : isNotValid
                };
            }
        },
        validationCustom :{
            text : function($input){
                var matchElement = $input.attr("match"),
                    isNotValid = false,
                    type ="";
                if(matchElement){
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
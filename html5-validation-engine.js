/*!
 * jQuery HTML5 Validation Engine
 * Original author: @posabsolute, Cedric Dugas, http://www.position-absolute.com
 * Licensed under the MIT license
 */

(function ( $, window, document, undefined ) {


    var pluginName = "html5ValidationEngine",
        defaults = {
            currentLocal : "en"
        };

    function Plugin( element, options ) {
        this.$el = $(element);

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = this.options;
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
                this.$el.on("submit", function(e){
                    var $form = $("form");
                    $form.attr("novalidate", true);

                    var valid = self.checkIfValid($(this));
                    if (!valid) { $form.trigger('invalid'); }
                    return valid;
                });
            }else{
                this.$el.on("click", ":submit" , function(e){
                    $("form").attr("novalidate", true);
                    var valid = true,
                        $form = $(this).closest("form");
                    
                    if($form.find('.error').length > 0 || !self.checkIfValid($form)){
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        $form.trigger('invalid');
                        return false;
                    }

                    return valid;
                });
            }
        
            this.$el.on("blur", ":input:not(.placeholder)", function(){
                var $el = $(this);
                if ($el.attr("data-no-error-onblur")) { return; }
                
                if(!self.checkInput($el)){
                    $("#error_"+$el.attr("id")).empty();
                    $el.next(".error:first").remove();
                    $el.next(".hopOver").next(".error:first").remove();
                }
            });
            
            this.$el.on("change", "[type=checkbox],[type=radio]", function(){
                var $el = $(this);
                if(!self.checkInput($el)){
                    $("#error_"+$el.attr("id")).empty();
                    $("[id='error_" + $el.attr("name") + "']").empty();
                    $el.next(".error:first").remove();
                    $el.next(".hopOver").next(".error:first").remove();
                }
            });

            this.$el.on("change", "select", function(){
                var $el = $(this);
                if(!self.checkInput($el)){
                    $("#error_"+$el.attr("id")).empty();
                    $el.next(".error:first").remove();
                    $el.next(".hopOver").next(".error:first").remove();
                }
            });

            // clear error on input keydown (for ie8)
            this.$el.on("input keydown", ":input:not(.placeholder)", function() {
                var $el = $(this);
                $("#error_"+$el.attr("id")).empty();
                $el.next(".error:first").remove();
                $el.next(".hopOver").next(".error:first").remove();
            });
        },
        submitEvent : function(){
            
        },
        blurEvent: function(){

        },
        checkIfValid : function($form){
            var isValid = true, self = this;
            $form.find(".error").remove();
            $form.find(":input[validate]:not(.placeholder),:input[required]:not(.placeholder), select[required]").each(function(){
                if(self.getErrortype($(this))){
                    isValid = false;
                }
            });

            return isValid;
        },
        checkInput : function ($el) {

            if($el.attr('required') || $el.attr('type') === 'radio'){

                return this.getErrortype($el);
            }
            if($el.attr('validate')){
                if($.trim($el.val())){
                    return this.getErrortype($el);
                }else{
                    return false;
                }
                
            }
        },
        getErrortype: function($input){
            var error = false;

            if ($input[0].tagName === 'SELECT' || $input.attr('type') === 'radio') {
                error = this.getErrortypeFallback($input);
            } else if((this.isHtml5() ? this.getError($input) : this.getErrortypeFallback($input)) || this.getErrorCustom($input)){
                error = true;
            }
  
            if(error){
                this.showError($input);
            }
            return error;
        },
        getError : function($input){

            var value = $.trim($input.val());
            if ($input.attr('type') === 'radio') {
                return this.validate.radio($input).isNotValid;
            }
            else if($input.attr('required') && !value) {
                return true;
            }
            else if ($input.attr('validate')) {
                return !$input[0].checkValidity();
            }
            //var isNotValid = !$.trim($input.val());
            return false;
        },
        getErrortypeFallback : function($input){

            var inputType = $input.attr("type");
            var error = {
                type: "",
                isNotValid : false
            };
            if(inputType === "radio"){
                error = this.validate.radio($input);
            }
            else if ($input[0].tagName === 'SELECT') {
                error = this.validate.select($input);
            }
            else if(!$input.val()){
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
            if(inputType === "checkbox"){
                error = this.validationCustom.checkbox($input);
            }
            return error.isNotValid;
        },
        showError : function($input){
            var message =   $.html5ValidationEngine.localisations[this._defaults.currentLocal][$input.data("error-message")] ||
                            $input.data("error-message") ||
                            $input[0].validationMessage ||
                            "This field is required",
                $errorContainer = $("#error_"+$input.attr("id"));

            if ($input.attr('type') === 'radio' && !$errorContainer.length) {
                // Try with name
                $errorContainer = $("#error_"+$input.attr("name"));
            }
            // Re-adjust message if field is empty
            var value = $.trim($input.val());
            if($input.attr('required') && !value) {
                message =   $.html5ValidationEngine.localisations[this._defaults.currentLocal]['required'] ||
                            "This field is required";
            }

            var content = "<div class='error'><i class='fa fa-ssense-warning'></i>"+message+"</div>"; 

            $input.next(".error:first").remove();
            $input.next(".hopOver").next(".error:first").remove();
            if ($errorContainer.length) {
                $errorContainer.html(content);
            } else if(!$input.next().hasClass("hopOver")){
                $input.after(content);
            }else{
                $input.next(".hopOver:first").after(content);
            }
            
        },
        destroy : function(){
            $(document).off("invalid", this.loadHtml5Validation);
            $(document).off(":submit", this.submitEvent);
            $(document).off(":blur",   this.blurEvent);
        },
        validate :{
            radio: function($input){
                var $group = $input.parents('form').find("[name='"+$input.attr("name")+"']:checked");
                return {
                    type:"radio",
                    isNotValid : $group.length === 0
                };
            },
            select: function($select) {
                return {
                    type:"select",
                    isNotValid : !$select.val() ? true : false
                };
            },
            text : function($input){
                var required = $input.attr("required"),
                    pattern = $input.attr("pattern"),
                    matchElement = $input.attr("match"),
                    maxlength = $input.attr("maxlength"),
                    min = $input.attr("min"),
                    max = $input.attr("max"),
                    isNotValid = false,
                    type ="";

                if (required) {
                    type="required";
                    isNotValid = $input.val().length == 0 ? true : false;
                }else if(pattern){
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
            checkbox : function($input){
                var numCheck = parseInt($input.attr("mincheckbox")) || 0,
                    $group = $("[name='"+$input.attr("name")+"']:checked");
                return {
                    type:"checkbox",
                    isNotValid : ($group.length < numCheck ) ? true : false
                };
            },
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
        if (typeof(options) === 'string'  && Plugin.prototype[options]) {

            Plugin.prototype[options](this);
        } else {
            return this.each(function () {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName,
                    new Plugin( this, options ));
                }
            });
        }
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
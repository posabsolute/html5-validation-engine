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
        this._state = {};
        this._defaults = this.options;
        this._name = pluginName;

        this.init(options);
    }

    Plugin.prototype = {

        init: function() {
            this.initAdditionalPatterns();
            this.loadValidation();
        },
        initAdditionalPatterns: function() {
            // To make it easier to follow, split the regular expressions up and explain
            // what each one does individually. We'll concat them together later.
            var regexArray = [
                /a-zA-Z0-9/, // Regular alphanumeric stuff
                /'\.,-\/#!@$%\^&\*;:{}=\-_+`~()\|/, // Match punctuation and other special characters
                /\\\/(){}\[\]/, // Match slashes and brackets
                /\s\u200A\u2009\u20a0\u2008\u2002\u2007\u3000\u2003\u2004\u2005\u2006/, // Matches regular spaces along with the weirder spaces
                /\u00C0-\u00ff/, // Matches everything latin-based between À-ÿ
                /\uff0b/, // Matches the weird plus sign (＋)
                /\uff08\uff09/, // Matches the weird brackets (（）)
                /\uff0c/, // Matches the weird comma (，)
                /\u00e6/, // Matches that a and e stuck together thing (æ)
                /\u00ba/, // Matches that weird symbol europeans use for NO. (º)
                /\u2010-\u2015/, // Matches the weird dashes (‐ — and everything in between)
                /\uff03/, // Matches the weird hash tag (＃)
                // See here for bi-directional text control characters:
                // https://en.wikipedia.org/wiki/Bi-directional_text#explicit_formatting
                /\u202a-\u202e/, // Matches foreign-language directional formatting chars (rtl, ltr, pop)
                /\u2066-\u2069/, // Matches isolated foreign-language direction formatting chars (lri, rli, fsi, pop)
                /\u200e\u200f\u061c/, // Matches foreign language marks (lrm, rlm, alm for arabic)
            ];

            var combinedSource = '';

            for (var i = 0; i < regexArray.length; i++) {
                combinedSource += regexArray[i].source;
            }

            this._defaults.latinCharacterPattern = '^[' + combinedSource + ']*$';
        },
        applyAdditionalPatterns: function($el) {
            if ($el.attr('data-latin-characters-only') == 'true') {
                $el.attr('data-character-restriction', this._defaults.latinCharacterPattern);
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
                    $el.removeClass('validation-error');
                    $el.trigger('valid');
                } else {
                    $el.trigger('invalid');
                }
            });
            
            this.$el.on("change", "[type=checkbox],[type=radio]", function(){
                var $el = $(this);
                if(!self.checkInput($el)){
                    $("#error_"+$el.attr("id")).empty();
                    $("[id='error_" + $el.attr("name") + "']").empty();
                    $el.next(".error:first").remove();
                    $el.next(".hopOver").next(".error:first").remove();
                    $el.removeClass('validation-error');
                    $el.trigger('valid');
                } else {
                    $el.trigger('invalid');
                }
            });

            this.$el.on("change", "select", function(){
                var $el = $(this);
                if(!self.checkInput($el)){
                    $("#error_"+$el.attr("id")).empty();
                    $el.next(".error:first").remove();
                    $el.next(".hopOver").next(".error:first").remove();
                    $el.removeClass('validation-error');
                    $el.trigger('valid');
                } else {
                    $el.trigger('invalid');
                }
            });

            // clear error on input keydown (for ie8)
            this.$el.on("input keydown", ":input:not(.placeholder)", function() {
                var $el = $(this);
                $("#error_"+$el.attr("id")).empty();
                $el.next(".error:first").remove();
                $el.next(".hopOver").next(".error:first").remove();
                $el.removeClass('validation-error');
                $el.trigger('valid');
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
            this.applyAdditionalPatterns($el);
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

            if ($input[0].tagName === 'SELECT' || $input.attr('type') === 'radio' || $input.attr('type') === 'checkbox') {
                error = this.getErrortypeFallback($input);
            } //else if((this.isHtml5() ? this.getError($input) : this.getErrortypeFallback($input)) || this.getErrorCustom($input)){
            else if(this.getErrortypeFallback($input) || this.getErrorCustom($input)){
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
            } else if (inputType === "checkbox") {
                error = this.validate.checkbox($input);
            }
            else if ($input[0].tagName === 'SELECT') {
                error = this.validate.select($input);
            }
            else if(!$input.val()){
                error = {
                    type:"required",
                    isNotValid : true
                };
                
            } else if(inputType === "number" || inputType === "tel" || inputType === "text" || inputType === "password" || inputType === "date"){
                error = this.validate.text($input);
                if (error.isNotValid) {
                    this._state.currentErrorType = error.type;
                };
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
                message = $input.data('empty-error-message') || $.html5ValidationEngine.localisations[this._defaults.currentLocal]['required'] ||
                            "This field is required";
            } else if ($input.attr("maxlength")) {
                var max = parseInt($input.attr("maxlength"));
                if (value.length > max) {
                    message = $.html5ValidationEngine.localisations[this._defaults.currentLocal]['maxlength'](max) ||
                            "Please enter no more than " + maxlength + " characters.";
                }
            }

            if (this._state.currentErrorType == 'characterRestriction') {
                message = $input.data('character-restriction-error-message');
            }
            

            var content = "<div class='error'>"+message+"</div>";

            $input.next(".error:first").remove();
            $input.next(".hopOver").next(".error:first").remove();
            if ($errorContainer.length) {
                $errorContainer.html(content);
            } else if(!$input.next().hasClass("hopOver")){
                $input.after(content);
            }else{
                $input.next(".hopOver:first").after(content);
            }

            $input.addClass('validation-error');
            
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
            checkbox: function($input){
                var $group = $input.parents('form').find("[name='"+$input.attr("name")+"']:checked");
                return {
                    type:"checkbox",
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
                    characterRestrictionPattern = $input.attr("data-character-restriction"),
                    matchElement = $input.attr("match"),
                    minlength = $input.attr("minlength"),
                    maxlength = $input.attr("maxlength"),
                    min = $input.attr("min"),
                    max = $input.attr("max"),
                    isNotValid = false,
                    type ="";

                if (characterRestrictionPattern) {
                    var regex = new RegExp(characterRestrictionPattern);
                    isNotValid = !regex.test($input.val());
                    if (isNotValid) {
                        return {
                            type: "characterRestriction",
                            isNotValid: isNotValid
                        };
                    }
                }

                if (required) {
                    type="required";
                    isNotValid = isNotValid || ($input.val().length === 0 ? true : false);
                }
                if(pattern){
                    type="pattern";
                    var regex = new RegExp(pattern);
                    isNotValid = isNotValid || (!regex.test($input.val()) ? true : false);
                }
                if(matchElement){
                    type="match";
                    isNotValid = isNotValid || ($(matchElement).val() !== $input.val() ? true : false);
                }
                if(minlength) {
                    type="minlength";
                    isNotValid = isNotValid || ($input.val().length < parseFloat(minlength) ? true : false);
                }
                if(maxlength){
                    type="maxlength";
                    isNotValid = isNotValid || ($input.val().length > parseFloat(maxlength) ? true : false);
                }
                if(min && max){
                    type="minmax";
                    isNotValid = isNotValid || ((parseFloat($input.val()) < min || parseFloat($input.val())> max) ? true : false);
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
                    return $.html5ValidationEngine.format.apply( this, args );
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

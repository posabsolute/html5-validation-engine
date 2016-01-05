(function() {
	$.html5ValidationEngine.localisations.ja = {
		required: "Please fill out this field.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		match : "Please match the password",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.html5ValidationEngine.format("Please enter no more than {0} characters."),
		minlength: $.html5ValidationEngine.format("Please enter at least {0} characters."),
		minmax: $.html5ValidationEngine.format("Please enter a value between {0} and {1} characters long."),
		range: $.html5ValidationEngine.format("Please enter a value between {0} and {1}."),
		max: $.html5ValidationEngine.format("Please enter a value less than or equal to {0}."),
		min: $.html5ValidationEngine.format("Please enter a value greater than or equal to {0}.")
	};
}());

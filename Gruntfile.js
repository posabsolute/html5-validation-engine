module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            all: [
                "app/**/*.js"
            ]
        },
        uglify: {
            target: {
                files: {
                    "html5-validation-engine.min.js": "html5-validation-engine.js"
                }
            }
        },
        jasmine: {
            components: {
                src: [
                    "http://code.jquery.com/jquery-1.10.1.min.js",
                    "html5-validation-engine.js",
                    "localisations/en_US.js"
                ],
                options: {
                    specs: "tests/spec/*Spec.js",
                    keepRunner : true,
                    outfile : "tests/_SpecRunner.html",
                    helpers: "tests/helpers/*.js"
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("buildjs", [
        "jshint",
        "jasmine",
        "uglify"
    ]);

    grunt.registerTask("lint", [
        "jshint"
    ]);
    grunt.registerTask("runtests", [
        "jasmine"
    ]);
    grunt.registerTask("default", ["build"]);

};
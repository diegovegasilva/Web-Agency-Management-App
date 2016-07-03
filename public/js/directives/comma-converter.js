(function () {
    var app = angular.module('commaDirective', []);

    app.directive("comaDotConverter", function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {

                modelCtrl.$parsers.push(function (inputValue) {
                    if (typeof (inputValue) == "undefined")
                        return '';
                    var transformedInput = inputValue.replace(/,/g, '.');

                    if (transformedInput != inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };

    });

})();
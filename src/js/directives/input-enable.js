(function () {
    var app = angular.module('inputEnable', []);
    app.directive('inputEnable',['$rootScope' ,function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                if ($rootScope.userRol <= 1) {
                    element.bind('click', function () {
                        this.readOnly = false;
                    });
                    element.bind('blur', function () {
                        this.readOnly = true;
                    });
                    element.bind('keyup', function () {
                    });
                }
            }
        };
    }]);
})();

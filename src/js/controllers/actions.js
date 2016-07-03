(function () {
    var app = angular.module('actionsController', []);

    app.controller('ActionsController', ['$scope', '$window',function ($scope, $window) {
        $scope.goBack = function () {
            $window.history.back();
        };
        $scope.isFull = true;
        $scope.toggleMenu = function () {
            $scope.isFull = !$scope.isFull;
        };
    }]);


})();
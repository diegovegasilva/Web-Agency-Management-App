(function () {
    var app = angular.module('actionsController', []);

    app.controller('ActionsController', function ($scope, $window) {
        $scope.goBack = function () {
            $window.history.back();
        };
        $scope.isFull = true;
        $scope.toggleMenu = function () {
            $scope.isFull = !$scope.isFull;
        };
    });


})();
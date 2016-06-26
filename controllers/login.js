(function () {
    var app = angular.module('loginController', ['loginService', 'ngMessages', 'ui.bootstrap', 'ui.router.compat']);

    app.controller('LoginController', function ($rootScope, $scope, LoginService, $modalInstance) {
        $scope.cancel = function () {
            $modalInstance.dismiss();
            sessionStorage.removeItem('loginModal');
            delete $rootScope.currentUser;
            delete $rootScope.currentUserImg;
            delete $rootScope.token;
            delete $rootScope.userRol;
            delete $rootScope.currentuserID;
            $state.go('login');
        }
        $scope.submit = function () {
            LoginService.login($scope.login.username, $scope.login.password).then(function (data) {
                $modalInstance.close(data);
                sessionStorage.removeItem('loginModal');
            });
        };
    });
    app.controller('LoginFormController', function ($scope, $rootScope, $window, $state, $timeout, LoginService) {
        sessionStorage.loginModal = true;
        $rootScope.$watch('token', function () {
            if ($rootScope.currentUser && $rootScope.token) {
                $scope.showShortcuts = true;
            } else {
                $scope.showShortcuts = false;
            }
        });
        $scope.login = [];
        $scope.submit = function () {
            LoginService.login($scope.login.username, $scope.login.password).then(function (data) {
                $rootScope.currentUser = sessionStorage.user = data.data.username;
                $rootScope.currentUserImg = sessionStorage.userImg = data.data.url;
                $rootScope.currentUserID = sessionStorage.userID = data.data.id;
                $rootScope.token = sessionStorage.token = data.token;
                $rootScope.userRol = sessionStorage.userRol = data.data.userRol;
                $scope.showShortcuts = true;
                sessionStorage.loginModal = true;
                $state.go('index');
            });
        };
        //cerrar alert
        $scope.closeAlert = function (index) {
            delete $rootScope.alerts;
        };
    });
})();
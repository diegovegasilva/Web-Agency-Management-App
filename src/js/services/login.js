(function () {
    var app = angular.module('loginService', ['ui.bootstrap', 'ui.router.compat']);

    app.factory('LoginService', ['$http', '$location', '$modal', '$rootScope', '$window', function ($http, $location, $modal, $rootScope, $window) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var login = [];

            login.assignCurrentUser = function (user) {
                $rootScope.currentUser = user;
                $window.sessionStorage.user = user;
                return user;
            };
            login.assignCurrentUserImg = function (userImg) {
                $rootScope.currentUserImg = userImg;
                $window.sessionStorage.userImg = userImg;
                return userImg;
            };
            login.assignCurrentUserID = function (id) {
                $rootScope.currentUserID = id;
                $window.sessionStorage.userID = id;
                return id;
            };
            login.assingToken = function (token) {
                $rootScope.token = token;
                $window.sessionStorage.token = token;
                return token;
            };
            login.assingUserRol = function (userRol) {
                $rootScope.userRol = userRol;
                $window.sessionStorage.userRol = userRol;
                return userRol;
            };
            login.modal = function () {
                var instance = $modal.open({
                    templateUrl: 'partials/loginModal.html',
                    controller: 'LoginController',
                    controllerAs: 'LoginController'
                });
                return instance.result.then(function (data) {
                    login.assignCurrentUser(data.data.username);
                    login.assignCurrentUserImg(data.data.url);
                    login.assignCurrentUserID(data.data.id);
                    login.assingToken(data.token);
                    login.assingUserRol(data.data.userRol);
                });
            };
            login.login = function (username, password) {
                return $http.post(webServiceUrl + 'login', {username: username, password: password}).then(function (data) {
                    return data.data;
                });
            };
            return login;
        }
    ]);

})();
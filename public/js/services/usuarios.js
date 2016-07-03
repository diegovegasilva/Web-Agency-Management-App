(function () {
    var app = angular.module('usersService', []);

    app.factory('UsersService', ['$http', '$location', '$upload', function ($http, $location, $upload) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var users = [];

            users.getUsers = function (perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getUsers');
                }else{
                    return $http.get(webServiceUrl + 'getUsers?perPage=' + perPage + '&offset=' + offset);
                }
            };

            users.getUser = function (userID) {
                return $http.get(webServiceUrl + 'getUser?id=' + userID);
            };

            users.addUser = function (user) {
                return $http.post(webServiceUrl + 'addUser', user).then(function (data) {
                    return data;
                });
            };
            users.editUser = function (user) {
                return $http.put(webServiceUrl + 'editUser', user).then(function (data) {
                    return data;
                });
            };
            users.deleteUser = function (userID) {
                return $http.delete(webServiceUrl + 'deleteUser?id=' + userID).then(function (status) {
                    return status.data;
                });
            };
            users.getRoles = function () {
                return $http.get(webServiceUrl + 'getRoles');
            };
            users.getRol = function (rolID) {
                return $http.get(webServiceUrl + 'getRol?id=' + rolID);
            };

            users.uploadUserImage = function (file, userID) {
                return $upload.upload({
                    url: webServiceUrl + 'uploadUserImage',
                    method: 'POST',
                    file: file,
                    data: file.name
                });
            };
            users.saveUserImage = function (id, userID) {
                return $http.post(webServiceUrl + 'saveUserImage', {id: id, userID: userID}).then(function (data) {
                    return data;
                });
            };
            users.deleteUserImage = function (imageID) {
                return $http.delete(webServiceUrl + 'deleteUserImage?id=' + imageID).then(function (data) {
                    return data;
                });
            };

            users.getUserImage = function (userID) {
                return $http.get(webServiceUrl + 'getUserImage?id=' + userID).then(function (data) {
                    return data;
                });
            };

            return users;

        }]);

})();
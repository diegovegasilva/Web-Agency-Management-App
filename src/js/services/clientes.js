(function () {
    var app = angular.module('clientsService', []);

    app.factory('ClientsService', ['$http', '$location', function ($http, $location) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var clients = [];

            clients.getClients = function (perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {

                    return $http.get(webServiceUrl + 'getClients');
                } else {

                    return $http.get(webServiceUrl + 'getClients?perPage=' + perPage + '&offset=' + offset);
                }
            };

            clients.getClient = function (clientID) {
                return $http.get(webServiceUrl + 'getClient?id=' + clientID);
            };

            clients.addClient = function (client) {
                return $http.post(webServiceUrl + 'addClient', client);
            };
            clients.editClient = function (client) {
                return $http.put(webServiceUrl + 'editClient', client).then(function (data) {
                    return data;
                });
            };
            clients.deleteClient = function (clientID) {
                return $http.delete(webServiceUrl + 'deleteClient?id=' + clientID).then(function (status) {
                    return status.data;
                });
            };
            clients.getProvinces = function () {
                return $http.get(webServiceUrl + 'getProvinces');
            };
            clients.getProvince = function (provinceID) {
                return $http.get(webServiceUrl + 'getProvince?id=' + provinceID);
            };
            clients.addComment = function(comment){
                return $http.post(webServiceUrl + 'addComment', comment);
            };
            clients.getComments = function (clientID) {
                return $http.get(webServiceUrl + 'getComments?clientID=' + clientID);
            };
            clients.getClientTasks = function(clientID){
                return $http.get(webServiceUrl + 'getClientTasks?clientID=' + clientID);
            };
            return clients;

        }]);

})();
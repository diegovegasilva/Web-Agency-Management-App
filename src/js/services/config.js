(function () {
    var app = angular.module('configService', []);

    app.factory('ConfigService', ['$http', '$location', '$upload', function ($http, $location, $upload) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var config = [];

            config.deleteVat = function (vatID) {
                return $http.delete(webServiceUrl + 'deleteVat?id=' + vatID).then(function (status) {
                    return status.data;
                });
            };
            config.addVat = function (vat) {
                return $http.post(webServiceUrl + 'addVat', vat).then(function (data) {
                    return data;
                });
            };
            config.getUserData = function () {
                return $http.get(webServiceUrl + 'getUserData');
            };
            config.editUserData = function (user) {
                return $http.put(webServiceUrl + 'editUserData', user);
            };
            config.getInvoiceImage = function(){
                return $http.get(webServiceUrl + 'getInvoiceImage');
            };
            config.uploadInvoiceImage = function (file) {
                return $upload.upload({
                    url: webServiceUrl + 'uploadInvoiceImage',
                    method: 'POST',
                    file: file,
                    data: file.name
                });
            };
            config.deleteInvoiceImage = function (imageID) {
                return $http.delete(webServiceUrl + 'deleteInvoiceImage').then(function (data) {
                    return data;
                });
            };
            return config;

        }]);

})();
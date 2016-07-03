(function () {
    var app = angular.module('graphicsService', []);

    app.factory('GraphicsService', ['$http', '$location', '$upload', function ($http, $upload) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var graph = [];

            graph.getProjectsByYear = function (year) {
                return $http.get(webServiceUrl + 'getProjectsByYear?year=' + year);
            };
            graph.getLastYearProjects = function () {
                return $http.get(webServiceUrl + 'getLastYearProjects');
            };
            graph.getAcceptedOrdersAmountByYear = function (year) {
                return $http.get(webServiceUrl + 'getAcceptedOrdersAmountByYear?year=' + year);
            };
            graph.getLastYearAcceptedOrdersAmount = function () {
                return $http.get(webServiceUrl + 'getLastYearAcceptedOrdersAmount');
            };
            graph.getPayedInvoicesAmountByYear = function (year) {
                return $http.get(webServiceUrl + 'getPayedInvoicesAmountByYear?year=' + year);
            };
            graph.getLastYearPayedInvoicesAmount = function () {
                return $http.get(webServiceUrl + 'getLastYearPayedInvoicesAmount');
            };
            graph.getLastYearExpenses = function () {
                return $http.get(webServiceUrl + 'getLastYearExpenses');
            };
            graph.getExpensesByYear = function (year) {
                return $http.get(webServiceUrl + 'getExpensesByYear?year=' + year);
            };
            graph.getSentInvoicesCount = function () {
                return $http.get(webServiceUrl + 'getSentInvoicesCount');
            };
            graph.getActiveProjectsCount = function () {
                return $http.get(webServiceUrl + 'getActiveProjectsCount');
            };
            graph.getActiveTasksCount = function () {
                return $http.get(webServiceUrl + 'getActiveTasksCount');
            };
            graph.getSentOrdersCount = function () {
                return $http.get(webServiceUrl + 'getSentOrdersCount');
            };
            graph.getMonthInvoicesAmount = function () {
                return $http.get(webServiceUrl + 'getMonthInvoicesAmount');
            };
            graph.getMonthExpenses = function () {
                return $http.get(webServiceUrl + 'getMonthExpenses');
            };
            
            return graph;

        }]);

})();
(function () {
    var app = angular.module('expensesService', []);

    app.factory('ExpensesService', ['$http', function ($http) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var expenses = [];

            expenses.getExpenses = function (perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getExpenses');
                }else{
                    return $http.get(webServiceUrl + 'getExpenses?perPage=' + perPage + '&offset=' + offset);
                }
            };
            
            expenses.getExpensesRecurrent = function (perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getExpensesRecurrent');
                }else{
                    return $http.get(webServiceUrl + 'getExpensesRecurrent?perPage=' + perPage + '&offset=' + offset);
                }
            };
            
            expenses.getExpense = function (expenseID) {
                return $http.get(webServiceUrl + 'getExpense?id=' + expenseID).then(function(data){
                    data.data.amount = parseFloat(data.data.amount);
                    data.data.date = new Date(data.data.date);
                    return data;
                });
            };
            
            expenses.getExpenseRecurrent = function (expenseID) {
                return $http.get(webServiceUrl + 'getExpenseRecurrent?id=' + expenseID).then(function(data){
                    data.data.amount = parseFloat(data.data.amount);
                    data.data.date = new Date(data.data.date);
                    return data;
                });
            };
            
            expenses.getExpensesFrequency = function () {
                    return $http.get(webServiceUrl + 'getExpensesFrequency');
            };
            
            expenses.addExpenses = function (exp) {
                return $http.post(webServiceUrl + 'addExpenses', exp).then(function (data) {
                    return data;
                });
            };
            
            expenses.editExpenses = function (exp) {
                return $http.put(webServiceUrl + 'editExpenses', exp).then(function (data) {
                    return data;
                });
            };
            
            expenses.deleteExpenses = function (expID) {
                return $http.delete(webServiceUrl + 'deleteExpenses?id=' + expID).then(function (status) {
                    return status.data;
                });
            };
            
            expenses.editExpensesRecurrent = function (exp) {
                return $http.put(webServiceUrl + 'editExpensesRecurrent', exp).then(function (data) {
                    return data;
                });
            };
            
            expenses.deleteExpensesRecurrent = function (expID) {
                return $http.delete(webServiceUrl + 'deleteExpensesRecurrent?id=' + expID).then(function (status) {
                    return status.data;
                });
            };
            
            return expenses;

        }]);

})();
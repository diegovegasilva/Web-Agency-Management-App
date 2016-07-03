(function () {
    var app = angular.module('expensesController', ['usersService', 'expensesService']);

    app.controller('ListExpensesController', ['$scope', 'UsersService', 'ExpensesService', 'config', '$modal', '$timeout', '$state', function ($scope, UsersService, ExpensesService, config, $modal, $timeout, $state) {
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        $scope.predicate = '-date';
        $scope.getExpenses = function () {
            if ($state.current.name == 'listadoGastosRecurrentes') {
                ExpensesService.getExpensesRecurrent($scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.expenses = data.data.data;
                    $scope.results = data.data.length;
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }

                });
            } else {
                ExpensesService.getExpenses($scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.expenses = data.data.data;
                    $scope.results = data.data.length;
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }

                });
            }
        };
        $scope.getExpenses();
        $scope.state = $state.current.name;
        var d = new Date();
        $scope.timezoneOffset = d.getTimezoneOffset()  / 60;
        //editar gastos
        $scope.editExpenses = function (id) {
            if ($scope.state == 'listadoGastosRecurrentes') {
                ExpensesService.getExpenseRecurrent(id).then(function (data) {
                    $scope.expense = data.data;
                    $scope.selected = {};
                    UsersService.getUsers().then(function (data) {
                        $scope.users = data.data.data;
                        angular.forEach($scope.users, function (user) {
                            if (user.id == $scope.expense.user_id) {
                                $scope.selected.value = user;
                            }
                        });
                        if (!$scope.selected.value) {
                            $scope.selected = {value: $scope.users[$scope.users.length - 1]};
                        }
                    });
                    ExpensesService.getExpensesFrequency().then(function (data) {
                        $scope.frequency = data.data.data;
                    });
                });
            } else {
                ExpensesService.getExpense(id).then(function (data) {
                    $scope.expense = data.data;
                    $scope.selected = {};
                    UsersService.getUsers().then(function (data) {
                        $scope.users = data.data.data;
                        angular.forEach($scope.users, function (user) {
                            if (user.id == $scope.expense.user_id) {
                                $scope.selected.value = user;
                            }
                        });
                        if (!$scope.selected.value) {
                            $scope.selected = {value: $scope.users[$scope.users.length - 1]};
                        }
                    });
                    ExpensesService.getExpensesFrequency().then(function (data) {
                        $scope.frequency = data.data.data;
                    });
                });
            }

            $scope.modalInstance = $modal.open({
                templateUrl: 'editExpensesModal.html',
                scope: $scope,
                controller: 'ListExpensesController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.edit = function (expense) {
                expense.user_id = $scope.selected.value.id;
                if ($scope.state == 'listadoGastosRecurrentes') {
                    ExpensesService.editExpensesRecurrent(expense).then(function(data) {
                        $scope.modalInstance.dismiss();
                        $scope.alerts = [{type: 'success', msg: 'Gasto editado correctamente.'}];
                        $scope.getExpenses();
                        $timeout($scope.closeAlert, 4000);
                    });
                } else {
                    ExpensesService.editExpenses(expense).then(function (data) {
                        $scope.modalInstance.dismiss();
                        $scope.alerts = [{type: 'success', msg: 'Gasto editado correctamente.'}];
                        $scope.getExpenses();
                        $timeout($scope.closeAlert, 4000);
                    });
                }
            };
        };
        //borrar gastos
        $scope.deleteExpenses = function (id) {
            $scope.expensesID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteExpensesModal.html',
                scope: $scope,
                controller: 'ListExpensesController'
            });
            $scope.delete = function (id) {
                if ($scope.state == 'listadoGastosRecurrentes') {
                    ExpensesService.deleteExpensesRecurrent(id).then(function (data) {
                        $scope.modalInstance.dismiss();
                        $scope.alerts = [{type: 'success', msg: 'Gasto eliminado correctamente.'}];
                        $timeout($scope.closeAlert, 4000);
                        $scope.getExpenses();
                    });
                } else {
                    ExpensesService.deleteExpenses(id).then(function (data) {
                        $scope.modalInstance.dismiss();
                        $scope.alerts = [{type: 'success', msg: 'Gasto eliminado correctamente.'}];
                        $timeout($scope.closeAlert, 4000);
                        $scope.getExpenses();
                    });
                }
            };
        };
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
        //cerrar alert
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.pageChanged = function () {
            $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
            $scope.getExpenses();
        };

    }]);
    app.controller('AddExpensesController', ['$scope', 'UsersService', 'ExpensesService', '$timeout', '$state',function ($scope, UsersService, ExpensesService, $timeout, $state) {

        UsersService.getUsers().then(function (data) {
            $scope.users = data.data.data;
            $scope.selected = {};
        });
        ExpensesService.getExpensesFrequency().then(function (data) {
            $scope.frequency = data.data.data;
        });
        var d = new Date();
        $scope.timezoneOffset = d.getTimezoneOffset()  / 60;
        $scope.addExpenses = function () {
            $scope.expenses.user_id = $scope.selected.value.id;
            var backView = function () {
                $state.go('listadoGastos');
            };
            
            ExpensesService.addExpenses($scope.expenses).then(function (data) {
                console.log(data);
                if (data.data.status == 1) {
                    $scope.alerts = [{type: 'success', msg: 'Gasto insertado correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

    }]);


})();
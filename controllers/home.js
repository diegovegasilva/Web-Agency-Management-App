(function () {
    var app = angular.module('homeController', ['ui.bootstrap', 'ngMessages', 'graphicsService']);

    app.controller('HomeController', function ($scope, $rootScope, $state, GraphicsService, $q) {
        sessionStorage.loginModal = true;
        $rootScope.$watch('token', function () {
            if ($rootScope.currentUser && $rootScope.token) {
                $scope.showShortcuts = true;
            } else {
                $state.go('login');
            }
        });

        function getSelectYears() {
            var obj;
            var year = new Date().getFullYear();
            var diff = year - 2015;
            for (i = 0; i <= diff; i++) {
                obj = {value: year - i, name: year - i};
                $scope.projectYears.push(obj)
            }
        }

        $scope.projectYears = [{value: 0, name: 'Últimos 12 meses'}];
        getSelectYears();
        $scope.balance = function (a, b) {
            var sum = a.map(function (num, idx) {
                return parseFloat(num) - parseFloat(b[idx]);
            });
            return sum;
        };

        //GRAFICO PROYECTOS
        $scope.getProjectByYear = function (year) {
            GraphicsService.getProjectsByYear(year).then(function (data) {
                $scope.labels = [];
                $scope.data = [];
                for (var keyName in  data.data.data[0]) {
                    $scope.labels.push(keyName);
                    $scope.data.push(parseInt(data.data.data[0][keyName]));
                }
                $scope.data = [$scope.data];
                $scope.series = ['Nuevos proyectos', 'Proyectos finalizados'];
            });
        };


        $scope.updateProjectYear = function () {
            if ($scope.projectYear == 0) {
                $scope.getLastYearProjects();
            } else {
                $scope.getProjectByYear($scope.projectYear);
            }
        };
        $scope.getLastYearProjects = function () {
            GraphicsService.getLastYearProjects().then(function (data) {
                $scope.labels = [];
                $scope.data = [];
                angular.forEach(data.data.data, function (result) {
                    $scope.labels.push(result.month);
                    $scope.data.push(result.projects);
                });
                $scope.data = [$scope.data];
                $scope.series = ['Nuevos proyectos', 'Proyectos finalizados'];
            });
        };
        $scope.getLastYearProjects();

        //GRAFICO FACTURAS

        $scope.getAcceptedOrdersAmountByYear = function (year) {
            var deferred = $q.defer();
            GraphicsService.getAcceptedOrdersAmountByYear(year).then(function (data) {
                for (var keyName in  data.data.data[0]) {
                    $scope.labelsInv.push(keyName);
                    $scope.dataInv.push(parseInt(data.data.data[0][keyName]));
                }
                $scope.dataInv = [$scope.dataInv];
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.getPayedInvoicesAmountByYear = function (year) {
            var deferred = $q.defer();
            var dataInv = [];
            GraphicsService.getPayedInvoicesAmountByYear(year).then(function (data) {
                for (var keyName in  data.data.data[0]) {
                    dataInv.push(parseInt(data.data.data[0][keyName]));
                }
                $scope.dataInv.push(dataInv);
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.getExpensesByYear = function (year) {
            var deferred = $q.defer();
            var dataInv = [];
            GraphicsService.getExpensesByYear(year).then(function (data) {
                for (var keyName in  data.data.data[0]) {
                    dataInv.push(parseInt(data.data.data[0][keyName]));
                }
                $scope.dataInv.push(dataInv);
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.getInvoicesByYear = function (year) {
            $scope.labelsInv = [];
            $scope.dataInv = [];
            $scope.getAcceptedOrdersAmountByYear(year).then(function () {
                $q.all([$scope.getPayedInvoicesAmountByYear(year), $scope.getExpensesByYear(year)]).then(function () {
                    var balance = $scope.balance($scope.dataInv[1], $scope.dataInv[2]);
                    $scope.dataInv.push(balance);
                });
            });
        };


        $scope.getLastYearAcceptedOrdersAmount = function () {
            var deferred = $q.defer();
            GraphicsService.getLastYearAcceptedOrdersAmount().then(function (data) {
                $scope.labelsInv = [];
                $scope.dataInv = [];
                angular.forEach(data.data.data, function (result) {
                    $scope.labelsInv.push(result.month);
                    $scope.dataInv.push(result.total);
                });
                $scope.dataInv = [$scope.dataInv];
                $scope.seriesInv = ['Contratación', 'Ingresos', 'Gastos', 'Balance'];
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.getLastYearPayedInvoicesAmount = function () {
            var deferred = $q.defer();
            var dataInv = [];
            GraphicsService.getLastYearPayedInvoicesAmount().then(function (data) {
                angular.forEach(data.data.data, function (result) {
                    dataInv.push(result.total);
                });
                $scope.dataInv.push(dataInv);
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.getLastYearExpenses = function () {
            var deferred = $q.defer();
            var dataInv = [];
            GraphicsService.getLastYearExpenses().then(function (data) {
                angular.forEach(data.data.data, function (result) {
                    dataInv.push(result.total);
                });
                $scope.dataInv.push(dataInv);
                deferred.resolve($scope.dataInv);
            });
            return deferred.promise;
        };
        $scope.invoicesLastYearRender = function () {
            $scope.getLastYearAcceptedOrdersAmount().then(function () {
                $q.all([$scope.getLastYearPayedInvoicesAmount(), $scope.getLastYearExpenses()]).then(function () {
                    var balance = $scope.balance($scope.dataInv[1], $scope.dataInv[2]);
                    $scope.dataInv.push(balance);
                });
            });
        };

        $scope.updateInvoicesYear = function () {
            if ($scope.InvoicesYear == 0) {
                $scope.invoicesLastYearRender();
            } else {
                $scope.getInvoicesByYear($scope.InvoicesYear);
            }
        };

        $scope.invoicesLastYearRender();

        //AVISOS
        GraphicsService.getSentInvoicesCount().then(function (data) {
            $scope.invoicesCount = data.data.data[0].total;
        });
        GraphicsService.getActiveProjectsCount().then(function (data) {
            $scope.projectsCount = data.data.data[0].total;
        });
        GraphicsService.getActiveTasksCount().then(function (data) {
            $scope.tasksCount = data.data.data[0].total;
        });
        GraphicsService.getSentOrdersCount().then(function (data) {
            $scope.ordersCount = data.data.data[0].total;
        });
        GraphicsService.getMonthInvoicesAmount().then(function (data) {
            $scope.invoicesSum = data.data.data[0].total;
        });
        GraphicsService.getMonthExpenses().then(function (data) {
            $scope.expensesSum = data.data.data[0].total;
        });
    });

})();




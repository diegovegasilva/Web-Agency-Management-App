(function () {
    var app = angular.module('familiesController', ['familiesService']);

    app.controller('FamiliesController', ['$scope', '$modal', '$timeout', 'FamiliesService',function ($scope, $modal, $timeout, FamiliesService) {

        //get familias
        FamiliesService.getFamilies(null).then(function (data) {
            $scope.familias = data.data.data;
        });
        //crear arbol de familias
        $scope.getFamilyTree = function () {
            FamiliesService.getRootFamilies().then(function (data) {
                $scope.rootFamilies = data.data.data;
                $scope.recursive = function (obj) {
                    if (obj) {
                        angular.forEach(obj, function (family) {
                            FamiliesService.getFamilies(family.id).then(function (result) {
                                family.child = result.data.data;
                                $scope.recursive(family.child);
                            });
                        });
                    }
                };
                $scope.recursive($scope.rootFamilies);
            });
        };
        $scope.getFamilyTree();


        //editar familia
        $scope.editFamily = function (id) {
            FamiliesService.getFamily(id).then(function (data) {
                $scope.familia = data.data;
            });
            $scope.modalInstance = $modal.open({
                templateUrl: 'editFamilyModal.html',
                scope: $scope,
                controller: 'FamiliesController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.edit = function (family) {
                FamiliesService.editFamily(family).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Familia editada correctamente.'}];
                    $scope.getFamilyTree();
                    $timeout($scope.closeAlert, 4000);
                });
            };
        };
        //borrar familia
        $scope.deleteFamily = function (id) {
            $scope.familyID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteFamilyModal.html',
                scope: $scope,
                controller: 'FamiliesController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.delete = function (id) {
                FamiliesService.deleteFamily(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Familia eliminada correctamente.'}];
                    $scope.getFamilyTree();
                    $timeout($scope.closeAlert, 4000);
                });
            };
        };
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
        //alert

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }]);
    app.controller('FamiliesMenuController', ['$scope', '$modal', '$state', '$timeout', 'FamiliesService', function ($scope, $modal, $state, $timeout, FamiliesService) {

        //get familias
        FamiliesService.getFamilies(null).then(function (data) {
            $scope.familias = data.data.data;
        });

        //añadir familia
        $scope.addFamilia = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                scope: $scope,
                controller: 'FamiliesController'
            });
            $scope.newFamily = {};
            $scope.alerts = [];
            $scope.add = function () {
                FamiliesService.addFamily($scope.newFamily).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Familia creada correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                });
            };
            $scope.cancel = function () {
                $scope.modalInstance.close();
            };
        };
        //cerrar alerta
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
            $state.go($state.current, {}, {reload: true});
        };

    }]);
})();
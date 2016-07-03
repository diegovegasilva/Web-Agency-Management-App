(function () {
    var app = angular.module('configController', ['productsService', 'clientsService', 'configService', 'ngMessages', 'ui.bootstrap']);

    app.controller('ConfigController',['$scope', '$modal', '$timeout', 'ProductsService', 'ConfigService', 'ClientsService', 'config', function ($scope, $modal, $timeout, ProductsService, ConfigService, ClientsService, config) {


        //datos facturacion
        ClientsService.getProvinces().then(function (data) {
            $scope.provinces = data.data;
        });
        $scope.userData = function () {
            ConfigService.getUserData().then(function (data) {
                $scope.user = data.data;
            });
        };
        $scope.userData();

        $scope.restoreUserData = function () {
            $scope.userData();
        };
        //editar datos usuario
        $scope.editUserData = function () {
            $scope.alerts = [];
            ConfigService.editUserData($scope.user).then(function (data) {
                $scope.alerts = [{type: 'success', msg: 'Datos actualizados correctamente.'}];
                $timeout($scope.closeAlert, 4000);
                $scope.userData();
            });

        };

        //get iva
        $scope.getVat = function () {
            ProductsService.getVAT().then(function (data) {
                $scope.vats = data.data;
            });
        };
        $scope.getVat();

        //borrar IVA
        $scope.deleteVat = function (id) {
            $scope.vatID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteVatModal.html',
                scope: $scope,
                controller: 'ConfigController'
            });
            $scope.delete = function (id) {
                ConfigService.deleteVat(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'IVA eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getVat();
                });
            };
        };
        //Añadir IVA

        $scope.addVat = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'addVatModal.html',
                scope: $scope,
                controller: 'ConfigController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.add = function (iva) {
                ConfigService.addVat(iva).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'IVA añadido correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getVat();
                });
            };
        };

        //cambio de vista

        $scope.defaultView = sessionStorage.appDefaultView;
        $scope.productMode = localStorage.appProductMode;
        $scope.changeDefaultView = function () {
            $scope.alerts = [];
            localStorage.appDefaultView = $scope.defaultView;
            $scope.alerts = [{type: 'success', msg: 'Vista cambiada correctamente.'}];
            $timeout($scope.closeAlert, 2000);
        };
        $scope.changeProductMode = function () {
            $scope.alerts = [];
            localStorage.appProductMode = $scope.productMode;
            $scope.alerts = [{type: 'success', msg: 'Modo cambiado correctamente.'}];
            $timeout($scope.closeAlert, 2000);
        };

        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
        //cerrar alert
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        
        $scope.url = config.domain + config.imagePath;
        
        ConfigService.getInvoiceImage().then(function (data) {
            $scope.tempFile = [];
            if (data.data.image) {
                $scope.files = true;
                $scope.tempFile.name = data.data.image;
                $scope.tempFile.src = data.data.image;
            } else {
                $scope.files = false;
                $scope.image = false;

            }
        });      
        $scope.deleteInvoiceImage = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteImageModal.html',
                scope: $scope
            });
            $scope.deleteImage = function () {
                ConfigService.deleteInvoiceImage().then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.tempFile.name = null;
                    $scope.tempFile.id = null;
                    $scope.tempFile.src = null;
                    $scope.files = false;
                    $scope.alerts = [{type: 'success', msg: 'Imagen eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 2000);
                });
            };
        };
        $scope.onFileSelect = function ($files) {
            $scope.tempFile = [];
            var file = $files[0];
            $scope.tempFile.name = '';
            if (file.type.indexOf('image') == -1) {
                $scope.error = 'Tipo de archivo no permitido. Sólo se admiten .jpg o .png';
                $scope.files = false;
                return false;
            }
            if (file.size > 10485760) {
                $scope.error = 'El tamaño máximo permitido son 10MB';
                $scope.files = false;
                return false;
            } else {
                ConfigService.uploadInvoiceImage(file).progress(function (evt) {
                    $scope.loading = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    $scope.tempFile.name = file.name;
                    $scope.tempFile.id = data.data;
                    $scope.tempFile.src = data.src;
                    $scope.files = true;
                    $scope.error = false;
                }).error(function (data, status) {
                    $scope.message = data;
                });
            }
        };

    }]);
})();
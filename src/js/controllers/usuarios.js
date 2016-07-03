(function () {
    var app = angular.module('usersController', ['usersService', 'ngMessages', 'ui.bootstrap']);

    app.controller('UsersController', ['$scope', '$modal', '$timeout', 'UsersService', 'config',function ($scope, $modal, $timeout, UsersService, config) {
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;


        $scope.getUsers = function () {
            UsersService.getUsers($scope.itemsPerPage, $scope.offset).then(function (data) {
                $scope.users = data.data.data;
                angular.forEach($scope.users, function (user) {
                    UsersService.getRol(user.userRol).then(function (data) {
                        user.rol = data.data.userRol;
                    });
                });
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }

            });
        };
        $scope.getUsers();
        //borrar usuario
        $scope.deleteUser = function (id) {
            $scope.userID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteUserModal.html',
                scope: $scope,
                controller: 'UsersController'
            });
            $scope.delete = function (id) {
                UsersService.deleteUser(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Usuario eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getUsers();
                });
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
            $scope.getUsers();
        };

    }]);
    app.controller('DetailUsersController', ['$scope', '$stateParams', 'UsersService', '$location', '$modal', '$timeout', 'resolveUser', '$state', 'config', '$q',function ($scope, $stateParams, UsersService, $location, $modal, $timeout, resolveUser, $state, config, $q) {

        var originalUser = resolveUser.data;
        delete originalUser.password;
        originalUser.newPassword = '';
        $scope.user = angular.copy(originalUser);
        $scope.userID = $stateParams.userID;

        UsersService.getRoles().then(function (data) {
            $scope.roles = data.data;

        });

        $scope.getUser = function () {
            UsersService.getUser($scope.userID).then(function (data) {
                $scope.user = data.data;
                $scope.user.rol = '';
                $scope.user.newPassword = '';
                UsersService.getRol($scope.user.userRol).then(function (data) {
                    $scope.user.rol = data.data.userRol;
                    originalUser.rol = data.data.userRol;
                    delete $scope.user.password;
                });
            });
        };
        $scope.getUser();

        var backView = function () {
            $state.go('usuarios');
        };
        $scope.editUser = function () {
            if ($scope.user.newPassword !== '' && $scope.user.newPassword !== false)
                $scope.user.password = $scope.user.newPassword;
            $q.all([
                UsersService.editUser($scope.user),
                UsersService.saveUserImage($scope.tempFile.id, $scope.userID)
            ]).then(function (data) {
                if (data) {
                    $scope.alerts = [{type: 'success', msg: 'Usuario editado correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };
        $scope.originalEditForm = function () {
            return angular.equals(originalUser, $scope.user);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.deleteUser = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteUserModal.html',
                scope: $scope,
                controller: 'UsersController'
            });
            $scope.delete = function () {
                UsersService.deleteUser($stateParams.userID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Usuario eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $state.go('usuarios');
                });
            };
        };
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        $scope.url = config.domain + config.imagePath;
        //get imagen 
        UsersService.getUserImage($scope.userID).then(function (data) {
            $scope.tempFile = [];
            angular.forEach(data.data, function (file) {
                if (data.data.length > 0) {
                    $scope.files = file;
                    $scope.tempFile.name = file.url;
                    $scope.tempFile.id = file.id;
                    $scope.tempFile.src = file.url;
                } else {
                    $scope.files = false;
                    $scope.image = false;
                }
            });
        });

        //borrar imagen
        $scope.deleteUserImage = function (id) {
            $scope.imageID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteImageModal.html',
                scope: $scope
            });
            $scope.deleteImage = function (id) {
                UsersService.deleteUserImage(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.tempFile.name = null;
                    $scope.tempFile.id = null;
                    $scope.tempFile.src = null;
                    $scope.files = false;
                    $scope.originalEditForm = function () {
                        return angular.equals(originalUser, $scope.user);
                    };
                    $scope.alerts = [{type: 'success', msg: 'Imagen eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 2000);
                });
            };
        };

        //subir imagen
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
                UsersService.uploadUserImage(file).progress(function (evt) {
                    $scope.loading = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data) {
                    $scope.tempFile.name = file.name;
                    $scope.tempFile.id = data.data;
                    $scope.tempFile.src = data.src;
                    $scope.files = true;
                    $scope.error = false;
                    $scope.originalEditForm = false;
                }).error(function (data) {
                    $scope.message = data;
                });
            }
        };

    }]);
    app.controller('AddUsersController', ['$scope', 'UsersService', '$location', '$q', '$timeout', '$state', '$upload', 'config',function ($scope, UsersService, $location, $q, $timeout, $state, $upload, config) {

        UsersService.getRoles().then(function (data) {
            $scope.roles = data.data;
        });
        $scope.url = config.domain + config.imagePath;

        //subir imagen
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
                UsersService.uploadUserImage(file).progress(function (evt) {
                    $scope.loading = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data) {
                    $scope.tempFile.name = file.name;
                    $scope.tempFile.id = data.data;
                    $scope.tempFile.src = data.src;
                    $scope.files = true;
                    $scope.error = false;
                }).error(function (data) {
                    $scope.message = data;

                });
            }
        };

        $scope.deleteUserImage = function (imageID) {
            UsersService.deleteProductImage(imageID).then(function (data) {
                $scope.tempFile.name = null;
                $scope.tempFile.id = null;
                $scope.tempFile.src = null;
                $scope.files = false;
            });
        };

        //añadir usuario
        $scope.addUser = function () {
            function addPartialUser(user) {
                return $q(function (resolve, reject) {
                    UsersService.addUser(user).then(function (data) {
                        userID = data.data.data;
                        resolve(userID);
                    });
                });
            }
            function addPartialImage(imageID, userID) {
                UsersService.saveUserImage(imageID, userID);
            }
            var reloadView = function () {
                $state.go($state.$current, null, {reload: true});
            };
            var promise = addPartialUser($scope.user);
            promise.then(function (data) {
                if ($scope.files === true) {
                    addPartialImage($scope.tempFile.id, userID);
                }
                if (data) {
                    $scope.alerts = [{type: 'success', msg: 'Producto creado correctamente.'}];
                    $timeout(reloadView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo'}];
                }

            });
        };


        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }]);

    app.controller('DetailUserController', ['$rootScope', '$scope', '$stateParams', 'UsersService', '$location', '$modal', '$timeout', 'resolveUser', '$state', 'config', '$q',function ($rootScope, $scope, $stateParams, UsersService, $location, $modal, $timeout, resolveUser, $state, config, $q) {

        var originalUser = resolveUser.data;
        delete originalUser.password;
        originalUser.newPassword = '';
        $scope.user = angular.copy(originalUser);
        $scope.userID = $stateParams.userID;


        if ($stateParams.userID != $rootScope.currentUserID) {
            $state.go('noAuth');
        }

        UsersService.getRoles().then(function (data) {
            $scope.roles = data.data;
        });

        $scope.getUser = function () {
            UsersService.getUser($scope.userID).then(function (data) {
                $scope.user = data.data;
                $scope.user.rol = '';
                $scope.user.newPassword = '';
                UsersService.getRol($scope.user.userRol).then(function (data) {
                    $scope.user.rol = data.data.userRol;
                    originalUser.rol = data.data.userRol;
                    delete $scope.user.password;
                });
            });
        };
        $scope.getUser();

        var reloadView = function () {
            $state.go($state.$current, null, {reload: true});
        };
        $scope.editUser = function () {
            if ($scope.user.newPassword !== '' && $scope.user.newPassword !== false)
                $scope.user.password = $scope.user.newPassword;
            $q.all([
                UsersService.editUser($scope.user),
                UsersService.saveUserImage($scope.tempFile.id, $scope.userID)
            ]).then(function (data) {
                if (data) {
                    $scope.alerts = [{type: 'success', msg: 'Usuario editado correctamente.'}];
                    $timeout(reloadView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };

        $scope.originalEditForm = function () {
            return angular.equals(originalUser, $scope.user);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.deleteUser = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteUserModal.html',
                scope: $scope,
                controller: 'UsersController'
            });
            $scope.delete = function () {
                UsersService.deleteUser($stateParams.userID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Usuario eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $state.go('usuarios');
                });
            };
        };
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        $scope.url = config.domain + config.imagePath;
        //get imagen 
        UsersService.getUserImage($scope.userID).then(function (data) {
            $scope.tempFile = [];
            angular.forEach(data.data, function (file) {
                if (data.data.length > 0) {
                    $scope.files = file;
                    $scope.tempFile.name = file.url;
                    $scope.tempFile.id = file.id;
                    $scope.tempFile.src = file.url;
                } else {
                    $scope.files = false;
                    $scope.image = false;
                }
            });
        });

        //borrar imagen
        $scope.deleteUserImage = function (id) {
            $scope.imageID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteImageModal.html',
                scope: $scope
            });
            $scope.deleteImage = function (id) {
                UsersService.deleteUserImage(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.tempFile.name = null;
                    $scope.tempFile.id = null;
                    $scope.tempFile.src = null;
                    $scope.files = false;
                    $scope.originalEditForm = function () {
                        return angular.equals(originalUser, $scope.user);
                    };
                    $scope.alerts = [{type: 'success', msg: 'Imagen eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 2000);
                });
            };
        };

        //subir imagen
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
                UsersService.uploadUserImage(file).progress(function (evt) {
                    $scope.loading = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data) {
                    $scope.tempFile.name = file.name;
                    $scope.tempFile.id = data.data;
                    $scope.tempFile.src = data.src;
                    $scope.files = true;
                    $scope.error = false;
                    $scope.originalEditForm = false;
                }).error(function (data) {
                    $scope.message = data;
                });
            }
        };

    }]);
})();

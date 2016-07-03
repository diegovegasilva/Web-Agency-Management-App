(function () {
    var app = angular.module('productsController', ['productsService', 'ngMessages', 'ui.bootstrap', 'ui.router.compat']);

    app.controller('ProductsRootFamiliesController',['$scope', '$state', 'ProductsService', '$stateParams', 'config', function ($scope, $state, ProductsService, $stateParams, config) {

        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;

        $scope.familyID = $stateParams.familyID;
        $scope.getProducts = function () {
            if ($scope.familyID) {               
                ProductsService.getFamilies($scope.familyID,$scope.itemsPerPage,$scope.offset).then(function (data) {
                    $scope.families = data.data.data;
                    angular.forEach($scope.families, function (family) {
                        ProductsService.getFinalFamilies(family.id,$scope.itemsPerPage,$scope.offset).then(function (result) {
                            
                            family.row = result.data.rows;
                            family.href = result.data.rows === 0 ? 'producto/' + family.name + '/' + family.id : 'productos/' + family.id;
                        });
                    });
                    $scope.results = data.data.length;
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }
                });
            } else {
                ProductsService.getRootFamilies($scope.itemsPerPage,$scope.offset).then(function (data) {
                    $scope.families = data.data.data;

                    angular.forEach($scope.families, function (family) {
                        ProductsService.getFinalFamilies(family.id).then(function (result) {
                            family.href = result.data.rows === 0 ? 'producto/' + family.name + '/' + family.id : 'productos/' + family.id;
                        });
                    });
                    $scope.results = data.data.length;
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }
                });
            }
        };
        $scope.getProducts();
        $scope.pageChanged = function () {
            $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
            $scope.getProducts();
        };
        
        $scope.state = $state.current.name;
    }]);
    
    app.controller('ProductsListController', ['$scope', '$stateParams', '$filter', '$state', 'ProductsService', 'config',function ($scope, $stateParams, $filter, $state, ProductsService, config) {
        
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        
        $scope.familyID = $stateParams.familyID;
        if (!isFinite(String($scope.familyID))){
            $scope.familyID = '';
        }
        $scope.getProducts = function(){
            ProductsService.getProducts($scope.familyID,$scope.itemsPerPage,$scope.offset).then(function (data) {
                $scope.products = data.data.data;
                $scope.productsSearch = $scope.products;
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
            });
        };
        $scope.getProducts();
        $scope.pageChanged = function () {
             $scope.offset = $scope.itemsPerPage *($scope.currentPage-1);
             $scope.getProducts();
          };
        $scope.$watch('search', function(val){ 
            $scope.products = $filter('filter')($scope.productsSearch, val);
        });
        $scope.state = $state.current.name;
    }]);

    app.controller('AddProductsController', ['$scope', 'ProductsService', '$location', '$q', '$upload', '$state', '$timeout', 'config',function ($scope, ProductsService, $location, $q, $upload, $state, $timeout, config) {

        //get iva
        ProductsService.getVAT().then(function (data) {
            $scope.vat = data.data;
        });

        // get select families
        ProductsService.getFamilies(null).then(function (data) {
            
            $scope.selectFamilies = [];
            angular.forEach(data.data.data, function (family, index) {
                ProductsService.getFinalFamilies(family.id).then(function (result) {
                    if (result.data.rows === 0) {
                        $scope.selectFamilies.push(family);
                    }
                });
            });
        });

        $scope.product = {};
        $scope.product.active = 1;

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.url = config.domain + config.imagePath;
        $scope.price = [{name: '', units: '', price: '', product_id: ''}];
        $scope.removePrice = function (index) {
            $scope.price.splice(index, 1);
        };
        $scope.addPrice = function () {
            $scope.price.push({price: ''});
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
                ProductsService.uploadProductImage(file).progress(function (evt) {
                    $scope.loading = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
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

        $scope.deleteProductImage = function (imageID) {
            ProductsService.deleteProductImage(imageID).then(function (data) {
                $scope.tempFile.name = null;
                $scope.tempFile.id = null;
                $scope.tempFile.src = null;
                $scope.files = false;
            });
        };

        //añadir producto
        $scope.addProduct = function () {
            function addPartialProduct(product) {
                return $q(function (resolve, reject) {
                    ProductsService.addProduct(product).then(function (data) {
                        productID = data.data.data;
                        angular.forEach($scope.price, function (iter, index) {
                            iter.product_id = productID;
                        });
                        resolve(productID);
                    });
                });
            }
            function addPartialImage(imageID, productID) {
                ProductsService.saveProductImage(imageID, productID);
            }
            function addPartialPrice(priceValue) {
                ProductsService.addFormat(priceValue);
            }
            var reloadView = function () {
                $state.go($state.$current, null, {reload: true});
            };
            var promise = addPartialProduct($scope.product);
            promise.then(function (data) {
                if ($scope.files === true) {
                    $q.all([
                        addPartialImage($scope.tempFile.id, productID),
                        addPartialPrice($scope.price)
                    ]).then(function () {
                        if (data) {
                            $scope.alerts = [{type: 'success', msg: 'Producto creado correctamente.'}];
                            $timeout(reloadView, 1000);
                        } else {
                            $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                        }
                    });
                } else {
                    $q.all([
                        addPartialPrice($scope.price)
                    ]).then(function () {
                        if (data) {
                            $scope.alerts = [{type: 'success', msg: 'Producto creado correctamente.'}];
                            $timeout(reloadView, 1000);
                        } else {
                            $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo'}];
                        }
                    });
                }
            });
        };
    }]);

    app.controller('ProductsDetailController', ['$scope', '$stateParams', 'ProductsService', '$location', '$q', 'resolveProduct', 'resolvePrice', 'resolveProductImage', '$window', '$timeout', 'config', '$modal', '$state',function ($scope, $stateParams, ProductsService, $location, $q, resolveProduct, resolvePrice, resolveProductImage, $window, $timeout, config, $modal, $state) {
        var originalProduct = resolveProduct.data;
        $scope.product = angular.copy(originalProduct);

        var originalPrice = resolvePrice.data;
        $scope.price = angular.copy(originalPrice);

        var originalImage = resolveProductImage.data;

        angular.forEach(originalImage, function (image) {
            $scope.image = image;
        });
        $scope.url = config.domain + config.imagePath;
        //get product
        ProductsService.getProduct($stateParams.productID).then(function (data) {
            $scope.product = data.data;
        });

        // get select families
        ProductsService.getFamilies(null).then(function (data) {
            $scope.selectFamilies = [];
            angular.forEach(data.data.data, function (family, index) {
                ProductsService.getFinalFamilies(family.id).then(function (result) {
                    if (result.data.rows === 0) {
                        $scope.selectFamilies.push(family);
                    }
                });
            });
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        //get precios
        ProductsService.getProductPrice($stateParams.productID).then(function (data) {
            $scope.price = data.data;
            if ($scope.price) {
                $scope.clearPrice = [];
            }
        });

        //ocultar y añadir precios
        $scope.removePrice = function (index, formatID) {
            $scope.price.splice(index, 1);
            $scope.clearPrice.push(formatID);
        };
        $scope.addPrice = function () {
            $scope.price.push({id: '', name: '', units: '', price: '', product_id: $stateParams.productID});
        };

        //get iva
        ProductsService.getVAT().then(function (data) {
            $scope.vat = data.data;
        });

        //get imagen 
        ProductsService.getProductImage($stateParams.productID).then(function (data) {
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
        $scope.deleteProductImage = function (id) {
            $scope.imageID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteImageModal.html',
                scope: $scope
            });
            $scope.deleteImage = function (id) {
                ProductsService.deleteProductImage(id).then(function (data) {
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
                ProductsService.uploadProductImage(file).progress(function (evt) {
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

        //borrar producto
        $scope.deleteProduct = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteProductModal.html',
                scope: $scope
            });
            $scope.delete = function () {
                ProductsService.deleteProduct($stateParams.productID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Producto eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $state.go('productosRootFamilias');
                });
            };
        };
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        //editar product

        $scope.erasePrice = function () {
            if ($scope.clearPrice.length > 0) {
                ProductsService.deleteFormat($scope.clearPrice);
            }
        };

        $scope.editProduct = function () {

            var historyBack = function () {
                $window.history.back();
            };

            if ($scope.files) {
                $q.all([
                    ProductsService.editProduct($scope.product),
                    $scope.erasePrice(),
                    ProductsService.editFormat($scope.price),
                    ProductsService.saveProductImage($scope.tempFile.id, $stateParams.productID)
                ]).then(function (values) {
                    if (values) {
                        $scope.alerts = [{type: 'success', msg: 'Producto editado correctamente.'}];
                        $timeout(historyBack, 1000);
                    } else {
                        $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                    }

                });
            } else {
                $q.all([
                    ProductsService.editProduct($scope.product),
                    $scope.erasePrice(),
                    ProductsService.editFormat($scope.price)
                ]).then(function (values) {
                    if (values) {
                        $scope.alerts = [{type: 'success', msg: 'Producto editado correctamente.'}];
                        $timeout(historyBack, 1000);
                    } else {
                        $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                    }
                });
            }
        };

        //validar cambios
        $scope.originalEditForm = function () {
            return angular.equals(originalProduct, $scope.product) && angular.equals(originalPrice, $scope.price) && angular.equals($scope.image, $scope.files);

        };
        $scope.originalImage = function () {
            return angular.equals($scope.image, $scope.files);

        };
    }]);
})();
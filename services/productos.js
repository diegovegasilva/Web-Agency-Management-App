(function () {
    var app = angular.module('productsService', []);

    app.factory('ProductsService', ['$http', '$location', '$upload', function ($http, $location, $upload) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var products = [];

            products.getRootFamilies = function (perPage, offset) {
                return $http.get(webServiceUrl + 'getRootFamilies?perPage=' + perPage + '&offset=' + offset);
            };
            products.getFamilies = function (familyID, perPage, offset) {

                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getFamilies?id=' + familyID);
                } else {
                    return $http.get(webServiceUrl + 'getFamilies?id=' + familyID + '&perPage=' + perPage + '&offset=' + offset);
                }
            };
            products.getFinalFamilies = function (familyID, perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getFinalFamilies?id=' + familyID);
                } else {
                    return $http.get(webServiceUrl + 'getFinalFamilies?id=' + familyID + '&perPage=' + perPage + '&offset=' + offset);
                }
            };
            products.getProducts = function (familyID, perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    if (familyID) {
                        return $http.get(webServiceUrl + 'getProducts?familyID=' + familyID);
                    } else {
                        return $http.get(webServiceUrl + 'getProducts');
                    }
                } else {
                    if (familyID) {
                        return $http.get(webServiceUrl + 'getProducts?familyID=' + familyID + '&perPage=' + perPage + '&offset=' + offset);
                    } else {
                        return $http.get(webServiceUrl + 'getProducts?perPage=' + perPage + '&offset=' + offset);
                    }
                }
            };
            products.getProduct = function (productID) {
                return $http.get(webServiceUrl + 'getProduct?id=' + productID);
            };
            products.getProductPrice = function (productID) {
                return $http.get(webServiceUrl + 'getProductPrice?id=' + productID);
            };
            products.getProductImage = function (productID) {
                return $http.get(webServiceUrl + 'getProductImage?id=' + productID);
            };
            products.getVAT = function () {
                return $http.get(webServiceUrl + 'getVAT');
            };
            products.addProduct = function (product) {
                return $http.post(webServiceUrl + 'addProduct', product);
            };
            products.addFormat = function (format) {
                return $http.post(webServiceUrl + 'addFormat', format);
            };
            products.editProduct = function (product) {
                return $http.put(webServiceUrl + 'editProduct', product).then(function (data) {
                    return data;
                });
            };
            products.editFormat = function (format) {
                return $http.put(webServiceUrl + 'editFormat', format).then(function (data) {
                    return data;
                });
            }
            products.deleteFormat = function (formatID) {
                return $http.delete(webServiceUrl + 'deleteFormat', {data: formatID}).then(function (data) {
                    return data;
                });
            }
            products.deleteProduct = function (productID) {
                return $http.delete(webServiceUrl + 'deleteProduct?id=' + productID).then(function (status) {
                    return status.data;
                });
            }
            products.uploadProductImage = function (file) {
                return $upload.upload({
                    url: webServiceUrl + 'uploadProductImage',
                    method: 'POST',
                    file: file,
                    data: file.name,
                })
            };
            products.deleteProductImage = function (imageID) {
                return $http.delete(webServiceUrl + 'deleteProductImage?id=' + imageID).then(function (data) {
                    return data;
                });
            }
            products.saveProductImage = function (id, productID) {
                return $http.post(webServiceUrl + 'saveProductImage', {id: id, productID: productID}).then(function (data) {
                    return data;
                });
            }
            products.getProductImage = function (productID) {
                return $http.get(webServiceUrl + 'getProductImage?id=' + productID).then(function (data) {
                    return data;
                });
            }
            return products;

        }]);

})();
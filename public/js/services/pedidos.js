(function () {
    var app = angular.module('ordersService', []);

    app.factory('OrdersService', ['$http', '$location', function ($http, $location) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var orders = [];


            orders.data = {
                units: '',
                view: '',
                save: false
            };
            orders.getView = function () {
                return orders.data.view;
            };
            orders.setView = function (newView) {
                orders.data.view = newView;
                return orders.data.view;
            };
            orders.getProducts = function (familyID, perPage, offset) {

                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    if (familyID) {
                        return $http.get(webServiceUrl + 'getProducts?order=1&familyID=' + familyID);
                    } else {
                        return $http.get(webServiceUrl + 'getProducts?order=1');
                    }
                } else {
                    if (familyID) {
                        return $http.get(webServiceUrl + 'getProducts?order=1&familyID=' + familyID + '&perPage=' + perPage + '&offset=' + offset);
                    } else {
                        return $http.get(webServiceUrl + 'getProducts?order=1&perPage=' + perPage + '&offset=' + offset);
                    }
                }
            };
            orders.getProductUnits = function () {
                return orders.data.units;
            };
            orders.setProductUnits = function (newUnits) {
                orders.data.units = newUnits;
                return orders.data.units;
            };
            orders.getSaveMode = function () {
                return orders.data.save;
            };
            orders.setSaveMode = function (mode) {
                orders.data.save = mode;
                return orders.data.save;
            };
            orders.getPrice = function (priceID) {
                return $http.get(webServiceUrl + 'getPrice?id=' + priceID);
            };
            orders.getVAT = function () {
                return $http.get(webServiceUrl + 'getVAT');
            };
            orders.getVATPercent = function (vatID) {
                return $http.get(webServiceUrl + 'getVATPercent?id=' + vatID);
            };
            orders.addOrder = function (order) {
                return $http.post(webServiceUrl + 'addOrder', order);
            };
            orders.addOrderLines = function (products, orderID) {
                return $http.post(webServiceUrl + 'addOrderLines', {products: products, orderID: orderID}).then(function (data) {
                    return data;
                });
            };
            orders.editOrder = function (order) {
                return $http.put(webServiceUrl + 'editOrder', order);
            };
            orders.editOrderLines = function (ordersLines, orderID) {
                return $http.put(webServiceUrl + 'editOrderLines', {products: ordersLines, orderID: orderID}).then(function (data) {
                    return data;
                });
            };
            orders.getOrder = function (orderID) {
                return $http.get(webServiceUrl + 'getOrder?id=' + orderID);
            };
            orders.getOrderLines = function (orderID) {
                return $http.get(webServiceUrl + 'getOrderLines?id=' + orderID).then(function (data) {
                    angular.forEach(data.data, function (line) {
                        line.units = parseInt(line.units);
                    });
                    return data;
                });
            };
            orders.getOrders = function (clientID, perPage, offset, type) {
                if (clientID) {
                    return $http.get(webServiceUrl + 'getOrders?clientID=' + clientID + '&perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                } else {
                    return $http.get(webServiceUrl + 'getOrders?perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                }
            };
            orders.deleteOrder = function (orderID) {
                return $http.delete(webServiceUrl + 'deleteOrder?id=' + orderID).then(function (status) {
                    return status.data;
                });
            };
            orders.acceptOrder = function (order, project) {
                return $http.put(webServiceUrl + 'acceptOrder', {order: order, project: project});
            };
            orders.getInvoices = function (clientID, orderID, perPage, offset, type) {
                if (clientID) {
                    if (orderID) {
                        return $http.get(webServiceUrl + 'getInvoices?clientID=' + clientID + '&orderID=' + orderID + '&perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                    } else {
                        return $http.get(webServiceUrl + 'getInvoices?clientID=' + clientID + '&perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                    }
                } else {
                    if (orderID) {
                        return $http.get(webServiceUrl + 'getInvoices?orderID=' + orderID + '&perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                    } else {
                        return $http.get(webServiceUrl + 'getInvoices?perPage=' + perPage + '&offset=' + offset + '&type=' + type);
                    }
                }
            };
            orders.getInvoice = function (invoiceID) {
                return $http.get(webServiceUrl + 'getInvoice?id=' + invoiceID).then(function (data) {
                    data.data.date = new Date(data.data.date);
                    return data;
                });
            };
            orders.deleteInvoice = function (invoiceID) {
                return $http.delete(webServiceUrl + 'deleteInvoice?id=' + invoiceID).then(function (status) {
                    return status.data;
                });
            };
            orders.invoiceChangeStatus = function (invoiceID, status) {
                return $http.post(webServiceUrl + 'invoiceChangeStatus', {invoiceID: invoiceID, status: status});
            };
            orders.addInvoice = function (id) {
                return $http.post(webServiceUrl + 'addInvoice', id);
            };
            orders.editInvoice = function (order) {
                return $http.put(webServiceUrl + 'editInvoice', order);
            };
            orders.getPaymentMethods = function () {
                return $http.get(webServiceUrl + 'getPaymentMethods');
            };
            orders.getInstallments = function () {
                return $http.get(webServiceUrl + 'getInstallments');
            };

            return orders;


        }]);

})();

(function () {
    var app = angular.module('ordersController', ['clientsService', 'ordersService', 'configService', 'ngMessages', 'ui.bootstrap']);

    app.controller('MakeOrderController',['$scope', 'ClientsService', '$modal', '$state', function ($scope, ClientsService, $modal, $state) {
        ClientsService.getClients().then(function (data) {
            $scope.clients = data.data.data;
            $scope.selected = {};
        });

        $scope.startOrder = function () {
            $scope.order.client = $scope.selected.value.id;
            localStorage.setObject('order', $scope.order);
            if (localStorage.appProductMode == 'byProduct') {
                $state.go('addProductosPedido');
            } else {
                $state.go('categoriasPedido');
            }
        };

        //check order
        if (localStorage.order) {
            $scope.order = localStorage.getObject('order');
            if ($scope.order.id) {
                localStorage.removeItem('order');
                $scope.order = {};
            } else {
                $scope.modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    scope: $scope
                });
            }
        } else {
            $scope.order = {};
        }

        //Modal
        $scope.ok = function () {
            $scope.modalInstance.close();
            if (localStorage.appProductMode == 'byProduct') {
                $state.go('addProductosPedido');
            } else {
                $state.go('categoriasPedido');
            }
        };
        $scope.cancel = function () {
            $scope.modalInstance.dismiss();
            localStorage.removeItem('order');
            $scope.order = {};
        };
    }]);

    app.controller('OrderAddProductController', ['$scope', 'ProductsService', 'OrdersService', '$state', '$stateParams', '$filter', 'config',function ($scope, ProductsService, OrdersService, $state, $stateParams, $filter, config) {


        if (!localStorage.order) {
            $state.go('pedidoCrear');
        } else {
            $scope.order = localStorage.getObject('order');
        }

        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;


        $scope.familyID = $stateParams.familyID;


        //actualizamos lista de productos con localStorage al cargar
        if ($scope.order.products) {
            OrdersService.getProducts($scope.familyID, $scope.itemsPerPage, $scope.offset).then(function (data) {
                $scope.products = $scope.mergeProducts(data.data.data, $scope.order.products);
                $scope.products.price = '';
                $scope.getFormat();
                $scope.getVatVal();
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
            });
        } else {
            OrdersService.getProducts($scope.familyID, $scope.itemsPerPage, $scope.offset).then(function (data) {
                $scope.products = data.data.data;
                $scope.getFormat();
                $scope.getVatVal();
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
            });
            $scope.order.products = [];
        }
        $scope.getProducts = function () {
            OrdersService.getProducts($scope.familyID, $scope.itemsPerPage, $scope.offset).then(function (data) {
                $scope.products = data.data.data;
                $scope.getFormat();
                $scope.getVatVal();
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
            });
        };
        $scope.getProducts();
        $scope.updateOrder = function (productID) {
            $scope.tempProducts = $filter('filter')($scope.products, {isAdd: true}, true);
            $scope.order.products = $scope.order.products.concat($scope.tempProducts);
            $scope.getProducts();
        };

        //actualizar storage de productos y numero unidades 
        $scope.$watch('order.products', function () {
            localStorage.setObject('order', $scope.order);
            if (($scope.order.products) && ($scope.order.products.length > 0)) {
                $scope.productUnits = localStorage.getObject('order').products.length;
            } else {
                $scope.productUnits = -1;
            }
            $scope.$watch('productUnits', function (newUnits) {
                if (newUnits)
                    OrdersService.setProductUnits(newUnits);
            });
        });

        //formatos, precio y unidades iniciales
        $scope.getFormat = function () {
            angular.forEach($scope.products, function (product) {
                if (!product.units)
                    product.units = 1;
                ProductsService.getProductPrice(product.id).then(function (data) {
                    if (data.data.length) {
                        product.format = data.data;
                        if (data.data.length === 1) {
                            angular.forEach(data.data, function (price) {
                                product.price = price.id;
                            });
                        }
                    }
                });
            });
        };
        $scope.getVatVal = function () {
            angular.forEach($scope.products, function (product) {
                OrdersService.getVATPercent(product.vat).then(function (data) {
                    product.vatPercent = data.data.vat;
                });
            });
        };

        //fusionar products y order.products
        $scope.mergeProducts = function (products, orders) {
            var newProds = angular.copy(products);
            for (var i = 0; i < newProds.length; i++) {
                var prod = newProds[i];
                for (var j = 0; j < orders.length; j++) {
                    var order = orders[j];
                    if (order.id === prod.id) {
                        for (var key in order) {
                            prod[key] = order[key];
                        }
                    }
                }
            }
            return newProds;
        };

        $scope.pageChanged = function () {
            $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
            $scope.getProducts();
        };


        //cambio de vista
        $scope.view = localStorage.appDefaultView;
        $scope.$watch(function () {
            return OrdersService.getView();
        }, function (newView) {
            if (newView)
                $scope.view = newView;
        });
    }]);

    app.controller('OrderCategoryController', ['$scope', 'ProductsService', 'OrdersService', '$stateParams', 'config',function ($scope, ProductsService, OrdersService, $stateParams, config) {
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;


        $scope.familyID = $stateParams.familyID;
        $scope.getProducts = function () {
            if ($scope.familyID) {
                ProductsService.getFamilies($scope.familyID, $scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.families = data.data.data;

                    angular.forEach($scope.families, function (family) {
                        ProductsService.getFinalFamilies(family.id, $scope.itemsPerPage, $scope.offset).then(function (result) {
                            family.row = result.data.rows;
                            family.href = result.data.rows === 0 ? 'crear-pedido/producto/' + family.name + '/' + family.id : 'crear-pedido/productos/' + family.id;
                        });

                    });
                    $scope.results = data.data.length;
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }
                });
            } else {
                ProductsService.getRootFamilies($scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.families = data.data.data;
                    angular.forEach($scope.families, function (family) {
                        ProductsService.getFinalFamilies(family.id).then(function (result) {
                            family.row = result.data.rows;
                            family.href = result.data.rows === 0 ? 'crear-pedido/producto/' + family.name + '/' + family.id : 'crear-pedido/productos/' + family.id;
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

        //cambio de vista
        $scope.view = localStorage.appDefaultView;
        $scope.$watch(function () {
            return OrdersService.getView();
        }, function (newView) {
            if (newView)
                $scope.view = newView;
        });
    }]);

    app.controller('OrderAddProductMenuController', ['$scope', 'OrdersService', '$state', 'config',function ($scope, OrdersService, $state, config) {
        $scope.endOrder = function () {
            $scope.order = localStorage.getObject('order');
            if ($scope.order.products && $scope.order.products.length > 0) {
                $scope.error = false;
                angular.forEach($scope.order.products, function (product) {
                    if ((product.format.length > 1) && (!product.price)) {
                        $scope.alerts = [{type: 'danger', msg: 'Selecciona el formato de los productos seleccionados para continuar.'}];
                        $scope.closeAlert = function (index) {
                            $scope.alerts.splice(index, 1);
                        };
                        $scope.error = true;
                    }
                });
                if ($scope.error === false) {
                    $state.go('resumenPedido');
                }
            } else {
                $scope.alerts = [{type: 'danger', msg: 'No has seleccionado ningún producto'}];
                $scope.closeAlert = function (index) {
                    $scope.alerts.splice(index, 1);
                };
            }
        };
        //unidades
        $scope.$watch(function () {
            return OrdersService.getProductUnits();
        }, function (newUnits) {
            if (newUnits)
                $scope.productUnits = newUnits;
        });
        //vista
        $scope.view = localStorage.appDefaultView;
        $scope.changeView = function (newView) {
            OrdersService.setView(newView);
            $scope.view = newView;
        };
    }]);

    app.controller('OrderResumeController', ['$rootScope', '$scope', 'OrdersService', 'ProductsService', '$state', '$filter', 'config',function ($rootScope, $scope, OrdersService, ProductsService, $state, $filter, config) {
        if (!localStorage.order) {
            $state.go('pedidoCrear');
        } else {
            $scope.order = localStorage.getObject('order');
            if (!$scope.order.id) {
                $scope.order.price = {};
            } else {
                $rootScope.title = 'Detalle de pedido';
            }
        }
        if ($scope.order.accepted === 1) {
            $scope.editable = false;
        } else {
            $scope.editable = true;
        }
        $scope.products = $scope.order.products;
        //update lista de productos activos
        $scope.updateOrder = function () {
            $scope.order.products = $filter('filter')($scope.products, {isSelected: true}, true);
        };

        //descuento
        $scope.applyDiscount = function (discount, price) {
            if (discount) {
                var lastChar = discount.toString().slice(-1);
                if (lastChar == '%') {
                    if (parseFloat(discount) < 100) {
                        return price * (100 - parseFloat(discount)) / 100;
                    } else {
                        return price;
                    }
                } else {
                    if (discount < price) {
                        return price - discount;
                    } else if (discount >= price || discount === 0) {
                        return price;
                    }
                }
            } else {
                return price;
            }
        };

        //precio
        $scope.price = function () {
            var totalPrice = 0;
            var totalVat = 0;

            angular.forEach($scope.order.products, function (product) {
                OrdersService.getPrice(product.price).then(function (data) {
                    $scope.order.price.discount = '';
                    var price = $scope.applyDiscount(product.discount, data.data.price * product.units);

                    totalPrice = parseFloat(totalPrice + price);

                    var tempVat = price * (product.vatPercent / 100);
                    totalVat = totalVat + parseFloat(tempVat.toFixed(2));
                    //valores
                    $scope.totalPrice = totalPrice;
                    $scope.totalVat = totalVat;
                    $scope.totalPriceVat = parseFloat($scope.totalPrice + $scope.totalVat);

                    //objeto order
                    $scope.order.price.price = parseFloat($scope.totalPrice).toFixed(2);
                    $scope.order.price.vat = parseFloat($scope.totalVat).toFixed(2);
                    $scope.order.price.total = parseFloat($scope.totalPriceVat.toFixed(2));

                    //objeto producto
                    angular.forEach(product.format, function (format) {
                        if (format.id == product.price) {
                            product.formatName = format.name;
                        }
                    });
                    if (!product.discount) {
                        product.discount = 0;
                    }
                    product.unitPrice = data.data.price;
                    product.priceVal = parseFloat(price);
                    product.vatVal = parseFloat(price * (product.vatPercent / 100));
                    localStorage.setObject('order', $scope.order);
                });
            });
        };

        //query VAT y mostrar precio
        $scope.setPrice = function () {
            if (!$scope.vat) {
                OrdersService.getVAT().then(function (data) {
                    $scope.vat = data.data;
                    $scope.price();
                });
            } else {
                $scope.price();
            }
        };
        //update localstorage de productos y precio
        $scope.$watch('order.products', function () {
            localStorage.setObject('order', $scope.order);
            $scope.setPrice();
        });


        //activar editar
        $scope.actions = {};

        //cambio de vista
        $scope.view = localStorage.appDefaultView;
        $scope.$watch(function () {
            return OrdersService.getView();
        }, function (newView) {
            if (newView)
                $scope.view = newView;
        });

    }]);

    app.controller('OrderDetailController', ['$scope', '$stateParams', 'OrdersService',function ($scope, $stateParams, OrdersService) {

        OrdersService.getOrderLines($stateParams.orderID).then(function (data) {
            $scope.products = data.data;
        });

        OrdersService.getOrder($stateParams.orderID).then(function (data) {
            $scope.order = data.data;
            $scope.total = $scope.order.price + $scope.order.vat;
        });

    }]);

    app.controller('OrderResumeMenuController', ['$scope', 'OrdersService', 'ClientsService', '$state', '$modal', '$q', '$timeout',function ($scope, OrdersService, ClientsService, $state, $modal, $q, $timeout) {

        $scope.order = localStorage.getObject('order');

        if ($scope.order.accepted === 1) {
            $scope.editable = false;
        } else {
            $scope.editable = true;
        }
        //nombre de cliente
        ClientsService.getClient($scope.order.client).then(function (data) {
            $scope.clientName = data.data.name;
        });

        //guardar datos pedido
        function addOrder(order) {
            return $q(function (resolve, reject) {
                OrdersService.addOrder(order).then(function (data) {
                    OrderID = data.data.data;
                    resolve(OrderID);
                });
            });
        }
        function addOrderLines(orderLines, OrderID) {
            OrdersService.addOrderLines(orderLines, OrderID).then(function () {
                $scope.alerts = [{type: 'success', msg: 'El pedido ha sido creado correctamente.'}];
                var end = function () {
                    localStorage.removeItem('order');
                    $state.go('listadoPedidos');
                };
                $timeout(end, 4000);
                $scope.closeAlert = function (index) {
                    $scope.alerts.splice(index, 1);
                    end();
                };
            });
        }

        //editar pedido
        function editOrder(order) {
            OrdersService.editOrder(order).then(function (data) {
            });
        }
        function editOrderLines(orderLines, OrderID) {
            OrdersService.editOrderLines(orderLines, OrderID).then(function (data) {
            });
        }

        //confirmar
        $scope.confirmOrder = function () {

            $scope.order = localStorage.getObject('order');
            if ($scope.order.products.length > 0) {
                $scope.orderData = {
                    price: $scope.order.price.price,
                    vat: $scope.order.price.vat,
                    discount: $scope.order.price.discount,
                    client_id: $scope.order.client,
                    client_name: $scope.clientName,
                    total: $scope.order.price.total
                };
                if ($scope.order.id) {
                    $scope.orderData.id = $scope.order.id;
                    $q.all([editOrder($scope.orderData), editOrderLines($scope.order.products, $scope.order.id)]).then(function () {
                        $scope.alerts = [{type: 'success', msg: 'El pedido ha sido modificado correctamente.'}];
                        var end = function () {
                            localStorage.removeItem('order');
                            $state.go('listadoPedidos');
                        };
                        $timeout(end, 4000);
                        $scope.closeAlert = function (index) {
                            $scope.alerts.splice(index, 1);
                            end();
                        };
                    });
                } else {
                    var promise = addOrder($scope.orderData);
                    promise.then(function (data) {
                        addOrderLines($scope.order.products, OrderID);
                    });
                }
            } else {
                $scope.alerts = [{type: 'danger', msg: 'No has añadido ningún producto'}];
                $scope.closeAlert = function (index) {
                    $scope.alerts.splice(index, 1);
                };
            }
        };
        //cancelar
        $scope.cancelOrder = function () {
            if ($scope.order.id) {
                templateModel = 'OrderEditModelContent.html';
            } else {
                templateModel = 'OrderCreateModelContent.html';
            }
            $scope.modalInstance = $modal.open({
                templateUrl: templateModel,
                scope: $scope
            });
            $scope.ok = function () {
                $scope.modalInstance.dismiss();
            };
            $scope.cancel = function () {
                $scope.modalInstance.close();
                localStorage.removeItem('order');
                $scope.goBack();
            };
        };
        $scope.addMoreProducts = function () {
            if (localStorage.appProductMode == 'byProduct') {
                $state.go('addProductosPedido');
            } else {
                $state.go('categoriasPedido');
            }
        };
    }]);

    app.controller('OrderListController', ['$rootScope', '$scope', '$modal', '$timeout', '$state', 'OrdersService', '$q', '$stateParams', 'ProductsService', 'config',function ($rootScope, $scope, $modal, $timeout, $state, OrdersService, $q, $stateParams, ProductsService, config) {

        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        if ($stateParams.clientID) {
            $rootScope.title = 'Pedidos';
        }
        if ($state.current.name == 'listadoPedidosAceptados') {
            $scope.accepted = 1;
        } else {
            $scope.accepted = 0;
        }

        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        $scope.pageChanged = function () {
            $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
            $scope.getOrders();
        };


        if ($stateParams.clientID) {
            $scope.clientID = $stateParams.clientID;
        } else {
            $scope.clientID = null;
        }
        //listado pedidos
        $scope.getOrders = function () {
            OrdersService.getOrders($scope.clientID, $scope.itemsPerPage, $scope.offset, $scope.accepted).then(function (data) {
                if (data.data.data.length < 1) {
                    $scope.noResults = true;
                }
                angular.forEach(data.data.data, function (order) {
                    order.id = parseInt(order.id);
                    order.price = parseFloat(order.price);
                    $scope.clientName = order.client_name;
                });
                $scope.orders = data.data.data;
                $scope.predicate = '-id';

                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }

            });

        };
        $scope.getOrders();

        //borrar pedido
        $scope.deleteOrder = function (id) {
            $scope.orderID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteOrderModal.html',
                scope: $scope,
                controller: 'OrderListController'
            });
            $scope.delete = function (id) {
                OrdersService.deleteOrder(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Pedido eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getOrders();
                });
            };
        };

        //aceptar pedido

        OrdersService.getPaymentMethods().then(function (data) {
            $scope.PaymentMethods = data.data;
        });
        OrdersService.getInstallments().then(function (data) {
            $scope.installments = data.data;
        });
        var d = new Date();
        $scope.timezoneOffset = d.getTimezoneOffset() / 60;
        $scope.acceptOrder = function (id, clientID, total) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'acceptOrderModal.html',
                scope: $scope,
                controller: 'OrderListController'
            });
            $scope.alerts = [];
            //modal editar

            $scope.accept = function (order, project) {
                order.id = id;
                order.total = total;
                project.order_id = id;
                if ($stateParams.clientID) {
                    project.client_id = parseInt($stateParams.clientID);
                } else {
                    project.client_id = clientID;
                }

                OrdersService.acceptOrder(order, project).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Pedido aceptado'}];
                    $timeout($scope.redirect, 1000);
                });
            };
        };

        //crear factura
        $scope.order = {};

        //modificar pedido
        $scope.orderDetail = function (id) {
            var promise = getOrder(id);
            promise.then(function (orderID) {
                getOrderLines(orderID).then(function (data) {
                    getFormatLines(data);
                });
            });
        };

        $scope.projectDetail = function (id) {
            $state.go('proyectosDetalle', {projectID: id});
        };

        //obj pedido
        function getOrder(orderID) {
            return $q(function (resolve, reject) {
                localStorage.removeItem('order');
                OrdersService.getOrder(orderID).then(function (data) {
                    $scope.order.client = data.data.client_id;
                    $scope.order.accepted = data.data.accepted;
                    $scope.order.price = {};
                    $scope.order.id = orderID;
                    $scope.order.price.discount = data.data.discount;
                    resolve(orderID);
                });
            });
        }
        //obj productos
        function getOrderLines(orderID) {
            return $q(function (resolve, reject) {
                OrdersService.getOrderLines(orderID).then(function (data) {
                    productID = data.data.id;
                    $scope.order.products = data.data;
                    angular.forEach($scope.order.products, function (product) {
                        delete product.vat;
                        delete product.order_id;
                        product.units = parseInt(product.units);
                        if (product.discount !== 0) {
                            product.showDiscount = true;
                        }
                        rename(product, 'id', 'idLine');
                        rename(product, 'product_id', 'id');
                        rename(product, 'product_name', 'name');
                        rename(product, 'vat_id', 'vat');
                        rename(product, 'format_id', 'price');
                        rename(product, 'unit_price', 'unitPrice');
                        rename(product, 'vat_percent', 'vatPercent');
                        product.isSelected = true;
                    });
                    resolve($scope.order.products);
                });
            });
        }
        //obj format
        function getFormatLines(obj) {
            var format = [];
            angular.forEach(obj, function (product) {
                format.push(ProductsService.getProductPrice(product.id).then(function (data) {
                    product.format = data.data;
                }));
            });
            $q.all(format).then(function () {
                localStorage.setObject('order', $scope.order);
                $state.go('resumenPedido');

            });
        }

        //renombrar obj props
        function rename(obj, oldName, newName) {
            if (!obj.hasOwnProperty(oldName)) {
                return false;
            }
            obj[newName] = obj[oldName];
            delete obj[oldName];
            return true;
        }

        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
        //cerrar alert
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        //redireccion aceptar 
        $scope.redirect = function () {
            if ($stateParams.clientID) {
                $state.go('listadoPedidosAceptados', {clientID: $stateParams.clientID});
            } else {
                $state.go('listadoPedidosAceptados');
            }
        };
    }]);

    app.controller('InvoiceListController', ['$scope', '$modal', '$timeout', '$stateParams', 'OrdersService', 'config',function ($scope, $modal, $timeout, $stateParams, OrdersService, config) {

        //Paginador
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        $scope.pageChanged = function () {
            $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
            $scope.getInvoices();
        };


        //listado pedidos
        $scope.clientID = $stateParams.clientID;
        $scope.orderID = $stateParams.orderID;
        switch ($stateParams.type) {
            case 'pendientes':
                $scope.type = 0;
                break;
            case 'emitidas':
                $scope.type = 1;
                break;
            case 'pagadas':
                $scope.type = 2;
                break;
            default:
                $scope.type = null;
                break;
        }
        $scope.getInvoices = function () {
            OrdersService.getInvoices($scope.clientID, $scope.orderID, $scope.itemsPerPage, $scope.offset, $scope.type).then(function (data) {
                if (data.data.length < 1) {
                    $scope.noResults = true;
                }
                angular.forEach(data.data.data, function (invoice) {
                    invoice.id = parseInt(invoice.id);
                    switch (invoice.status) {
                        case '0':
                            invoice.status_name = 'pendiente';
                            break;
                        case '1':
                            invoice.status_name = 'emitida';
                            break;
                        case '2':
                            invoice.status_name = 'pagada';
                    }
                });
                $scope.invoices = data.data.data;
                $scope.predicate = '-date';
                $scope.results = data.data.length;
                $scope.clientName = data.data.data[0].client_name;

                //paginador
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
            });
        };
        $scope.getInvoices();

        //borrar pedido
        $scope.deleteInvoice = function (id) {
            $scope.invoiceID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteInvoiceModal.html',
                scope: $scope,
                controller: 'InvoiceListController'
            });
            $scope.delete = function (id) {
                OrdersService.deleteInvoice(id).then(function (data) {

                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Factura eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getInvoices();
                });
            };
        };
        $scope.changeStatus = function (id, status) {
            $scope.invoiceID = id;
            $scope.status = status;
            $scope.modalInstance = $modal.open({
                templateUrl: 'invoiceChangeStatusModal.html',
                scope: $scope,
                controller: 'InvoiceListController'
            });
            $scope.change = function () {
                OrdersService.invoiceChangeStatus($scope.invoiceID, $scope.status).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Estado actualizado.'}];
                    $timeout($scope.closeAlert, 1000);
                    $scope.getInvoices();
                });
            };
        };

        $scope.switchClass = function (status) {
            switch (status) {
                case 'pendiente':
                    return 'label-danger';
                case 'emitida':
                    return 'label-warning';
                case 'pagada':
                    return 'label-success';
            }
        };
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
        //cerrar alert
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }]);

    app.controller('DetailInvoiceController', ['$scope', '$stateParams', 'OrdersService', 'ConfigService',function ($scope, $stateParams, OrdersService, ConfigService) {

        $scope.invoiceID = $stateParams.invoiceID;
        $scope.discount = false;

        OrdersService.getInvoice($scope.invoiceID).then(function (data) {

            $scope.invoice = data.data;
            if ($scope.invoice.date == 'Thu Jan 01 1970 01:00:00 GMT+0100 (Hora estándar romance)') {
                $scope.invoice.date = null;
            }
            if ($scope.invoice.date !== null) {
                $scope.year = $scope.invoice.date.getFullYear().toString().substring(2, 4);
            }
            $scope.percentage = $scope.invoice.percentage;
            $scope.invoiceInstallment = $scope.invoice.subTotal;
            $scope.orderID = data.data.order_id;

            //Calculo porcentaje general
            $scope.invoice.installmentBase = (Math.round((($scope.invoice.total - $scope.invoice.vat) * $scope.percentage) * 100) / 100).toFixed(2);
            $scope.invoice.installmentVat = (Math.round(($scope.invoice.vat * $scope.percentage) * 100) / 100).toFixed(2);

            var dif = Number($scope.invoiceInstallment) - (Number($scope.invoice.installmentBase) + Number($scope.invoice.installmentVat));
            if (dif > 0) {
                $scope.invoice.installmentBase = (Math.ceil((($scope.invoice.total - $scope.invoice.vat) * $scope.percentage) * 100) / 100).toFixed(2);
            } else if (dif < 0) {
                $scope.invoice.installmentBase = (Math.floor((($scope.invoice.total - $scope.invoice.vat) * $scope.percentage) * 100) / 100).toFixed(2);
            }
            console.log($scope.invoice);

            OrdersService.getOrderLines($scope.invoice.order_id).then(function (data) {
                $scope.products = data.data;
                $scope.vats = {};
                $scope.iva = [];
                $scope.base = {};
                $scope.bases = [];
                angular.forEach($scope.products, function (product, key) {
                    if (product.discount > 0) {
                        $scope.discount = true;
                    }
                    product.discount = $scope.discountSimbol(product.discount);
                    product.vat = product.vat * $scope.percentage;
                    product.price = product.price * $scope.percentage;
                    if (dif > 0) {
                        product.price = Math.ceil(product.price * 100) / 100;
                        if (key === 0) {
                            product.vat = Math.floor(product.vat * 100) / 100;
                        } else {
                            product.vat = Math.round(product.vat * 100) / 100;
                        }
                    } else if (dif < 0) {
                        product.price = Math.floor(product.price * 100) / 100;
                        if (key === 0) {
                            product.vat = Math.ceil(product.vat * 100) / 100;
                        } else {
                            product.vat = Math.round(product.vat * 100) / 100;
                        }
                    } else {
                        if (key === 0) {
                            product.vat = Math.floor(product.vat * 100) / 100;
                        } else {
                            product.vat = Math.round(product.vat * 100) / 100;
                        }
                        product.price = Math.round(product.price * 100) / 100;
                    }

                    if ($scope.vats[product.vat_percent]) {
                        $scope.vats[product.vat_percent] = parseFloat($scope.vats[product.vat_percent]) + parseFloat(product.vat);
                        $scope.base[product.vat_percent] = parseFloat($scope.base[product.vat_percent]) + parseFloat(product.price);
                    } else {
                        $scope.vats[product.vat_percent] = parseFloat(product.vat);
                        $scope.base[product.vat_percent] = parseFloat(product.price);
                    }
                });
                angular.forEach($scope.vats, function (value, key) {
                    angular.forEach($scope.base, function (value2, key2) {
                        if (key == key2) {
                            $scope.iva.push({
                                'id': key,
                                'value': value,
                                'base': value2
                            });
                        }
                    });
                });
                $scope.productsCopy = angular.copy($scope.products);
            });
            $scope.discountSimbol = function (value) {
                if (!isNaN(value) && value.indexOf('€') === -1) {
                    return value + '€';
                } else {
                    return value;
                }

            };
            ConfigService.getUserData().then(function (data) {
                $scope.userData = data.data;
            });


        });
    }]);

    app.controller('DetailInvoiceMenuController', ['$scope',function ($scope) {

        $scope.print = function () {
            window.print();
        };
    }]);
})();


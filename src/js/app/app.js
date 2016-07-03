(function () {

    var app = angular.module('eGestion', ['ui.router.compat', 'headerController', 'actionsController', 'homeController', 'clientsController', 'productsController', 'familiesController', 'ordersController', 'loginController', 'configController', 'usersController', 'projectsController', 'expensesController', 'commaDirective', 'passwordCheck', 'chart.js', 'recursiveFamilies', 'inputEnable', 'setFocus', 'hitEnter', 'angularFileUpload', 'ngAnimate', 'dateConverterFilter', 'textAngular']);

// RUTAS

    app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', '$provide', function ($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider, $provide) {

            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $httpProvider.interceptors.push(['$timeout', '$q', '$injector', '$rootScope',function ($timeout, $q, $injector, $rootScope) {
                var loginModal, $http, $state;
                $timeout(function () {
                    loginModal = $injector.get('LoginService');
                    $http = $injector.get('$http');
                    $state = $injector.get('$state');
                });
                return {
                    responseError: function (rejection) {
                        sessionStorage.removeItem('user');
                        sessionStorage.removeItem('userImg');
                        sessionStorage.removeItem('userID');
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('userRol');

                        //fallo de login
                        if ($state.current.name == 'login') {
                            sessionStorage.loginModal = true;

                            if ($rootScope.previousState.name != 'index') {
                                $rootScope.alerts = [{type: 'danger', msg: 'usuario o contraseña incorrectos.'}];
                                $timeout(function () {
                                    delete $rootScope.alerts;
                                }, 40000);
                            }
                            if ($rootScope.previousState.name == 'index') {
                                $rootScope.previousState.name = '';
                            }
                        }
                        if (rejection.status !== 401 && $state.current.name !== 'login') {
                            $state.go('noAuth');
                            return rejection;
                        } else if (rejection.status === 403 && $state.current.name == 'login') {
                            $rootScope.alerts = [{type: 'danger', msg: 'usuario o contraseña incorrectos.'}];
                            $timeout(function () {
                                delete $rootScope.alerts;
                            }, 40000);
                        } else {
                            sessionStorage.removeItem('loginModal');
                        }

                        var deferred = $q.defer();

                        if (sessionStorage.loginModal === false) {
                            sessionStorage.loginModal = true;
                            loginModal.modal().then(function () {//login ok
                                sessionStorage.removeItem('loginModal');
                                deferred.resolve($http(rejection.config));
                            }).catch(function () { //cancelar login
                                sessionStorage.removeItem('loginModal');
                                $state.go('login');
                                deferred.reject(rejection);
                            });
                        }
                        return deferred.promise;
                    }
                };
            }]);
            $urlRouterProvider.otherwise("/");

            $stateProvider
                    .state('index', {
                        url: '/',
                        section: 'parent',
                        title: 'App eGestion',
                        views: {
                            "contentView": {
                                templateUrl: "views/home.html",
                                controller: 'HomeController'
                            }
                        },
                        data: {
                        }
                    })
                    .state('login', {
                        url: 'login',
                        section: 'parent',
                        title: 'App eGestion',
                        views: {
                            "contentView": {
                                templateUrl: "views/login.html",
                                controller: 'LoginFormController'
                            }
                        },
                        data: {
                        }
                    })
                    .state('noAuth', {
                        url: 'acceso-restringido',
                        section: 'parent',
                        title: 'Acceso restringido',
                        views: {
                            "contentView": {
                                templateUrl: "views/403.html"
                            }
                        },
                        data: {
                            requireLogin: false
                        }
                    })
                    .state('familias', {
                        url: "/categorias",
                        title: 'Categorías',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/familias.html",
                                controller: 'FamiliesController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/family-menu.html",
                                controller: 'FamiliesMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2]
                        }
                    })
                    .state('clientes', {
                        url: "/clientes",
                        title: 'Clientes',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/clientes.html",
                                controller: 'ClientsController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/client-menu.html"
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('clientesDetalle', {
                        url: "/clientes/:clientID",
                        title: 'Detalle de cliente',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/cliente-detalle.html",
                                controller: 'DetailClientsController',
                                resolve: {
                                    resolveClient: function (ClientsService, $stateParams) {
                                        var clientID = $stateParams.clientID;
                                        return ClientsService.getClient(clientID);
                                    }
                                }
                            },
                            "subMenuView": {
                                templateUrl: "partials/client-detail-menu.html",
                                controller: 'DetailClientsMenuController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('clientesCrear', {
                        url: "/crear-cliente",
                        section: 'parent',
                        title: 'Añadir cliente',
                        views: {
                            "contentView": {
                                templateUrl: "views/cliente-crear.html",
                                controller: 'AddClientsController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('productosRootFamilias', {
                        url: "/productos/:familyID?",
                        section: 'parent',
                        title: 'Productos',
                        views: {
                            "contentView": {
                                templateUrl: "views/categorias.html",
                                controller: 'ProductsRootFamiliesController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/product-menu.html",
                                controller: 'ProductsRootFamiliesController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3]
                        }
                    })
                    .state('productos', {
                        url: "/listado-productos",
                        section: 'parent',
                        title: 'Productos',
                        views: {
                            "contentView": {
                                templateUrl: "views/producto-listado.html",
                                controller: 'ProductsListController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/product-menu.html",
                                controller: 'ProductsListController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3]
                        }
                    })
                    .state('productosListado', {
                        url: "/producto/:familyName/:familyID",
                        section: 'parent',
                        title: 'Productos',
                        views: {
                            "contentView": {
                                templateUrl: "views/producto-listado.html",
                                controller: 'ProductsListController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/product-menu.html",
                                controller: 'ProductsListController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3]
                        }
                    })
                    .state('productoDetalle', {
                        url: "/producto/:productID",
                        section: 'parent',
                        title: 'Detalle de producto',
                        views: {
                            "contentView": {
                                templateUrl: "views/producto-detalle.html",
                                controller: 'ProductsDetailController',
                                resolve: {
                                    resolveProduct: function (ProductsService, $stateParams) {
                                        var productID = $stateParams.productID;
                                        return ProductsService.getProduct(productID);
                                    },
                                    resolvePrice: function (ProductsService, $stateParams) {
                                        var productID = $stateParams.productID;
                                        return ProductsService.getProductPrice(productID);
                                    },
                                    resolveProductImage: function (ProductsService, $stateParams) {
                                        var productID = $stateParams.productID;
                                        return ProductsService.getProductImage(productID);
                                    }
                                }
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('productosCrear', {
                        url: "/crear-producto",
                        section: 'parent',
                        title: 'Crear producto',
                        views: {
                            "contentView": {
                                templateUrl: "views/producto-crear.html",
                                controller: 'AddProductsController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2]
                        }
                    })
                    .state('pedidoCrear', {
                        url: "/crear-pedido",
                        section: 'parent',
                        title: 'Crear pedido',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-crear.html",
                                controller: 'MakeOrderController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('addProductosPedido', {
                        url: "/crear-pedido/anadir-productos",
                        section: 'parent',
                        title: 'Pedido en curso',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-add.html",
                                controller: 'OrderAddProductController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-add-menu.html",
                                controller: 'OrderAddProductMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('categoriasPedido', {
                        url: "/crear-pedido/productos/:familyID?",
                        section: 'parent',
                        title: 'Pedido en curso',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-categorias.html",
                                controller: 'OrderCategoryController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-add-category-menu.html",
                                controller: 'OrderAddProductMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('addCategoriasProductosPedido', {
                        url: "/crear-pedido/producto/:familyName/:familyID",
                        section: 'parent',
                        title: 'Pedido en curso',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-categorias-add.html",
                                controller: 'OrderAddProductController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-add-category-menu.html",
                                controller: 'OrderAddProductMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('resumenPedido', {
                        url: "/resumen-pedido",
                        section: 'parent',
                        title: 'Finalizar pedido',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-resumen.html",
                                controller: 'OrderResumeController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-resume-menu.html",
                                controller: 'OrderResumeMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('pedidoDetalle', {
                        url: "/pedido/:orderID",
                        section: 'parent',
                        title: 'Detalle de pedido',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-detalle.html",
                                controller: 'OrderDetailController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-detail-menu.html",
                                controller: 'OrderDetailController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoPedidos', {
                        url: "/pedidos/:clientID?",
                        section: 'parent',
                        title: 'Pedidos presentados',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-listado.html",
                                controller: 'OrderListController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-list-menu.html"
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoPedidosAceptados', {
                        url: "/pedidos-aceptados/:clientID?",
                        section: 'parent',
                        title: 'Pedidos aceptados',
                        views: {
                            "contentView": {
                                templateUrl: "views/pedido-listado.html",
                                controller: 'OrderListController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/order-list-menu.html"
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoFacturasClientes', {
                        url: "/facturas/cliente/:clientID",
                        section: 'parent',
                        title: 'Facturas',
                        views: {
                            "contentView": {
                                templateUrl: "views/factura-listado.html",
                                controller: 'InvoiceListController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoFacturasPedidos', {
                        url: "/facturas/pedido/:orderID",
                        section: 'parent',
                        title: 'Facturas',
                        views: {
                            "contentView": {
                                templateUrl: "views/factura-listado.html",
                                controller: 'InvoiceListController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoFacturas', {
                        url: "/facturas/:type?",
                        section: 'parent',
                        title: 'Facturas',
                        views: {
                            "contentView": {
                                templateUrl: "views/factura-listado.html",
                                controller: 'InvoiceListController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('facturasDetalle', {
                        url: "/factura/:invoiceID",
                        title: 'Detalle de factura',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/factura-detalle.html",
                                controller: 'DetailInvoiceController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/invoice-detail-menu.html",
                                controller: 'DetailInvoiceMenuController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoGastos', {
                        url: "/gastos",
                        section: 'parent',
                        title: 'Gastos',
                        views: {
                            "contentView": {
                                templateUrl: "views/gastos-listado.html",
                                controller: 'ListExpensesController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('listadoGastosRecurrentes', {
                        url: "/gastos-recurrentes",
                        section: 'parent',
                        title: 'Gastos Recurrentes',
                        views: {
                            "contentView": {
                                templateUrl: "views/gastos-listado.html",
                                controller: 'ListExpensesController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('insertarGastos', {
                        url: "/gastos/insertar",
                        section: 'parent',
                        title: 'Insertar Gastos',
                        views: {
                            "contentView": {
                                templateUrl: "views/gastos-crear.html",
                                controller: 'AddExpensesController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('gastosDetalle', {
                        url: "/gastos/:gastosID",
                        title: 'Detalle de gastos',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/gastos-detalle.html",
                                controller: 'ListExpensesController',
                                resolve: {
                                    resolveExpenses: function (ExpensesService, $stateParams) {
                                        var expensesID = $stateParams.expensesID;
                                        return ExpensesService.getExpenses(expensesID);
                                    }
                                }
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('configuracion', {
                        url: "/configuracion",
                        title: 'Configuracion',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/configuracion.html",
                                controller: 'ConfigController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('usuarios', {
                        url: "/usuarios",
                        title: 'usuarios',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/usuarios.html",
                                controller: 'UsersController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/user-menu.html"
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1]
                        }
                    })
                    .state('usuariosDetalle', {
                        url: "/usuarios/:userID",
                        title: 'Detalle de usuario',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/usuario-detalle.html",
                                controller: 'DetailUsersController',
                                resolve: {
                                    resolveUser: function (UsersService, $stateParams) {
                                        var userID = $stateParams.userID;
                                        return UsersService.getUser(userID);
                                    }
                                }
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1]
                        }
                    })
                    .state('usuariosCrear', {
                        url: "/crear-usuario",
                        section: 'parent',
                        title: 'Crear usuario',
                        views: {
                            "contentView": {
                                templateUrl: "views/usuario-crear.html",
                                controller: 'AddUsersController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1]
                        }
                    })
                    .state('usuario', {
                        url: "/mi-perfil/:userID",
                        title: 'Detalle de usuario',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/usuario-detalle.html",
                                controller: 'DetailUserController',
                                resolve: {
                                    resolveUser: function (UsersService, $stateParams) {
                                        var userID = $stateParams.userID;
                                        return UsersService.getUser(userID);
                                    }
                                }
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('proyectos', {
                        url: "/proyectos/:clientID?",
                        title: 'Proyectos',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/proyectos.html",
                                controller: 'ProjectsController'
                            },
                            "subMenuView": {
                                templateUrl: "partials/project-menu.html",
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('proyectoCrear', {
                        url: "/crear-proyecto/:clientID?",
                        section: 'parent',
                        title: 'Crear proyecto',
                        views: {
                            "contentView": {
                                templateUrl: "views/proyecto-crear.html",
                                controller: 'AddProjectController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('proyectosDetalle', {
                        url: "/proyecto/:projectID",
                        title: 'Detalle de proyecto',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/proyecto-detalle.html",
                                controller: 'DetailProjectsController',
                                resolve: {
                                    resolveProject: function (ProjectsService, $stateParams) {
                                        var projectID = $stateParams.projectID;
                                        return ProjectsService.getProject(projectID);
                                    }
                                }
                            },
                            "subMenuView": {
                                templateUrl: "partials/project-detail-menu.html",
                                controller: 'DetailProjectsController',
                                resolve: {
                                    resolveProject: function (ProjectsService, $stateParams) {
                                        var projectID = $stateParams.projectID;
                                        return ProjectsService.getProject(projectID);
                                    }
                                }
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    })
                    .state('listadoTareas', {
                        url: "/proyectos/:projectID/tareas/:userID?",
                        section: 'parent',
                        title: 'Tareas',
                        views: {
                            "contentView": {
                                templateUrl: "views/tareas-listado.html",
                                controller: 'TasksListController',
                            },
                            "subMenuView": {
                                templateUrl: "partials/task-menu.html",
                                controller: 'TasksListMenuController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('clienteTareas', {
                        url: "/clientes/:clientID/tareas",
                        section: 'parent',
                        title: 'Tareas',
                        views: {
                            "contentView": {
                                templateUrl: "views/tareas-listado.html",
                                controller: 'TasksListController',
                            },
                            "subMenuView": {
                                templateUrl: "partials/task-menu.html",
                                controller: 'TasksListMenuController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('usuarioTareas', {
                        url: "/mis-tareas",
                        section: 'parent',
                        title: 'Mis Tareas',
                        views: {
                            "contentView": {
                                templateUrl: "views/tareas-listado.html",
                                controller: 'TasksListController',
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3, 4]
                        }
                    })
                    .state('TareaCrear', {
                        url: "/proyecto/:projectID/crear-tarea",
                        section: 'parent',
                        title: 'Crear tarea',
                        views: {
                            "contentView": {
                                templateUrl: "views/tarea-crear.html",
                                controller: 'AddTaskController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('TareaClientCrear', {
                        url: "/clientes/:clientID/crear-tarea",
                        section: 'parent',
                        title: 'Crear tarea',
                        views: {
                            "contentView": {
                                templateUrl: "views/tarea-crear.html",
                                controller: 'AddTaskController'
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 3]
                        }
                    })
                    .state('tareaDetalle', {
                        url: "/tareas/:taskID",
                        title: 'Detalle de tarea',
                        section: 'parent',
                        views: {
                            "contentView": {
                                templateUrl: "views/tarea-detalle.html",
                                controller: 'DetailTaskController',
                                resolve: {
                                    resolveTask: function (ProjectsService, $stateParams) {
                                        var taskID = $stateParams.taskID;
                                        return ProjectsService.getTask(taskID);
                                    }
                                }
                            },
                            "subMenuView": {
                            }
                        },
                        data: {
                            requireLogin: true,
                            authRoles: [1, 2, 3, 4]
                        }
                    });



            $provide.decorator('$browser', ['$delegate', function ($delegate) {
                    var superUrl = $delegate.url;
                    $delegate.url = function (url, replace) {
                        if (url !== undefined) {
                            return superUrl(url.replace(/\%20/g, "+"), replace);
                        } else {
                            return superUrl().replace(/\+/g, "%20");
                        }
                    };
                    return $delegate;
                }]);

            $locationProvider.html5Mode(true);
        }
    ]);
    app.constant('config', {
        'domain': "http://app.fiadeiro.es/",
        'imagePath': '/upload',
        'itemsPerPage': 10,
        'maxPages': 6
    });

    app.run(['$state', '$rootScope', 'LoginService', '$injector', '$http', function ($state, $rootScope, LoginService, $injector, $http) {

            $rootScope.section = 'parent';
            if (!localStorage.appDefaultView)
                localStorage.appDefaultView = 'list';
            if (!localStorage.appProductMode)
                localStorage.appProductMode = 'byCategory';
            //titulo seccion
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                $rootScope.title = toState.title;
                $rootScope.section = toState.section;

            });
            //datos login
            sessionStorage.removeItem('loginModal');
            if (sessionStorage.user && !$rootScope.currentUser) {
                $rootScope.currentUser = sessionStorage.user;
            }
            if (sessionStorage.userImg && !$rootScope.currentUserImg) {
                $rootScope.currentUserImg = sessionStorage.userImg;
            }
            if (sessionStorage.userID && !$rootScope.currentUserID) {
                $rootScope.currentUserID = sessionStorage.userID;
            }
            if (sessionStorage.token && !$rootScope.token) {
                $rootScope.token = sessionStorage.token;
            }
            if (sessionStorage.userRol && !$rootScope.userRol) {
                $rootScope.userRol = sessionStorage.userRol;
            }

            //token para consultas
//            $injector.get("$http").defaults.transformRequest = function (data, headersGetter) {
//                if ($rootScope.token)
//                    headersGetter()['Token'] = $rootScope.token;
//                if (data) {
//                    return angular.toJson(data);
//                }
//            };

//            $http.defaults.headers.common['Token'] = $rootScope.token;
//            $injector.get("$http").defaults.headers.common['Token'] = '$rootScope.token';



            //compronar si login
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, from) {
                $rootScope.previousState = from;
                $http.defaults.headers.common.Token = $rootScope.token;
                var requireLogin = toState.data.requireLogin;
                var isAuth = function (rol) {
                    if (rol === '0') {
                        return 1;
                    } else {
                        return toState.data.authRoles.indexOf(parseInt(rol));
                    }
                };
                if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
                    event.preventDefault();
                    LoginService.modal().then(function () {

                        return $state.go(toState.name, toParams);
                    })
                            .catch(function () {
                                return $state.go('login');
                            });
                }
                if (requireLogin && typeof $rootScope.currentUser !== 'undefined' && isAuth($rootScope.userRol) < 0) {

                    event.preventDefault();
                    $state.go('noAuth');
                }

            });
        }]);

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    Storage.prototype.getObject = function (key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    };
})();
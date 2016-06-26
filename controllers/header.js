(function () {
    var app = angular.module('headerController', []);

    app.controller('HeaderController', function ($scope, $rootScope, $window, $state) {

        $scope.userHidden = true;
        $scope.toggleUserMenu = function () {
            $scope.userHidden = !$scope.userHidden;
        };

        $scope.logOut = function () {
            delete $rootScope.currentUser;
            delete $rootScope.token;
            delete $rootScope.userRol;
            delete $rootScope.currentuserID;
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userID');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userRol');
            $state.go('login');
        };

        $scope.hideUserMenu = function () {
            if ($scope.userHidden === false)
                $scope.userHidden = true;
        };

        $rootScope.$watch('token', function () {
            if ($rootScope.currentUser && $rootScope.token) {
                $scope.showUserMenu = true;
            } else {
                $scope.showUserMenu = false;
            }
        });
    });



    app.controller('NavController', function ($scope,$state) {
        
        $scope.menu = [
            {
                name: "Clientes",
                href: "javascript:;",
                icon: 'users',
                subItems: [
                    {name: "Clientes", href: "clientes"},
                    {name: "Crear Cliente", href: "clientesCrear"}
                ],
                activeMenu : ['clientes','clientesCrear']
            },
            {
                name: "Proyectos",
                href: "javascript:;",
                icon: 'folder-open',
                subItems: [
                    {name: "Proyectos", href: "proyectos"},
                    {name: "Crear proyecto", href: "proyectoCrear"}
                ],
                activeMenu : ['proyectos','proyectoCrear']
            },
            {
                name: "Facturación",
                href: "javascript:;",
                icon: 'euro',
                subItems: [
                    {name: "Facturas pendientes", href: "listadoFacturas({clientID:'', type:'pendientes'})"},
                    {name: "Facturas emitidas", href: "listadoFacturas({clientID:'', type:'emitidas'})"},
                    {name: "Facturas pagadas", href: "listadoFacturas({clientID:'', type:'pagadas'})"}
                ],
                activeMenu :['listadoFacturas']
            },
            {
                name: "Pedidos",
                href: "javascript:;",
                icon: 'basket',
                subItems: [
                    {name: "Pedidos presentados", href: "listadoPedidos({clientID:''})"},
                    {name: "Pedidos aceptados", href: "listadoPedidosAceptados"},
                    {name: "Hacer Pedido", href: "pedidoCrear"}
                ],
                activeMenu :['listadoPedidos','pedidoCrear', 'listadoPedidosAceptados']
            },
            {
                name: "Gastos",
                href: "javascript:;",
                icon: 'credit-card',
                subItems: [
                    {name: "Listado de Gastos", href: "listadoGastos"},
                    {name: "Gastos Recurrentes", href: "listadoGastosRecurrentes"},
                    {name: "Insertar Gastos", href: "insertarGastos"},
                ],
                activeMenu :['listadoGastos','listadoGastosRecurrentes','insertarGastos']
            },
            {
                name: "Productos",
                href: "javascript:;",
                icon: 'archive',
                subItems: [
                    {name: "Categorías", href: "familias"},
                    {name: "Productos", href: "productosRootFamilias"},
                    {name: "Crear Producto", href: "productosCrear"}
                ],
                activeMenu :['familias','productosRootFamilias', 'productosCrear']
            },
            {
                name: "Usuarios",
                href: "javascript:;",
                icon: 'user',
                subItems: [
                    {name: "Usuarios", href: 'usuarios'},
                    {name: "Crear usuario", href: 'usuariosCrear'}
                ],
                activeMenu :['usuarios','usuariosCrear']
            },
            {
                name: "Configuración",
                icon: 'cog',
                href: "configuracion",
                activeMenu :['configuracion']
            },
            {
                name: "Ayuda",
                icon: 'help',
                href: "ayuda",
                activeMenu :['ayuda']
            }
        ];

        $scope.showChilds = function (index) {
            $scope.menu[index].active = !$scope.menu[index].active;
            $scope.collapseAnother(index);
        };

        $scope.collapseAnother = function (index) {
            for (var i = 0; i < $scope.menu.length; i++) {
                if (i != index) {
                    $scope.menu[i].active = false;
                }
            }
        };
        $scope.collapseAll = function (index) {
            for (var i = 0; i < $scope.menu.length; i++) {
                $scope.menu[i].active = false;
            }
        };
        $scope.activeMenu = function (states) {
            if(typeof(states) == 'object'){
                var item = false;
                for (i=0; i<states.length; i++) {
                    if($state.includes(states[i]) === true){
                        item = true;
                    };
                }
                return item;
            }else{
                return $state.includes(states);
            }
        };
    });
})();
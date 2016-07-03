(function () {
    var app = angular.module('clientsController', ['clientsService','projectsService','ngMessages', 'ui.bootstrap']);

    app.controller('ClientsController', ['$scope', '$modal', '$timeout', 'ClientsService', 'config', function ($scope, $modal, $timeout, ClientsService, config) {
        
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        
        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage *($scope.currentPage-1);
        $scope.paginator = true;
        $scope.getClients = function () {
            ClientsService.getClients($scope.itemsPerPage,$scope.offset).then(function (data) {
                $scope.clients = data.data.data;
                $scope.results = data.data.length;
                if($scope.results <= $scope.itemsPerPage){
                    $scope.paginator = false;
                }
                
            });
        };
        $scope.getClients();
        //borrar pedido
        $scope.deleteClient = function (id) {
            $scope.clientID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteClientModal.html',
                scope: $scope,
                controller: 'ClientsController'
            });
            $scope.delete = function (id) {
                ClientsService.deleteClient(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Cliente eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getClients();
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
             $scope.offset = $scope.itemsPerPage *($scope.currentPage-1);
             $scope.getClients();
          };
    }]);
    app.controller('DetailClientsController', ['$rootScope', '$scope', '$stateParams', 'ClientsService', 'ProjectsService', '$modal', '$timeout', 'resolveClient', '$state', '$filter',function ($rootScope, $scope, $stateParams, ClientsService, ProjectsService, $modal, $timeout, resolveClient, $state, $filter) {

        var originalClient = resolveClient.data;
        $scope.client = angular.copy(originalClient);
        $scope.clientID = $stateParams.clientID;


        ClientsService.getClient($stateParams.clientID).then(function (data) {
            $scope.client = data.data;
        });

        ClientsService.getProvinces().then(function (data) {
            $scope.provinces = data.data;
        });

        var backView = function () {
            $state.go('clientes');
        };
        $scope.editClient = function () {
            ClientsService.editClient($scope.client).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Cliente editado correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };

        $scope.originalEditForm = function () {
            return angular.equals(originalClient, $scope.client);
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.deleteClient = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteClientModal.html',
                scope: $scope,
                controller: 'ClientsController'
            });
            $scope.delete = function () {
                ClientsService.deleteClient($stateParams.clientID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Cliente eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $state.go('clientes');
                });
            };
        };
        
        //proyectos
        $scope.predicate = 'end_date';
        $scope.getProjects = function () {
            ProjectsService.getActiveProjects($scope.clientID,$scope.itemsPerPage, $scope.offset).then(function (data) {
                $scope.projects = data.data.data;
            });
        };
        $scope.getProjects();
        
       
        $scope.hourWarning = function(project){
            if(project.hours_total > project.hours_budget){                
                return 'label-danger';
            }else if(project.hours_total < project.hours_budget && project.hours_total - (project.hours_total/10) <= project.hours_budget && project.hours_total > project.hours_budget - (project.hours_budget/10)){
               return 'label-warning'; 
            }else{
               return 'label-standart';
            }
        };
        $scope.today = new Date();
        $scope.dateWarning = function(project){
            if(project.status === 1){
                var endDate = new Date(project.end_date);
                if(endDate.getTime()<= $scope.today.getTime()){
                    return 'label-danger';
                }else if(endDate.getTime() > $scope.today.getTime() && endDate.getTime()-1296000000 <= $scope.today.getTime()){
                    return 'label-warning';
                }else{
                    return 'label-standart';
                }
            }else{
                return 'label-standart';
            }
        };
        
        $scope.selectable = function(){
            $scope.selectDisable = !$scope.selectDisable;
        };
        
        //comentarios
        $scope.getComments = function () {
            ClientsService.getComments($scope.clientID).then(function (data) {
                $scope.comments = data.data.data;
                $scope.commentsSearch = $scope.comments;
            });
        };
        $scope.getComments();
        
        $scope.addComment = function(){
            $scope.modalInstance = $modal.open({
                templateUrl: 'addCommentModal.html',
                scope: $scope,
                controller: 'ClientsController'
            });
            $scope.comment = {
                client_id : $scope.clientID,
                user_id : $rootScope.currentUserID
            };
            $scope.alerts = [];
            $scope.add = function () {
                ClientsService.addComment($scope.comment).then(function(data){
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Comentario añadido correctamente.'}];
                    $timeout($scope.closeAlert, 1000);
                    $scope.getComments();
                });
            };
            $scope.cancel = function () {
                $scope.modalInstance.close();
            };
        };
        
        $scope.$watch('search', function(val)
        { 
            $scope.comments = $filter('filter')($scope.commentsSearch, val);
        });
        
        //tareas
        
        $scope.getTasks = function(){
            ClientsService.getClientTasks($scope.clientID).then(function(data){
                $scope.tasks = data.data.data;
            });
        };
        $scope.getTasks();
        
        $scope.changeStatus = function(type, id, status){
            var obj = {};
            obj.id = id;
            obj.status = status === 0 ? 1 : 0;
            if(type == 'project'){
                ProjectsService.setProjectStatus(obj).then(function(data){
            });
            }else{
                ProjectsService.setTaskStatus(obj).then(function(data){
                });
            }
        };
        
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
    }]);
    app.controller('DetailClientsMenuController',['$scope', '$stateParams', function ($scope, $stateParams) {
        $scope.clientID = $stateParams.clientID;
    }]);
    app.controller('AddClientsController', ['$scope', 'ClientsService', '$timeout', '$state',function ($scope, ClientsService, $timeout, $state) {

        ClientsService.getProvinces().then(function (data) {
            $scope.provinces = data.data;
        });

        $scope.addClient = function () {

            var backView = function () {
                $state.go('clientes');
            };
            ClientsService.addClient($scope.client).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Cliente creado correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }]);
})();
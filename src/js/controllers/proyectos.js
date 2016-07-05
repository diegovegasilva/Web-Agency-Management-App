(function () {
    var app = angular.module('projectsController', ['clientsService', 'projectsService', 'usersService', 'ngMessages', 'ui.bootstrap', 'ui.select']);

    app.controller('ProjectsController', ['$scope', '$modal', '$timeout', '$stateParams', 'ClientsService', 'ProjectsService', 'config', function ($scope, $modal, $timeout, $stateParams, ClientsService, ProjectsService, config) {
        
        $scope.predicate = 'end_date';
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        if($stateParams.clientID){
            $scope.clientID = $stateParams.clientID;
            ClientsService.getClient($scope.clientID).then(function(data){
                $scope.clientName = data.data.name;
            });
        }else{
            $scope.clientID = null;
        }
        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        $scope.getProjects = function (orderBy, orderWay) {
            ProjectsService.getProjects($scope.clientID,$scope.itemsPerPage, $scope.offset, orderBy, orderWay).then(function (data) {
                $scope.projects = data.data.data;
                $scope.results = data.data.length;
                if ($scope.results <= $scope.itemsPerPage) {
                    $scope.paginator = false;
                }
                angular.forEach($scope.projects, function (project) {
                    ClientsService.getClient(project.client_id).then(function (data) {
                        project.client = data.data.name;
                    });
                });
            });
        };
        $scope.getProjects();
        //borrar pedido
        $scope.deleteProject = function (id) {
            $scope.projectID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteProjectModal.html',
                scope: $scope,
                controller: 'ProjectsController'
            });
            $scope.delete = function (id) {
                ProjectsService.deleteProject(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Proyecto eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getProjects();
                });
            };
        };

        $scope.hourWarning = function(project){
            if(parseFloat(project.hours_total) > parseFloat(project.hours_budget)){  
                return 'label-danger';
            }else if(parseFloat(project.hours_total) < parseFloat(project.hours_budget) && parseFloat(project.hours_total) - (parseFloat(project.hours_total/10)) <= parseFloat(project.hours_budget) && parseFloat(project.hours_total) > parseFloat(project.hours_budget) - (parseFloat(project.hours_budget/10))){
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
        
        $scope.changeStatus = function(projectID, status){
            var project = {};
            project.id = projectID;
            project.status = status === 0 ? 1 : 0;          
            ProjectsService.setProjectStatus(project).then(function(data){
                $scope.getProjects();
            });
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
            $scope.getProjects();
        };
    }]);
    app.controller('DetailProjectsController', ['$rootScope', '$scope', '$stateParams', 'ProjectsService', '$modal', '$timeout', 'resolveProject', '$state', function ($rootScope, $scope, $stateParams, ProjectsService, $modal, $timeout, resolveProject, $state) {
        var originalProject = resolveProject.data;
        $scope.project = angular.copy(originalProject);
        $scope.projectID = $stateParams.projectID;
        ProjectsService.getProject($stateParams.projectID).then(function (data) {
            $scope.project = data.data;
        });
        var backView = function () {
            $state.go('proyectos');
        };
        var d = new Date();
        $scope.timezoneOffset = d.getTimezoneOffset()  / 60;
        $scope.editProject = function () {
            ProjectsService.editProject($scope.project).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Proyecto editado correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };

        $scope.originalEditForm = function () {
            return angular.equals(originalProject, $scope.project);           
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.deleteProject = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteProjectModal.html',
                scope: $scope,
                controller: 'ProjectsController'
            });
            $scope.delete = function () {
                ProjectsService.deleteProject($stateParams.projectID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Proyecto eliminado correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $state.go('proyectos');
                });
            };
        };
        
        //tareas
        $scope.predicate = '-date';
        $scope.getTasks = function () {
        ProjectsService.getTasks($scope.projectID).then(function (data) {
                $scope.tasks = data.data.data;
            });
        };
        $scope.getTasks();
        
        $scope.insertTime = function(taskID) {
            $scope.taskID = taskID;
            $scope.modalInstance = $modal.open({
                templateUrl: 'inserTimeModal.html',
                scope: $scope,
                controller: 'TasksListController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.insert = function (task) {
                task.task_id= $scope.taskID;
                task.user = $rootScope.currentUserID;
                ProjectsService.addTaskTime(task).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Horas apuntadas.'}];
                    $timeout($scope.closeAlert, 1000);
                    $scope.getTasks();
                });
            };
        };
        
        $scope.changeStatus = function(taskID, status){
            var task = {};
            task.id = taskID;
            task.status = status === 0 ? 1 : 0;
            ProjectsService.setTaskStatus(task).then(function(data){
                $scope.getTasks();
            });
        };
        
        //borrar tarea
        $scope.deleteTask = function (id) {
            $scope.taskID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteTaskModal.html',
                scope: $scope,
                controller: 'TasksListController'
            });
            $scope.deleteTaskMod = function (id) {
                ProjectsService.deleteTask(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Tarea eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getTasks();
                });
            };
        };
        
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
    }]);
    app.controller('AddProjectController', ['$scope', 'ClientsService', 'ProjectsService', '$timeout', '$state', '$stateParams', '$filter', function ($scope, ClientsService, ProjectsService, $timeout, $state, $stateParams, $filter) {
        ClientsService.getClients().then(function (data) {
            $scope.clients = data.data.data;
            $scope.selected = {};
            if($stateParams.clientID){
                $scope.clientID = $stateParams.clientID;
                 $filter('filter')($scope.clients, function(item) {                    
                    if($scope.clientID == item.id){             
                         $scope.selected = {value: $scope.clients[$scope.clients.indexOf(item)]};
                    }
                });
                
            }
         });
        var d = new Date();
        $scope.timezoneOffset = d.getTimezoneOffset()  / 60;
        $scope.addProject = function () {
            $scope.project.client_id = $scope.selected.value.id;
            var backView = function () {
                if($stateParams.clientID){
                    $state.go('proyectos',{clientID:$stateParams.clientID});
                }else{
                    $state.go('proyectos');
                }
            };
            ProjectsService.addProject($scope.project).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Proyecto creado correctamente.'}];
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
    app.controller('TasksListController', ['$rootScope', '$scope', '$stateParams', '$modal', '$state', '$timeout', 'ProjectsService', 'config', function ($rootScope, $scope, $stateParams, $modal, $state, $timeout, ProjectsService, config) {
        
        $scope.state = $state.current.name;
        $scope.projectID = $stateParams.projectID;
        $scope.clientID = $stateParams.clientID;
        $scope.selectedItem = '';
        $scope.predicate = '-date';
        $scope.maxPages = config.maxPages;
        $scope.itemsPerPage = config.itemsPerPage;
        
        $scope.currentPage = 1;
        $scope.offset = $scope.itemsPerPage * ($scope.currentPage - 1);
        $scope.paginator = true;
        
       
        $scope.taskType = [{value:0, name:'Asignadas'},{value:1, name:'Creadas'}];
        
        if($scope.projectID){
            $scope.getTasks = function () {
                ProjectsService.getTasks($scope.projectID,$scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.tasks = data.data.data;
                    $scope.results = data.data.length;
                    if (!$scope.results) {
                        $scope.noResults = true;
                    }else{
                        $scope.noResults = false;
                    }
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }
                });
            };
        }
        else if($scope.clientID){
            $scope.getTasks = function(){
                ProjectsService.getClientAllTasks($scope.clientID,$scope.itemsPerPage, $scope.offset).then(function (data) {
                    $scope.tasks = data.data.data;
                    $scope.results = data.data.length;
                    if (!$scope.results) {
                        $scope.noResults = true;
                    }else{
                        $scope.noResults = false;
                    }
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }
                });
            };
        }
        else{
            $scope.getTasks = function (type) {
                ProjectsService.getUserTasks($rootScope.currentUserID,$scope.itemsPerPage, $scope.offset, type).then(function (data) {
                    $scope.tasks = data.data.data;
                    $scope.results = data.data.length;
                    if (!$scope.results) {
                        $scope.noResults = true;
                    }
                    else{
                        $scope.noResults = false;
                    }
                    if ($scope.results <= $scope.itemsPerPage) {
                        $scope.paginator = false;
                    }else{
                        $scope.paginator = true;
                    }
                });
            };
        }
        $scope.getTasks();
        
        $scope.insertTime = function(taskID) {
            $scope.taskID = taskID;
            $scope.modalInstance = $modal.open({
                templateUrl: 'inserTimeModal.html',
                scope: $scope,
                controller: 'TasksListController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.insert = function (task) {
                task.task_id= $scope.taskID;
                task.user = $rootScope.currentUserID;
                ProjectsService.addTaskTime(task).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Horas apuntadas.'}];
                    $timeout($scope.closeAlert, 1000);
                });
            };
        };
        
        //borrar tarea
        $scope.deleteTask = function (id) {
            $scope.taskID = id;
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteTaskModal.html',
                scope: $scope,
                controller: 'TasksListController'
            });
            $scope.delete = function (id) {
                ProjectsService.deleteTask(id).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Tarea eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    $scope.getTasks();
                });
            };
        };
        
        $scope.changeStatus = function(taskID, status){
            var task = {};
            task.id = taskID;
            task.status = status === 0 ? 1 : 0;
            ProjectsService.setTaskStatus(task).then(function(data){
                $scope.getTasks();
            });
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
            $scope.getTasks($scope.selectedItem);
        };
        
        $scope.selectedItem = 0;
        $scope.updateTaskList = function(){
            $scope.getTasks($scope.selectedItem);
        };




    }]);
    app.controller('TasksListMenuController', ['$scope','$stateParams', function ($scope,$stateParams) {
        $scope.projectID = $stateParams.projectID;
    }]);
    app.controller('DetailTaskController', ['$rootScope', '$scope', '$stateParams', 'ProjectsService', 'UsersService', '$modal', '$timeout', 'resolveTask', '$state', '$filter', function ($rootScope, $scope, $stateParams, ProjectsService, UsersService, $modal, $timeout, resolveTask, $state, $filter) {
        var originalTask = resolveTask.data;
        $scope.task = angular.copy(originalTask);
        $scope.taskID = $stateParams.taskID;
        
        ProjectsService.getTask($scope.taskID).then(function (data) {
                $scope.task = data.data;
        });
        UsersService.getUsers().then(function(data){
            $scope.users = data.data.data;            
            var selected = $filter('filter')($scope.users, function(d) {return d.id == $scope.task.assigned;})[0];
            $scope.selected = {value:selected};
        });
        $scope.getTaskTime = function(){
            ProjectsService.getTaskTime($scope.taskID).then(function(data){
                $scope.hours = data.data.data;
                $scope.totalTime = data.data.totalTime;
            });
        };
        $scope.getTaskTime();

        $scope.selectChange = function(){            
            $scope.task.assigned = $scope.selected.value.id;
        };
        
        var backView = function () {
            $state.go('listadoTareas',{projectID:$scope.task.project_id});
        };
        $scope.editTask = function () {
            
            ProjectsService.editTask($scope.task).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Tarea editada correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };
        $scope.originalEditForm = function () {
            return angular.equals(originalTask, $scope.task);
        };
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.deleteTask = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: 'deleteTaskModal.html',
                scope: $scope,
                controller: 'TasksListMenuController'
            });
            $scope.delete = function () {
                ProjectsService.deleteTask($scope.taskID).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Tarea eliminada correctamente.'}];
                    $timeout($scope.closeAlert, 4000);
                    backView();
                });
            };
        };   
        $scope.enable = function(){
            var users = ['0', '1', '2'];
            if(users.indexOf($rootScope.userRol) > -1 || $scope.task.marker == $rootScope.currentUserID){
                $scope.disabled = true;
            }            
        };
        $scope.enableText = function(){
            var users = ['0', '1', '2'];
            if(users.indexOf($rootScope.userRol) > -1 || $scope.task.marker == $rootScope.currentUserID){
                $scope.nowrite = true;
            }            
        };
        
        $scope.insertTime = function(reload) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'inserTimeModal.html',
                scope: $scope,
                controller: 'TasksListController'
            });
            $scope.alerts = [];
            //modal editar
            $scope.insert = function (task) {
                task.task_id= $scope.taskID;
                task.user = $rootScope.currentUserID;
                ProjectsService.addTaskTime(task).then(function (data) {
                    $scope.modalInstance.dismiss();
                    $scope.alerts = [{type: 'success', msg: 'Horas apuntadas.'}];
                    $timeout($scope.closeAlert, 1000);
                    if(!reload){
                        $scope.getTaskTime();
                    }else{
                        $state.go($state.current, {}, {reload: true});
                    }
                });
            };
        };
        
        $scope.allow = function(){
            var users = ['0', '1'];
            if(users.indexOf($rootScope.userRol) > -1 || $scope.task.marker == $rootScope.currentUserID){
                $scope.allowed = true;
            }            
        };
        $scope.allow();
        //cerrar modal
        $scope.cancel = function () {
            $scope.modalInstance.close();
        };
    }]);
    app.controller('AddTaskController', ['$rootScope', '$scope','$stateParams','ProjectsService','UsersService', '$timeout', '$state', function ($rootScope, $scope,$stateParams,ProjectsService,UsersService, $timeout, $state) {
        $scope.projectID = $stateParams.projectID;
        if($stateParams.clientID){
        $scope.clientID = $stateParams.clientID;
            ProjectsService.getProjects($scope.clientID).then(function (data) {
                $scope.projects = data.data.data;
                $scope.selectedProj = {};
            });
        }
        $scope.task = {
            status : true,
            maker : $rootScope.currentUserID,
            project_id : $scope.projectID
        };
        UsersService.getUsers().then(function(data){
            $scope.users = data.data.data;
            $scope.selected = {};
        });      
        
        $scope.addTask = function () { 
            if($stateParams.clientID){
                $scope.task.project_id = $scope.selectedProj.value.id;
            }
            $scope.task.assigned = $scope.selected.value.id;
            var backView = function () {
                $state.go('proyectosDetalle', {projectID:$scope.projectID});
            };
            ProjectsService.addTask($scope.task).then(function (data) {
                if (data.data.status === 1) {
                    $scope.alerts = [{type: 'success', msg: 'Tarea creada correctamente.'}];
                    $timeout(backView, 1000);
                } else {
                    $scope.alerts = [{type: 'danger', msg: 'Se ha producido un error, por favor vuelve a intentarlo.'}];
                }
            });
        };
        
    }]);
})();
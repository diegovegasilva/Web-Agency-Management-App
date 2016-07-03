(function () {
    var app = angular.module('projectsService', []);

    app.factory('ProjectsService', ['$http', function ($http) {

            var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
            var projects = [];

            projects.getProjects = function (clientID, perPage, offset, orderBy, orderWay) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    if (clientID) {
                       return $http.get(webServiceUrl + 'getProjects?clientID='+ clientID +'&orderBy=' + orderBy +'&orderWay=' + orderWay);
                    } else {
                        return $http.get(webServiceUrl + 'getProjects?orderBy=' + orderBy +'&orderWay=' + orderWay);
                    }
                } else {
                    if (clientID) {
                        return $http.get(webServiceUrl + 'getProjects?clientID='+clientID+'&perPage=' + perPage + '&offset=' + offset +'&orderBy=' + orderBy +'&orderWay=' + orderWay);
                    } else {
                        return $http.get(webServiceUrl + 'getProjects?perPage=' + perPage + '&offset=' + offset +'&orderBy=' + orderBy +'&orderWay=' + orderWay);
                    }
                }
            };
            
            projects.getActiveProjects = function (clientID, perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    if (clientID) {
                       return $http.get(webServiceUrl + 'getActiveProjects?clientID='+ clientID);
                    } else {
                        return $http.get(webServiceUrl + 'getActiveProjects');
                    }
                } else {
                    if (clientID) {
                        return $http.get(webServiceUrl + 'getActiveProjects?clientID='+clientID+'&perPage=' + perPage + '&offset=' + offset);
                    } else {
                        return $http.get(webServiceUrl + 'getActiveProjects?perPage=' + perPage + '&offset=' + offset);
                    }
                }
            };
            
            projects.getProject = function (projectID) {
                return $http.get(webServiceUrl + 'getProject?id=' + projectID).then(function (data) {
                    data.data.hours_budget = parseFloat(data.data.hours_budget);
                    data.data.end_date = new Date(data.data.end_date);
                    return data;
                });
            };

            projects.addProject = function (project) {
                return $http.post(webServiceUrl + 'addProject', project);
            };
            projects.editProject = function (project) {
                return $http.put(webServiceUrl + 'editProject', project).then(function (data) {
                    return data;
                });
            };
            projects.setProjectStatus = function (project) {
                return $http.post(webServiceUrl + 'setProjectStatus', project).then(function (data) {
                    return data;
                });
            };
            projects.deleteProject = function (projectID) {
                return $http.delete(webServiceUrl + 'deleteProject?id=' + projectID).then(function (status) {
                    return status.data;
                });
            };
            projects.getTasks = function (projectID, perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getTasks?projectID=' + projectID).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                } else {
                    return $http.get(webServiceUrl + 'getTasks?projectID=' + projectID + '&perPage=' + perPage + '&offset=' + offset).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                }
            };
            projects.getClientAllTasks = function (clientID, perPage, offset) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getClientAllTasks?clientID=' + clientID).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                } else {
                    return $http.get(webServiceUrl + 'getClientAllTasks?clientID=' + clientID + '&perPage=' + perPage + '&offset=' + offset).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                }
            };
            projects.getUserTasks = function (userID, perPage, offset, type) {
                if (typeof perPage === 'undefined' || typeof offset === 'undefined') {
                    return $http.get(webServiceUrl + 'getUserTasks?userID=' + userID + '&type=' + type).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                } else {
                    return $http.get(webServiceUrl + 'getUserTasks?userID=' + userID + '&type=' + type + '&perPage=' + perPage + '&offset=' + offset).then(function (data) {
                        angular.forEach(data.data.data, function (task) {
                            task.hours_budget = parseFloat(task.hours_budget);
                            task.hours_cons = parseFloat(task.hours_cons);
                        });
                        return data;
                    });
                }
            };
            projects.getTask = function (taskID) {
                return $http.get(webServiceUrl + 'getTask?id=' + taskID).then(function (data) {
                    data.data.hours_budget = parseFloat(data.data.hours_budget);
                    return data;
                });
            };
            projects.addTask = function (task) {
                return $http.post(webServiceUrl + 'addTask', task);
            };
            projects.deleteTask = function (taskID) {
                return $http.delete(webServiceUrl + 'deleteTask?id=' + taskID).then(function (status) {
                    return status.data;
                });
            };
            projects.addTaskTime = function (task) {
                return $http.post(webServiceUrl + 'addTaskTime', task);
            };
            projects.editTask = function (task) {
                return $http.put(webServiceUrl + 'editTask', task).then(function (data) {
                    return data;
                });
            };
            projects.setTaskStatus = function (task) {
                return $http.post(webServiceUrl + 'setTaskStatus', task).then(function (data) {
                    return data;
                });
            };
            projects.getTaskTime = function (taskID) {
                return $http.get(webServiceUrl + 'getTaskTime?id=' + taskID);
            };
            return projects;

            


        }]);

})();
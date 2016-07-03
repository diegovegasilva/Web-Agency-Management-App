(function(){
	var app = angular.module('familiesService',[]);
	
	app.factory('FamiliesService', ['$http','$location', function($http, $location){
		
		var webServiceUrl = 'http://app.fiadeiro.es/webservice/';
		var families = [];
		
		families.getFamily = function(familyID){
			return $http.get(webServiceUrl+'getFamily?id='+familyID);
		};		
		families.getRootFamilies = function(){
			return $http.get(webServiceUrl+'getRootFamilies');
		};		
		families.getFamilies = function(familyID){
			return $http.get(webServiceUrl+'getFamilies?id='+familyID);
		};		
		families.addFamily = function(family){
			return $http.post(webServiceUrl + 'addFamily', family);
		};
		families.editFamily  = function(family){
			return $http.put(webServiceUrl + 'editFamily', family);
		};	
		families.deleteFamily = function(familyID){
			return $http.delete(webServiceUrl + 'deleteFamily?id=' + familyID).then(function (status) {
				return status.data;
			});
		};
		return families;
		
	}]);

})();
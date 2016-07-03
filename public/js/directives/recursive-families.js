(function(){
	var app = angular.module('recursiveFamilies',[]);
	
	app.directive('recursiveFamilies', ['FamiliesService', '$stateParams', function(FamiliesService, $stateParams) {
		return {
			restrict: 'EA',
			scope: {
				familia: '='
			},
			template: '<li ng-repeat="family in childFamilies"><form class="form"><label ng-bind="family.name"></label></form></li>',           
			link : function(scope, element, attrs){
				angular.forEach(familia, function(family){
					FamiliesService.getFamilies(family.id).then(function(result){
						//$scope.childFamilies.rows = result.data.rows;
						$scope.template = '';
						$scope.childFamilies = result.data;
					});
				});
			}
		};
	}]);	
	
		
})();
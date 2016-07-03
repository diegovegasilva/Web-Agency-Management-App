(function(){
	var app = angular.module('hrefDirective',[]);
	
	app.directive('customHref', ['ProductsService', '$stateParams', function(ProductsService, $stateParams) {
		return {
			restrict: 'EA',
			template: '<li ng-repeat="family in getFamilies"><p><a ng-bind="family.name" ng-href="{{family.href}}"></a></p></li>',           
			link : function(scope, element, attrs){
				var id = $stateParams.familyID;
				ProductsService.getFamilies(id).then(function(data){
					scope.getFamilies = data.data.data;
					angular.forEach(scope.getFamilies, function(family){	
                        ProductsService.getFinalFamilies(family.id).then(function(result){
                            family.href = result.data.rows === 0 ? 'producto/'+family.name+'/'+family.id : 'productos/' + family.id ;
                        });
                    });			
				});
			}
		};
	}]);		
})();
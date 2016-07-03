(function(){
	var app = angular.module('dateConverterFilter',[]);
	app.filter('dateToISO', function() {
	  return function(input) {
		return new Date(input).toISOString();
	  };
	});
})();
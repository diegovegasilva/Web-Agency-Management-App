(function () {
    var app = angular.module('hitEnter', []);
    app.directive('hitEnter', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                document.addEventListener("keydown", function (event) {
                    if(event.which === 13) {
//                        console.log('enter');
                        scope.$apply(function (){
                            scope.$eval(attrs.hitEnter);
                        });
                        event.preventDefault();
                    }
                   
                });
            }
        };
    });
})();


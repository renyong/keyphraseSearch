var utils = angular.module('atilika.search.utils', []);

// http://stackoverflow.com/questions/18790333/angular-js-render-value-without-data-binding
// Thanks Connor
// app.directive('bindOnce', function() {
//     return {
//         scope: true,
//         link: function( $scope, $element ) {
//             setTimeout(function() {
//                 $scope.$destroy();
//             }, 0);
//         }
//     }
// });

// app.directive('bindOnce', function() {
//     return {
//         scope: true,
//         link: function($scope, $element) {
//             setTimeout(function() {
//                 $scope.$destroy();
//                 $element.removeClass('ng-binding ng-scope');
//             }, 0);
//         }
//     }
// });

app.directive('bindOnce', ['$timeout',
	function($timeout) {
    return {
        scope: true,
        link: function($scope, $element) {
            $timeout(function() {
                $scope.$destroy();
                $element.removeClass('ng-binding ng-scope');
            }, 0, false);
        }
    }
}]);
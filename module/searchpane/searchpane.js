var header = angular.module('atilika.search.searchpane', []);

header.directive('atilikaSearchpane', ['$rootScope', 'dbconfig', 'searchHandler', 'solr',
	function($rootScope, dbconfig, searchHandler, solr) {
		return {
			restrict: 'E',
			
			link: function(scope, element, attrs) {
				(function init() {
					var offlistener = $rootScope.$on('SEARCH_EVENT', function() {
						var data = searchHandler.response.get();
						scope.numFound = data.response.numFound;
						scope.numShown = scope.numFound < dbconfig.rows ? scope.numFound : dbconfig.rows;
						
					});

					//scope.$on('$destroy', function() {
					//	offListener();
					//});
				})();

				scope.search = function() {
					searchHandler.facets.clear();
					dbconfig.start = 0;
					searchHandler.query.set(scope.query);
					searchHandler.facets.clearDrilledFacets();
					solr.select();
				};
			},

			templateUrl: 'module/searchpane/searchpane-template.html'
		};
	}
]);
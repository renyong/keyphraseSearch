var results = angular.module('atilika.search.results', []);

results.directive('atilikaResultpane', ['$rootScope', 'dbconfig','searchHandler', 'solr',
	function($rootScope, dbconfig, searchHandler, solr) {
		return {
			restrict: 'E',

			link: function(scope, element, attrs) {
				(function init() {
					var offlistener = $rootScope.$on('SEARCH_EVENT', function() {
						var data = searchHandler.response.get();

						scope.docs = data.response.docs;
						scope.hlsnippets = data.highlighting;
						scope.totalItems = data.response.numFound;
						scope.currentPage = data.response.start / dbconfig.rows + 1;
					});

					scope.$on('$destroy', function() {
						offListener();
					});
				})();

				scope.getHlSnippets = function(doc) {
					if (scope.hlsnippets[doc.id] != undefined) {
						return scope.hlsnippets[doc.id].content;
					}
				};

				scope.selectPage = function(page) {
					dbconfig.start = page * dbconfig.rows - 10;
					solr.select();
				};
			},

			templateUrl: 'module/results/resultpane-template.html'
		};
	}
]);

results.directive('atilikaResult', ['dbconfig', 'docPostFacetProcessing',
	function(dbconfig, docPostFacetProcessing) {
		return {
			restrict: 'E',
			
			scope: {
                doc: '=',
                hlsnippets: '='
            },

            link: function(scope, element, attrs) {

                //console.log(scope.hlsnippets);

            	scope.debug = false;
            	var facets = docPostFacetProcessing(scope.doc);
            	scope.fieldList = dbconfig.facet.fieldList;
            	scope.redactedFacets = facets.redacted;
            	scope.rawFacets = facets.raw;

            	scope.dbid = scope.doc['exported-dbid'];

            	scope.showDebug = function() {
            		scope.debug = !scope.debug;
            	};
            },

			templateUrl: 'module/results/result-template.html'
		};
	}
]);

results.service('docPostFacetProcessing', ['dbconfig',
	function(dbconfig){        

		function countUniqueFacets(facets) {
			var facetHash = {};

			for (var fieldName in facets) {
				if (facets.hasOwnProperty(fieldName)) {
					if (facetHash[fieldName] == undefined) {
						facetHash[fieldName] = {};
					}

					for (var i = 0; i < facets[fieldName].length; i++) {
						if (facetHash[fieldName][facets[fieldName][i]] == undefined) {
							facetHash[fieldName][facets[fieldName][i]] = 1;
						} else {
							facetHash[fieldName][facets[fieldName][i]] = facetHash[fieldName][facets[fieldName][i]] + 1;
						}
					}
				}
			}

			return facetHash;
		}

		function getFacetsFromDoc(doc, suffix) {
			var facetList = {};

			for (var docProperty in doc) {
				if (doc.hasOwnProperty(docProperty)) {
					var fieldName = docProperty;

					if (docProperty.substring(docProperty.length - dbconfig.facet.rawSuffix.length, docProperty.length) == suffix) {
						fieldName = docProperty.substring(0, docProperty.length - dbconfig.facet.rawSuffix.length);
					}

					if (dbconfig.facet.fieldLimit[fieldName] != undefined) {
						facetList[fieldName] = doc[docProperty];
					}
				}
			}

			return facetList;
		}

		return function(doc) {
			var redactedFacets = getFacetsFromDoc(doc, '');
			var rawFacets = getFacetsFromDoc(doc, dbconfig.facet.rawSuffix);

			var facets = {};
			facets.redacted = countUniqueFacets(redactedFacets);
			facets.raw = countUniqueFacets(rawFacets);

			return facets;
		}
	}
]);

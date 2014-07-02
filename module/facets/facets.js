var facets = angular.module('atilika.search.facets', []);

facets.directive('atilikaFacetpane', ['$rootScope', 'searchHandler', 'dbconfig',
	function($rootScope, searchHandler, dbconfig) {
		return {
			restrict: 'E',
			
			link: function(scope, element, attrs) {
				(function init() {
					var offListener = $rootScope.$on('SEARCH_EVENT', function() {
						updateFacets();
					});

					scope.$on('$destroy', function() {
						offListener();
					});
				})();

				function updateFacets() {
					scope.fields = dbconfig.facet.fieldProperties;
					scope.facets = searchHandler.facets.get();
					scope.drillFacets = searchHandler.facets.getDrilledFacets();	
					//console.log(scope.drillFacets);	
				};
			},

			template: '<atilika-facet-grouping ng-repeat="field in fields" field-name="field" facets="facets[field.field]" drill-facets="drillFacets[field.field]"></atilika-facet-grouping>'
		};
	}
]);

facets.directive('atilikaFacetGrouping', ['$rootScope', '$sce', 'dbconfig', 'searchHandler', 'solr',
	function($rootScope, $sce, dbconfig, searchHandler, solr) {
		return {
			restrict: 'E',

			scope: {
				fieldName: '=',
				facets: '=',
				drillFacets: '='
			},

			link: function(scope, element, attrs) {
				scope.css = scope.fieldName.field.toLowerCase();
				
				scope.drilledFacets = '';
				scope.cachedFacets = '';

				scope.changeFacetLimitText = 'More';
				scope.isCollapsed = false;

				(function generateFacetsHTML() {
					function generateHTML(facetList, listType) {
						var html = '';
						var liCss = '';
						var drilled = false;
						
						if (listType == 'drilled') {
							liCss = liCss + ' active';
							drilled = true;
						}

						var ulStart = '<ul class="nav nav-pills nav-stacked">';
						var html = html + ulStart;

						for (var facetName in facetList) {
							if (facetList.hasOwnProperty(facetName)) {
								var listItem = '<li class="' + liCss + '"><a class="facet" drilled="' + drilled + '" facetname="' + facetList[facetName].value + '"><span>' + facetList[facetName].value + '</span><span class="pull-right">' + facetList[facetName].count + '</span></a></li>';
								html = html + listItem;
							}
						}

						var ulEnd = '</ul>';
						html = html + ulEnd;

						if (listType == 'drilled') {
							scope.drilledFacets = $sce.trustAsHtml(html);
						} else {
							scope.cachedFacets = $sce.trustAsHtml(html);
						}
					}

					scope.$watch('facets', function() {
						generateHTML(scope.facets, 'cached');
					});

					var offlistener = $rootScope.$on('SEARCH_EVENT', function(event) {
						//console.log('facets, generating drilled html from search event');
						var drilledFacets = searchHandler.facets.getDrilledFacetsField(scope.fieldName.field);
						//console.log(scope.fieldName.field, drilledFacets);
						generateHTML(drilledFacets, 'drilled');

						scope.$on('$destroy', function(event) {
							offlistener();
						});
					});
				})();

				(function attachDrillListener() {
					element.on('click', function(event) {
						event.preventDefault();

						var facetName = undefined;
						var drilled = undefined;

						if (event.target.className == 'facet') {
							facetName = event.target.attributes['facetname'].value;
							drilled = event.target.attributes.drilled.value;
						} else if (event.target.parentNode.className == 'facet') {
							facetName = event.target.parentNode.attributes['facetname'].value;
							drilled = event.target.parentNode.attributes.drilled.value;
						}

						if (facetName != undefined & drilled != undefined) {
							if (drilled == 'true') {
								searchHandler.facets.drill(scope.drillFacets[facetName], scope.fieldName.field);
							} else {
								searchHandler.facets.drill(scope.facets[facetName], scope.fieldName.field);
							}

							solr.select();
						}
					});

					scope.$on('$destroy', function(event) {
						element.off('click');
					});
				})();

				scope.changeFacetLimit = function() {
					function setLoadFacetText(text) {
						var offlistener = $rootScope.$on('SEARCH_EVENT', function(event) {
							scope.changeFacetLimitText = text;

							scope.$on('$destroy', function(event) {
								offlistener();
							});

							offlistener();
						});
					}

					if (dbconfig.facet.fieldLimit[scope.fieldName.field] == dbconfig.facet.limit) {
						dbconfig.facet.fieldLimit[scope.fieldName.field] = dbconfig.facet.maxFacetLimit;
						setLoadFacetText('Less');
					} else {
						dbconfig.facet.fieldLimit[scope.fieldName.field] = dbconfig.facet.limit;
						setLoadFacetText('More');
					}

					solr.select();
				};
			},

			templateUrl: 'module/facets/facetgrouping-template.html'
		}
	}
]);

facets.factory('facetFactory', [
	function(){        
		return {
			create: function(value, count) {
				return {
					value: value,
					count: count
				};
			}
		};
	}
]);
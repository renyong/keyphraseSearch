var searchHandler = angular.module('atilika.search.searchHandler', []);

searchHandler.factory('searchHandler', ['$rootScope', 'dbconfig', 'facetFactory',
    function($rootScope, dbconfig, facetFactory){
     var query = '';

     var result = {};

     var cachedDrillFacets = {};

     var cachedFacets = {};

    function cacheFacets(facets) {
        for (var fieldName in facets) {
            if (facets.hasOwnProperty(fieldName)) {
                cachedFacets[fieldName] = {};

                if (cachedDrillFacets[fieldName] == undefined) {
                    cachedDrillFacets[fieldName] = {};
					//console.log("run");
                }
                
                for (var i = 0; i < facets[fieldName].length; i += 2) {
                    var facet = facetFactory.create(facets[fieldName][i], facets[fieldName][i + 1]);

                    if (cachedDrillFacets[fieldName][facet.value] == undefined) {
                        cachedFacets[fieldName][facet.value] = facet;
						//console.log(fieldName);
						//console.log(facet.value);
						//console.log(cachedFacets);
                    }
                }
            }
        }
    };

    return {
        query: {
            get: function() {
                return query;
            },

            set: function(s) {
                query = s;
            },

            clear: function() {
                query = '';
            }
        },

        response: {
            get: function() {
                return result;
            },

            set: function(data) {
                result = data;
                cacheFacets(data['facet_counts']['facet_fields']);
                $rootScope.$broadcast('SEARCH_EVENT');
            },

            clear: function() {
                result = {};
            }
        },

        facets: {
            add: function(facet, field) {
                if (getCachedFacetFieldIndex(facet, field) == -1) {
                    cachedFacets[field].push(facet);
                }              
            },

            clear: function() {
                cachedFacets = {};
            },

            get: function() {
                return cachedFacets;
            },

            remove: function(facet, field) {
                var index = getCachedFacetFieldIndex(facet, field);
                if (index != -1) {
                    cachedFacets[field].splice(index, 1);
                }              
            },

            contains: function(facet, field) {
                var index = getCachedFacetFieldIndex(facet, field);
                return index != -1;
            },

            drill: function(facet, field) {
                 if (cachedDrillFacets[field][facet.value] == undefined) {
                    cachedDrillFacets[field][facet.value] = facet;
                 } else {
                    delete cachedDrillFacets[field][facet.value];
                 }
            },

            getDrilledFacets: function() {
                return cachedDrillFacets;
            },

            getDrilledFacetsField: function(fieldName) {
                return cachedDrillFacets[fieldName];
            },

            clearDrilledFacets: function() {
                cachedDrillFacets = {};
            },

            size: function() {
                var count = 0;

                for (var field in cachedFacets) {
                    if (cachedFacets.hasOwnProperty(field)) {
                        for (var i = 0; i < cachedFacets[field].length; i++) {
                            count++;
                        }
                    }
                }

                return count;
            }
        },

        docs: {
            get: function() {
                return result.response.docs;  
            }   
        },

        getResultFacets: function(field) {
            return result['facet_counts']['facet_fields'][field];
        }
    }
}]);
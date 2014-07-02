var solr = angular.module('atilika.search.solr', []);

solr.factory('solr', ['$rootScope', '$http', 'dbconfig', 'searchHandler',
    function($rootScope, $http, dbconfig, searchHandler){
        var url = 'http://10.0.0.107:8983/solr/collection1/select';

        return {
            select: function() {
                var params = {};
                params['q'] = searchHandler.query.get();
                // params['q'] = '{!q.op=AND}' + searchHandler.query.get();
                // params['q.op'] = 'AND';
                // params['mm'] = 1;
                params['wt'] = 'json';
                params['json.wrf'] = 'JSON_CALLBACK';
                params['indent'] = 'indent';
                params['start'] = dbconfig.start;
                params['rows'] = dbconfig.rows;
                params['hl'] = dbconfig.hl;
                params['hl.fl'] = dbconfig.hlfl;
                params['hl.simple.pre'] = dbconfig.hlsimplepre;
                params['hl.simple.post'] = dbconfig.hlsimplepost;
                params['hl.snippets'] = dbconfig.hlsnippets;

                if (dbconfig.facet.toggle) {
                    params['facet'] = true;
                    params['facet.field'] = dbconfig.facet.fieldList;
                    params['facet.limit'] = dbconfig.facet.limit;
                    params['facet.mincount'] = dbconfig.facet.mincount;

                    for (var i = 0; i < dbconfig.facet.fieldList.length; i++) {
                        params['f.' + dbconfig.facet.fieldList[i] + '.facet.limit'] = dbconfig.facet.fieldLimit[dbconfig.facet.fieldList[i]];
                    }

                    params['defType'] = dbconfig.defType;
                    params['qf'] = dbconfig.qf;
                }

                var fq = [];

                var drilledFacets = searchHandler.facets.getDrilledFacets();
                for (var fieldName in drilledFacets) {
                    if (drilledFacets.hasOwnProperty(fieldName)) {
                        var field = drilledFacets[fieldName];
                        
                        for (var facetName in field) {
                            if (field.hasOwnProperty(facetName)) {
                                var facet = field[facetName];
                                fq.push(fieldName + ':' + facet.value);
                            }
                        }
                    }
                }

                if (fq.length > 0) {
                    params['fq'] = fq;               
                }


                $http({
                    method: 'JSONP',
                    url: url,
                    params: params
                }).
                success(function(data, status) {
                    searchHandler.response.set(data);
                    console.log(data);
                }).
                error(function(data, status) {
                    // console.error(data, status);
                });
            }
        };
    }]);
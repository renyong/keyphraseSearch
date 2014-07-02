/**
 * Created by yong on 5/22/14.
 */

var sample = angular.module('atilika.search.searchsample', [
]);

sample.directive('atilikaSearchsample', ['$rootScope', 'dbconfig', 'searchHandler', 'solr','$http',
    function($rootScope, dbconfig, searchHandler, solr,$http) {
        return {
            restrict: 'E',

            link: function(scope, element, attrs) {
                

                function formEncode(obj) {
                    // http://blog.tryfinally.co.za/2012/12/form-url-encoded-post-with-angularjs.html
                    var encodedString = '';
                    for (var key in obj) {
                        if (encodedString.length !== 0) {
                            encodedString += '&';
                        }

                        encodedString += key + '=' + encodeURIComponent(obj[key]);
                    }
                    return encodedString.replace(/%20/g, '+');
                }

                (function init() {
                    var offlistener = $rootScope.$on('SEARCH_EVENT', function() {
                        var data = searchHandler.response.get();
                        scope.numFound = data.response.numFound;
                        scope.numShown = scope.numFound < dbconfig.rows ? scope.numFound : dbconfig.rows;
                    });

                    //scope.$on('$destroy', function() {
                    //    offListener();
                    //});
                })();

                scope.search = function(searchParams) {
                    searchHandler.facets.clear();
                    dbconfig.start = 0;
                    searchHandler.query.set(searchParams);
                    searchHandler.facets.clearDrilledFacets();
                    solr.select();
                };

                scope.extract = function(){
                    console.log(scope.query);
                    $http.post("/keywords/extract", formEncode({text: scope.posQuery, count: 10}), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        }

                    }).
                        success(function(data, status) {
                            //console.log(data["keyphrases"]);
                            /* construct the search query for solr 
                            keyphrases extracted by Atilika keyphrase are required */
                            scope.myKeyphrases = [];
                            var keyphrasesArray = data.keyphrases;
                            var arrayLength = keyphrasesArray.length;
                            //var searchKey = "";
                            $rootScope.searchKey = "";
                            for(var i = 0;i<arrayLength;i++){
                                console.log(keyphrasesArray[i].keyphrase,keyphrasesArray[i].score);
                                var item = keyphrasesArray[i].keyphrase;
                                scope.myKeyphrases.push(item);
                                //var weight = Math.exp(Math.ceil(keyphrasesArray[i].score*10));
                                var weight = Math.ceil(keyphrasesArray[i].score*10);

                                if(i == arrayLength-1){
                                    var part = item + "\^" + weight;
                                }
                                else{
                                    var part = item + "\^" + weight + " OR ";
                                }

                                $rootScope.searchKey += part;
                            }
                            /* process the keyphrases extracted */
                            //console.log(searchKey);
                            console.log($rootScope.searchKey);
                            var originalSearch = scope.posQuery;
                            //scope.query = $rootScope.searchKey;
                            
                            $('#keyphrase-result').empty();
                            //$('#neg-keyphrase-result').empty();
                            var formater = ThemeCloudFormatter;
                            //console.log(formater);

                           
                            formater.format($('#keyphrase-result'),originalSearch,data);                                
                            

                            scope.search($rootScope.searchKey);
                            //scope.query= originalSearch;
                            //scope.myKeyphrases = scope.myKeyphrases.slice(0,5)
                            if(scope.negQuery){
                                scope.extractNeg();
                            }
                            

                        }).
                        error(function(data, status) {
                            console.error(data, status);
                        });
                };

                scope.posClear = function(){
                  $('#pos-input').empty();
                  $('#keyphrase-result').empty();
                  //console.log($("#neg-input").attr("disabled"));

                  //$("#neg-input").attr("disabled",false);
                };

                scope.enableNegSearch = function(){
                    ("#neg-input").attr("disabled",false);
                };

                scope.extractNeg = function(){
                    console.log(scope.negQuery);
                    $http.post("/keywords/extract", formEncode({text: scope.negQuery, count: 10}), {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        }

                    }).
                        success(function(data, status) {
                            //console.log(data["keyphrases"]);
                            /* construct the search query for solr 
                            keyphrases extracted by Atilika keyphrase are required */
                            scope.myKeyphrases = [];
                            var keyphrasesArray = data.keyphrases;
                            var arrayLength = keyphrasesArray.length;
                            //var searchKey = "";
                            var parts = "";
                            for(var i = 0;i<arrayLength;i++){
                                //console.log(keyphrasesArray[i]["keyphrase"],keyphrasesArray[i]["score"]);
                                var item = keyphrasesArray[i].keyphrase;
                                scope.myKeyphrases.push(item);
                                var weight = Math.ceil(keyphrasesArray[i].score*10);
                                
                                //if(i == arrayLength-1){
                                //    var part = item + "\^" + weight;
                                //}
                                //else{
                                //    var part = item + "\^" + weight + " NOT ";
                                //}
                                var part = " NOT " + item + "\^" + weight;
                                parts += part; 
                                
                            }
                            if ($rootScope.searchKey === undefined){
                                    $rootScope.searchKey = "*"
                            }   
                            var index = $rootScope.searchKey.length;
                            $rootScope.searchKey += parts;

                            /* process the keyphrases extracted */
                            console.log($rootScope.searchKey);
                            var originalSearch = scope.negQuery; //gain the original query for postive example input
                            //scope.query = $rootScope.searchKey;
                            
                            $('#neg-keyphrase-result').empty();
                            var formater = ThemeCloudFormatter;
                            //console.log(formater);

                            
                            formater.format($('#neg-keyphrase-result'),originalSearch,data);                                
                             

                            scope.search($rootScope.searchKey);
                            //scope.query= originalSearch; //
                            $rootScope.searchKey = $rootScope.searchKey.substr(0,index);
                            //scope.myKeyphrases = scope.myKeyphrases.slice(0,5)
                            

                        }).
                        error(function(data, status) {
                            console.error(data, status);
                        });
                };

                scope.negClear = function(){
                   $('#neg-input').empty(); 
                   $('#neg-keyphrase-result').empty();     
                };


            },

            templateUrl: 'module/searchsample/searchsample-template.html'
        };
    }
]);

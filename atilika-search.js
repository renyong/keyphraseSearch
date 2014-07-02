var app = angular.module('atilika.search', [
		'ngSanitize',
		'ui.bootstrap',
		'atilika.search.utils',
		'atilika.search.dbconfig',
		'atilika.search.searchHandler',
		'atilika.search.solr',
		'atilika.search.searchpane',
		'atilika.search.facets',
		'atilika.search.results',
        'atilika.search.searchbox',
        'atilika.search.searchsample'
	]
);

app.config([
    function() {
    	
}]);
var dbconfig = angular.module('atilika.search.dbconfig', []);

dbconfig.factory('dbconfig', [
    function(){  
        var qf = '';
        var fieldList = [];

        var fieldProperties = [
            {field: 'PER', description: 'Person'},
            {field: 'TTL', description: 'Title'},
            {field: 'ORG', description: 'Organization'},
            // {field: 'GPE', description: 'Geo-political entity'},
            {field: 'LOC', description: 'Location'},
            {field: 'FAC', description: 'Facility'},
            {field: 'NAT', description: 'Nationality'},
            {field: 'REL', description: 'Religion'}
        ];

        (function init() {
            // generate qf line for edismax field boost
            var qfList = [
                {field: 'title', boost: 50},
                {field: 'body', boost: 10},
                {field: 'text', boost: 3}
                // {field: 'PER', boost: 1.5},
                // {field: 'TTL', boost: 1.5},
                // {field: 'ORG', boost: 1.5},
                // // {field: 'GPE', boost: 1.5},
                // {field: 'LOC', boost: 1.5},
                // {field: 'FAC', boost: 1.5},
                // {field: 'NAT', boost: 1.5},
                // {field: 'REL', boost: 0.5}
            ];

            for (var i = 0; i < qfList.length; i++) {
                qf = qf + qfList[i].field + '^' + qfList[i].boost + ' ';
            }

            // generate fields list for easy array access
            for (var i = 0; i < fieldProperties.length; i++) {
                fieldList.push(fieldProperties[i].field);
            }
        })();

        

        return {
            start: 0,

            rows: 10,

            facet: {
                toggle: true,

                limit: 5,

                maxFacetLimit: 30,

                fieldLimit: {
                    PER: 5,
                    TTL: 5,
                    ORG: 5,
                    // GPE: 5,
                    LOC: 5,
                    FAC: 5,
                    NAT: 5,
                    REL: 5
                },

                mincount: 1,

                fieldList: fieldList,

                fieldProperties: fieldProperties,

                rawSuffix: '_RAW'
            },

            deffType: 'edismax',

            hl: true,

            hlfl: 'content',

            hlsimplepre: '<em>',

            hlsimplepost: '</em>',

            hlsnippets: 5,

            qf: qf
        };
    }]);
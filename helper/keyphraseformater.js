FormatterCommon = {

    initKeyphraseFocus:function () {
        var formatter = this;
        $('.inline-text span').hover(function () {
            formatter.focusKeyphrase(this.id);
        }, function () {
            formatter.unfocusKeyphrase(this.id);
        });
    },

    focusKeyphrase:function (keyphraseId) {
        $('.inline-text span[id|="' + keyphraseId + '"]').addClass("keyword-highlighted");
    },

    unfocusKeyphrase:function (keyphraseId) {
        $('.inline-text span[id|="' + keyphraseId + '"]').removeClass("keyword-highlighted");
    },

    initKeyphraseTooltip:function (keyphrases) {
        function getKeyphraseTooltip() {
            //console.log("I am in the function");
            var keyphrase = {keyphrase:'unknown', score:'unknown', positions:[]};
            // TODO: Can we do the below in a better way?
            var rank = -1;
            for (var i = 0; i < keyphrases.length; i++) {
                if (encodeURI(keyphrases[i].keyphrase) == this.id) {
                    keyphrase = keyphrases[i];
                    rank = i + 1;
                }
            }
            var title = 'score: ' + keyphrase.score.toFixed(3) + " rank: " + rank;
            
            return title;
        }
         
        
         $('.inline-text span').tooltip({title:getKeyphraseTooltip});
       
       

    }
};

ThemeCloudFormatter = {

    setupAnimation:function (elements) {

        function calculateNormalizer(elements) {
            var values = [];
            for (var entry in elements) {
                values.push(elements[entry].score);
            }
            values.sort().reverse();
            return values[0];
        }

        function calculateFontSize(score) {
            // We adjust the range of the scores to 80% of the normalized score values, and round off to whole pixels.
            // The actual size if up to 240% of the font size set in css.
            // For low scores we set a minimum of 100% of css font-size setting.
            var range = 0.8;
            var minScore = 1.0 - range;
            var maxFontSize = 240;
            var minFontSize = 100;
            var estimatedFontSize = (score * range + minScore) * maxFontSize;

            return Math.round(Math.max(estimatedFontSize, minFontSize));
        }

        function calculateDuration(score) {
            // Each keyphrase is animated at a different speed, with duration between 500ms and 1500ms.
            // Keyphrases with higher score are shown quicker, while less important keyphrases fade in slowly.
            var range = 1000;
            var minDuration = 500;
            var maxDuration = minDuration + range;

            return Math.min(minDuration / score, maxDuration);
        }

        function calculateOpacity(score) {
            // Each keyphrase gets a separate final opacity between 0.6 and 1.0.
            // Keyphrases with higher score gets a higher opacity.
            // Score values are re-distributed between minScore and 1.0.
            // No opacity value are set below minOpacity.
            var range = 0.6;
            var minScore = 1.0 - range;
            var minOpacity = 0.6;
            var opacity = (score * range) + minScore;

            return Math.max(opacity, minOpacity);
        }

        var normalizer = calculateNormalizer(elements);

        for (var i in elements) {

            var entry = elements[i];

            var score = entry.score / normalizer;

            var fontSize = calculateFontSize(score);
            var finalOpacity = calculateOpacity(score);
            var duration = calculateDuration(score);

            var span = '.inline-text span[id|="' + entry.id + '"]';

            ($(span).css({opacity:0}));
            ($(span).css({'font-size':fontSize + "%"}));
            ($(span).animate({opacity:finalOpacity}, duration));
        }
    },

    format:function (node, text, data) {
        console.log('format', node, text, data);
        var keyphrases = [];
        var text = "";

        for (var i = 0; i < data.keyphrases.length; i++) {
            keyphrases[i] = data.keyphrases[i];
        }



        // Sort keyphrases so that they are displayed in the same order as in the original text
        keyphrases.sort(function (a, b) {
            return a.positions[0] - b.positions[0];
        });

        var elements = {};

        for (var i = 0; i < keyphrases.length; i++) {
            var keyphrase = keyphrases[i];
            var score = keyphrase.score;
            var keyphraseId = encodeURI(keyphrase.keyphrase);

            //text += "<span data-toggle=\"tooltip\" title=\"it is a test\" class='keyphrase theme' id=" + keyphraseId + ">" + keyphrase.keyphrase + "</span>";
            text += "<span class='keyphrase theme' id=" + keyphraseId + ">" + keyphrase.keyphrase + "</span>";
            elements[i] = { id:keyphraseId, score:score};
        }
        
        node.append('<div class="inline-text">' + text + '</div>');

        // Add animation effect to the display of each keyphrases
        this.setupAnimation(elements);

        // Add keyphrases focus when hovering over a keyphrases
        this.prototype.initKeyphraseFocus();
       
        // Add keyphrases tooltip that appears when hovering over a keyphrases
        this.prototype.initKeyphraseTooltip(data.keyphrases);
         
       
    }
};

ThemeCloudFormatter.prototype = FormatterCommon;
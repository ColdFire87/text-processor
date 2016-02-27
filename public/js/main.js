/**
 * Created by Stefan on 26/02/2016.
 *
 *  TODO
 *    - when using right click -> paste it works correctly
 *    - when using CTRL+V it evaluates twice
 */

var timer;
var textInserted = '';
var previousKeyCode = '';

var wordsArea = $('#wordsArea');
var getEntitiesBtn = $('#getEntitiesBtn');
var entitiesDiv = $('#entities');
var getKeywordsBtn = $('#getKeywordsBtn');
var keywordsDiv = $('#keywords');
var wordsBreakdown = $('#wordsBreakdown');

// http://www.mediacollege.com/internet/javascript/text/count-words.html
function stripMultipleSpaces ( text ) {
  var s = text;
  s = s.replace(/(^\s*)|(\s*$)/gi,"");
  s = s.replace(/[ ]{2,}/gi," ");
  s = s.replace(/\n /,"\n");

  return s;
}
// Count total number of words in string
function countWords( text ){
  if(text.length) {
    return stripMultipleSpaces( text ).split(' ').length;
  }
  else {
    return 0;
  }
}

function evaluateInput() {
  // important! - empty arrays so values do not accumulate between evaluations
  words = [];
  counts = [];

  // https://stackoverflow.com/questions/11499268/sort-two-arrays-the-same-way#11499391
  function _sortArrays() {
    //1) combine the arrays:
    var list = [];
    for (var j=0; j<words.length; j++)
      list.push({'word': words[j], 'count': counts[j]});

    //2) sort:
    list.sort(function(a, b) {
      if(a.count > b.count) {
        return -1;
      }
      else if(a.count == b.count) {
        // if count is equal sort by word
        if(a.word > b.word) {
          return -1;
        }
        else if( a.word == b.word ) { // this case should never be reached since we have unique words in the array
          return 0;
        }
        else {
          return 1;
        }
      }
      else {
        return 1;
      }
    });

    //3) separate them back out:
    for (var k = 0; k < list.length; k++) {
      words[k] = list[k].word;
      counts[k] = list[k].count;
    }
  }
  // https://stackoverflow.com/questions/25602372/counting-unique-words-in-strings
  function _calculate(inputs) {
    // Calculate unique occurences
    for (var i = 0; i < inputs.length; i++) {
      var isExist = false;
      for (var j = 0; j < words.length; j++) {
        if (inputs[i].toUpperCase() == words[j].toUpperCase()) {  // ignore case when comparing
          isExist = true;
          counts[j] = counts[j] + 1;  // this line is buggy on stackoverflow because it uses i instead of j for indexing
        }
      }
      if (!isExist) {
        words.push(inputs[i]);
        counts.push(1);
      }
      isExist = false;
    }

    // Sort by most occurences
    counts.sort(function (a, b) {

    });
  }

  // Update internal string representation
  transformInput();

  // Update debug output
  $('#output').text(textInserted);

  if(textInserted.length) {
    _calculate(textInserted.split(' '));
    _sortArrays();

    var output = '';

    for (var i = 0; i < words.length; i++) {
      output += '<div class="col-xs-6 col-md-3 text-right">' +
                    words[i] + ' <span class="badge">' + counts[i] + '</span>' +
                '</div>';
    }

    wordsBreakdown.html(output);
  }
  else {
    wordsBreakdown.html('<div class="col-xs-12">Nothing to display</div>');
  }

  $('#textAnalysisAlertDiv').show();

  $('#wordCount').text(countWords(textInserted));
  $('#uniqueWordCount').text(words.length);

  change(getData());
}

function initTimeout() {
  clearTimeout(timer);
  timer = setTimeout(function() {
    evaluateInput();
  }, 2000);
}

// Ignore all input but alphabet characters
function transformInput() {
  // grab whole text
  textInserted = wordsArea.val();

  // https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string-having-trouble-with-the-char#9364527
  textInserted = stripMultipleSpaces(
    textInserted.replace(/[_\W]|[0-9]/g, ' ')   // remove non alpha-numeric
                .replace(/[0-9]/g, '')          // remove numeric too
  );
}

function doRequest(options) {
  if(typeof options !== "object") options = {};

  options.requestUrl = (typeof options.requestUrl === 'undefined') ? '' : options.requestUrl;
  options.endpoint = (typeof options.endpoint === 'undefined') ? '' : options.endpoint;
  options.postData = (typeof options.postData === 'undefined') ? '' : options.postData;
  options.className = (typeof options.className === 'undefined') ? '' : options.className;
  options.outputElement = (typeof options.outputElement === 'undefined') ? '' : options.outputElement;
  options.btnElement = (typeof options.btnElement === 'undefined') ? '' : options.btnElement;

  // don't make request if the text is just a bunch of whitespace
  if(options.postData.replace(/\s/g, "").length)
  {
    $.ajax({
      type: "POST",
      dataType: 'json',
      url: options.requestUrl + options.endpoint,
      data: { text: options.postData },
      timeout: 4000,
      beforeSend: function () {
        // prevent user making multiple requests at the same time
        options.btnElement.attr('disabled', true);
      }
    }).always(function (data, status_code, error) {
      // restore button state
      options.btnElement.attr('disabled', false);

      // hide alert
      $('#textAnalysisAlertDiv').hide();

      switch(status_code)
      {
        case 'success':
          var response = data[options.endpoint] || [];

          // check for items before iterating
          if(response.length) {
            var content = '<table class="table table-striped"><thead><tr><th>Text</th><th>'+
                            (response[0].type ? 'Type' : 'Sentiment') +
                              '</th></tr></thead><tbody>';

            for(var i=0; i<response.length; i++) {
              content += '<tr>';
              content += '<td><div class="'+ options.className +'">' + response[i].text + '</div></td>';
              content += '<td><div class="'+ options.className +'">' +
                                (response[i].type ? response[i].type : response[i].sentiment.type) +
                          '</div></td>';
              content += '</tr>';
            }

            content += '</tbody></table>';

            // Update UI
            options.outputElement.html(content);
          }
          else {
            // Update UI - show info message
            options.outputElement.text('No '+ options.endpoint +' found in text');
          }

          break;

        default:
          sweetAlert('Request failure', '[' + error + '] ' + data.responseText, 'error');
          break;
      }
    });
  }
  else {
    sweetAlert('No text to extract ' + options.endpoint + ' from', '', 'error');
  }
}

// run the code on document.ready
$(function() {

  wordsArea.on('paste', function() {

    // set timeout as value is not available when the handler is invoked
    // for the paste event
    setTimeout(function() {
      // Run evaluation
      evaluateInput();
    }, 50);
  });

  wordsArea.on('keyup', function( event ) {

    // Setup evaluation based on input (immediate vs delayed)
    if( event.keyCode === 190 || event.keyCode === 32)   // 190 - full stop      32 - space
    {
      // evaluateInput triggers graph redraw which impacts on performance
      // prevent redraw when user spams the key
      if(event.keyCode !== previousKeyCode)
      {
        clearTimeout(timer);    // timer may be already running so you end up evaluating twice
        evaluateInput();
      }
    }
    else
    {
      // init/reset timeout
      initTimeout();
    }

    previousKeyCode = event.keyCode;
  });

  getEntitiesBtn.on('click', function() {

    doRequest({
      requestUrl: '/api/alchemy/',
      endpoint: 'entities',
      postData: wordsArea.val(),
      className: 'entity',
      btnElement: getEntitiesBtn,
      outputElement: entitiesDiv
    });
  });

  getKeywordsBtn.on('click', function() {

    doRequest({
      requestUrl: '/api/alchemy/',
      endpoint: 'keywords',
      postData: wordsArea.val(),
      className: 'keyword',
      btnElement: getKeywordsBtn,
      outputElement: keywordsDiv
    });
  });

  // Main entry point of script
  (function run() {
    evaluateInput();
    $('#textAnalysisAlertDiv').hide();
  })();
});
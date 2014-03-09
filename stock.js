(function($) {
  function getStock(opts, type, complete) {
    var defs = {
      desc: false,
      baseURL: 'http://query.yahooapis.com/v1/public/yql?q=',
      query: {
        quotes: 'select * from yahoo.finance.quotes where symbol = "{stock}" | sort(field="{sortBy}", descending="{desc}")',
        historicaldata: 'select * from yahoo.finance.historicaldata where symbol = "{stock}" and startDate = "{startDate}" and endDate = "{endDate}"'
      },
      suffixURL: {
        quotes: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?',
        historicaldata: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?'
      }
    };

    opts = opts || {};

    if (!opts.stock) {
        complete('No stock defined');
        return;
    }

    var query = defs.query[type]
    .replace('{stock}', opts.stock)
    .replace('{sortBy}', defs.sortBy)
    .replace('{desc}', defs.desc)
    .replace('{startDate}', opts.startDate)
    .replace('{endDate}', opts.endDate);

    var url = defs.baseURL + query + (defs.suffixURL[type] || '');
    $.getJSON(url, function(data) {
      var err = null;
      if (!data || !data.query) {
        err = true;
      }
      complete(err, !err && data.query.results);    });
  }
  window.getStock = getStock;
})(jQuery);

var getDataForTicker = function(ticker){
  var today = new Date();
  var todayStr = today.getFullYear + '-' + today.getMonth() + '-' + today.getDate();
  getStock({ stock: ticker, startDate: '2014-01-01', endDate: todayStr }, 'historicaldata', function(err, data) {
    var ticks = data.quote;
    console.log(ticks);
  });
};

// http://bost.ocks.org/mike/bar/3/
var plotColumnGraph = function(data){
  var width = 960,
      height = 500;


};

$(document).ready(function(){
  // tests
  getStock({ stock: 'AAPL' }, 'quotes', function(err, data) {
    console.log('Test1: ', data);
  });

  getStock({ stock: 'AAPL', startDate: '2013-01-01', endDate: '2013-01-05' }, 'historicaldata', function(err, data) {
    console.log('Test2: ', data);
  });

  // get graph on submit
  $('#submit').click(function(){
    event.preventDefault();
    var ticker = $("#ticker").val();
    getDataForTicker(ticker);
  });
});



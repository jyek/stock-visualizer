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
    plotColumnGraph(ticks);
  });
};

// http://bost.ocks.org/mike/bar/3/
var plotColumnGraph = function(data){
  var width = 960,
      height = 400;

  console.log(data);

  var y = d3.scale.linear().domain([1000,1300]).range([0, height]);

  var chart = d3.select('.chart')
    .attr('width', width)
    .attr('height', height);

  var barWidth = width / data.length;

  var bar = chart.selectAll('g')
    .data(data)
    .enter().append('g')
    .attr('transform', function(d, i){ return "translate(" + i * barWidth + ",0)"; });

  bar.append('rect')
    .attr('y', function(d){ return height - y(d.Close); })
    .attr('height', function(d){ return y(d.Close); })
    .attr('width', barWidth - 1);
};

$(document).ready(function(){
  // initial ticker
  var ticker = 'GOOG';

  // tests
  getStock({ stock: 'AAPL' }, 'quotes', function(err, data) {
    console.log('Test1: ', data);
  });

  getStock({ stock: 'AAPL', startDate: '2013-01-01', endDate: '2013-01-05' }, 'historicaldata', function(err, data) {
    console.log('Test2: ', data);
  });

  // default
  getDataForTicker(ticker);

  // get graph on submit
  $('#submit').click(function(){
    event.preventDefault();
    ticker = $("#ticker").val();
    getDataForTicker(ticker);
  });
});



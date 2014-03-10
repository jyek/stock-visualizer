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
    plotColumnGraph(ticks, ticker);
  });
};

// http://bost.ocks.org/mike/bar/3/
var plotColumnGraph = function(data, ticker){
  var margin = {top: 20, right: 30, bottom: 50, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      padding = 20;
      yPadding = 50;

  console.log(data, ticker);

  var format = d3.format('0,000');
  var min = d3.min(data,function(d){return d.Close;}) - yPadding;
  var max = d3.max(data,function(d){return d.Close;}) + yPadding;

  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
  var y = d3.scale.linear().domain([max, min]).range([height, 0]);

  // chart
  var chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class','body')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // title
  var title = d3.select('.chart').selectAll('g .title')
    .data([ticker]);

  title.enter().append('g')
    .attr('class', 'title');

  title.append('text')
    .attr('class', 'title')
    .attr('x', width/2)
    .attr('y', padding)
    .attr('fill', 'red')
    .text(ticker);

  // axis stamps
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

  // bars
  var barWidth = width / data.length;

  var bar = chart.selectAll('g')
    .data(data)
    .enter().append('g')
    .attr('transform', function(d, i){ return "translate(" + (width - (i + 1) * barWidth) + ",0)"; });

  bar.append('rect')
    .attr('class', 'bar')
    .attr('y', function(d){ return height - y(d.Close); })
    .attr('height', function(d){ return y(d.Close); })
    .attr('width', barWidth - 1);

  bar.append('text')
    .attr('x', barWidth / 2)
    .attr('y', function(d) { return height - y(d.Close) + 3; })
    .attr('dy', '.75em')
    .text(function(d) { return format(d3.round(d.Close, 0)); });

  // make axis
  chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  chart.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append('text')
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price");
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



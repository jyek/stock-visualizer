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

$(document).ready(function(){
  // prepare chart
  var margin = {top: 20, right: 30, bottom: 50, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      padding = 20;

  // chart
  var chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class','body')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // http://bost.ocks.org/mike/bar/3/
  var updateColumnGraph = function(data, ticker){
    // params
    var barWidth = width / data.length;
    var format = d3.format('0,000');
    var minDate = d3.min(data,function(d){return new Date(d.Date);});
    var maxDate = d3.max(data,function(d){return new Date(d.Date);});
    var min = d3.min(data,function(d){return +d.Close;});
    var max = d3.max(data,function(d){return +d.Close;});

    var x = d3.time.scale().domain([minDate, maxDate]).range([0, width]);
    var y = d3.scale.linear().domain([min, max]).range([height, 0]);

    // axis stamps
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickFormat(d3.time.format("%b %Y"))
      .tickSize(0,0)
      .tickPadding(10);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5)
      .tickSize(0,0)
      .tickPadding(8);

    // title: data
    var title = d3.select('.chart').selectAll('g .title')
      .data([ticker]);

    // title: enter
    var titleEnter = title.enter().append('g')
      .attr('class', 'title')
      .append('text');

    // title: update
    title.selectAll('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', padding)
      .text(function(d){ return d; });

    // bar: data
    var bar = chart.selectAll('g')
      .data(data);

    // bar: enter
    var barEnter = bar.enter().append('g')
      .attr('transform', function(d, i){ return "translate(" + (width - (i + 1) * barWidth) + ",0)"; });

    barEnter.append('rect')
      .attr('class', 'bar');

    barEnter.append('text');

    // bar: update
    bar.selectAll('text')
      .attr('x', barWidth / 2)
      .attr('y', function(d) { console.log(d.Close); return y(d.Close) + 3; })
      .attr('dy', '.75em')
      .text(function(d) { return format(d3.round(d.Close, 0)); });

    bar.selectAll('rect')
      .transition()
      .attr('width', barWidth - 1)
      .duration(1000)
      .attr('height', function(d){ return height - y(d.Close); })
      .attr('y', function(d){ return y(d.Close); });

    // bar: remove
    bar.exit().remove();

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

  var getDataForTicker = function(ticker){
    var today = new Date();
    var todayStr = today.getFullYear + '-' + today.getMonth() + '-' + today.getDate();
    getStock({ stock: ticker, startDate: '2014-01-01', endDate: todayStr }, 'historicaldata', function(err, data) {
      var ticks = data.quote;
      updateColumnGraph(ticks, ticker);
    });
  };

  /*********************
  CORE
  *********************/

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



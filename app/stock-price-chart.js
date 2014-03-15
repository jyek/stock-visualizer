$(document).ready(function(){
  // prepare chart
  var margin = {top: 20, right: 30, bottom: 50, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      padding = 20;

  // date parsing
  var parseDate = d3.time.format("%Y-%m-%d").parse;

  // scale x axis
  var x = d3.time.scale()
    .range([0, width]);

  // scale y axis
  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%d %b %Y"));

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  // line
  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

  // chart
  var svg = d3.select(".stock-price-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // chart - init x-axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis");

  // chart - init y-axis
  svg.append("g")
      .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  // chart - init line
  svg.append("path")
    .attr("class", "line");

  // draw
  var draw = function(ticker, data){
    // process date and closing price
    data.forEach(function(d) {
      d.date = parseDate(d.Date);
      d.close = +d.Close;
      console.log(d.close,d.Close,d.date,d.Date);
    });

    // update bounds of chart
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    // update x and y axis
    svg.selectAll("g.x.axis")
      .call(xAxis);

    svg.selectAll("g.y.axis")
      .call(yAxis);

    // update line
    svg.selectAll("path.line")
      .datum(data)
      .attr("d", line);
  };

  var getDataForTicker = function(ticker){
    var today = new Date();
    var todayStr = today.getFullYear + '-' + today.getMonth() + '-' + today.getDate();
    getStock({ stock: ticker, startDate: '2014-01-01', endDate: todayStr }, 'historicaldata', function(err, data) {
      var ticks = data.quote;
      draw(ticker, ticks);
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



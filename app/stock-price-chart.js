$(document).ready(function(){
  // prepare chart
  var margin = {top: 20, right: 30, bottom: 50, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      padding = 20;

  // chart
  var chart = d3.select('.stock-price-chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class','body')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // http://bost.ocks.org/mike/bar/3/
  var draw = function(ticker, data){
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
    var title = d3.select('.stock-price-chart').selectAll('g .title')
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
      .attr('y', function(d) { return y(d.Close) + 3; })
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

  function redraw(ticker, data) {
    var barWidth = width / data.length;
    var format = d3.format('0,000');
    var minDate = d3.min(data,function(d){return new Date(d.Date);});
    var maxDate = d3.max(data,function(d){return new Date(d.Date);});
    var min = d3.min(data,function(d){return +d.Close;});
    var max = d3.max(data,function(d){return +d.Close;});

    var x = d3.time.scale().domain([minDate, maxDate]).range([0, width]);
    var y = d3.scale.linear().domain([min, max]).range([height, 0]);

    console.log('hey', data, ticker);

    var title = chart.selectAll('text.title')
      .data([ticker])
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', padding)
      .text(function(d){ return d; });

    chart.selectAll("rect")
        .data(data)
      .transition()
        .duration(1000)
        .attr("y", function(d) { return height - y(d.Close); })
        .attr("height", function(d) { return y(d.Close); });

    // chart: update text
    chart.selectAll('text')
        .data(data)
      .transition()
        .duration(1000)
        .attr('x', barWidth / 2)
        .attr('y', function(d) { return y(d.Close) + 3; })
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
  }

  var init = false;

  var getDataForTicker = function(ticker){
    var today = new Date();
    var todayStr = today.getFullYear + '-' + today.getMonth() + '-' + today.getDate();
    getStock({ stock: ticker, startDate: '2014-01-01', endDate: todayStr }, 'historicaldata', function(err, data) {
      var ticks = data.quote;
      if (!init){
        draw(ticker, ticks);
        init = true;
      } else {
        redraw(ticker, ticks);
      }
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



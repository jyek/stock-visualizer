var StockChartView = Backbone.View.extend({

  el: '.stock-chart-view',

  initialize: function(){
    var context = this;
    context.render();

    // listeners
    context.model.on('ticksReady', _.bind(context.update, context) );
  },

  // change underlying ticker
  changeStock: function(stock){
    this.model = stock;
    this.model.on('ticksReady', _.bind(this.update, this) );
  },

  // create wireframes for line chart
  render: function(){
    console.log('StockChartView: rendered');

    var context = this;

    // prepare chart
    context.margin = {top: 20, right: 30, bottom: 50, left: 40};
    context.width = 960 - context.margin.left - context.margin.right;
    context.height = 500 - context.margin.top - context.margin.bottom;
    context.padding = 20;

    // date parsing
    context.parseDate = d3.time.format("%Y-%m-%d").parse;

    // scale x axis
    context.x = d3.time.scale()
      .range([0, context.width]);

    // scale y axis
    context.y = d3.scale.linear()
      .range([context.height, 0]);

    context.xAxis = d3.svg.axis()
      .scale(context.x)
      .orient("bottom")
      .tickFormat(d3.time.format("%d %b %Y"));

    context.yAxis = d3.svg.axis()
      .scale(context.y)
      .orient("left");

    // line
    context.line = d3.svg.line()
      .x(function(d) { return context.x(d.date); })
      .y(function(d) { return context.y(d.close); });

    // chart
    context.svg = d3.select(context.el)
        .attr("width", context.width + context.margin.left + context.margin.right)
        .attr("height", context.height + context.margin.top + context.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + context.margin.left + "," + context.margin.top + ")");

    // chart - init x-axis
    context.svg.append("g")
        .attr("transform", "translate(0," + context.height + ")")
        .attr("class", "x axis");

    // chart - init y-axis
    context.svg.append("g")
        .attr("class", "y axis")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");

    // chart - init line
    context.svg.append("path")
      .attr("class", "line");
  },

  // update line chart for data
  update: function(stock){
    console.log('StockChartView: updated');

    var context = this;

    // assign data and ticker
    var ticker = stock.ticker;
    var data = stock.ticks;

    // process date and closing price
    data.forEach(function(d) {
      d.date = context.parseDate(d.Date);
      d.close = +d.Close;
    });

    // update bounds of chart
    context.x.domain(d3.extent(data, function(d) { return d.date; }));
    context.y.domain(d3.extent(data, function(d) { return d.close; }));

    // update x and y axis
    context.svg.selectAll("g.x.axis")
      .call(context.xAxis);

    context.svg.selectAll("g.y.axis")
      .call(context.yAxis);

    // update line
    context.svg.selectAll("path.line")
      .datum(data)
      .attr("d", context.line);
  }
});
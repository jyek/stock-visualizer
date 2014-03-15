window.data = [1,3,7,9,10,14,12];

var width = 420;
var barHeight = 20;

var x = d3.scale.linear()
  .range([0, width]);

var chart = d3.select('.chart1')
  .attr('width', width);

var type = function(d) {
  d.value = +d.value; // coerce to number
  return d;
};

d3.tsv('http://localhost/~justinyek/hackreactor/stock/data.tsv', type, function(err, data){

  x.domain([0, d3.max(data, function(d){ return d.value; })]);

  chart.attr('height', barHeight * data.length);

  var bar = chart.selectAll('g')
      .data(data)
    .enter().append('g')
      .attr('transform', function(d, i){ return 'translate(0, ' + i * barHeight + ')'; });

  bar.append('rect')
    .attr('width', function(d){ console.log(d.value); return x(d.value); })
    .attr('height', barHeight - 1);

  bar.append('text')
    .attr('x', function(d){ return x(d.value) - 20; })
    .attr('y', barHeight / 2)
    .attr('fill', 'white')
    .attr('dy', '.35em')
    .text(function(d){ return d.value; });
});
var Stock = Backbone.Model.extend({
  initialize: function(opts){
    var context = this;

    context.ticker = opts.ticker;

    // get historical data
    context.query({ stock: opts.ticker, startDate: '2014-01-01', endDate: this.today() }, 'historicaldata', function(err, data) {
      context.ticks = data.quote;
      // console.log('Ticks:', context.ticks);
      context.displayTicks();
    });

    // get current quotes
    context.query({ stock: opts.ticker, startDate: '2014-01-01', endDate: this.today() }, 'quotes', function(err, data) {
      context.metrics = data.quote;
      // console.log('Metrics:', context.metrics);
      context.displayMetrics();
    });
  },

  // Yahoo query
  query: function(opts, type, complete){
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
      complete(err, !err && data.query.results);
    });
  },

  // ready to display chart
  displayTicks: function(){
    this.trigger('ticksReady', this);
  },

  // ready to display metrics
  displayMetrics: function(){
    this.trigger('metricsReady', this);
  },

  // returns today's date in yyyy-mm-dd
  today: function(){
    var today = new Date();
    return today.getFullYear + '-' + today.getMonth() + '-' + today.getDate();
  }
});
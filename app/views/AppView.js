var AppView = Backbone.View.extend({

  initialize: function(opts){
    // create stock chart view
    var defaultStock = new Stock({ticker: 'AAPL'});
    this.stockChartView = new StockChartView({model: defaultStock});
    this.metricView = new MetricView({model: defaultStock});
    this.queryView = new QueryView();

    this.queryView.on('refresh', _.bind(this.changeStock, this) );
  },

  changeStock: function(ticker){
    console.log('AppView: change stock to', ticker);
    var stock = new Stock({ticker: ticker});
    this.stockChartView.changeStock(stock);
    this.metricView.changeStock(stock);
  }

});
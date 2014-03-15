var MetricView = Backbone.View.extend({

  el: '.metric-view',

  template: _.template(''),

  initialize: function(opts){
    this.render();
    this.model.on('metricsReady', _.bind(this.render, this));
  },

  changeStock: function(stock){
    this.model = stock;
    this.model.on('metricsReady', _.bind(this.render, this) );
  },

  render: function(){
    this.$el.html(JSON.stringify(this.model.metrics));
  }

});
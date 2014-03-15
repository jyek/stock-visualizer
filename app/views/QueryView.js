var QueryView = Backbone.View.extend({

  el: '.query-view',

  initialize: function(opts){

  },

  events: {
    'click #submit': 'refresh',
    'keyup :input #submit': 'keypress'
  },

  refresh: function(e){
    e.preventDefault();
    ticker = $('#ticker').val();
    this.trigger('refresh', ticker);
  },

  keypress: function(e){
    if (e.keyCode === 13){
      this.refresh(e);
    }
  }

});
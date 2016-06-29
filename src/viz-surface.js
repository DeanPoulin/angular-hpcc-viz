(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('common', {
    Surface: window.common_Surface
  });
  
  viz.addDirective('vizSurface', {
    props: {
      title  : {required: true},
			content: {required: true},
      icon   : {method: 'icon_faChar'},
			menu   : true
    },
    events: {
      menuClicked: {
        target: 'menu',
        event: 'click',
        args: ['$selection']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.common_Surface();
      }
    }
  }); 
})();

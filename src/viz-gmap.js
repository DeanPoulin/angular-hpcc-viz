(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('map', {
    GMap: window.map_GMap
  });
  
  viz.addDirective('vizGmap', {
    props: {
      data: {required: true}
    },
    ctrl: {
      createVizObj: function () {
        return new window.map_GMap();
      }
    }
  });
})();

(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('chart', {
    MultiChartSurface: window.chart_MultiChartSurface
  });

  viz.addDirective('vizMultichartSurface', {
    props: {
      icon   : {method: 'icon_faChar'},
      title  : {required: true},
      mode   : {required: true},
      type   : {required: true, method: 'chartType'},
      columns: {required: true},
      data   : {required: true}
    },
    events:  {
      click: {
        event: 'click',
        args: ['$data', '$columnName']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.chart_MultiChartSurface();
      }
    }
  });
})();

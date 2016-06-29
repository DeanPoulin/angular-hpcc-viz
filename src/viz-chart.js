(function () {
  'use strict';

  // Must match definition in MultiChart.js
  var CHART_TYPES = {
    // 1D
    SUMMARY      : window.chart_Summary,
    GAUGE        : window.chart_Gauge,

    // 2D
    BUBBLE       : window.chart_Bubble,
    PIE          : window.chart_Pie,
    GOOGLE_PIE   : window.google_Pie,
    C3_DONUT     : window.c3chart_Donut,
    C3_PIE       : window.c3chart_Pie,
    AM_FUNNEL    : window.amchart_Funnel,
    AM_PIE       : window.amchart_Pie,
    AM_PYRAMID   : window.amchart_Pyramid,
    WORD_CLOUD   : window.other_WordCloud,

    // ND
    COLUMN       : window.chart_Column,
    LINE         : window.chart_Line,
    AREA         : window.chart_Area,
    STEP         : window.chart_Step,
    GOOGLE_BAR   : window.google_Bar,
    GOOGLE_COLUMN: window.google_Column,
    GOOGLE_LINE  : window.google_Line,
    C3_AREA      : window.c3chart_Area,
    C3_BAR       : window.c3chart_Bar,
    C3_COLUMN    : window.c3chart_Column,
    C3_LINE      : window.c3chart_Line,
    C3_SCATTER   : window.c3chart_Scatter,
    C3_STEP      : window.c3chart_Step,
    AM_AREA      : window.amchart_Area,
    AM_BAR       : window.amchart_Bar,
    AM_LINE      : window.amchart_Line,

    // ANY
    TABLE        : window.other_Table
  };

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('chart', {
    ChartModes: ['1D', '2D', 'ND', 'all'],
    ChartTypes: Object.keys(CHART_TYPES).sort()
  });

  viz.addDirective('vizChart', {
    props: {
      type   : {init: true},
      columns: {required: true},
      data   : {required: true},
      
      // Donut Chart
      title: {required: false},
      showLabel: {required: false},
      arcWidth: {required: false},

      // Google Chart
      axisFontSize: {required: false},
      showLegend: {required: false},
      legendFontSize: {required: false},
      xAxisTitle: {required: false},
      yAxisTitle: {required: false},
      smoothLines: {required: false},
      legendAlignment: {required: false},
      legendPosition: {required: false},
      xAxisViewWindowMin: {required: false},
      yAxisViewWindowMin: {required: false}
    },
    events:  {
      click: {
        event: 'click',
        args: ['$data', '$columnName']
      }
    },
    ctrl: {
      createVizObj: function (type) {
        return new CHART_TYPES[type]();
      }
    }
  });
})();

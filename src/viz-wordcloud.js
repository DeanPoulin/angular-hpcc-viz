(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('other', {
    WordCloud: window.other_WordCloud
  });

  viz.addDirective('vizWordcloud', {
    props: {
      columns: {required: true},
      data: {required: true},
      padding: true,
      font: true,
      fontSizeFrom: true,
      fontSizeTo: true,
      angleFrom: true,
      angleTo: true,
      angleCount: true
    },
    ctrl: {
      createVizObj: function () {
        return new window.other_WordCloud();
      }
    }
  });
})();

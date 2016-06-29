(function () {
  'use strict';

  var TREE_TYPES = {
    SUNBURST_PARTITION: window.tree_SunburstPartition,
    CIRCLE_PACKING    : window.tree_CirclePacking,
    DENDROGRAM        : window.tree_Dendrogram
  };

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('tree', {
    TreeTypes: Object.keys(TREE_TYPES).sort(),
    SunburstPartition: window.tree_SunburstPartition,
    CirclePacking: window.tree_CirclePacking,
    Dendrogram: window.tree_Dendrogram,
  });

  viz.addDirective('vizTree', {
    props: {
      type: {init: true},
      data: {required: true}
    },
    ctrl: {
      createVizObj: function (type) {
        return new TREE_TYPES[type]();
      }
    }
  });
})();

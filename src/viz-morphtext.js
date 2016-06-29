(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('other', {
    MorphText: window.other_MorphText
  });

  viz.addDirective('vizMorphtext', {
    props: {
      text: {required: true},
      anchor: true,
      reverse: true
    },
    ctrl: {
      createVizObj: function () {
        return new window.other_MorphText();
      }
    }
  });
})();

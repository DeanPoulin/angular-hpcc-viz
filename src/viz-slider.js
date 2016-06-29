(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('form', {
    Slider: window.form_Slider
  });

  viz.addDirective('vizSlider', {
    props: {
      allowRange: true,
      low: {required: true},
      high: {required: true},
      step: {required: true},
      showPlay: true,
      playInterval: true,
      playDiameter: true,
      playGutter: true,
      loopDiameter: true,
      loopGutter: true
    },
    events:  {
      valueChanged: {
        event: 'click',
        args: ['$value']
      },
      rangeChanged: {
        event: 'newSelection',
        args: ['$start', '$end']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.form_Slider();
      }
    }
  });
})();

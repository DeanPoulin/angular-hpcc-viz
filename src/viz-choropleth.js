(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('map', {
    Countries: window.map_countries,
    USStates: window.map_usStates,
    USCounties: window.map_usCounties,

    ChoroplethCountries: window.map_ChoroplethCountries,
    ChoroplethStates: window.map_ChoroplethStates,
    ChoroplethCounties: window.map_ChoroplethCounties
  });

  viz.addDirective('vizChoropleth', {
    props: {
      type   : {init: true},
      columns: {required: true},
      data   : {required: true}
    },
    ctrl: {
      createVizObj: function (type) {
        return new {
          COUNTRIES  : window.map_ChoroplethCountries,
          US_STATES  : window.map_ChoroplethStates,
          US_COUNTIES: window.map_ChoroplethCounties
        }[type]();
      }
    }
  });
})();

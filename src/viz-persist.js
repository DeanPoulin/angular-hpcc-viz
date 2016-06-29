(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('other', {
    Persist: window.other_Persist
  });

  viz.addDirective('vizPersist', {
    props: {
      state: {init: true},
      columns: true,
      data   : true
      // TODO: may add more optional properties here
    },
    ctrl: {
      createVizObj: function (state, cb) {
        window.other_Persist.create(state, cb);
      }
    }
  });
})();

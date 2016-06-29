(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('other', {
    Table: window.other_Table
  });

  viz.addDirective('vizTable', {
    props: {
      columns: {required: true},
      data   : {required: true},
      enablePagination: {method: 'pagination'},
      itemsPerPage: true,
      pageNumber: true
    },
    ctrl: {
      createVizObj: function () {
        return new window.other_Table();
      }
    }
  });
})();

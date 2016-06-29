(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('layout', {
    Grid: window.layout_Grid,
    Cell: window.layout_Cell,
    Surface: window.layout_Surface
  });

  viz.addDirective('vizGrid', {
    props: {
      contents: {required: true}
    },
    ctrl: {
      createVizObj: function () {
        return new window.layout_Grid();
      },
      bindProp: function (prop, val) {
        if (prop === 'contents') {
          if (val == null) return false;

          val.forEach(function (content) {
            this.vizObj.setContent.apply(this.vizObj, content);
          }.bind(this));

          return true;
        }
        else {
          return viz.BaseController.prototype.bindProp.call(this, prop, val);
        }
      }
    }
  });
})();

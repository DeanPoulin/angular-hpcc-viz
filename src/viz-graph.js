(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('graph', {
    LayoutTypes: ['Circle', 'ForceDirected', 'ForceDirected2', 'Hierarchy'],
    Graph: window.graph_Graph,
    Vertex: window.graph_Vertex,
    Edge: window.graph_Edge
  });

  viz.addDirective('vizGraph', {
    props: {
      data: {required: true},
      layout: {required: true},
      allowDragging: true,
      scale: true,
      applyScaleOnLayout: true,
      highlightOnMouseOverVertex: true,
      highlightOnMouseOverEdge: true,
      transitionDuration: true,
      showEdges: true,
      snapToGrid: true,
      hierarchyRankDirection: true,
      hierarchyNodeSeparation: true,
      hierarchyEdgeSeparation: true,
      hierarchyRankSeparation: true
    },
    events:  {
      vertexClick: {
        event: 'vertex_click',
        args: ['$vertex', '$event']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.graph_Graph();
      },
      bindProp: function (prop, val) {
        if (prop === 'data') {
          if (val == null) return false;

          // Resets marker as graph_Graph.data() keeps adding context.id
          val.edges.forEach(function (edge) {
            if (edge._sourceMarker && ~edge._sourceMarker.indexOf('_')) {
              edge._sourceMarker = edge._sourceMarker.substring(edge._sourceMarker.lastIndexOf('_')+1);
            }
            if (edge._targetMarker && ~edge._targetMarker.indexOf('_')) {
              edge._targetMarker = edge._targetMarker.substring(edge._targetMarker.lastIndexOf('_')+1);
            }
          });
          this.vizObj.data(val);
          return true;
        }
        else {
          return viz.BaseController.prototype.bindProp.call(this, prop, val);
        }
      }
    }
  });
})();

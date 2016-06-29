(function () {
  'use strict';

  var vizConstants = {};

  var viz = angular.module('angular.hpcc.viz', []).constant('viz', vizConstants);

  /**
   * Base controller
   */
  viz.BaseController = BaseController;

  /**
   * Adds constants to a specific namespace in the viz service.
   */
  viz.addConstants = function (namespace, map) {
	  var nsConstants = vizConstants[namespace] = vizConstants[namespace] || {};
    Object.keys(map).forEach(function (key) {
      var value = map[key];
      nsConstants[key] = value;
    });
    return this;
  };

  /**
   * Creates and registers a directive to the viz module.
   */
  viz.addDirective = function (name, opts) {
    var restrict = opts.restrict || 'AE';
    var props = opts.props || {};
    var events = opts.events || {};
    var ctrl = opts.ctrl;

    return this.directive(name, function () {
      return {
        restrict: restrict,
        scope: getScopeBindings(),
        controller: createController()
      };
    });

    function getScopeBindings() {
      var bindings = Object.keys(props).reduce(function (bindings, prop) {
        bindings[prop] = '=' + ((props[prop].init || props[prop].required) ? '' : '?');
        return bindings;
      }, {
        // scope attrs available to all directives
        bindToScope: '@'
      });

      return Object.keys(events).reduce(function (bindings, event) {
        bindings[event] = '&?';
        return bindings;
      }, bindings);
    }

    function createController() {
      /*@ngInject*/
      function Controller($scope, $element, $attrs) {
        viz.BaseController.call(this, $scope, $element, $attrs, props, events);
      }
      Controller.$inject = ["$scope", "$element", "$attrs"];
      Controller.prototype = Object.create(viz.BaseController.prototype);
      for (var key in ctrl) {
        Controller.prototype[key] = ctrl[key];
      }
      return Controller;
    }
  };

  // Adds common constants
  viz.addConstants('common', {
    Shape: window.common_Shape,
    FAChar: window.common_FAChar,
    Icon: window.common_Icon,
    Text: window.common_Text,
    TextBox: window.common_TextBox,
    List: window.common_List,
    Menu: window.common_Menu,
    ResizeSurface: window.common_ResizeSurface,
    Palette: window.common_Palette
  });

  function BaseController(scope, elm, attrs, props, events) {
    this.scope = scope;
    this.elm = elm;
    this.attrs = attrs;
    this.props = props;
    this.events = events;
    this.render = debounce(this.render.bind(this), 100);

    // Normalizes property descriptor and setups watches
    Object.keys(props).forEach(function (prop) {
      var propDesc = props[prop];

      if (propDesc === true) {
        propDesc = props[prop] = {};
      }

      if (propDesc.method == null) {
        propDesc.method = prop;
      }

      scope.$watch(prop, this.onPropSet.bind(this, prop));
    }.bind(this));

    // Defers create if there's a required init property
    var deferCreate = Object.keys(props).some(function (prop) {
      return props[prop].init;
    });

    if (!deferCreate) {
      this.initializeVizObj();
    }
  }

  /**
   * Called when a scope property is set via data binding.
   */
  BaseController.prototype.onPropSet = function (prop, val) {
    if (val != null && this.props[prop].init) {
      if (this.vizObj) {
        this.elm.html('');
      }
      this.initializeVizObj(val, this.render.bind(this));
    }
    else if (this.vizObj && this.bindProp(prop, val)) {
      this.render();
    }
  };

  /**
   * Creates handler for a event.
   */
  BaseController.prototype.createEventHandler = function (scopeEvent, target, eventDesc) {
    return function () {
      var vizEvent = eventDesc.event;
      var argNames = eventDesc.args;
      var args = arguments;

      // Invokes super if exist as Viz widget usually has default event handler
      var superImpl = Object.getPrototypeOf(target)[vizEvent];
      if (superImpl) {
        superImpl.apply(target, args);
      }

      // Invokes scope event if it's declared
      if (this.scope[scopeEvent]) {
        var argMap = argNames.reduce(function (map, name, index) {
          map[name] = args[index];
          return map;
        }, {});

        this.scope[scopeEvent].call(this.vizObj, argMap);
        this.scope.$apply();
      }
    }.bind(this);
  };

  /**
   * Binds a scope property to the viz object.
   * @param {String} the property to bind.
   * @return true if binding is successful.
   */
  BaseController.prototype.bindProp = function (prop, val) {
    var propDesc = this.props[prop];
    if (val == null && !propDesc.allowNull) {
      return false;
    }

    this.vizObj[propDesc.method](val);
    Object.keys(this.events).forEach(function (scopeEvent) {
      var eventDesc = this.events[scopeEvent];
      if (eventDesc.target === prop) {
        var target = this.vizObj['_' + eventDesc.target];
        if (target) {
          target[eventDesc.event] = this.createEventHandler(scopeEvent, target, eventDesc);
        }
      }
    }.bind(this));

    return true;
  };

  /**
   * Creates internal viz object and binds events.
   */
  BaseController.prototype.initializeVizObj = function (val, cb) {
    var done = function (vizObj) {
      this.vizObj = vizObj.target(this.elm[0]);

      // Binds the viz object to the parent scope if requested
      if (this.scope.bindToScope) {
        this.scope.$parent[this.scope.bindToScope] = this.vizObj;
      }

      // Only binds properties during deferred initialization
      // to avoid double-binding when watches start running after initialization
      if (val != null) {
        Object.keys(this.props).forEach(function (prop) {
          if (!this.props[prop].init) {
            this.bindProp(prop, this.scope[prop]);
          }
        }.bind(this));
      }

      Object.keys(this.events).forEach(function (scopeEvent) {
        var eventDesc = this.events[scopeEvent];
        if (eventDesc.target == null) {
          this.vizObj[eventDesc.event] = this.createEventHandler(scopeEvent, this.vizObj, eventDesc);
        }
      }.bind(this));

      if (cb) cb();
    }.bind(this);

    // Supports both sync and async call patterns
    var vizObj = this.createVizObj(val, done);
    if (vizObj != null) done(vizObj);
  };

  /**
   * Renders the viz object if all required properties are available.
   */
  BaseController.prototype.render = function () {
    var readyToRender = this.vizObj && Object.keys(this.props).every(function (prop) {
      var propDesc = this.props[prop];
      return !propDesc.required || this.scope[prop] != null;
    }.bind(this));

    if (readyToRender) {
      this.vizObj.render();
    }
  };

  // Utilities
  function debounce(fn, after) {
    var timer = null;

    return function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, after);
    };
  }
})();

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

(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('map', {
    GMap: window.map_GMap
  });
  
  viz.addDirective('vizGmap', {
    props: {
      data: {required: true}
    },
    ctrl: {
      createVizObj: function () {
        return new window.map_GMap();
      }
    }
  });
})();

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

(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('chart', {
    MultiChartSurface: window.chart_MultiChartSurface
  });

  viz.addDirective('vizMultichartSurface', {
    props: {
      icon   : {method: 'icon_faChar'},
      title  : {required: true},
      mode   : {required: true},
      type   : {required: true, method: 'chartType'},
      columns: {required: true},
      data   : {required: true}
    },
    events:  {
      click: {
        event: 'click',
        args: ['$data', '$columnName']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.chart_MultiChartSurface();
      }
    }
  });
})();

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

(function () {
  'use strict';

  var viz = angular.module('angular.hpcc.viz');

  viz.addConstants('common', {
    Surface: window.common_Surface
  });
  
  viz.addDirective('vizSurface', {
    props: {
      title  : {required: true},
			content: {required: true},
      icon   : {method: 'icon_faChar'},
			menu   : true
    },
    events: {
      menuClicked: {
        target: 'menu',
        event: 'click',
        args: ['$selection']
      }
    },
    ctrl: {
      createVizObj: function () {
        return new window.common_Surface();
      }
    }
  }); 
})();

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

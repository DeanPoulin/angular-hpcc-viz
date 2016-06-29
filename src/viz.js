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

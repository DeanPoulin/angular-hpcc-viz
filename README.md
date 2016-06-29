angular-hpcc-viz
========

This project hosts AngularJS wrappers for [HPCC visualization framework](https://github.com/hpcc-systems/Visualization).

### Build

* `gulp`: runs `clean`, `scripts`
* `gulp clean`
* `gulp scripts`
* `gulp jshint`


### Install

```
bower install angular-hpcc-viz --save
```

**Note:** the Bower distribution of HPCC viz framework includes all widgets and external libraries (e.g. d3, c3, amCharts etc.) If you only use some widgets, make sure you only include the corresponding scripts and libraries. For Angular apps, this means overriding Bower's main for hpcc-viz and excluding unused libraries in wiredep task. See [this](https://github.com/hpcc-systems/Visualization/blob/master/bower.json) for the list of all viz scripts and libraries.


### Usage

#### Module
angular.module('app.x', ['angular.hpcc.viz', ...])

#### Constants
angular.hpcc.viz constants are DI-enabled and most of them are aliases of internal viz widgets. For example, if you need to access to the slider widget, instead of referencing it via the global namespace (i.e. `window.form_Slider`), inject `viz` and use `viz.form.Slider`.

Below is the list of current namespaces and constants. Those that aren't aliases are shown in italic.

* viz.common: Shape, FAChar, Icon, Text, TextBox, List, Menu, Surface, ResizeSurface, Palette
* viz.chart: MultiChartSurface, *ChartModes*, *ChartTypes*
* viz.map: GMap, ChoroplethCountries, ChoroplethStates, ChoroplethCounties, *Countries*, *USStates*, *USCounties*
* viz.graph: Graph, Vertex, Edge, *LayoutTypes*
* viz.tree: SunburstPartition, CirclePacking, Dendrogram, *TreeTypes*
* viz.layout: Grid, Cell, Surface
* viz.form: Slider, Input
* viz.other: Table, MorphText, Persist

If you need to access to a widget that doesn't have a corresponding constant, please submit an issue or pull request.

#### Directives

angular.hpcc.viz directives are AngularJS wrappers of viz widgets. Check out the demos folder for usages of the widgets you're interested in.

Native viz widgets can be exposed to scope by declaring the bind-to-scope attribute on a viz directive. For example:

```html
<viz-table bind-to-scope="vizTable"></viz-table>
```

```js
console.log($scope.table) // => hpcc-viz table widget
```

**Note:** Not all features of viz are exposed to AngularJS yet. For example, you might need to hook up with an event or bind to a property that has no corresponding AngularJS binding. If that's the case, please submit an issue or pull request.

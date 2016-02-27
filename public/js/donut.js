/**
 * Created by Stefan on 26/02/2016.
 *
 * This must be included before main.js so that we can do live updates on the graph
 */

var graphDiv = $('#graphDiv');

var svg, pie, arc, outerArc, key, color;
var width, height, radius;
var minAngle = 10;
var hiddenValues = 0;

function computeDimensions() {
  width = graphDiv.width() - 20;
  height = graphDiv.height() - 20;
  radius = Math.min(width, height) / 2;

  arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  console.log({ width:width, height:height, radius:radius, halfWidth: width /2, halfHeight: height / 2 });
}

function getData (){
  var labels = [];

  for(var i=0; i<words.length; i++) {
    labels.push({
      label: words[i],
      value: counts[i]
    });
  }

  return labels;
}

function filerPie( arcsArray ) {
  var arcAngle = 0;
  var filteredArray = [];

  for(var i=0; i<arcsArray.length; i++)
  {
    arcAngle = arcsArray[i].endAngle - arcsArray[i].startAngle;

    // convert angle from radians to degrees
    arcAngle = arcAngle * (180 / Math.PI);

    // we need to reconstruct the data array that we feed into pie() to only contain
    // the items that would take more that minAngle degrees on the chart
    if(arcAngle > minAngle) {
      filteredArray.push({ label: arcsArray[i].data.label, value: arcsArray[i].data.value });
    }
  }

  hiddenValues = arcsArray.length - filteredArray.length;
  $('#hiddenValues').text(hiddenValues);

  // the function takes in the output of pie() and rebuilds the data array
  // we need to pass out the output of pie() invoked on the filtered data
  return pie(filteredArray);
}

function change(data) {

  // don't show the graph if the words array is empty
  if(words.length < 1) {
    graphDiv.hide();
    $('#graphAlert').show();

    return;
  }
  else {
    graphDiv.show();
    $('#graphAlert').hide();
  }

  // compute data only once
  var pieData = filerPie(pie(data));

  /* ------- PIE SLICES -------*/
  var slice = svg.select(".slices").selectAll("path.slice")
                 .data(pieData, key);

  slice.enter()
    .insert("path")
    .style("fill", function(d) { return color(d.data.label); })
    .attr("class", "slice");

  slice
    .transition().duration(1000)
    .attrTween("d", function(d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        return arc(interpolate(t));
      };
    });

  slice.exit()
    .remove();

  /* ------- TEXT LABELS -------*/

  var text = svg.select(".labels").selectAll("text")
                .data(pieData, key);

  text.enter()
    .append("text")
    .attr("dy", ".35em")
    .text(function(d) {
      return d.data.label;
    });

  function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle)/2;
  }

  text.transition().duration(1000)
    .attrTween("transform", function(d) {
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
        return "translate("+ pos +")";
      };
    })
    .styleTween("text-anchor", function(d){
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        return midAngle(d2) < Math.PI ? "start":"end";
      };
    });

  text.exit()
    .remove();

  /* ------- SLICE TO TEXT POLYLINES -------*/

  var polyline = svg.select(".lines").selectAll("polyline")
    .data(pieData, key);

  polyline.enter()
    .append("polyline");

  polyline.transition().duration(1000)
    .attrTween("points", function(d){
      this._current = this._current || d;
      var interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        var d2 = interpolate(t);
        var pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        return [arc.centroid(d2), outerArc.centroid(d2), pos];
      };
    });

  polyline.exit()
    .remove();
}

function initGraph() {
  // empty element before appending
  graphDiv.html('');

  svg = d3.select("#graphDiv")
    .append("svg")
    .append("g");

  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labels");
  svg.append("g")
    .attr("class", "lines");

  pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.value;
    });

  key = function(d){ return d.data.label; };

  color = d3.scale.ordinal()
    .domain(words)
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  computeDimensions();
  change(getData());
}

// run the code on document.ready
$(function() {
  $(window).on('resize', function () {
    // recompute all values that depend on the new size values
    computeDimensions();
    change(getData());
  });

  // Main entry point of script
  (function run() {
    initGraph();

    $('#hiddenValues').text(hiddenValues);
    $('#minAngle').text(minAngle);
  })();
});
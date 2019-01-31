'use strict';
/* jshint camelcase: false */

const $scope = { overTime: {} };

import { bisector, extent, max } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { easeCubicInOut as easing } from 'd3-ease';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { area, line, curveMonotoneX as curve } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import 'd3-transition';

const dateBisector = bisector(({ date }) => date).left;

function getClosestEntry(data, scale, pos) {
  const date = scale.invert(pos),
    idx = dateBisector(data, date),
    lo = data[idx - 1] || {},
    hi = data[idx] || {};
  return date - lo.date > hi.date - date ? hi : lo;
}

const transition = (element, duration = 50) => element.transition().duration(duration).ease(easing);

let xAxis, yAxis, areaAboveCount, areaAboveTarget, areaBelowCount, areaBelowTarget, certLegend, x, y, svg, targetLine, countLine;
let certData;

// ---------------------------------------------------------
// SVG CREATION
// ---------------------------------------------------------

function initSvg(placeholder) {
  const margin = { top: 20, right: 80, bottom: 35, left: 30 };
  const w = 400,
    h = 180;

  const width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

  placeholder
    .attr('viewBox', `0 0 ${ w } ${ h }`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg = placeholder.append('g').attr('transform', `translate(${ margin.left }, ${ margin.top })`);

  x = scaleTime().range([0, width]).nice();
  y = scaleLinear().range([height, 0]).nice();

  xAxis = axisBottom().ticks(width / 100);
  yAxis = axisLeft().ticks(height / 30);

  // GRID
  const grid = svg.append('g');
  grid.append('g').attr('class', 'grid x').attr('transform', `translate(0, ${ height })`);
  grid.append('g').attr('class', 'grid y');

  // AXES
  svg.append('g').attr('transform', `translate(0, ${ height })`).attr('class', 'x axis');
  svg.append('g').attr('class', 'y axis');

  // ---------------------------------------------------------
  // LINES AND AREAS FUNCTIONS DEFINITION
  // ---------------------------------------------------------

  countLine = line().curve(curve).x(d => x(d.date)).y(d => y(d.count));
  targetLine = line().curve(curve).x(countLine.x()).y(d => y(d.target));

  areaAboveCount = area().curve(curve).x(countLine.x()).y0(countLine.y()).y1(0);
  areaAboveTarget = area().curve(curve).x(targetLine.x()).y0(targetLine.y()).y1(0);
  areaBelowCount = area().curve(curve).x(countLine.x()).y0(countLine.y()).y1(height);
  areaBelowTarget = area().curve(curve).x(targetLine.x()).y0(targetLine.y()).y1(height);

  // ---------------------------------------------------------
  // SVG ELEMENTS PLACEHOLDERS
  // ---------------------------------------------------------

  // CLIPPING AREAS
  const defs = svg.append('defs');
  defs.append('clipPath').attr('id', 'clip-count').append('path');
  defs.append('clipPath').attr('id', 'clip-target').append('path');

  // AREAS
  svg.append('path').attr('class', 'count area').attr('clip-path', 'url(#clip-target)');
  svg.append('path').attr('class', 'target area').attr('clip-path', 'url(#clip-count)');

  // COORDINATES HIGHLIGHT PLACEHOLDER
  const highlightCoordinates = svg.append('g').style('display', 'none');

  // LINES
  svg.append('path').attr('class', 'target line');
  svg.append('path').attr('class', 'count line');

  // ---------------------------------------------------------
  // HIGHLIGHT ELEMENTS
  // ---------------------------------------------------------

  const highlight = svg.append('g').style('display', 'none');

  const highlightAbscissa = highlightCoordinates.append('g');
  highlightAbscissa.append('path').attr('d', `M0,0V${ height }`).attr('class', 'highlight-coordinates');
  const highlightAbscissaTick = highlightAbscissa.append('g').attr('class', 'axis');
  highlightAbscissaTick.append('path').attr('d', `M0,${ height }v20`);
  highlightAbscissaTick.append('text').attr('transform', `translate(0, ${ height + 30 })`).attr('text-anchor', 'middle');

  const highlightOrdinateCount = highlightCoordinates.append('path').attr('d', `M0,0H${ width }`).attr('class', 'highlight-coordinates');
  const highlightOrdinateTarget = highlightCoordinates.append('path').attr('d', `M0,0H${ width }`).attr('class', 'highlight-coordinates');

  const highlightTarget = highlight.append('g').attr('text-anchor', 'middle');
  highlightTarget.append('circle').attr('class', 'target line').attr('r', 4);
  highlightTarget.append('text').attr('class', 'highlight-shadow');
  highlightTarget.append('text').attr('class', 'target');

  const highlightCount = highlight.append('g').attr('text-anchor', 'middle');
  highlightCount.append('circle').attr('class', 'count line').attr('r', 4);
  highlightCount.append('text').attr('class', 'highlight-shadow');
  highlightCount.append('text').attr('class', 'count');

  const legend = svg.append('g').attr('transform', `translate(${ width }, ${ height / 2 })`).style('fill', 'black');
  legend.append('path').attr('d', 'M10,-10h25').attr('class', 'line count');
  //legend.append('circle').attr('r', 4).attr('cx', 30).attr('cy', -10).attr('class', 'line count');
  certLegend = legend.append('text').attr('class', 'count').attr('transform', 'translate(40, -5)');
  legend.append('path').attr('d', 'M10,10h25').attr('class', 'line target').style('shape-rendering', 'crispEdges');
  //legend.append('circle').attr('r', 4).attr('cx', 30).attr('cy', 10).attr('class', 'line target');
  legend.append('text').attr('class', 'target').attr('transform', 'translate(40, 15)').text('Cible');

  // ---------------------------------------------------------
  // HOVERING ZONE
  // ---------------------------------------------------------

  svg.append('rect').attr('width', width).attr('height', height).style('fill', 'none').style('pointer-events', 'all').style('cursor', 'crosshair')
    .on('mouseover', function () {
      highlight.style('display', null);
      highlightCoordinates.style('display', null);
      grid.style('display', 'none');
    })
    .on('mouseout', function () {
      highlight.style('display', 'none');
      highlightCoordinates.style('display', 'none');
      grid.style('display', null);
      $scope.mouseY = null;
    })
    .on('mousemove', function () {
      $scope.mouseY = mouse(this)[0];
      $scope.updateHighlight();
    });

  $scope.updateHighlight = function (transitionDuration = 50) {
    if ($scope.mouseY) {
      const d = getClosestEntry(certData, x, $scope.mouseY);
      highlightCount.transition().duration(transitionDuration).ease(easing).attr('transform', `translate(${ x(d.date) }, ${ y(d.count) })`);
      highlightCount.selectAll('text')
        .transition().duration(transitionDuration).ease(easing)
        .attr('transform', 'translate(0, ' + (d.target > d.count ? 17 : -8) + ')')
        .text($scope.overTime.cert.cert_short + ' : ' + d.count);

      highlightTarget.transition().duration(transitionDuration).ease(easing).attr('transform', `translate(${ x(d.date) }, ${ y(d.target) })`);
      highlightTarget.selectAll('text')
        .transition().duration(transitionDuration).ease(easing)
        .attr('transform', 'translate(0, ' + (d.target > d.count ? -8 : 17) + ')')
        .text('Cible : ' + d.target);

      highlightAbscissa.transition().duration(transitionDuration).ease(easing).attr('transform', `translate(${ x(d.date) }, 0)`);
      highlightOrdinateCount.transition().duration(transitionDuration).ease(easing).attr('transform', `translate(0, ${ y(d.count) })`);
      highlightOrdinateTarget.transition().duration(transitionDuration).ease(easing).attr('transform', `translate(0, ${ y(d.target) })`);

      highlightAbscissaTick.select('text').text(timeFormat('%d %b %Y')(d.date));
    }
  };
}

Promise.all([require('./certificates.sample.json'), require('./stats.sample.json')]).then(([certificates, sitesHistory]) => {
  new Promise(function trySelectPlaceholder(resolve) {
    if (select('svg#interactive-chart').empty()) {
      return setTimeout(trySelectPlaceholder.bind(this, resolve), 100);
    }

    resolve(select('svg#interactive-chart'));
  }).then(placeholder => {
    initSvg(placeholder);
    $scope.certificates = Object.values(certificates).sort(c => c.cert_order);
    $scope.data = sitesHistory;
    $scope.displayData($scope.certificates[0].cert_pk);
    let idx = 1;
    setInterval(() => $scope.displayData($scope.certificates[idx = (idx + 1) % $scope.certificates.length].cert_pk), 3000);
  });
});

$scope.displayData = function (cert_pk, skipTransitions) {
  $scope.overTime.cert = $scope.certificates.find(c => c.cert_pk === cert_pk);
  certData = $scope.data.map(({ date, stats }) => ({ date: new Date(date), count: stats[cert_pk].current, target: stats[cert_pk].target }));

  x.domain(extent(certData, d => d.date)).nice();
  y.domain([0, certData.reduce((mx, entry) => max([mx, entry.count, entry.target]), 0)]).nice();

  xAxis.scale(x);
  yAxis.scale(y);

  const duration = skipTransitions ? 0 : 1000;
  $scope.updateHighlight(duration);
  transition(svg.select('.x.axis'), duration).call(xAxis.tickSize(6, 0).tickFormat(date => (date.getMonth() ? timeFormat('%B') : timeFormat('%Y'))(date)));
  transition(svg.select('.y.axis'), duration).call(yAxis.tickSize(6, 0).tickFormat(format('d')));

  transition(svg.select('#clip-count path'), duration).attr('d', areaAboveCount(certData));
  transition(svg.select('#clip-target path'), duration).attr('d', areaAboveTarget(certData));
  transition(svg.select('.count.area'), duration).attr('d', areaBelowCount(certData));
  transition(svg.select('.target.area'), duration).attr('d', areaBelowTarget(certData));

  transition(svg.select('.target.line'), duration).attr('d', targetLine(certData));
  transition(svg.select('.count.line'), duration).attr('d', countLine(certData));

  certLegend.text($scope.overTime.cert.cert_short);
};

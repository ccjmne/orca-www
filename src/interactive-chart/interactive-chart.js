'use strict';
/* jshint camelcase: false */
require('./interactive-chart.scss');

const d3 = require('d3');

const $scope = { overTime: {} };

const dateBisector = d3.bisector(d => d.date).left;

function getClosestEntry(data, scale, pos) {
  const date = scale.invert(pos),
    idx = dateBisector(data, date),
    hi = data[idx],
    lo = data[idx - 1];

  if (hi === undefined) {
    return lo;
  }

  if (lo === undefined) {
    return hi;
  }

  return date - lo.date > hi.date - date ? hi : lo;
}

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

  x = d3.scaleTime().range([0, width]).nice();
  y = d3.scaleLinear().range([height, 0]).nice();

  xAxis = d3.axisBottom().ticks(width / 100);
  yAxis = d3.axisLeft().ticks(height / 30);

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

  countLine = d3.line().curve(d3.curveMonotoneX).x(d => x(d.date)).y(d => y(d.count));
  targetLine = d3.line().curve(d3.curveMonotoneX).x(countLine.x()).y(d => y(d.target));

  areaAboveCount = d3.area().curve(d3.curveMonotoneX).x(countLine.x()).y0(countLine.y()).y1(0);
  areaAboveTarget = d3.area().curve(d3.curveMonotoneX).x(targetLine.x()).y0(targetLine.y()).y1(0);
  areaBelowCount = d3.area().curve(d3.curveMonotoneX).x(countLine.x()).y0(countLine.y()).y1(height);
  areaBelowTarget = d3.area().curve(d3.curveMonotoneX).x(targetLine.x()).y0(targetLine.y()).y1(height);

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
      $scope.mouseY = d3.mouse(this)[0];
      $scope.updateHighlight();
    });

  $scope.updateHighlight = function (transitionDuration = 50) {
    if ($scope.mouseY) {
      const d = getClosestEntry(certData, x, $scope.mouseY);
      highlightCount.transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('transform', `translate(${ x(d.date) }, ${ y(d.count) })`);
      highlightCount.selectAll('text')
        .transition().duration(transitionDuration).ease(d3.easeCubicInOut)
        .attr('transform', 'translate(0, ' + (d.target > d.count ? 17 : -8) + ')')
        .text($scope.overTime.cert.cert_short + ' : ' + d.count);

      highlightTarget.transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('transform', `translate(${ x(d.date) }, ${ y(d.target) })`);
      highlightTarget.selectAll('text')
        .transition().duration(transitionDuration).ease(d3.easeCubicInOut)
        .attr('transform', 'translate(0, ' + (d.target > d.count ? -8 : 17) + ')')
        .text('Cible : ' + d.target);

      highlightAbscissa.transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('transform', `translate(${ x(d.date) }, 0)`);
      highlightOrdinateCount.transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('transform', `translate(0, ${ y(d.count) })`);
      highlightOrdinateTarget.transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('transform', `translate(0, ${ y(d.target) })`);

      highlightAbscissaTick.select('text').text(d3.timeFormat('%d %b %Y')(d.date));
    }
  };
}

Promise.all([require('./certificates.sample.json'), require('./stats.sample.json')]).then(([certificates, sitesHistory]) => {
  new Promise(function trySelectPlaceholder(resolve) {
    if (d3.select('svg#interactive-chart').empty()) {
      return setTimeout(trySelectPlaceholder.bind(this, resolve), 100);
    }

    resolve(d3.select('svg#interactive-chart'));
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

  x.domain(d3.extent(certData, d => d.date)).nice();
  y.domain([0, certData.reduce((max, entry) => d3.max([max, entry.count, entry.target]), 0)]).nice();

  xAxis.scale(x);
  yAxis.scale(y);

  const transitionDuration = skipTransitions ? 0 : 1000;
  $scope.updateHighlight(transitionDuration);
  svg.select('.x.axis').transition().duration(transitionDuration).ease(d3.easeCubicInOut).call(xAxis.tickSize(6, 0).tickFormat(date => (date.getMonth() ? d3.timeFormat('%B') : d3.timeFormat('%Y'))(date)));
  svg.select('.y.axis').transition().duration(transitionDuration).ease(d3.easeCubicInOut).call(yAxis.tickSize(6, 0).tickFormat(d3.format('d')));

  svg.select('#clip-count path').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', areaAboveCount(certData));
  svg.select('#clip-target path').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', areaAboveTarget(certData));
  svg.select('.count.area').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', areaBelowCount(certData));
  svg.select('.target.area').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', areaBelowTarget(certData));

  svg.select('.target.line').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', targetLine(certData));
  svg.select('.count.line').transition().duration(transitionDuration).ease(d3.easeCubicInOut).attr('d', countLine(certData));

  certLegend.text($scope.overTime.cert.cert_short);
};

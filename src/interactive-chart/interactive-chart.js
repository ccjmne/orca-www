'use strict';
// jshint camelcase: false

import { bisector, extent, max } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { easeCubicInOut as easing } from 'd3-ease';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { area, line, curveMonotoneX as curve } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import 'd3-transition';

const certificates = Object.values(require('./certificates.sample.json')).sort(({ cert_order }) => cert_order);
const data = require('./stats.sample.json');
const dateBisector = bisector(({ date }) => date).left;

class InteractiveChart {
  constructor(selector) {
    this.svg = select(selector).attr('viewBox', `0 0 ${ this.width } ${ this.height }`).attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g').attr('transform', `translate(${ this.margin.left }, ${ this.margin.top })`);

    this.axes = {
      x: {
        grid: this.svg.append('g').attr('class', 'x grid').attr('transform', `translate(0, ${ this.chartHeight })`),
        elem: this.svg.append('g').attr('class', 'x axis').attr('transform', `translate(0, ${ this.chartHeight })`),
        scale: scaleTime().range([0, this.chartWidth]).nice(),
        axis: axisBottom().ticks(this.chartWidth / 100)
      },
      y: {
        grid: this.svg.append('g').attr('class', 'y grid'),
        elem: this.svg.append('g').attr('class', 'y axis'),
        scale: scaleLinear().range([this.chartHeight, 0]).nice(),
        axis: axisLeft().ticks(this.chartHeight / 30)
      }
    };

    const defs = this.svg.append('defs');
    ['count', 'target'].forEach(value => this[value] = (({ x, y }) => ({
      line: {
        elem: this.svg.append('path').attr('class', `${ value } line`),
        fn: line().curve(curve).x(x).y(y)
      },
      area: {
        elem: this.svg.append('path').attr('class', `${ value } area`).attr('clip-path', `url(#clip-${ value })`),
        clip: defs.append('clipPath').attr('id', `clip-${ value }`).append('path'),
        above: area().curve(curve).x(x).y0(y).y1(0),
        below: area().curve(curve).x(x).y0(y).y1(this.chartHeight)
      }
    }))({ x: ({ date }) => this.axes.x.scale(date), y: d => this.axes.y.scale(d[value]) }));

    this.crosshairs = (g => ({
      g,
      ticks: g.select('#abscissa .axis'),
      date: g.select('#abscissa'),
      count: g.select('#ordinate-count'),
      target: g.select('#ordinate-target')
    }))(this.svg.append('g').style('opacity', 0).html(`
      <g id="abscissa">
          <path class="highlight-coordinates" d="M0,0V${ this.chartHeight }"></path>
          <g class="axis">
              <path d="M0,${ this.chartHeight }v25"></path>
              <text transform="translate(0, ${ this.chartHeight + 37 })" text-anchor="middle"></text>
          </g>
      </g>
      <path id="ordinate-count" class="highlight-coordinates" d="M0,0H${ this.chartWidth }"></path>
      <path id="ordinate-target" class="highlight-coordinates" d="M0,0H${ this.chartWidth }"></path>`));

    this.details = (g => ({
      g,
      count: g.select('#highlight-count'),
      target: g.select('#highlight-target')
    }))(this.svg.append('g').style('opacity', 0).html(['count', 'target'].map(type => `
      <g id="highlight-${ type }" text-anchor="middle">
          <circle class="line ${ type }" r="4"></circle>
          <text class="highlight-shadow"></text>
          <text class="${ type }"></text>
      </g>`).reverse()));

    this.legend = this.svg.append('g').attr('transform', `translate(${ this.chartWidth }, ${ this.chartHeight / 2 })`).html(`
      <path class="line count" d="M10,-10h25"></path>
      <path class="line target" d="M10,10h25"></path>
      <text id="legend-cert" class="count" transform="translate(40, -5)"></text>
      <text class="target" transform="translate(40, 15)">Cible</text>`).select('#legend-cert');

    const self = this;
    this.svg.append('rect').attr('class', 'hover-zone').attr('width', this.chartWidth).attr('height', this.chartHeight).on('mouseover', function () {
      self.details.g.transition().style('opacity', '1');
      self.crosshairs.g.transition().style('opacity', '1');
    }).on('mouseout', function () {
      self.details.g.transition().style('opacity', 0);
      self.crosshairs.g.transition().style('opacity', 0);
      self.mouseX = null;
    }).on('mousemove', function () {
      [self.mouseX, ] = mouse(this);
      self.updateHighlight();
    });
  }

  updateHighlight(duration = 50) {
    const transition = this.transition(duration);
    const { date, count, target } = this.getClosestEntry();
    const { x: { scale: scaleX }, y: { scale: scaleY } } = this.axes;

    transition(this.details.count).attr('transform', `translate(${ scaleX(date) }, ${ scaleY(count) })`);
    transition(this.details.count.selectAll('text'))
      .attr('transform', `translate(0, ${ target > count ? 17 : -8 })`)
      .text(`${ this.cert.cert_short } : ${ count }`);

    transition(this.details.target).attr('transform', `translate(${ scaleX(date) }, ${ scaleY(target) })`);
    transition(this.details.target.selectAll('text'))
      .attr('transform', `translate(0, ${ target > count ? -8 : 17 })`)
      .text(`Cible : ${ target }`);

    transition(this.crosshairs.date).attr('transform', `translate(${ scaleX(date) }, 0)`);
    transition(this.crosshairs.count).attr('transform', `translate(0, ${ scaleY(count) })`);
    transition(this.crosshairs.target).attr('transform', `translate(0, ${ scaleY(target) })`);
    transition(this.crosshairs.ticks).select('text').text(timeFormat('%d %b %Y')(date));
  }

  displayData({ cert_pk: key }, duration = 1000) {
    this.cert = certificates.find(c => c.cert_pk === key);
    this.data = data.map(({ date, stats }) => ({ date: new Date(date), count: stats[key].current, target: stats[key].target }));
    this.legend.transition().duration(duration / 2).style('opacity', 0).transition().duration(duration / 2).text(this.cert.cert_short).style('opacity', 1);

    const transition = this.transition(duration);
    transition(this.axes.x.elem).call(this.axes.x.axis
      .scale(this.axes.x.scale.domain(extent(this.data, d => d.date)).nice())
      .tickSize(6, 0).tickFormat(date => (date.getMonth() ? timeFormat('%B') : timeFormat('%Y'))(date)));
    transition(this.axes.y.elem).call(this.axes.y.axis
      .scale(this.axes.y.scale.domain([0, this.data.reduce((mx, entry) => max([mx, entry.count, entry.target]), 0)]).nice())
      .tickSize(6, 0).tickFormat(format('d')));
    transition(this.axes.x.grid).call(this.axes.x.axis.tickSize(-this.chartHeight, 0).tickFormat(''));
    transition(this.axes.y.grid).call(this.axes.y.axis.tickSize(-this.chartWidth, 0).tickFormat(''));

    transition(this.count.area.clip).attr('d', this.target.area.above(this.data));
    transition(this.count.area.elem).attr('d', this.count.area.below(this.data));
    transition(this.count.line.elem).attr('d', this.count.line.fn(this.data));

    transition(this.target.area.clip).attr('d', this.count.area.above(this.data));
    transition(this.target.area.elem).attr('d', this.target.area.below(this.data));
    transition(this.target.line.elem).attr('d', this.target.line.fn(this.data));

    if (this.hovering) {
      this.updateHighlight(duration);
    }
  }

  getClosestEntry() {
    const date = this.axes.x.scale.invert(this.mouseX),
      idx = dateBisector(this.data, date),
      lo = this.data[idx - 1],
      hi = this.data[idx];
    if (typeof lo === 'undefined') {
      return hi;
    }
    if (typeof hi === 'undefined') {
      return lo;
    }
    return date - lo.date > hi.date - date ? hi : lo;
  }

  transition(duration = 50) {
    return element => element.transition().duration(duration).ease(easing);
  }

  get hovering() {
    return !!this.mouseX;
  }

  get margin() {
    return { top: 20, right: 80, bottom: 40, left: 40 };
  }

  get chartWidth() {
    return this.width - this.margin.left - this.margin.right;
  }

  get chartHeight() {
    return this.height - this.margin.top - this.margin.bottom;
  }

  get width() {
    return 550;
  }

  get height() {
    return 200;
  }
}

const chart = new InteractiveChart('svg#interactive-chart');
chart.displayData(certificates[0], true);
let idx = 1;
setInterval(() => chart.displayData(certificates[idx = (idx + 1) % certificates.length]), 3000);

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Country, DataService } from '../data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-round-chart',
  templateUrl: './round-chart.component.html',
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class RoundChartComponent implements OnInit {
  // Wymiary
  get height(): number {
    return parseInt(d3.select('body').style('height'), 10) / 2;
  }
  get width(): number {
    return parseInt(d3.select('.container').style('width'), 10);
  }
  radius: number;

  // Kąty
  private arc: any;
  private hoveredArc: any;
  private arcLabel: any;
  private pie: any;
  private slices: any;

  private color: any;

  // Kontener
  private svg: any;
  private mainContainer: any;

  private texts: any;

  dataSource: Country[];
  total: number;

  constructor(private service: DataService) {
  }

  ngOnInit() {
    this.dataSource = this.service.getData();
    this.total = this.dataSource.reduce((sum, it) => sum += it.value, 0);
    this.svg = d3.select('#round').select('svg');
    this.initSvg();
  }

  private initSvg() {
    this.setSVGDimensions();

    // Schemat kolorów
    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.mainContainer = this.svg.append('g')
      .attr('transform', 'translate(' + (this.radius) + ',' + (this.radius) + ')');

    this.pie = d3.pie()
      .sort(null)
      .value((d: any) => d.value);

    this.draw();
    window.addEventListener('resize', this.resize.bind(this));
  }

  private setSVGDimensions() {
    this.radius = (Math.min(this.width, this.height)) / 2;

    this.svg
      .attr('width', 2 * this.radius)
      .attr('height', 2 * this.radius);

    this.svg.select('g')
      .attr('transform', 'translate(' + this.radius + ',' + this.radius + ')');
  }

  private draw() {
    this.setArcs();
    this.drawSlices();
    this.drawLabels();
  }

  private setArcs() {
    const thickness = (1 - 25 / 100);
    this.arc = d3.arc()
      .outerRadius(this.radius)
      .innerRadius(0);

    this.arcLabel = d3.arc()
      .innerRadius(this.radius * .8)
      .outerRadius(this.radius * .8);
  }

  private drawSlices() {
    this.slices = this.mainContainer.selectAll('path')
      .remove()
      .exit()
      .data(this.pie(this.dataSource))
      .enter().append('g')
      .append('path')
      .attr('d', this.arc)
      .attr('opacity', 1);
    this.slices
      .attr('fill', 'transparent')
      .attr('fill', (d, i) => this.color(i));

    this.slices
      .on('mouseover', function (data, i, arr) {
        d3.select(arr[i])
          .transition()
          .ease(d3.easeBackOut)
          .duration(300)
          .attr('opacity', .9);
      }.bind(this))
      .on('mouseout', function (data, i, arr) {
        d3.select(arr[i])
          .transition()
          .ease(d3.easeBackOut)
          .duration(300)
          .attr('opacity', 1);
      }.bind(this));
  }

  private drawLabels() {
    this.texts = this.mainContainer.selectAll('text')
      .remove()
      .exit()
      .data(this.pie(this.dataSource))
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${this.arcLabel.centroid(d)})`)
      .attr('dy', '0.35em');

    this.texts.append('tspan')
      .filter(d => (d.endAngle - d.startAngle) > 0.05)
      .attr('x', 0)
      .attr('y', 0)
      .style('font-weight', 'bold')
      .text(d => d.data.name);

    this.texts.append('tspan')
      .filter(d => (d.endAngle - d.startAngle) > 0.25)
      .attr('x', 0)
      .attr('y', '1.3em')
      .attr('fill-opacity', 0.7)
      .text(d => d.data.value.toLocaleString());
  }

  private resize() {
    this.setSVGDimensions();
    this.setArcs();
    this.repaint();
    this.drawLabels();
  }

  private repaint() {
    this.drawSlices();
    this.drawLabels();
  }
}

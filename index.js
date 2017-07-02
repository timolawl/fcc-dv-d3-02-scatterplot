
//cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js

// FCC: Visualize Data with a Scatterplot Graph
// User Story: I can see performance time visualized in a scatterplot graph.
// User Story: I can mouse over a plot to see a tooltip with additional details.

var Chart = (function(window, d3) {
  
  var url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

  var x, y, xAxis, yAxis, svg, chartWrapper, div, nodes, dots, names, fastestTime, legend, allegation, noallegation, sources, margin, width, height;
  var timeFormat = d3.time.format('%M:%S');
  
  d3.json(url, init);
  
  function init(json) {
    var times = json.map(function(cyclist) { return cyclist.Time; });
    var placement = json.map(function(cyclist) { return cyclist.Place; });
    
    var adjustedTimes = times.map(function(time) { return timeFormat.parse(time) - timeFormat.parse(times[0]); });
    
    fastestTime = timeFormat.parse(times[0]);
    
    // set up axes
    // x is based on time: minutes and is linear..
    x = d3.time.scale()
      .domain([d3.time.second.offset(adjustedTimes[adjustedTimes.length - 1], 2), 0]);
    
    y = d3.scale.linear()
      .domain([d3.max(placement) + 2, d3.min(placement)]);
    
    xAxis = d3.svg.axis()
      .orient('bottom')
      .tickFormat(d3.time.format('%M:%S'));
    
    yAxis = d3.svg.axis()
      .orient('left');
    
    // set up svg
    svg = d3.select('.chart').append('svg');
    
    chartWrapper = svg.append('g');
    
    div = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    
    chartWrapper.append('g')
      .attr('class', 'axis axis--x');
    
    chartWrapper.append('text')
      .attr('class', 'label label--title')
      .style('text-anchor', 'middle')
      .text('Doping in Professional Bicycle Racing');
    
    chartWrapper.append('text')
      .attr('class', 'label label--subtitle')
      .style('text-anchor', 'middle')
      .text('Thirty-five fastest times up Alpe d\'Huez, normalized to 13.8km');
    
    chartWrapper.append('text')
      .attr('class', 'label label--x')
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('+Time differential (compared to record time)');
    
    chartWrapper.append('g')
      .attr('class', 'axis axis--y');
    
    chartWrapper.append('text')
      .attr('class', 'label label--y')
      .attr('transform', 'rotate(-90)')
      .attr('dx', '.71em')
      .style('text-anchor', 'middle')
      .text('Ranking');
    
    
    nodes = chartWrapper.selectAll('.data')
      .data(json).enter().append('g');
    
    dots = nodes.append('circle')
        .attr('class', 'dot');
    
    nodes.on('mouseover', function(d) {
      d3.select(this.firstChild).attr('class', 'dot active--dot');
      d3.select(this.lastChild).attr('class', 'cyclist--name active--name');
      div.transition()
        .duration(200)
        .style('opacity', 0.9);
      // name: country
      // year, time
      // doping snippet
      if (d.Doping !== '') {
        div.html('<span class="cyclist--textname">' + d.Name + '</span>, ' + d.Nationality + '<br>Year: ' + d.Year + ' Time: ' + d.Time + '<br><br>' + d.Doping);
      }
      else div.html('<span class="cyclist--textname">' + d.Name + '</span>, ' + d.Nationality + '<br>Year: ' + d.Year + ' Time: ' + d.Time);

      div.style('left', window.innerWidth * 0.1 + margin.left * 1.2 + 'px')
        .style('top', window.innerHeight * 0.1 + margin.top + 'px');

    })

      .on('mouseout', function(d) {
      d3.select(this.firstChild).attr('class', 'dot');
      d3.select(this.lastChild).attr('class', 'cyclist--name');
      div.transition()
        .duration(500)
        .style('opacity', 0);
    });

    names = nodes.append('text')
      .attr('class', 'cyclist--name')
      .attr('transform', 'translate(10' + ',' + '4)')
      .style('text-anchor', 'start')
      .text(function(d) { return d.Name; });
    
    legend = chartWrapper.append('g')
      .attr('class', 'legend');
    
    allegation = legend.append('g')
      .attr('class', 'legend--allegation');
    
    allegation.append('circle')
      .attr('class', 'dot legend--dot')
      .attr('fill', 'red');
    
    allegation.append('text')
      .attr('class', 'legend--text')
      .attr('text-anchor', 'start')
      .text('Riders with doping allegations');
    
    noallegation = legend.append('g')
      .attr('class', 'legend--noallegation');
    
    noallegation.append('circle')
      .attr('class', 'dot legend--dot')
      .attr('fill', 'black');

    noallegation.append('text')
      .attr('class', 'legend legend--text')
      .attr('text-anchor', 'start')
      .text('No doping allegations');
        
    sources = d3.select('body').append('div')
      .attr('class', 'sources')
      .html(
      '<span class="sources--text"><span class="sources--title">Sources:</span><br>' + 
        '<a href="//en.wikipedia.org/wiki/Alpe_d%27Huez">Wikipedia</a>, ' + 
        '<a href="//www.fillarifoorumi.fi/forum/showthread.php?38129-Ammattilaispy%F6r%E4ilij%F6iden-nousutietoja-%28aika-km-h-VAM-W-W-kg-etc-%29&p=2041608#post2041608">Fillari Forum</a>, ' +
        '<a href="//alex-cycle.blogspot.com/2015/07/alpe-dhuez-tdf-fastest-ascent-times.html">Professional Cycler Blog</a>, ' +
        '<a href="//www.dopeology.org/">Dopeology</a>' + 
      '</span>'
    );
      
    
    render();
    
  }
  
  function render() {
    updateDimensions();
    
    x.range([0, width]);
    y.range([height, 0]);
    
    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    xAxis.scale(x);
    
    if (window.innerWidth < 800) {
      xAxis.ticks(7); // ticks every 30 seconds instead of every 15
    }
    else xAxis.ticks(13); // normal number of ticks
    
    yAxis.scale(y);
    
    svg.select('.axis.axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
    
    svg.select('.axis.axis--y')
      .call(yAxis);
    
    svg.select('.label.label--title')
      .attr('x', width/2)
      .attr('y', -50);
    
    svg.select('.label.label--subtitle')
      .attr('x', width/2)
      .attr('y', -25);
    
    svg.select('.label.label--x')
      .attr('x', width/2)
      .attr('y', height + 40);
    
    svg.select('.label.label--y')
      .attr('x', -height/2)
      .attr('y', -40);
    
    dots.attr('r', 4)
      .attr('cx', function(d) { return x(new Date(timeFormat.parse(d.Time) - fastestTime)); })
      .attr('cy', function(d) { return y(d.Place); })
      .style('fill', function(d) { return d.Doping === '' ? 'black' : 'red'; });
    
    names.attr('x', function(d) { return x(new Date(timeFormat.parse(d.Time) - fastestTime)); })
      .attr('y', function(d) { return y(d.Place); });

    
    svg.selectAll('.legend--dot')
      .attr('r', 4)
      .attr('cx', -10)
      .attr('cy', -5);
    
    svg.select('.legend')
      .attr('transform', 'translate(' + (width - 200) + ',' + (height - 50) + ')');
    
    svg.select('.legend--noallegation')
      .attr('transform', 'translate(0' + ',' + 20 + ')');
    
  }
  
  function updateDimensions() {
    margin = {top: 100, right: 100, bottom: 70, left: 60 };
    
    width = window.innerWidth * 0.8 - margin.left - margin.right;
    height = window.innerHeight * 0.8 - margin.top - margin.bottom;
  }
  
  return {
    render: render
  }
  
  
})(window, d3);

window.addEventListener('resize', Chart.render);


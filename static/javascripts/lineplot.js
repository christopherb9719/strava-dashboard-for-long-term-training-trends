class BarChart {
  constructor(container, data, margin, width, height, id) {
    this.data = this.buildBarValues(data);
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.id = id;
    this.draw()
  }

  initialiseValues() {
    this.min_distance = d3.min(this.data, function(d) { return d.distance });
    this.max_distance = d3.max(this.data, function(d) { return d.distance });
    this.min_elevation_gain = d3.min(this.data, function(d) { return d.total_elevation_gain });
    this.max_elevation_gain = d3.max(this.data, function(d) { return d.total_elevation_gain });
    this.min_heart_rate = d3.min(this.data, function(d) { return d.heart_rate });
    this.max_heart_rate = d3.max(this.data, function(d) { return d.heart_rate });
    this.min_date = startDate;
    this.max_date = endDate;
    this.min_time = new Date(0, 0, 0, 0, 0, 0);
    this.max_time = new Date(0, 0, 0, 23, 59, 59);
    this.tags = [];
  }

  draw() {
    this.x = d3.scaleBand().range([0, this.width]).round(.2).domain([0, 23]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain(d3.extent(this.data)).nice();

    this.plot = d3.select(this.container).append('svg')
      .attr('width', w + this.margin.left + this.margin.right)
      .attr("height", h/2 + this.margin.top + this.margin.bottom)
      .append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    this.plotBars();
  }

  createAxes() {
    this.xAxisScale = d3.scaleLinear().domain([0, 23]).range([0, this.width]);
    this.xAxis = d3.axisBottom(this.xAxisScale)
          .tickFormat(function(d) {
              if (d == 0) return "";
              else if (d < 10) d = "0" + d;
              return d + ":00";
            });

    this.yAxis = d3.axisLeft(this.y);

    this.plot.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxis)

    this.plot.append("g")
      .call(this.yAxis);
  }

  plotBars() {
    this.plot.selectAll("rect")
      .data(this.data)
      .enter().append("rect")
        .attr("x", d => this.xAxisScale(this.data.indexOf(d)))
        .attr("y", d => this.getY(d))
        .attr('width', 30)
        .attr("fill", "#ff471a")
        .attr('height', d => Math.abs(this.y(d) - this.y(0)))
      .on('mouseover', function(d, i) {
        if (i < 10) { var time = "0" + i + ":00" }
        else { var time = i + ":00" }
        var html  = "Time of run: <b> " + time + "</b><br/>" +
                    "y: <b>" + d + "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", .7) // started as 0!
      })
      .on('mouseout', function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });
  }

  getY(d) {
    if (d > 0){
        return this.y(d);
    } else {
        return this.y(0);
    }
  }

  Mean(numbers) {
      var total = 0, i;
      for (i = 0; i < numbers.length; i += 1) {
          total += numbers[i];
      }
      return total / numbers.length;
  }

  buildBarValues(data) {
    var tod = [];
    var hr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    // count how much each city occurs in list and store in countObj
    data.forEach(function(d) {
      hr[d.hour] += d.heart_rate;
      p[d.hour] += d.average_pace;
    });
    var mean = this.Mean(hr)/this.Mean(p);
    for (var i = 0; i < 24; i++) {
      tod.push(mean - (hr[i]/p[i]));
    }
    return tod;
  }

}

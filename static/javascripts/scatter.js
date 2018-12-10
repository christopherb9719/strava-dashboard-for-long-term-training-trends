class Scatter {
  constructor(container, data, margin, width, height) {
    this.data = data;
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
    this.initialiseValues();
    this.draw();
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
  }

  draw() {
    console.log(this.container);
    this.x = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.heart_rate; }),
        d3.max(this.data, function(d) { return d.heart_rate; })])
      .range([0, this.width]);
    this.y = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.average_pace; }) - 0.02,
        d3.max(this.data, function(d) { return d.average_pace; }) + 0.02])
      .range([this.height, 0]);
    this.svg = d3.select(this.container).append('svg')
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append('g')
        .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    this.plotPoints();
  }

  createAxes() {
    this.xAxisCall = d3.axisBottom(this.x)
    this.xAxis = this.svg.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisCall);

    this.yAxisCall = d3.axisLeft(this.y)
    this.yAxis = this.svg.append("g")
        .call(this.yAxisCall)

    // Labels
    this.xAxis.append("text")
        .attr("transform", "translate(" + this.width + ", 0)")
        .attr("y", -6)
        .text("Average Heart Rate (BPM)");
    this.yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 16)
        .text("Average Pace (/km)");
  }

  plotPoints() {
    this.circles = this.svg.selectAll("circle")
        .data(this.data);

    this.circles.enter()
      .append("a")
        .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
        .append("circle")
          .attr("cx", (d => this.x(d.heart_rate)))
          .attr("cy", (d => this.y(d.average_pace)))
          .attr("r", function(d) { return getRadius(d);})
          .attr("fill", "#ff471a")
          .style("opacity", 0.5)
        .on('mouseover', function(d) {
          d3.select(this)
            .transition()
            .attr("fill", "#000000")
            .attr("r", 9)
          var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                      "Distance: <b> " + d.distance + "m </b><br/>" +
                      "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                      "<br/> Average Pace: <b/>" + d.average_pace.toFixed(3) + "/km</b>" +
                      "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

          tooltip.html(html)
              .style("left", (d3.event.pageX + 15) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(200) // ms
              .style("opacity", .9) // started as 0!
          }
        )
        .on('mouseout', function(d) {
          d3.select(this)
            .transition()
            .attr("fill", "#ff471a")
            .attr("r", getRadius(d))
          tooltip.transition()
              .duration(300) // ms
              .style("opacity", 0); // don't care about position!
        });
  }
}

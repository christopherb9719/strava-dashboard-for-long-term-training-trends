class Scatter {
  constructor(container, data, filters, margin, width, height, id) {
    this.data = data;
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
    this.id = id;
    this.filters = filters;
    this.draw();
  }

  draw() {
    this.x = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.heart_rate; }),
        d3.max(this.data, function(d) { return d.heart_rate; })])
      .range([0, this.width]);
    this.y = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.average_pace; }),
        d3.max(this.data, function(d) { return d.average_pace; })])
      .range([this.height, 0]);
    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
    this.plot = this.svg.append('g')
      .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    this.plotPoints();
  }

  createAxes() {
    this.xAxisCall = d3.axisBottom(this.x)

    this.xAxis = this.plot.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisCall);

    this.yAxisCall = d3.axisLeft(this.y)
      .tickFormat(function(d) {
        var seconds = Math.round((d % 1) * 60);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        var minutes = Math.floor(d - (d % 1));
        return (minutes + ":" + seconds);
      })
    this.yAxis = this.plot.append("g")
        .call(this.yAxisCall)


    // Labels
    this.xAxis.append("text")
        .attr("transform",
            "translate(" + (w/2) + " ," +
                      (h + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Mean Heart Rate (beats per minute)");

    this.yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Pace (minutes per km)");
  }

  plotPoints() {
    this.circles = this.plot.selectAll("circle")
        .data(this.data.filter(d => ((d.distance <= this.filters.getMaxDistance() && d.distance >= this.filters.getMinDistance())
          && (d.total_elevation_gain <= this.filters.getMaxElevationGain() && d.total_elevation_gain >= this.filters.getMinElevationGain())
          && (d.heart_rate <= this.filters.getMaxHeartRate() && d.heart_rate >= this.filters.getMinHeartRate())
          && this.dataInDate(d)
          && this.dataInTime(d)
          && this.containsTags(d)
        )));

    this.circles.enter()
      .append("a")
        .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
        .append("circle")
          .attr("cx", (d => this.x(d.heart_rate)))
          .attr("cy", (d => this.y(d.average_pace)))
          .attr("r", (d => this.getRadius(d)))
          .attr("fill", "#ff471a")
          .style("opacity", 0.5)
        .on('mouseover', function(d) {
          d3.select(this)
            .transition()
            .attr("fill", "#000000")
            //.attr("r", 9)
          var seconds = Math.round((d.average_pace % 1) * 60);
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          var minutes = Math.floor(d.average_pace - (d.average_pace % 1));
          //var pace = (d.average_pace - (d.average_pace % 1)) + ":" + d.average_pace%1.toFixed(2);
          var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                      "Distance: <b> " + d.distance + "m </b><br/>" +
                      "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                      "<br/> Average Pace: <b/>" + minutes + ":" + seconds + "/km</b>" +
                      "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

          tooltip.html(html)
              .style("left", (d3.event.pageX + 15) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(200) // ms
              .style("opacity", .9) // started as 0!
          }
        )
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .attr("fill", "#ff471a")
          tooltip.transition()
              .duration(300) // ms
              .style("opacity", 0); // don't care about position!
        });
  }


  update(w, h){
    // Update our scales
    this.x.range([0, w]);
    this.y.range([h, 0]);

    this.svg.attr("width", w + this.margin.left + this.margin.right);

    // Update our axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);

    this.plot.selectAll("circle").remove();
    // Update our circles
    this.plotPoints();
  }

  dataInDate(d) {
    if (d.year > this.filters.getEarliestDate().getFullYear() && d.year < this.filters.getLatestDate().getFullYear()) {
      return true;
    }
    else if (d.year == this.filters.getEarliestDate().getFullYear()) {
        if (d.month >= this.filters.getEarliestDate().getMonth()) return true;
    }
    else if (d.year == this.filters.getLatestDate().getFullYear()) {
      if (d.month <= this.filters.getLatestDate().getMonth()) return true;
    }
  }

  dataInTime(d) {
    if (d.hour > this.filters.getEarliestTime().getHours() && d.hour < this.filters.getLatestTime().getHours()) {
      return true;
    }
    else if (d.hour == this.filters.getEarliestTime().getHours()) {
      if (d.minute >= this.filters.getEarliestTime().getMinutes()) return true;
    }
    else if (d.year == this.filters.getLatestTime().getHours()) {
      if (d.minute <= this.filters.getLatestTime().getMinutes()) return true;
    }
  }

  containsTags(d) {
    this.filters.getTags().forEach(function(tag) {
      if (d.description != null && d.description.contains(tag)) {
        return false;
      }
    })
    return true;
  }

  getRadius(d) {
    var max = this.filters.getLatestDate().getTime()/1000,
        min = this.filters.getEarliestDate().getTime()/1000,
        date = new Date(d.year, d.month, d.day, 0, 0, 0),
        size = (max-min)/(max-(date.getTime()/1000));
    if (size == 'infinity') {
      return 20;
    }
    else {
      return Math.min(20, size);
    }
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getPlot() {
    return this.plot;
  }

  getData() {
    return this.data;
  }

  getFilters() {
    return this.filters;
  }

}

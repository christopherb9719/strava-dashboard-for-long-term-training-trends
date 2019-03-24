class Scatter {
  constructor(container, margin, width, height) {
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
  }

  draw(filterObject) {
    this.x = d3.scaleLinear()
      .domain([filterObject.getMinHeartRate(), filterObject.getMaxHeartRate()])
      .range([0, this.width]);
    this.y = d3.scaleLinear()
      .domain([filterObject.getMinPace(), filterObject.getMaxPace()])
      .range([this.height, 0]);
    this.svg = d3.select(this.container).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.plot = this.svg.append('g')
          .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")")
          .style("background", "#ffffff");

    this.plot.append("text")
        .attr("x", (this.width / 2))
        .attr("y", 0 - (this.margin.top/3))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Activities");

    this.createAxes();
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
    this.plot.append("text")
        .attr("transform",
            "translate(" + this.width/2 + " ," +
                      (this.height + this.margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Mean Heart Rate (bpm)");

    this.plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x",0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Pace (minutes per km)");
    }

  getRadius(d, filters) {
    var max = filters.getLatestDate().getTime()/1000,
        min = filters.getEarliestDate().getTime()/1000,
        date = new Date(d.year, d.month, d.day, 0, 0, 0),
        size = (max-min)/(max-(date.getTime()/1000));
    if (size == 'infinity') {
      return 20;
    }
    else {
      return Math.min(20, size);
    }
  }

  resize(new_width) {
    // Update our scales
    this.x.range([0, new_width]);

    this.svg.attr("width", new_width + this.margin.left + this.margin.right);

    // Update our axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getSvg() {
    return this.plot;
  }

  getData() {
    return this.data;
  }

  getFilters() {
    return this.filters;
  }
}

function getRadius(d, filters) {
  var max = filters.getLatestDate().getTime()/1000,
      min = filters.getEarliestDate().getTime()/1000,
      date = new Date(d.year, d.month, d.day, 0, 0, 0),
      size = (max-min)/(max-(date.getTime()/1000));
  if (size == 'infinity') {
    return 20;
  }
  else {
    return Math.min(20, size);
  }
}


function plotScatterPoints(plot, data, colour, x, y, filters, id) {
  plot.selectAll("[id='#dataset" + id + "']").remove();
  var circles = plot.selectAll("circles");

  circles.data(data).enter()
    .append("a")
      .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
      .append("circle")
        .attr("cx", (d => x(d.heart_rate)))
        .attr("cy", (d => y(d.average_pace)))
        .attr("r", function(d) { return getRadius(d, filters); })
        .attr("id", d => '#dataset'+id)
        .attr("fill", colour)
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
        var html  = "<span style='color:" + 'blue' + ";'>" + d.name + "<br/></span> " +
                    "Date: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b><br/>" +
                    "Distance: <b> " + d.distance + "m </b><br/>" +
                    "Heart Rate: <b>" + d.heart_rate + " bpm</b><br/>" +
                    "Pace: <b/>" + minutes + ":" + seconds + "/km</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", 1) // started as 0!
        }
      )
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .attr("fill", colour)
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });
}

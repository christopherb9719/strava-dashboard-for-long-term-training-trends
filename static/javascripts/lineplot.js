function Mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
}

function buildHistogram(width, height) {
  var tod = [];
  var hr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // count how much each city occurs in list and store in countObj
  dataset.forEach(function(d) {
    hr[d.hour] += d.heart_rate;
    p[d.hour] += d.average_pace;
  });
  var mean = Mean(hr)/Mean(p);
  for (i = 0; i < 24; i++) {
    tod.push(mean - (hr[i]/p[i]));
  }

  console.log(tod);

  var x = d3.scaleBand().range([0, width]).round(.2).domain([0, 23]);
  var y = d3.scaleLinear().range([height, 0]).domain(d3.extent(tod)).nice();

  var xAxisScale = d3.scaleLinear().domain([0, 23]).range([0, width]);

  var xAxisHist = d3.axisBottom(xAxisScale)
      .tickFormat(function(d) {
          if (d == 0) return "";
          else if (d < 10) d = "0" + d;
          return d + ":00";
        });

  var yAxisHist = d3.axisLeft(y);


  barchart = d3.select('#hist_container').append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr("height", h/2 + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //Append x axis
  barchart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(xAxisHist)

  barchart.append("g")
    .attr("class", "x axis")
    .append("line")
    .attr("y1", y(0))
    .attr("y2", y(0))
    .attr("x2", w);
    //"""{
      //if (d < 10) d = "0" + d;
      //return d + ":00";
    //}));
  //Append y axis
  barchart.append("g")
    .call(yAxisHist);

  barchart.selectAll("rect")
    .data(tod)
    .enter().append("rect")
      .attr("x", function(d, i) { console.log(xAxisScale(i)); return xAxisScale(i); })
      .attr("y", function(d, i) {  if (d > 0){
                return y(d);
            } else {
                return y(0);
            } })
      .attr('width', 30)
      .attr("fill", "#ff471a")
      .attr('height', function(d) { return Math.abs(y(d) - y(0)) })
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

  return barchart
}

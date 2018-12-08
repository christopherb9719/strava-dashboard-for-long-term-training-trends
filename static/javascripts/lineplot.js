function buildHistogram() {
  var tod = [];
  var hr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // count how much each city occurs in list and store in countObj
  dataset.forEach(function(d) {
    hr[d.hour] += d.heart_rate;
    p[d.hour] += d.average_pace;
  });
  for (i = 0; i < 24; i++) {
    if (p[i] == 0) tod.push(0);
    else tod.push(hr[i]/p[i]);
  }
  console.log(tod);

  var x_hist = d3.scaleLinear().range([0, w]);
  var y_hist = d3.scaleLinear().range([h/2, 0]);

  var xAxisHist = x_hist.domain([0, 23]);
  var yAxisHist = y_hist.domain([0, d3.max(tod)]);


  barchart = d3.select('#hist_container').append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr("height", h/2 + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //Append x axis
  barchart.append("g")
    .attr("transform", "translate(0, "+ h/2 +")")
    .call(d3.axisBottom(xAxisHist));

  //Append y axis
  barchart.append("g")
    .call(d3.axisLeft(yAxisHist));

  barchart.selectAll("rect")
    .data(tod)
    .enter().append("rect")
      .attr("x", function(d, i) { console.log(i); return x_hist(i-0.5); })
      .attr("y", function(d, i) { console.log(d); return y_hist(d); })
      .attr('width', 30)
      .attr('height', function(d) { return (h/2) - y_hist(d); })
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

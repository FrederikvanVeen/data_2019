// Frederik van veen, 10789324
// javascript file for barchart.html

// create format for graph
d3.select("head").append("title").text("Bar chart");
d3.select("body").append('h2').text("Barchart using D3");
d3.select("body").append('h4').text("Frederik van Veen \n\n 10789324 ");
d3.select("body").append('h5').text("The bar chart shown on this page, shows the amount of renewable energy (measured in KTOE) that was produced in Belgium through the years 1990 to 2016. The chart was created in javascript using the D3 library.");

// dimension for the svg area
var margin = {top: 40, right: 20, bottom: 50, left: 50};
var w = 600;
var h = 200;
var barPadding = 0.5;

// create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// define the div for the tooltip
const div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// create promise for the json file
d3.json("OECD.json").then(function(data) {

  // push all object containing KTOE measurement for Belgium after 1990
  json_interest = [];
  for(i = 0; i < data.length ; i++){
    if (data[i].LOCATION == 'BEL' && data[i].MEASURE == 'KTOE'&& data[i].TIME > 1990){
      json_interest.push(data[i])
    }
   }

  // create scale to map x values onto the svg
  var xScale = d3.scaleLinear()
    .domain([d3.min(json_interest, function(d) { return d.TIME; }), d3.max(json_interest, function(d) { return d.TIME; })])
    .range([0, w]);

  // create scale to map y values onto the svg
  var yScale_values = d3.scaleLinear()
           .domain([0, 3700.18])
           .range([0, 200]);

  // reverse scale for y values for axis
  var yScale_axis = d3.scaleLinear()
           .domain([0, 3700.18])
           .range([200, 0]);

  svg.selectAll("rect")
   .data(json_interest)
   .enter()
   .append("rect")
   .attr("x", function(d) {
        return xScale(d.TIME);
    })
   .attr("y", function(d) {
      return (h - yScale_values(d.Value));
    })
   .attr("width", w / json_interest.length - barPadding)
   .attr("height", function(d) {
        return yScale_values(d.Value);
    })
   .attr("fill", "teal")
   .attr("class", "bar")
   .on('mouseover', d => {
     div
       .transition()
       .duration(200)
       .style('opacity', 0.9);
     div
       .html("<strong>KTOE:</strong> <span style='color:red'>" + d.Value)
       .style('left', d3.event.pageX + 'px')
       .style('top', d3.event.pageY - 28 + 'px');
   })
   .on('mouseout', () => {
     div
       .transition()
       .duration(500)
       .style('opacity', 0);
   });

  // create tick values for x axis
  tick_values_x = [];
  for (i = 1991; i <= 2016; i++){
    tick_values_x.push(i)
  }

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+ 10 +"," + h + ")")
    .call(d3.axisBottom(xScale).tickValues(tick_values_x).tickFormat(d3.format("d")))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)");

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale_axis))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .text("renewable energy (KTOE)");

});

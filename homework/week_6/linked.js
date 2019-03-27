// creates div for graph and div for tooltip
var div2 = d3v5.select('body').append('div')
  .attr('id', 'container')

const div3 = d3v5
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);


window.onload = function() {
  drawDatamap();
};


// draw datamap with fillkeys from json, if existing
function drawDatamap(){

  // create promise for json of gdp-data
  d3v5.json("gdp_data_clean.json").then(function(data) {

      // create datamap
      var map = new Datamap({element: document.getElementById('container'),
      fills: {
      '>25000': '#1a9641',
      '15000-25000': '#a6d96a',
      '7500-15000': '#ffffbf',
      '3500-7500': '#fdae61',
      '<3500': '#d7191c',
      defaultFill: 'grey'
      },
      data: data,
      geographyConfig: {
        popupTemplate: function(geography, data) {
       return '<div class="hoverinfo">' + geography.properties.name + '<br />' + 'GDP per capita: ' +  data.GDP
     }},
      done: function(datamap) {
         datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
             country = geography.properties.name;

             // create promise for suicide data
             d3v5.json("suicidedata.json").then(function(data) {
               objects_interest_order = getObjectsInterest(data, country)
               // suicide data available
               if (objects_interest_order != 1){
                 d3v5.select("#graph").remove()
                 drawbar(objects_interest_order);
               }
               // no suicide data avaibale
               else{
                 d3v5.select('#graph').remove()
                 noDataAvailable();
               }
             });
         });
     }
      });
      // draw legend for datamap
      map.legend({
        legendTitle : "GDP per capita",
        defaultFillName: "No data: ",
        labels: {
          q0: "one",
          q1: "two",
          q2: "three",
          q3: "four",
          q4: "five",
        },
      });
  });
}


// create promise for the json file
function drawbar(objects_interest_order) {

  var margin = {top: 80, right: 80, bottom: 90, left: 120};
  var w = 350;
  var h = 200;
  var barPadding = 0.5;

  // create SVG element
  var svg = d3v5.select("#container")
              .append("svg")
              .attr("id","graph")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // determine sclale function for x-values to svg
  var xScale = d3v5.scaleBand()
  .domain(objects_interest_order.map(function(d) { return d.label; }))
  .rangeRound([0, w]).paddingInner(0.05);

  // determine sclale function for y-values to svg
  var yScale = d3v5.scaleLinear()
    .domain([d3v5.min(objects_interest_order, function(d) { return d.suicides_no; }), d3v5.max(objects_interest_order, function(d) { return d.suicides_no; })])
    .range([0, h]);

  // determine sclale function for y-axis
  var yScaleAxis = d3v5.scaleLinear()
    .domain([d3v5.min(objects_interest_order, function(d) { return d.suicides_no; }), d3v5.max(objects_interest_order, function(d) { return d.suicides_no; })])
    .range([h, 0]);

  // draw the bars for barchart
  svg.selectAll("rect")
   .data(objects_interest_order)
   .enter()
   .append("rect")
   // draw an extra white space between every pair of male en female bars
   .attr("x", function(d, i) {
        return xScale(d.label) + ifevenorzero(i)*10;
    })
   .attr("y", function(d) {
      return (h - yScale(d.suicides_no));
    })
   .attr("width", w / objects_interest_order.length - barPadding - 10)
   .attr("height", function(d) {
        return(yScale(d.suicides_no));
    })
   .attr("fill", function(d) {
        return(d.colour);
    })
   .attr("class", "bar")
   // show tooltip when mous hovers over a bar
   .on('mouseover', d => {
     div3
       .transition()
       .duration(200)
       .style('opacity', 0.9);
     div3
       .html("<strong>suicides:</strong> <span style='color:red'>" + d.suicides_no)
       .style('left', d3v5.event.pageX + 'px')
       .style('top', d3v5.event.pageY - 28 + 'px');
   })
   // vanish when mouse leaves bar
   .on('mouseout', () => {
     div3
       .transition()
       .duration(500)
       .style('opacity', 0);
   });

 // graph title
 svg.append("text")
     .attr('id', 'title')
     .attr("x", (w / 2))
     .attr("y", 5 - (margin.top / 2))
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .style("text-decoration", "underline")
     .text("suicides per age category in " + country);

  // add y-axis
  svg.append("g")
    .attr('id', 'yAxis')
    .attr("class", "y axis")
    .call(d3v5.axisLeft(yScaleAxis))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".70em")
    .text("amount of suicides");

  // add x-axis
  labels = [0, 2, 4, 6, 8, 10];
  svg.append("g")
    .attr('id', 'xAxis')
    .attr("class", "x axis")
    .attr("transform", "translate("+ 15 +"," + h + ")")
    .call(d3v5.axisBottom(xScale).tickValues(labels).tickFormat(d3.format("d")))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.50em")
      .attr("transform", "rotate(-90)")
      .text(function(d, i ){
        return objects_interest_order[i*2].age
      });

    // draw legend for bar chart
    for(i = 0; i < 2; i++){

      // colored rectangle
      svg.append("rect")
          .attr("x", w)
          .attr("y", 20 - (margin.top / 2) + (i * 20))
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", objects_interest_order[i].colour);

      // text on right side
      svg.append("text")
          .attr("x", w + 20)
          .attr("y", 34 - (margin.top / 2) + (i * 20))
          .text(objects_interest_order[i].sex);
    }

};


// create list of objects corresponding to the country clicked
function getObjectsInterest(data, country){
  data = Object.values(data);

  // get all object corresponding to country clicked
  objects_interest = [];
  for(i = 0; i < data.length ; i++){
    if (data[i].country == country){
      objects_interest.push(data[i])
    }
   }
   if(objects_interest.length == 0){
     return 1;
   }

  // put all the object in the right order
  ages = ["5-14 years", "15-24 years", "25-34 years", "35-54 years", "55-74 years", "75+ years"];
  objects_interest_order = [];
  for(i = 0; i < ages.length; i++){

    // from lowest ages to highest age
    age = ages[i];
    for(j = 0; j < objects_interest.length ; j++){
      if (objects_interest[j].age == age && objects_interest[j].sex == 'male'){
        objects_interest_order.push(objects_interest[j])
      }
    }

    // pair objects for male and female
    for(j = 0; j < objects_interest.length ; j++){
      if (objects_interest[j].age == age && objects_interest[j].sex == 'female'){
        objects_interest_order.push(objects_interest[j])
      }
    }
   }

   // add colour to objects, depending on gender
   for(i = 0; i < objects_interest_order.length ; i++){
     objects_interest_order[i].label = i;
     if (objects_interest_order[i].sex == 'male'){
       objects_interest_order[i].colour = 'blue'
     }
     if (objects_interest_order[i].sex == 'female'){
       objects_interest_order[i].colour = 'skyblue'
     }
   }
   return objects_interest_order
}


// function to determine if integer is zero/even
function ifevenorzero(n){
  if (n == 0){
    return 1
  }

  else{
    if(n % 2 == 0 ){
      return 1;
    }
    else{
      return 0;
    }
  }
};


// replace graph with a notice
function noDataAvailable(){
  var margin = {top: 100, right: 80, bottom: 90, left: 120};
  var w = 350;
  var h = 200;
  var barPadding = 0.5;

  // create new SVG element
  var svg = d3v5.select("#container")
              .append("svg")
              .attr("id","graph")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // append no data text to the svg element
  svg.append("text")
      .attr("x", (w / 2))
      .attr("y", 40 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("no suicide data avaibale  " + country);
}

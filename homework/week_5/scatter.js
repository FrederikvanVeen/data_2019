const gdpMax = 20000000;
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

function userselected() {
  d3.selectAll("svg").remove();

  var selectedValue1 = document.getElementById("selectData1").value
  var selectedValue2 = document.getElementById("selectData2").value

  var requests = [d3.json(selectedValue1), d3.json(selectedValue2)];
  Promise.all(requests).then(function(response) {

    var data1 = response[0];
    var data2 = response[1];

    mergedObjects = mergeDataAverage(data1, data2);

    drawScatterplot(mergedObjects, 400, 400);
    drawLegend(mergedObjects, 500);

  }).catch(function(e){
      throw(e);
  });

};

// functions for average data
function averageDatapoints(data){
  var values = Object.values(data);
  var averageArray = [];
  values.forEach(function(element) {
    var average = 0;
    element.forEach(function(item, index, array) {

      // determine datalabel
      keys = Object.keys(item);
      keys.forEach(function(element){
        if (element == 'Indicator'){
          datalabel = item.Indicator;
        }
        else if (element == 'Transaction'){
          datalabel = 'GDP';
        }
      })

      var length = array.length;
      average += item["Datapoint"];

      if (index == length - 1){
        var object = {Country: item.Country, averageDatapoint: (average/array.length), Datalabel: datalabel};
        if (datalabel == "GDP" && object.averageDatapoint < gdpMax){
          object.averageDatapoint = object.averageDatapoint/1000000;
          averageArray.push(object);
        }
        if (datalabel == "Total international arrivals"){
          object.averageDatapoint = object.averageDatapoint/1000000;
          averageArray.push(object);
        }
        if (datalabel == "Purchasing Power Parities"){
          averageArray.push(object);
        }

      }
    });
  });
  return averageArray;
};


function mergeDataAverage(data1, data2){

  data1_array = averageDatapoints(data1);
  data2_array = averageDatapoints(data2);

  var mergedObjects = [];
  for(i = 0; i < data2_array.length; i++){
    for(j = 0; j < data1_array.length; j++){
      if(data1_array[j].Country == data2_array[i].Country){
        var object = {Country: data1_array[j].Country, xLabel: data1_array[j].Datalabel, xPoint: data1_array[j].averageDatapoint, yLabel: data2_array[i].Datalabel, yPoint: data2_array[i].averageDatapoint};
        mergedObjects.push(object);
      }
    };
  };
  return mergedObjects;
};


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function drawScatterplot(dataset, height, width){

  dataset.forEach(function(item, index, array){
    item.Colour = colorArray[index];
  })

  // margin for svg element
  var margin = {top: 40, right: 20, bottom: 60, left: 70};

  // create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);


  var xScale = d3.scaleLinear()
    .domain([d3.min(dataset, function(d) { return d.xPoint; }), d3.max(dataset, function(d) { return d.xPoint; })])
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(dataset, function(d) { return d.yPoint; }), d3.max(dataset, function(d) { return d.yPoint; })])
    .range([height, 0]);

  var xLabel = dataset[0].xLabel;
  var yLabel = dataset[0].yLabel;

  if (xLabel[0] == 'G'){
    xLabel += ' (10e9 Dollars)'
  }
  if (yLabel[0] == 'G'){
    yLabel += ' (10e9 Dollars)'
  }

  if (xLabel[0] == 'T'){
    xLabel += ' (10e6)'
  }
  if (yLabel[0] == 'T'){
    yLabel += ' (10e6)'
  }

  // x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+ 0 +"," + height + ")")
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .attr("transform", "rotate(0)")
    .attr("y", 20)
    .attr("x", width-60)
    .attr("dy", ".70em")
    .text(xLabel)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.50em")
      .attr("transform", "rotate(-90)")

  // y-axis
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("dy", ".70em")
    .text(yLabel);

  // graph title
  svg.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text(dataset[0].yLabel + " vs " + dataset[0].xLabel);

  // draw the dots for scatter
  svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr("cx", function(d) {
        return xScale(d.xPoint);
    })
   .attr("cy", function(d) {
      return yScale(d.yPoint);
    })
   .attr("r", 5)
   .attr("fill", "teal")
   .attr("class", "bar")
   .style("fill", function(d) { return d.Colour; })
   .on('mouseover', d => {
     div
       .transition()
       .duration(200)
       .style('opacity', 0.9);
     div
       .html("<strong>x:</strong> <span style='color:red'>" + d.xPoint.toFixed(2) + "<br/>" +
       "<span style='color:white'><strong>y:</strong> <span style='color:red'>" + d.yPoint.toFixed(2))
       .style('left', d3.event.pageX + 'px')
       .style('top', d3.event.pageY - 60 + 'px');
   })
   .on('mouseout', () => {
     div
       .transition()
       .duration(500)
       .style('opacity', 0);
   });

   // get regression coefficients and max value and draw
   var regressionCoeffs  = giveRegressionCoeffs(dataset);
   var xMax = xScale(d3.max(dataset, function(d) { return d.xPoint; }));
   var a = regressionCoeffs[0];
   var b = regressionCoeffs[1];
   svg.append("line")
    .attr("x1", 0)
    .attr("y1", a * xMax)
    .attr("x2", xMax)
    .attr("y2", b)
    .attr("stroke-width", 2)
    .attr("stroke", "grey");


   svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", width + 50)
    .attr("y", function(d, i) {
       return (height - 200  - (i * 10));
     })
    .attr("width", 20)
    .attr("height", 10)
    .attr("fill", function(d){
      return d.Colour;
    })

}


function drawLegend(dataset, height, width){

  // create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width )
              .attr("height", height)
              .attr('class', 'AAP')
              .append("g")

  svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", 50)
   .attr("y", function(d, i) {
      return (height - 20 -  (i * 15));
    })
   .attr("width", 20)
   .attr("height", 10)
   .attr("fill", function(d){
     return d.Colour;
   })

   svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .attr("x", 75)
    .attr("y", function(d, i) {
       return (height - 10 - (i * 15));
     })
    .attr("width", 20)
    .attr("height", 10)
    .text(function(d){
       return d.Country;
     });
  }

function giveRegressionCoeffs(dataset) {
  var sumx = 0;
  var sumy = 0;
  var sumxy = 0;
  var sumxx = 0;

  var setLength = dataset.length;

  var x = 0;
  var y = 0;
  for (var i = 0; i < setLength; i++) {
      x = dataset[i].xPoint;
      y = dataset[i].yPoint;
      sumx += x;
      sumy += y;
      sumxx += x*x;
      sumxy += x*y;
  }

  var a = (setLength*sumxy - sumx*sumy) / (setLength*sumxx - sumx*sumx);
  var b = (sumy/setLength) - (a*sumx)/setLength;

  return [a, b];
};

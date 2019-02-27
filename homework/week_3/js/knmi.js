// dimension of chart differ from total canvas
var chart_start = 25
var chart_width = 400;
var chart_height = 400;

/* Transform function to map the datapoints to the correct location on the canvas.
The transformation function depends on the domain of the datapoints and the range of the canvas.*/
function createTransform(domain, range){

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
    var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}

/* Draws grid, axis, axis-ticks and axis titles for the chart on the canvas. */
draw_axis = function(){

  var canvas=document.getElementById("LineChart");
  var ctx = canvas.getContext("2d");

  // grid size corresponding to month
  var grid_size = chart_width/12
  var x_axis_distance_grid_lines = 12;
  var y_axis_distance_grid_lines = 12;
  var x_axis_starting_point = { number: 1, suffix: '\u03a0' };
  var y_axis_starting_point = { number: 1, suffix: '' };

  // canvas width
  var canvas_width = canvas.width;
  // canvas height
  var canvas_height = canvas.height;

  // number of vertical grid lines
  var num_lines_x = 12;
  // number of horizontal grid lines
  var num_lines_y = 12;


  // Draw grid lines along X-axis
  for(var i=0; i <= num_lines_x; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;

      // If line represents X-axis draw in different color
      if(i == x_axis_distance_grid_lines)
          ctx.strokeStyle = "#000000";
      else
          ctx.strokeStyle = "#e9e9e9";

      // draw horizontal lines at at distance of grid sizes
      ctx.moveTo(0, grid_size*i);
      ctx.lineTo(num_lines_x* grid_size, grid_size*i);
      ctx.stroke();
  }

  // Draw grid lines along Y-axis
  for(i=0; i<=num_lines_y; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;

      // If line represents Y-axis draw in different color
      if(i == y_axis_distance_grid_lines)
          ctx.strokeStyle = "#000000";
      else
          ctx.strokeStyle = "#e9e9e9";

      // draw vertical lines at at distance of grid sizes
      ctx.moveTo(grid_size*i, 0);
      ctx.lineTo(grid_size*i, num_lines_y* grid_size);
      ctx.stroke();
  }

  // draw ticks on x-axis
  graph_dates = ['1 jan', '1 feb', '1 mar', '1 apr', '1 may', '1 jun', '1 jul', '1 aug', '1 sept', '1 oct', '1 nov', '1 dec']
  for(var i=0; i<num_lines_x; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";

    // for dates tick match the location of vertical grid lines
    ctx.moveTo(grid_size*i, num_lines_x*grid_size);
    ctx.lineTo(grid_size*i, num_lines_x*grid_size-3);
    ctx.stroke()
    ctx.font = "10px Arial";
    ctx.fillText(graph_dates[i], grid_size*i, num_lines_x*grid_size + 7.5);
  }

  // domain of temperatures and corresponding transform function
  max_temp = 35.7;
  min_temp = -4,5;
  transform_temperature = createTransform([min_temp, max_temp], [0, chart_height])

  // temperatures for on axis
  temperatures = [0, 5, 10, 15, 20, 25, 30, 35]

  // draw ticks for y-axis (temperatures) at right height
  for (var i = 0; i < temperatures.length; i++){

    // determine right location on screen for tick with transform and draw tick
    var temp_tick_screen = transform_temperature(temperatures[i]);
    ctx.beginPath();
    ctx.moveTo(chart_width, chart_height - temp_tick_screen);
    ctx.lineTo(chart_width-3, chart_height - temp_tick_screen);
    ctx.stroke()

    // write corresponding temperature
    ctx.font = "10px Arial";
    ctx.fillText(temperatures[i], chart_width+3, chart_height - temp_tick_screen);
  }

  // write name of x-axis
  ctx.font = "17.5px Arial Bold";
  ctx.fillText('month', 0, num_lines_x*grid_size + 23);

  // write name of y-axis vertically
  ctx.save();
  ctx.translate(chart_width + 25, 120);
  ctx.rotate(-0.5*Math.PI);
  ctx.font = "17px Arial Bold";
  ctx.fillText('temperature (C)', 0, 0);
  ctx.restore()

}



var fileName = "KNMI_SCHIPHOL_2018.json";
var txtFile = new XMLHttpRequest();

txtFile.onreadystatechange = function() {

  // list to push info from json objects in
  var dates = [];
  var max_temperatures = [];

  if (txtFile.readyState === 4 && txtFile.status == 200) {
    var json = JSON.parse(txtFile.responseText);

    // loop through every object in json
    json.forEach(function(element) {

      // add every maximum temperature to list
      max_temperatures.push(element['TX']/10);

      // add every corresponding date in yyyy-mm-dd format
      var date = new Date(element['YYYYMMDD'].substr(0, 4) + '-' + element['YYYYMMDD'].substr(4,2) + '-' + element['YYYYMMDD'].substr(6, 2));
      dates.push(date)
    });

    const canvas = document.getElementById('LineChart');
    const ctx = canvas.getContext('2d');

    // create transform functions
    transform_function_x1 = createTransform([Math.min.apply(null, dates), Math.max.apply(null, dates)], [0, chart_width])
    transform_function_y1 = createTransform([Math.min.apply(null, max_temperatures), Math.max.apply(null, max_temperatures)], [0, chart_height])

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";

    // draw lines from datapoint to datapoint
    for (var i = 0; i < dates.length; i++){

      // determine right locations on screen for datapoints
      var date_screen = transform_function_x1(dates[i])
      var max_temperature_screen = transform_function_y1(max_temperatures[i])
      ctx.lineTo(date_screen, chart_height - max_temperature_screen)
    }

    ctx.stroke();

  }
}

txtFile.open("GET", fileName);
txtFile.send();
draw_axis();

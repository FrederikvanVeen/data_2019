
var canvas=document.getElementById("LineChart");
var ctx = canvas.getContext("2d");

var grid_size = 36.3;
var x_axis_distance_grid_lines = 11;
var y_axis_distance_grid_lines = 0;
var x_axis_starting_point = { number: 1, suffix: '\u03a0' };
var y_axis_starting_point = { number: 1, suffix: '' };


// canvas width
var canvas_width = canvas.width;
// canvas height
var canvas_height = canvas.height;

// no of vertical grid lines
var num_lines_x = Math.floor(canvas_height/grid_size);
console.log(num_lines_x);
// no of horizontal grid lines
var num_lines_y = Math.floor(canvas_width/grid_size);


// Draw grid lines along X-axis
for(var i=0; i <= num_lines_x; i++) {
    ctx.beginPath();
    ctx.lineWidth = 1;

    // If line represents X-axis draw in different color
    if(i == x_axis_distance_grid_lines)
        ctx.strokeStyle = "#000000";
    else
        ctx.strokeStyle = "#e9e9e9";

    if(i == num_lines_x) {
        ctx.moveTo(0, grid_size*i);
        ctx.lineTo(canvas_width, grid_size*i);
    }
    else {
        ctx.moveTo(0, grid_size*i);
        ctx.lineTo(num_lines_x* grid_size, grid_size*i);
    }
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

    if(i == num_lines_y) {
        ctx.moveTo(grid_size*i, 0);
        ctx.lineTo(grid_size*i, canvas_height);
    }
    else {
        ctx.moveTo(grid_size*i+0.5, 0);
        ctx.lineTo(grid_size*i+0.5, num_lines_y* grid_size);
    }
    ctx.stroke();
}



// draw ticks on x-axis
graph_dates = ['1 jan', '1 feb', '1 mar', '1 apr', '1 may', '1 jun', '1 jul', '1 aug', '1 sept', '1 oct', '1 nov', '1 dec']
for(var i=0; i<=num_lines_x; i++) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.moveTo(grid_size*i, num_lines_x*grid_size);
  ctx.lineTo(grid_size*i, num_lines_x*grid_size-3);
  ctx.stroke()
  ctx.font = "10px Arial";
  ctx.fillText(graph_dates[i], grid_size*i, num_lines_x*grid_size + 7.5);
}

// draw ticks on y-axis
for(var i=0; i<=num_lines_y; i++) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.moveTo(0, grid_size*i);
  ctx.lineTo(3, grid_size*i);
  ctx.stroke()
}


var dates = [];
var max_temperatures = [];
var object_list = [];
var data_points = [];
var humidity =[];

var fileName = "KNMI_SCHIPHOL_2018.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    var json = JSON.parse(txtFile.responseText);

    // loop through every object in json
    json.forEach(function(element) {
      // add every minimum temperature to list
      max_temperatures.push(element['TX']);
      // add every corresponding date in yyyy-mm-dd format
      var date = new Date(element['YYYYMMDD'].substr(0, 4) + '-' + element['YYYYMMDD'].substr(4,2) + '-' + element['YYYYMMDD'].substr(6, 2));
      dates.push(date)
      // add corresponding date en temperature as objects
      data_points.push({x: date.getTime(),
                        y: element['TX']/10});

    });

    const canvas = document.getElementById('LineChart');
    const ctx = canvas.getContext('2d');

    // // draw ticks on y-axis
    // var range_temp = Math.max.apply(null, max_temperatures) - Math.min.apply(null, max_temperatures);
    // for(var i=0; i<=range_temp; i = 1 + 0.5) {
    //   ctx.beginPath();
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = "#000000";
    //   ctx.moveTo(0, grid_size*i);
    //   ctx.lineTo(3, grid_size*i);
    //   ctx.stroke();
    // }

    function createTransform(domain, range){
      // domain is a two-element array of the data bounds [domain_min, domain_max]
      // range is a two-element array of the screen bounds [range_min, range_max]
      // this gives you two equations to solve:
      // range_min = alpha * domain_min + beta
      // range_max = alpha * domain_max + beta
          // a solution would be:

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

    transform_function_x1 = createTransform([Math.min.apply(null, dates), Math.max.apply(null, dates)], [0, 400])
    transform_function_y1 = createTransform([Math.min.apply(null, max_temperatures), Math.max.apply(null, max_temperatures)], [0, 400])

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";

    for (var i = 0; i < dates.length; i++){
      var date_screen = transform_function_x1(dates[i])
      var max_temperature_screen = transform_function_y1(max_temperatures[i])
      ctx.lineTo(date_screen, 400 - max_temperature_screen)
    }

    ctx.stroke();

  }
}
txtFile.open("GET", fileName);
txtFile.send();

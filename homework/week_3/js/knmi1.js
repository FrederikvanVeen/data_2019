
var c1=document.getElementById("LineChart1");
var ctx1 = c1.getContext("2d");

var c2=document.getElementById("LineChart2");
var ctx2 = c2.getContext("2d");

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
      humidity.push(element['UX'])
      // add every correspondin date in yyyy-mm-dd format
      var date = new Date(element['YYYYMMDD'].substr(0, 4) + '-' + element['YYYYMMDD'].substr(4,2) + '-' + element['YYYYMMDD'].substr(6, 2));
      dates.push(date)
      // add corresponding date en temperature as objects
      data_points.push({x: date.getTime(),
                        y: element['TX']/10});

    });
    console.log(humidity);
    const canvas1 = document.getElementById('LineChart1');
    const ctx1 = canvas1.getContext('2d');

    const canvas2 = document.getElementById('LineChart2');
    const ctx2 = canvas2.getContext('2d');

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

    transform_function_x1 = createTransform([Math.min.apply(null, dates), Math.max.apply(null, dates)], [0, canvas1.width])
    transform_function_y1 = createTransform([Math.min.apply(null, max_temperatures), Math.max.apply(null, max_temperatures)], [0, canvas1.height])

    transform_function_x2 = createTransform([Math.min.apply(null, dates), Math.max.apply(null, dates)], [0, canvas2.width])
    transform_function_y2 = createTransform([Math.min.apply(null, humidity), Math.max.apply(null, humidity)], [0, canvas2.height])
    ctx1.beginPath();
    ctx1.lineWidth = 1;


    for (var i = 0; i < dates.length; i++){
      var date_screen = transform_function_x1(dates[i])
      var max_temperature_screen = transform_function_y1(max_temperatures[i])
      ctx1.lineTo(date_screen, canvas1.height - max_temperature_screen)
    }

    ctx1.stroke();

    ctx2.beginPath();
    ctx2.lineWidth = 1;


    for (var i = 0; i < dates.length; i++){
      var date_screen = transform_function_x2(dates[i])
      var max_temperature_screen = transform_function_y2(humidity[i])
      ctx2.lineTo(date_screen, canvas2.height - max_temperature_screen)
    }

    ctx2.stroke();

  }
}
txtFile.open("GET", fileName);
txtFile.send();

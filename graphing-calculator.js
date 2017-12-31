var canvas = document.getElementById("grapharea");
var context = canvas.getContext("2d");
//Graph canvas size in pixels
var GRAPH_AREA_WIDTH = canvas.width;
var GRAPH_AREA_HEIGHT = canvas.height;
var GRIDS = 20;
var TOTAL_POINTS = 500;
var LINE_WIDTH = 4;
var FONT_TYPE = "20px Arial";
var COLOR_ORIGINAL_FUNCTION_CONCAVEUP = "#" + document.getElementById("origFunctionColorConcaveUp").color;
var COLOR_ORIGINAL_FUNCTION_CONCAVEDOWN = "#" + ('FFFFFF' - document.getElementById("origFunctionColorConcaveDown").color);
var COLOR_FIRST_DERIVATIVE =  "#" + document.getElementById("firstDerivativeFunctionColor").color;
var COLOR_SECOND_DERIVATIVE = "#" + document.getElementById("secondDerivativeFunctionColor").color;
var COLOR_POI = "#" + document.getElementById("poiColor").color;
var COLOR_EXTREMA = "#" + document.getElementById("extremaColor").color;
var COLOR_ASYMPTOTE = "#AA0088" ;

var deltaX = 0.02; // interval of X for each point
var colors = ["#00688B", "#660000", "#9900CC", "#E68A2E", "#006600", "#FF33CC"];
var currentColorIndex = 0;
var scale = 1;

// Initialize the graphing area, drawing coordinates plane
function init() {
    context.clearRect(0, 0, GRAPH_AREA_WIDTH, GRAPH_AREA_HEIGHT);

	COLOR_ORIGINAL_FUNCTION_CONCAVEUP = "#" + document.getElementById("origFunctionColorConcaveUp").color;
	COLOR_ORIGINAL_FUNCTION_CONCAVEDOWN = "#" + document.getElementById("origFunctionColorConcaveDown").color;
	COLOR_FIRST_DERIVATIVE =  "#" + document.getElementById("firstDerivativeFunctionColor").color;
	COLOR_SECOND_DERIVATIVE = "#" + document.getElementById("secondDerivativeFunctionColor").color;
	COLOR_POI = "#" + document.getElementById("poiColor").color;
	COLOR_EXTREMA = "#" + document.getElementById("extremaColor").color;

    drawCoordinate(scale);
}

function drawCoordinate(scale)
{
	var AXIS_COLOR = "#707070";
    var LINE_COLOR = "#c0c0c0";
    context.fillStyle = LINE_COLOR;

	// draw grids
    for (var i = 0; i < GRIDS; i++) {
        context.fillRect(GRAPH_AREA_WIDTH / GRIDS * i, 0, 1, GRAPH_AREA_HEIGHT);
        context.fillRect(0, GRAPH_AREA_HEIGHT / GRIDS * i, GRAPH_AREA_WIDTH, 1);
    }
	context.lineWidth = LINE_WIDTH;
    context.fillStyle = AXIS_COLOR;
	// draw x, y-axis
    context.fillRect(GRAPH_AREA_WIDTH / 2 - 2, 0, 4, GRAPH_AREA_HEIGHT);
    context.fillRect(0, GRAPH_AREA_HEIGHT / 2 - 2, GRAPH_AREA_WIDTH, 4);

	//label x, y axis
	context.font = FONT_TYPE;
	var label = GRIDS * scale / 2;
	var x = 2, y =2;
	for (var i = 0; i < GRIDS; i++) {
		context.font = FONT_TYPE;
		context.fillText(-label, x, GRAPH_AREA_HEIGHT / 2 + 20);
		if( label != 0)
		{
			context.fillText(label, GRAPH_AREA_WIDTH/2 + 5 , y + 10 );
		}
		x = x + GRAPH_AREA_WIDTH / GRIDS;
		y = y + GRAPH_AREA_HEIGHT / GRIDS;
		label = label -  scale;
	}
}

// functions for color selection event
function setColorForOriginalFunctionConcaveUp()
{
	COLOR_ORIGINAL_FUNCTION_CONCAVEUP = "#" + document.getElementById("origFunctionColorConcaveUp").color;
	draw();
}

function setColorForOriginalFunctionConcaveDown()
{
	COLOR_ORIGINAL_FUNCTION_CONCAVEDOWN = "#" + document.getElementById("origFunctionColorConcaveDown").color;
	draw();
}

function setColorForFirstDerivative()
{
	COLOR_FIRST_DERIVATIVE = "#" + document.getElementById("firstDerivativeFunctionColor").color;
	draw();
}

function setColorForSecondDerivative()
{
	COLOR_SECOND_DERIVATIVE = "#" + document.getElementById("secondDerivativeFunctionColor").color;
	draw();
}

function setColorForPOI()
{
	COLOR_POI = "#" + document.getElementById("poiColor").color;
	draw();
}

function setColorForExtrema()
{
	COLOR_EXTREMA = "#" + document.getElementById("extremaColor").color;
	draw();
}

// functions for zoom in and out event
function zoomOut()
{
	scale *= 2;
	draw();
}

function zoomIn()
{
	scale /= 2;
	draw();
}

// action for original functional input box 'enter' key click event
function getFunctionAndDraw(event) {
    if(event.keyCode == 13 ) {
        draw();
    }
}

// called by each user action for refreshing the graphing area
function draw() {
    init();
	var strFunction = document.getElementById("origFunction").value;
	if(strFunction != "")
		graphFunction(strFunction);
}

// main graphing function
function graphFunction(strFunction) {
    var prevX = NaN;
    var prevFirstDerivative = NaN;
    var prevSecondDerivative = NaN;
	var DELTA_X = (GRIDS * scale) * scale/ TOTAL_POINTS;
	var startIndex = - TOTAL_POINTS/2;
	var endIndex = TOTAL_POINTS/2;

    var prevY = NaN;
    var direction = NaN;
    var concavity = NaN;
    var numberOfReferencePoint = 0;

	strFunction = normalize(strFunction);
	var isTrig = isTrigFunction(strFunction);

	for (i = -TOTAL_POINTS; i < TOTAL_POINTS; i ++) {
        var x = i * (deltaX*scale);
	    var y = evalFunction(strFunction, x);

	//	var y1 = evalFunction(strFunction, Number.POSITIVE_INFINITY);
	//	var y2 = evalFunction(strFunction, Number.NEGATIVE_INFINITY);

		var y1 = evalFunction(strFunction, 1000000);
		var y2 = evalFunction(strFunction, -1000000);
		console.log("=========== y1, y2 ====== " + y1 + ", " + y2)

        var undefinedVal = false;
        if (!isFinite(y) || isNaN(y)) undefinedVal = true;

		// first derivative
        if (prevY != NaN) {
            var firstDerivative = (y - prevY) / (deltaX*scale);
            if (document.getElementById("cbxFirstDerivative").checked)
			{
				drawLineSegment(prevX, prevFirstDerivative, x, firstDerivative, COLOR_FIRST_DERIVATIVE);
			}
        }

		// Draw Vertical Asymptotes
	//	if( y == Infinity || (prevY != NaN && Math.abs(prevY -y) > 150))
		if( y == Infinity )
		{
			drawAsymptote(x, COLOR_ASYMPTOTE, 1, 'VERTICAL');
		}
		// Draw Horizontal Asymptotes
		if( !isTrig && y1 != NaN && y2 != NaN && !(y1 > 1000000) && !(y2 > 1000000) && Math.abs(y1-y2)< 0.0005)
		{
	//		console.log("HORIZZONTAL Asymptotes: == yLeft = " + y1 + " yRight = " + y2);
			drawAsymptote(y1, COLOR_ASYMPTOTE, 1, 'HORIZONTAL');
		}

		// Relative extremas
		if (document.getElementById("cbxExtrema").checked)
		{
			if (direction != NaN)
			{
				if(prevFirstDerivative!= NaN && firstDerivative != NaN
					&& prevFirstDerivative / firstDerivative < 0) {
					drawPoint(x, y, COLOR_EXTREMA, 7, true);
				}
			}
			if(isNaN(y) && prevY != NaN) {
				drawPoint(x, prevY, COLOR_EXTREMA, 8, false);
			}
		}

		// functional direction ( increasing or decreasing)
        if (firstDerivative != 0) direction = firstDerivative / Math.abs(firstDerivative);

		// second derivative
        if (prevFirstDerivative != NaN) {
            var secondDerivative = Math.round(((firstDerivative) - (prevFirstDerivative)) / (deltaX * scale) * 10000000) / 10000000;
            if (document.getElementById("cbxSecondDerivative").checked)
			{
				drawLineSegment(prevX, prevSecondDerivative, x, secondDerivative, COLOR_SECOND_DERIVATIVE);
			}
        }

		// remember derivative values for the last drawing point
    prevFirstDerivative = firstDerivative;
		prevSecondDerivative = secondDerivative;

		// Point of inflection
	    if (!undefinedVal) {
            if (!(secondDerivative == 0 && isNaN(concavity)) && secondDerivative / Math.abs(secondDerivative) != concavity) {
                 if (document.getElementById("cbxPOI").checked) {
                     if (numberOfReferencePoint > 2) {
						drawPoint(x, y, COLOR_POI, 7, true)
					 }
                     else numberOfReferencePoint++;
                 }
            }
        } else {
            numberOfReferencePoint = 0;
        }
        concavity = secondDerivative / Math.abs(secondDerivative);

		// draw original function
		color = COLOR_ORIGINAL_FUNCTION_CONCAVEUP;
		if(concavity != NaN)
		{
			if (concavity >= 0)
				color = COLOR_ORIGINAL_FUNCTION_CONCAVEUP;
			else
				color = COLOR_ORIGINAL_FUNCTION_CONCAVEDOWN;
		}
		drawLineSegment(prevX, prevY, x, y, color);

		prevX = x;
        prevY = y;

	}
}

function labelFunction(text, x, y, color)
{
	context.font = "30px Comic Sans MS";
	context.fillStyle = color;
	x=transformX(x);
	y=transformY(y);
	context.fillText(text , x, y);
}

// function of drawing the asymptote using given color and line width

function drawAsymptote(value, color, width, type)
{
	if(type == 'VERTICAL' )
	{
		drawDottedLineSegment(value, -200, value, 200, color, width);
	}
	else if(type == 'HORIZONTAL')
	{
		drawDottedLineSegment(-200, value, 200, value, color, width);
	}
}

// function of drawing a point (x1, y1)using given color and line width
function drawPoint(x, y, color, radius, fill) {
    if (color === undefined) color = colors[0];
    x = transformX(x);
    y = transformY(y);

	context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
	if(fill)
	{
		context.fillStyle = color;
		context.fill();
		context.lineWidth = 1;
    }
	else
	{
		context.lineWidth = 3;
	}
    context.strokeStyle = color;
    context.stroke();
}

// function of drawing a line segment from point (x1, y1) to (x2, y2) using given color and line width
function drawLineSegment(x1, y1, x2, y2, color, width) {
    if (color == undefined) color = colors[0];
    if (width == undefined) width = LINE_WIDTH;

	if(x1 != NaN && y1 != NaN && x1 != NaN && y2 != NaN && math.abs(y2-y1) < 10)
	{
		x1 = transformX(x1);
		y1 = transformY(y1);
		x2 = transformX(x2);
		y2 = transformY(y2);

		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);

		context.strokeStyle = color;
		context.lineWidth = width;
		context.stroke();
	}
}

function drawDottedLineSegment(x1, y1, x2, y2, color, width) {
    if (color == undefined) color = colors[0];
    if (width == undefined) width = LINE_WIDTH;

	if(x1 != NaN && y1 != NaN && x1 != NaN && y2 != NaN)
	{
		x1 = transformX(x1);
		y1 = transformY(y1);
		x2 = transformX(x2);
		y2 = transformY(y2);

		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);

		context.strokeStyle = color;
		context.lineWidth = width;
		context.stroke();
	}
}

// convert x from math value to graphic value in pixels
function transformX(x)
{
	return GRAPH_AREA_WIDTH * (0.5 + x / (GRIDS*scale));
}

// convert y from math value to graphic value in pixels
function transformY(y)
{
	return GRAPH_AREA_HEIGHT * (0.5 - y / (GRIDS*scale));
}

// function for evaluating y value given an x value, using third party math.js library
function evalFunction(strFunction, x)
{	var result = NaN;
	strFunction = strFunction.toLowerCase().replace(/x/g, "(" + x + ")");
	try{
		result = math.eval(math.eval(strFunction));
	}
	catch (e) {
		result = NaN;
	}
	return result;
}

function normalize(strFunction)
{
	strFunction = strFunction.toLowerCase();
	strFunction = strFunction.replace(/^\s+|\s+$/gm,'');
	// in math.js Math.log(x) = ln(x),
	// when given a log function with a different base, typed in function string as log(x, 10), log(x,2), etc
	if(strFunction == 'lnx' || strFunction == 'ln(x)')
		strFunction = 'log(x)';

	return strFunction;
}

function isTrigFunction(strFunction)
{
	if((strFunction.indexOf('sin') > -1)
		|| (strFunction.indexOf('cos') > -1)
		|| (strFunction.indexOf('tan') > -1)
		|| (strFunction.indexOf('cot') > -1)
		|| (strFunction.indexOf('sec') > -1)
		|| (strFunction.indexOf('csc') > -1))
		return true;
	else
		return false;
}

init();

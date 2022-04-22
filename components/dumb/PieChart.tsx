import BigNumber from 'bignumber.js'
import React from 'react'

var data = [
  {
   "name": "Value 1", 
   "color": "red", 
    "value": 180
  }, {
   "name": "Value 2", 
   "color": "rebeccapurple", 
    "value": 100
  }, {
   "name": "Value 3", 
   "color": "green", 
    "value": 135
  }, {
   "name": "Value 4", 
   "color": "pink", 
    "value": 230
  }, {
   "name": "Value 5", 
   "color": "blue", 
    "value": 90
  }
];

// Setup global variables
var svg = document.getElementById('pie-chart'),
    list = document.getElementById('pie-values'),
    totalValue = 0,
    radius = 100,
    circleLength = Math.PI * (radius * 2), // Circumference = PI * Diameter
    spaceLeft = circleLength;

// Get total value of all data.
for (var i = 0; i < data.length; i++) {
  totalValue += data[i].value;
}

// Loop trough data to create pie
for (var c = 0; c < data.length; c++) {
  
  // Create circle
  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  
  // Set attributes (self explanatory)
  circle.setAttribute("class", "pie-chart-value");
  circle.setAttribute("cx", 150);
  circle.setAttribute("cy", 150);
  circle.setAttribute("r", radius);
  
  // Set dash on circle
  circle.style.strokeDasharray = (spaceLeft) + " " + circleLength;
  
  // Set Stroke color
  circle.style.stroke = data[c].color;
  
  // Append circle to svg.
  svg.appendChild(circle);
  
  // Subtract current value from spaceLeft
  spaceLeft -= (data[c].value / totalValue) * circleLength;
  
  // Add value to list.
  var listItem = document.createElement('li'),
      valuePct = parseFloat((data[c].value / totalValue) * 100).toFixed(1);
  
  // Add text to list item
  listItem.innerHTML = data[c].name + ' (' + valuePct + '%)';
  
  // Set color of value to create relation to pie.
  listItem.style.color = data[c].color;
  
  // Append to list.
  list.appendChild(listItem);
}

export type PieChartItem = {
  value: BigNumber,
  color: string,
}

function PieChart({ items }: { items: PieChartItem[] }) {
  
}
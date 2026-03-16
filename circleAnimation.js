import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let dataset;
let svg;
let xScale;
let yScale;
let radiusScale;
let colorScale;
let continents, gdpExtent, lifeExpExtent, populationExtent;
 let xAxis;
 let yAxis;
 let yearText;
const width =  800;
const height = 600;
let circles = [];
const maxCircles = 10;

async function prepareVis() {
  const margin = { top: 10, right: 20, bottom: 100, left: 50 };

  dataset = await d3.csv("./dataset/gapminder_full.csv",d3.autoType);

  continents = new Set(dataset.map((d) => d.continent));
  gdpExtent = d3.extent(dataset, (d) => d.gdp_cap);
  lifeExpExtent = d3.extent(dataset, (d) => d.life_exp);
  populationExtent = d3.extent(dataset, (d) => d.population);

  console.log(dataset)

    svg = d3
    .select("#visContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");

  xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
  yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  radiusScale = d3.scaleLinear().range([5, 10]);
  colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  xScale.domain([0, gdpExtent[1]]);
  yScale.domain(lifeExpExtent);
  radiusScale.domain(populationExtent);
  colorScale.domain(continents);

    xAxis = svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`);

    xAxis.call(d3.axisBottom(xScale));

    yAxis = svg.append("g").attr("transform", `translate(${margin.left}, 0)`);

  yAxis.call(d3.axisLeft(yScale));

   svg
    .append("text")
    .attr("class", "yLabel")
    .attr("x", -300)
    .attr("y", 20)
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy");

  yearText = svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height / 2);

  svg
    .append("text")
    .attr("class", "xLabel")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 40)
    .text("GDP per Capita");

  // add legend for continents at the bottom center of the chart and add text
  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 60})`
    );

    svg
    .style("cursor", "crosshair");

  const legendSize = 20;
  const legendSpacing = 100;

  legend
    .selectAll("rect")
    .data(continents)
    .join("rect")
    .attr("x", (d, i) => i * legendSpacing)
    .attr("width", legendSize)
    .attr("height", legendSize)
    .attr("fill", (d) => colorScale(d));

  legend
    .selectAll("text")
    .data(continents)
    .join("text")
    .attr("x", (d, i) => i * legendSpacing + legendSize + 5)
    .attr("y", legendSize)
    .text((d) => d)
    .attr("fill", "black")
    .attr("font-size", "12px");

    svg.on("click", function(event) {

  const [x, y] = d3.pointer(event);
  circles.push({x: x, y: y});
  if (circles.length > maxCircles) {
    circles.shift();
  }

  updateCircles();
  });

}

async function runApp() {
  await prepareVis();
}

runApp();

function updateCircles(){

  const selection = svg
    .selectAll("circle")
    .data(circles);

  selection
    .join(
      enter => enter
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(500)
        .attr("r", 15),

      update => update,

      exit => exit
        .transition()
        .duration(300)
        .attr("r", 0)
        .remove()
    );
}

var element = document.getElementById('svg'), style = window.getComputedStyle(element), width = style.getPropertyValue('width');

width = width.substring(0, width.length-2);
width = Number(width);
width = Math.round(width);
console.log(width); 
var height = 500;

var tree = d3.layout.tree()
    .size([width, height-10]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) {console.log(d); return [d.x, d.y]; });

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,0)");

d3.json("./testdata/test3.json", function(error, root) {
  var nodes = tree.nodes(root);
  nodes[0].y = nodes[0].y + 20;
 
  for(var i = 0; i < nodes.length; i++)
    nodes[i].x = nodes[i].x - 65;
  
  var links = tree.links(nodes);

  console.log(nodes);
  console.log(links);
  
  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {console.log(d.x + " " + d.y); return "translate(" + d.x + "," + d.y + ")"; })

  node.append("circle")
      .attr("r", 8)
      .on("click", function(d){ $('#node_data').text(d.data); });

  node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; });
});

d3.select(self.frameElement).style("height", height + "px");



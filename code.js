// Env params
const padding = 30;
const container_width = 800;
const container_height = 900;
const svg_width = container_width*3 + padding*4;
const svg_height = container_height + padding*2;


// draw svg canvas
var svg = d3.select('#svg_chart').append('svg')
  .attr('width', svg_width)
  .attr('height', svg_height)
  .style("background", 'none');


// draw first container 
var container_1 = svg.append('rect')
  .attr('fill', '#e5d8d2')
  .attr('stroke', 'black')
  .attr('x', padding)
  .attr('y', padding)
  .attr('width', container_width)
  .attr('height', container_height)
 

// draw second container 
var container_2 = svg.append('rect')
.attr('fill', '#c5e3f6')
.attr('stroke', 'black')
.attr('x', container_width + padding*2)
.attr('y', padding)
.attr('width', container_width)
.attr('height', container_height);

// draw third container 
var container_3 = svg.append('rect')
  .attr('fill', '#9ad3be')
  .attr('stroke', 'black')
  .attr('x', container_width*2 + padding*3)
  .attr('y', padding)
  .attr('width', container_width)
  .attr('height', container_height);

// the group of matrix title
var name_group = svg.append("g")
  .attr("transform", "translate(0, " + padding*2/3 + ")");

// add title of first container 
name_group.append("text")
  .attr("class", "container_name")
  .attr("x", container_width/2 + padding)
  .text("Structure of program");
// add title of second container 
name_group.append("text")
  .attr("class", "container_name")
  .attr("x", container_width*3/2 + padding*2)
  .text("Graph View");
// add title of third container 
name_group.append("text")
  .attr("class", "container_name")
  .attr("x", container_width*5/2 + padding*3)
  .text("Performance Profile");

// first container canvas
var container_1_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*3/2}, ${padding*3/2})`);

// second container canvas
var container_2_plot = svg.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${padding*5/2 + container_width}, ${padding*3/2})`);

// third container canvas
var container_3_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*7/2 + container_width*2}, ${padding*3/2})`);

// drop down options
var options = ["top_5", "bottle_5", "top_vs_bottle"];

var dorp_down = d3.select("#drop_down")
  .selectAll("options")
  .data(options)
  .enter()
  .append("option")
  .attr("value", d => {return d;})
  .property("selected", d => {return d === options[0]})
  .text(d => 
  {
    return d[0].toUpperCase() + d.slice(1, d.length).split("_").join(" ");
  });
















// 1. TO DO: draw tree structure of the tree
var globalRoot;
// declares a tree 
var treemap = d3.tree().size([container_width - padding, container_height - padding]);

//tooltips for bar-chart and tree
var tip = d3.tip().attr('class','d3-tip')
    .html(d => {
      var text = "<strong>Name:</strong> <span style='color:#ff9f68'>" + d.data.task_name + "</span><br>";
      text += "<strong>Time:</strong> <span style='color:#ff9f68'>" + d.data.time + "</span><br>";
      if (d.data.children_count != 0){
        text += "<strong>Children:</strong> <span style='color:#ff9f68'>" + d.data.children_count+ "</span><br>";
      }
      if (d.data.tag != null){
        text += "<strong>Tag:</strong> <span style='color:#ff9f68'>" + d.data.tag + "</span><br>";
      }
      return text
    });

// Read Json file
d3.json("data/visual_sys.json").then( treeData => {
  // console.log(treeData); 
  // Assign parent, children, height, depth
  var root = d3.hierarchy(treeData, d => { return d.tasks; });
  root.x0 = container_height / 2;
  root.y0 = 0;

  globalRoot = root;
  // Assigns the x and y position for the nodes
  treeRoot = treemap(root);
  // draw tree
  draw_tree(treeRoot);

  draw_bars(root);
  // to get time time_data map()filter()
});











function draw_tree(root)
{
    // draw the links between the nodes
  var link = container_1_plot.selectAll(".link")
    .data( root.descendants().slice(1))
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d => {
      //look up d3 path format
      //write function to convert a start point and end point to this format
       return "M" + d.x + "," + d.y
         + "C" + d.x + "," + (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," + d.parent.y;
       });

  // draw nodes
  var node = container_1_plot.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", d => { 
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", d => {
      return "translate(" + d.x + "," + d.y + ")"; })

  // shows the task name but is too cluttered. revisit later
  // node.append("text")
  //   .text(d => d.data.task_name)
  //   .attr('dy', '0.32em');

  
  node.append("circle")
    .attr("r", 5)
    .data(root.descendants())
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', d => {
      draw_bars(d);

    });

  

  // Add text and tooltips for node and links
  // .......................................
  container_1_plot.call(tip);

    
  // Make the tree zoomable and collapsible
  // ......................................

}


// 2. TO DO: drop down event
d3.select("#drop_down").on("change", d => 
{
  var value = d3.select("#drop_down").property("value");
  console.log(value);
});

d3.select("#start_pro").on("input", graph_display);
d3.select("#end_pro").on("input", graph_display);

function graph_display()
{
  // Obtained value from input box
  var start_pro = d3.select("#start_pro").property("value");
  var end_pro = d3.select("#end_pro").property("value");
  console.log(start_pro);
  console.log(end_pro);
}








// 3. TO DO: draw graph (also need to consider the drop down value)

var transition = d3.transition().duration(500);

var y = d3.scaleBand()
      .range([(container_height - padding*2),0])
      .padding(0.2)

var x = d3.scaleLinear()
      .range([0, (container_width - padding *2)])
      

var z = d3.scaleOrdinal(d3.schemeSet2);
      

var x_axis = container_2_plot.append('g')
      .attr("transform", "translate(" + padding + ", " + (container_height - padding*2) + ")")
      
    
var y_axis = container_2_plot.append('g')
      .attr("transform", "translate(" + padding + ", 0)")

var x_label = container_2_plot.append("text")
    .attr("class", "axis_label")
    .attr("x", container_width/2)
    .attr("y", container_height - padding)
    .attr("text-anchor", "middle")
    .text("Time(s)");
    

var y_label = container_2_plot.append("text")
      .attr("class", "axis_label")
      .attr("x", -(container_width/2))
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")




      
// Draw bar chat
function draw_bars(data)
{

  //array storing all of the nodes time and name for a specific depth in order to extract their time data
  timeArray = []
  let timeObject = {};
  
  //upon clicking a node, this displays all of its siblings, shows how many siblings there are,
  //and stores all sibling nodes to access their time data conveniently
  globalRoot.descendants().forEach(node => {

    if(node.depth === data.depth){
      // console.log(node)
      if (timeObject[node.data.task_name] === undefined){
        timeObject[node.data.task_name] = node.data.time;
      }
      else if (timeObject[node.data.task_name] !== undefined){
        timeObject[node.data.task_name] += node.data.time;
      }
      
    }
  });

 timeArray.push(timeObject)
// keys for building stacked bars
 var keys = []
 for (key in timeObject){
  keys.push(key);
}


  //bar tooltips
  var barTip = d3.tip().attr('class','d3-tip')
  .html(d => {
    var text= "";
      text += "<strong>Name:</strong> <span style='color:#ff9f68'>" + d.key + "</span><br>";
      text += "<strong>Time:</strong> <span style='color:#ff9f68'>" + d[0].data[d.key].toFixed(2)+ "(s)" + "</span><br>";
    
    return text;
  });


  var currentDepth = data.depth;

  
  x.domain([0, globalRoot.data.time]);

  y.domain(timeArray.length);

  x_axis.call(d3.axisBottom(x));

  // draw y axis
  y_axis.call(d3.axisLeft(y));

  // y axis label
  y_label.text(`Level ${currentDepth}`);

  console.log(timeArray.length)

  var stackedBarData = d3.stack().keys(keys)(timeArray)


  var barContainer = container_2_plot.selectAll("rect").data(stackedBarData)

      barContainer.exit().remove()
    
      var barsEnter = barContainer.enter().append("rect")

      barsEnter
        .attr("fill", function(d) { return z(d.key); })
        .attr("y", function(d) { return y(d[keys]); })	    
        .attr("x", function(d) { return x(d[0][0])+ padding + 1; })
        .attr("width", function(d) { return x(d[0][1]) - x(d[0][0]); })
        .attr("height", y.bandwidth())
        .on('mouseover', barTip.show)
        .on('mouseout', barTip.hide);

      barContainer = barContainer.merge(barsEnter)

      barContainer.transition().duration(2000)
        .attr("fill", function(d) { return z(d.key); })
        .attr("y", function(d) { return y(d[keys]); })	    
        .attr("x", function(d) { return x(d[0][0])+ padding + 1; })
        .attr("width", function(d) { return x(d[0][1]) - x(d[0][0]); })
        .attr("height", y.bandwidth())

  

  //displays every node at a particular depth as an independent bar -- keeping this in case we need to use it for some reason in the future
  // var rects = container_2_plot.selectAll('rect')
  //   .data(timeObject)

  // //remove old bars
  // rects.exit().remove()


  // rects
  // .attr("x", padding)
  // .attr('y', (d,i) => {return y(i)})
  // .attr('height', y.bandwidth())
  // .attr('width', d => {
  //   return x(d.data.time)
  // })
  

  // rects
  // .enter()
  // .append("rect") // Add a new rect for each new elements
  //   .attr("x", padding)
  //   .attr('y', (d,i) => {return y(i)})
  //   .attr('height', y.bandwidth())
  //   .attr('class', "bar")
  //   .attr('width', d => {
  //     return x(d.data.time)
  //   })
  //   .attr('fill', 'blue')
  //   .style('opacity', '0.5')
  //   .on('mouseover', tip.show)
  //   .on('mouseout', tip.hide)
  
  container_2_plot.call(barTip)
} 









// 4. TO DO: Add profermance profile (This part you can design freely)


// All the code here is just for reference. You can change it freely. 














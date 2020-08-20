// Env params
const padding = 30;
const container_width = 800;
const container_height = 900;
const svg_width = container_width*3 + padding*4;
const svg_height = container_height + padding*2;
var start_pro = d3.select("#start_pro").property("value");
var end_pro = d3.select("#end_pro").property("value");
var globalKeys = []

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
.attr('fill', '#efecec')
.attr('stroke', 'black')
.attr('x', container_width + padding*2)
.attr('y', padding)
.attr('width', container_width*2)
.attr('height', container_height);

// draw third container 
// var container_3 = svg.append('rect')
//   .attr('fill', '#9ad3be')
//   .attr('stroke', 'black')
//   .attr('x', container_width*2 + padding*3)
//   .attr('y', padding)
//   .attr('width', container_width)
//   .attr('height', container_height);

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
  .attr("x", container_width*2 + padding*2)
  .text("Graph View");
// add title of third container 
// name_group.append("text")
//   .attr("class", "container_name")
//   .attr("x", container_width*5/2 + padding*3)
//   .text("Performance Profile");

// first container canvas
var container_1_plot = svg.append('g')
  .attr('class', 'container_1_plot')
  .attr('transform', `translate(${padding*3/2}, ${padding*3/2})`);

// second container canvas
var container_2_plot = svg.append('g')
  .attr('class', 'container_2_plot')
  .attr('transform', `translate(${padding*5/2 + container_width}, ${padding*3/2})`);

// third container canvas
// var container_3_plot = svg.append('g')
//   .attr('class', 'container_1_plot')
//   .attr('transform', `translate(${padding*7/2 + container_width*2}, ${padding*3/2})`);

// drop down options
var options = [" ", "best_to_worst", "worst_to_best", "best_5", "worst_5", "best_vs_worst"];


var drop_down = d3.select("#drop_down")
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

  var dropDownSelected = d3.select("#drop_down").property("value");












var levelButtonValue;
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

  root.descendants().forEach(node =>{
    node.data['expanded'] = false;
  })

 root.descendants()[0].data['expanded'] = true;

 

  globalRoot = root;

  globalRoot.data.tasks.forEach(task =>{
    globalKeys.push(task.task_name)
  })

  // Assigns the x and y position for the nodes
  treeRoot = treemap(root);
  // draw tree
  draw_tree(treeRoot);


 
});


var multipleProcess;
var barRoot;
d3.json("data/aggregated_perf_data.json").then( data => {
  
  // Assign parent, children, height, depth
  barRoot = d3.hierarchy( data, d => { return d.children; });
  
  multipleProcess = data;

  

  draw_bars(barRoot, start_pro, end_pro, dropDownSelected);

});



//updates when certain processes are selected
function graph_display()
  {
    // Obtained value from input box
    start_pro = d3.select("#start_pro").property("value");
    end_pro = d3.select("#end_pro").property("value");

    draw_bars(barRoot, start_pro, end_pro, dropDownSelected);
  }








function draw_tree(root)
{
  var i = 0;
    
  //comment in to make tree only show first two nodes
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeRoot.descendants(),
      links = treeRoot.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 120 });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = container_1_plot.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on('click', click);

// Add Circle for the nodes
nodeEnter.append('circle')
    .attr('class', 'node')
    .attr('r', 2)
    .style("fill", function(d) {
        return d._children ? "orange" : "#fff";
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', d => {
      
      if(d.data.expanded == false){
        d.data.expanded = true;

        var indexOfElement = globalKeys.indexOf(d.data.task_name)
        var childArray = []
        d._children.forEach(child =>{ childArray.push(child.data.task_name)})
    

        globalKeys.splice(indexOfElement,1)
        
        
        childArray.forEach(child =>{
          globalKeys.splice(indexOfElement,0, child)
          indexOfElement+=1
        })
      
      }

      else if(d.data.expanded == true){
        d.data.expanded = false;

        
        var indexOfElement = globalKeys.indexOf(d.children[0].data.task_name)
        console.log(indexOfElement)
    

        globalKeys.splice(indexOfElement,d.children.length, d.data.task_name)
        
      }

      
      console.log(d.data.expanded)
      
      
      
    
      if (d.children === undefined){
        alert("This node has no children. Please select another node.")
      }
      else{
        draw_bars(d, start_pro, end_pro, dropDownSelected)
      }

    });
    


// UPDATE
var nodeUpdate = nodeEnter.merge(node);

// Transition to the proper position for the node
nodeUpdate.transition()
  .duration(550)
  .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")";
   });

// Update the node attributes and style
nodeUpdate.select('circle.node')
  .attr('r', 5)
  .style("fill", function(d) {
      return d._children ? "lightblue" : "#fff";
  })
  .attr('cursor', 'pointer');


// Remove any exiting nodes
var nodeExit = node.exit().transition()
    .duration(550)
    .attr("transform", function(d) {
        return "translate(" + source.x + "," + source.y + ")";
    })
    .remove();

// On exit reduce the node circles size to 0
nodeExit.select('circle')
  .attr('r', 1e-6);

// On exit reduce the opacity of text labels
nodeExit.select('text')
  .style('fill-opacity', 1e-6);

// ****************** links section ***************************

// Update the links...
var link = container_1_plot.selectAll('path.link')
    .data(links, function(d) { return d.id; });

// Enter any new links at the parent's previous position.
var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d){
      var o = {x: source.x0, y: source.y0}
      return diagonal(o, o)
    });

// UPDATE
var linkUpdate = linkEnter.merge(link);

// Transition back to the parent element position
linkUpdate.transition()
    .duration(550)
    .attr('d', function(d){ return diagonal(d, d.parent) });

// Remove any exiting links
var linkExit = link.exit().transition()
    .duration(550)
    .attr('d', function(d) {
      var o = {x: source.x, y: source.y}
      return diagonal(o, o)
    })
    .remove();

// Store the old positions for transition.
nodes.forEach(function(d){
  d.x0 = d.x;
  d.y0 = d.y;
});

// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) {

  path = `M ${s.x} ${s.y}
          C ${(s.x + d.x) / 2} ${s.y},
            ${(s.x + d.x) / 2} ${d.y},
            ${d.x} ${d.y}`
  return path
}

// Toggle children on click.
function click(d) {
  if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  update(d);
}
}
// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}
  

  // Add text and tooltips for node and links
  // .......................................
  container_1_plot.call(tip);

    
  // Make the tree zoomable and collapsible
  // ......................................

}






// 2. TO DO: drop down event
d3.select("#drop_down").on("change", d => 
{
  dropDownSelected = d3.select("#drop_down").property("value");
  draw_bars(barRoot, start_pro, end_pro, dropDownSelected)
  

});














// 3. TO DO: draw graph (also need to consider the drop down value)

var transition = d3.transition().duration(300);

var y = d3.scaleBand()
      .range([0, (container_height - padding*2)])
      .paddingInner(0.2)
      .paddingOuter(0.2)

var x = d3.scaleLinear()
      .range([0, (container_width*2 - padding *2)])
      

var color = d3.scaleOrdinal().range(["#88d498", "#4dc32c", "#bef43d", "#387e73", "#33c199", "#87ff9d", "#2469ba", "#75cffa", 
"#bd5dfd", "#891bb0", "#f16391", "#feadc0", 
"#c6281c", "#f95a00", "#ff9e32", "#ffe07a"]);
      

var x_axis = container_2_plot.append('g')
      .attr("transform", "translate(" + padding + ", " + (container_height - padding*2) + ")")
      
    
var y_axis = container_2_plot.append('g')
      .attr("transform", "translate(" + padding + ", 0)")

var x_label = container_2_plot.append("text")
    .attr("class", "axis_label")
    .attr("x", container_width)
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
function draw_bars(data, start, end, drop_down)
{
  
  
  console.log(globalKeys)
  let timeArray = [];
  let timeObject = {};
  
  multipleProcess.forEach(process =>{
  
    

    var processHierarchy = d3.hierarchy( process.children, d => { return d.children; });
    timeObject['rank'] = process.rank;
    timeObject['totalTime'] = 0;


    processHierarchy.descendants().forEach(node => {
      
      globalKeys.forEach(key =>{
        if (node.data.task_name == key){
          timeObject['totalTime'] = node.data.time;
          timeObject[node.data.task_name] = node.data.time;
        }
      })
      // if node is main
      // if (node.parent ===  null && data.parent === null){

      //   timeObject['totalTime'] = node.data.time;

      //   node.children.forEach(child => {

      //     timeObject[child.data.task_name] = child.data.time;

      //   })
      // }

      // //if node is not main
      // else if (node.parent != null && data.parent != null){
        
      //   if (node.depth < 3){
      //     if(data.data.task_name === node.data.task_name && data.parent.data.task_name === node.parent.data.task_name){
      //       timeObject['totalTime'] += node.data.time;
      //       node.children.forEach(child => {
  
      //         timeObject[child.data.task_name] = child.data.time;
              
    
      //       })
      //     }

      //   }
      //   else{
      //     if(data.data.task_name === node.data.task_name && data.parent.parent.data.task_name === node.parent.parent.data.task_name){
      //       timeObject['totalTime'] = node.data.time;
      //       node.children.forEach(child => {

      //         timeObject[child.data.task_name] = child.data.time;

    
      //       })
      //     }
      //   }

      // }
  })

    timeArray.push(timeObject);
    timeObject = {}
})




if (start > timeArray[timeArray.length-1].rank || start < 0){
  alert('Chosen starting process out of range. Please choose a starting process within the range of your data.')
}

if (end > timeArray[timeArray.length-1].rank){
  alert('Chosen end process out of range. Please choose an end process within the range of your data.')
}









  
  //bar tooltips
  var barTooltip= ""

  var barTip = d3.tip().attr('class','d3-tip')
  .html(d => {
    var text = "";
    // if (d.key == undefined){
    //   time = +d[1]-d[0]
    //   text += "<strong>Time:</strong> <span style='color:#ff9f68'>" + time + "(s)" + "</span><br>";
    // }
    // else{
      text += "<strong>Name:</strong> <span style='color:#ff9f68'>" + d.key + "</span><br>";
    // }

    return text
  });
 
  
  




  // if there are no specific processes given, then just display all processes

  var newTime = [];
  timeArray.forEach(process => {
    if (process.rank >= start && process.rank <= end){
      newTime.push(process);
    }
  });



//changes the data set based on the dropdown option selected
if (drop_down === " "){
  newTime = newTime;
}
else if (drop_down === "best_to_worst"){
  newTime.sort((a, b) => d3.ascending(a.totalTime, b.totalTime))
}
else if (drop_down === "worst_to_best"){
  newTime.sort((a, b) => d3.descending(a.totalTime, b.totalTime))
}
else if (drop_down === "best_vs_worst"){
  if (newTime.length === 1){
    newTime = newTime
  }
  else{
    newTime.sort((a, b) => d3.ascending(a.totalTime, b.totalTime))
  tempTime = newTime
  newTime = [tempTime[0],tempTime[tempTime.length-1]]
  
  }
  
}
else if (drop_down === "best_5"){
  if (newTime.length < 5){
    alert("Less than 5 processes are selected. Please change the number of processes shown, or select a different menu option.")
    newTime = newTime;
  }
  else{
    newTime.sort((a, b) => d3.ascending(a.totalTime, b.totalTime))
    if (newTime.length === 5){
      newTime = newTime
    }
    else{
      newTime = newTime.slice(0,6)
    }
  }
}
else if (drop_down === "worst_5"){
  if (newTime.length < 5){
    alert("Less than 5 processes are selected. Please change the number of processes shown, or select a different menu option.")
    newTime = newTime;
  }
  else{
    newTime.sort((a, b) => d3.descending(a.totalTime, b.totalTime))
    if (newTime.length === 5){
      newTime = newTime
    }
    else{
      newTime = newTime.slice(0,6)
    }
  }
}

  var stackedBarData = d3.stack().keys(globalKeys)

  var currentDepth = data.depth;

  var currentNodeLabel;

  if (data.data.task_name === undefined){
    currentNodeLabel = data.data[0].children.task_name;
  }
  else{
    currentNodeLabel = data.data.task_name
  }

  x.domain([0, globalRoot.data.time]);

  y.domain(newTime.map(d => {return d.rank}));

  x_axis.call(d3.axisBottom(x));

  // draw y axis
  y_axis.call(d3.axisLeft(y));

  // y axis label
  y_label.text(currentNodeLabel);

  
  var layer = container_2_plot.selectAll(".layer")
  .data(stackedBarData(newTime))

  

  layer.exit().remove()

var bars = layer
  .enter().append("g")
  .attr("class", "layer")
  .on('mouseover', barTip.show)
  .on('mouseout', barTip.hide)
  .style("fill", function(d) { return color(d.key); })
  .merge(layer)
  .selectAll('rect')
  .data(function(d) { return d; });

bars.exit().remove()

bars
  .enter().append("rect")
    .attr('stroke', 'black')
    .attr("y", function(d) { if(newTime.length === 1){ return container_height/2 - 150 -padding} else{ return y(d.data.rank); }})
    .attr("x", function(d) { return x(d[0]) +padding + 1; })
    .attr("height", Math.min(y.bandwidth(), 300))
    .attr("width", function(d) { return x(d[1]) - x(d[0]) })
    // .on('mouseover', function(d)  {barTip.show})
    // .on('mouseout', barTip.hide)
     
    
   
    

bars.merge(bars)
.attr("y", function(d) { if(newTime.length === 1){ return container_height/2  - 150 -padding} else{ return y(d.data.rank); }})
    .attr("x", function(d) { return x(d[0]) +padding + 1; })
    .attr("height", Math.min(y.bandwidth(), 300))
    .attr("width", function(d) { return x(d[1]) - x(d[0]) })



 container_2_plot.call(barTip)
} 




//ALTERNATIVE VERSIONS OF THE BAR CHART
//*********************************************************************************************** */
// var bars = container_2_plot.selectAll("rect").data(stackedBarData(timeArray))



//       bars.exit().remove()
    
//       var barsEnter = bars.enter().append("rect")

//       barsEnter
//         .attr("fill", function(d) { return z(d.key); })
//         .attr("y", y(50))	    
//         .attr("x", padding + 1)
//         .attr("width", 0)
//         .attr("height", y.bandwidth())
//         .on('mouseover', barTip.show)
//         .on('mouseout', barTip.hide);

//       bars = bars.merge(barsEnter)

//       bars.transition().duration(1500)    
//         .attr("x", function(d) { return x(d[0][0])+ padding + 1; })
//         .attr("width", function(d) { return x(d[0][1]) - x(d[0][0]); })
//         .attr("height", y.bandwidth())

  

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



// 4. TO DO: Add profermance profile (This part you can design freely)


// All the code here is just for reference. You can change it freely. 














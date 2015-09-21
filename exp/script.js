function tree(){
    var svgW=958, svgH =460, vRad=12, tree={cx:300, cy:30, w:40, h:70};
    tree.vis={v:0, l:'?', p:{x:tree.cx, y:tree.cy},c:[]};   
    tree.size=1;
    tree.incMatx =[];
    tree.incX=500, tree.incY=30, tree.incS=20;
    
    tree.getVertices =  function(){
        var v =[];
        function getVertices(t,f){  
            v.push({v:t.v, l:t.l, p:t.p, f:f}); 
            t.c.forEach(function(d){ return getVertices(d,{v:t.v, p:t.p}); });
        }
        getVertices(tree.vis,{});
        return v.sort(function(a,b){ return a.v - b.v;});
    }
    
    tree.getEdges =  function(){
        var e =[];
        function getEdges(_){
            _.c.forEach(function(d){ e.push({v1:_.v, l1:_.l, p1:_.p, v2:d.v, l2:d.l, p2:d.p});});
            _.c.forEach(getEdges);
        }
        getEdges(tree.vis);
        return e.sort(function(a,b){ return a.v2 - b.v2;}); 
    }
    
    tree.addLeaf = function(_){
        function addLeaf(t){
            if(t.v==_){ t.c.push({v:tree.size++, l:'?', p:{},c:[]}); return; }
            t.c.forEach(addLeaf);
        }
        addLeaf(tree.vis);
        reposition(tree.vis);
        redraw();
    }

    tree.addManyLeaves = function(_) {
        function addLeaf(t){
            if(t.v==_){ t.c.push({v:tree.size++, l:'?', p:{},c:[]}); return; }
            t.c.forEach(addLeaf);
        }

        tree.vis = {
    'v': 0,
    'l': '?',
    'p': {
        'x': 300,
        'y': 30
    },
    'c': [{
        'v': 1,
        'l': '?',
        'c': [
        {
        'v': 5,
        'l': '?',
        'c': []
        },
        {
        'v': 5,
        'l': '?',
        'c': []
        },
        {
        'v': 5,
        'l': '?',
        'c': []
        }
        ]
    }, {
        'v': 2,
        'l': '?',
        'c': []
    }, {
        'v': 3,
        'l': '?',
        'c': []
    },  {
        'v': 4,
        'l': 'hi',
        'c': []
    }]
}
        reposition(tree.vis);
        redraw();
    }
    
    updateIncMatx = function(){
        var n = tree.size-1;
        tree.incMatx = d3.range(0,tree.size-1).map(function(){return 0;});
        updateIncMatxl = function(t){
            t.c.forEach(function(c){
                t.l < c.l ? tree.incMatx[t.l]= tree.incMatx[t.l] | (1<<(n-c.l)) : tree.incMatx[c.l]= tree.incMatx[c.l] | (1<<(n-t.l));
                updateIncMatxl(c);
            });
        }
        updateIncMatxl(tree.vis);       
    }
    
    getIncMatxRow = function(i){
        return d3.range(0,tree.size-1-i).map(function(d,j){ var n=tree.size-2-i-j; return (tree.incMatx[i] & 1<<n)>>n; });
    }
    
    redraw = function(){
        console.log(tree)
        var edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges());
        
        edges.transition().duration(500)
            .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
            .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;})
    
        edges.enter().append('line')
            .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
            .attr('x2',function(d){ return d.p1.x;}).attr('y2',function(d){ return d.p1.y;})
            .transition().duration(500)
            .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});
            
        var circles = d3.select("#g_circles").selectAll('circle').data(tree.getVertices()).enter().append("g");

        circles.transition().duration(500).attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;});
        
        circles.append('circle').attr('cx',function(d){ return d.f.p.x;}).attr('cy',function(d){ return d.f.p.y;}).attr('r',vRad)
            .transition().duration(500).attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;});

        circles.append("text"
            ).attr('dx', function(d) { return d.p.x - 4; }
            ).attr('dy', function(d) { return d.p.y + 5; }
            ).text(function(d) { return d.l; });

        d3.select('#incMatx').selectAll(".incrow").data(tree.incMatx)
            .enter().append('g').attr('class','incrow');
            
        d3.select('#incMatx').selectAll(".incrow").selectAll('.incRect')
            .data(function(d,i){ return getIncMatxRow(i).map(function(v,j){return {y:i, x:j, f:v};})})
            .enter().append('rect').attr('class','incRect');
            
        d3.select('#incMatx').selectAll('.incRect')
            .attr('x',function(d,i){ return (d.x+d.y)*tree.incS;}).attr('y',function(d,i){ return d.y*tree.incS;})
            .attr('width',function(){ return tree.incS;}).attr('height',function(){ return tree.incS;})
            .attr('fill',function(d){ return d.f == 1? 'black':'white'});
    }
    
    getLeafCount = function(_){
        if(_.c.length ==0) return 1;
        else return _.c.map(getLeafCount).reduce(function(a,b){ return a+b;});
    }
    
    reposition = function(v){
        var lC = getLeafCount(v), left=v.p.x - tree.w*(lC-1)/2;
        v.c.forEach(function(d){
            var w =tree.w*getLeafCount(d); 
            left+=w; 
            d.p = {x:left-(w+tree.w)/2, y:v.p.y+tree.h};
            reposition(d);
        });     
    }   
    
    initialize = function(){
        d3.select("body").append("div").attr('id','navdiv');
        
        d3.select("body").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg');

        d3.select("#treesvg").append('g').attr('id','g_lines').selectAll('line').data(tree.getEdges()).enter().append('line')
            .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
            .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});

        d3.select("#treesvg").append('g').attr('id','g_circles').selectAll('circle').data(tree.getVertices()).enter()
            .append('circle').attr('cx',function(d){ return d.p.x;}).attr('cy',function(d){ return d.p.y;}).attr('r',vRad)
          
           /* 
        d3.select("body").select("svg").append('g').attr('transform',function(){ return 'translate('+tree.incX+','+tree.incY+')';})
            .attr('id','incMatx').selectAll('.incrow')
            .data(tree.incMatx.map(function(d,i){ return {i:i, r:d};})).enter().append('g').attr('class','incrow');
*/

        tree.addManyLeaves(0);
    }
    initialize();
    return tree;
}

var tree= tree();

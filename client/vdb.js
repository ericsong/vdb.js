/* require: setServer, drawTree */

/* ideas generated by albert pan, eric song, kaushal parikh, ian lowinski, timothy yong */

var VDB_LIB = {};

VDB_LIB.server_name = "";

function TYPE(x) {
	if (x == null) {
		return "undefined";
	}
	if (typeof(x) != "object") {
		return typeof(x);
	} else {
		return Object.getPrototypeOf(x);
	}
}

function GRAPH_ARRAY(items, count, p) {
	var array_obj = [];
	var c = 0;
	for (var i in items) {
		var item = items[i];
		if (item == null) {
			continue;
		} else {
			if (TYPE(item) == TYPE([])) {
				var graphArray = GRAPH_ARRAY(item, count + 1, p);
				for (var n in graphArray[0]) {
					array_obj[c] = graphArray[0][n];
					c = c + 1;
				}
				count = graphArray[1];
			} else {
				if (TYPE(item) == TYPE(p)) {
					var graphNode = GRAPH_NODE(item, count);
					if (graphNode[0] != null) {
						array_obj[c] = graphNode[0];
						c = c + 1;
					}
					count = graphNode[1];
				}
			}
		}
	}
	if (array_obj.length == 0) {
		array_obj = null;
	}
	return [array_obj, count];
}

function GRAPH_NODE(curr, count) {
	var obj = {}, children = [], data = [];
	var c = 0, d = 0;
	var elements = Object.getOwnPropertyNames(curr);
	obj["name"] = "node" + count;
	for (var i in elements) {
		var element = elements[i];
		var ptr = curr[element];
		if (ptr == null) {
			continue;
		}
		if (TYPE(curr) == TYPE(ptr)) {
			var graphNode = GRAPH_NODE(ptr, count + 1);
			children[c] = graphNode[0];
			count = graphNode[1];
			c = c + 1;
		} else {
			if (TYPE(ptr) == TYPE([])) {
				var graphArray = GRAPH_ARRAY(ptr, count, curr);
				if (graphArray[0] != null) {
					//data[d] = graphArray[0];
					for (var n in graphArray[0]) {
						children[c] = graphArray[0][n];
						c = c + 1;
					}
				}
				count = graphArray[1];
			} else {
				data[d] = {"name": element, "value": ptr};
			}
			d = d + 1;
		}
	}
	obj["data"] = data;
	if (children.length != 0) {
		obj["children"] = children;
	}
	return [obj, count];
}

var REQ_OBJ = new XMLHttpRequest();

function setServer(servername) {
	VDB_LIB.server_name = servername;
}

function SEND_DATA(data) {
	if (VDB_LIB.server_name == "") {
		document.write("ERROR: SERVER UNKNOWN<br>");
		return;
	}
	REQ_OBJ.open("POST",VDB_LIB.server_name,true);
	REQ_OBJ.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	REQ_OBJ.send("JSON=" + data);
	WAIT_FOR_RESPONSE();
}

function WAIT_FOR_RESPONSE() {
	if (REQ_OBJ.readyState == 4) {
		console.log(REQ_OBJ.responseText);
	} else {
		setTimeout("WAIT_FOR_RESPONSE()", 100);
	}
}

function drawTree(obj) {
	var json = GRAPH_NODE(obj, 1);
	json = json[0];
	document.write(JSON.stringify(json) + "<br>");
	console.log(VDB_LIB.server_name);
	/*$.post( VDB_LIB.server_name, { data : JSON.stringify(json) }).done(function(data){
				console.log("request sent");
				console.log(data);
	});*/
	SEND_DATA(JSON.stringify(json));
}
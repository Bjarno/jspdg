var cnt = 0;

var PDG_Node = function (id) {
  this.id = id;
  this.cnt = cnt++;
  this.edges_in = [];
  this.edges_out = [];
  this.expression = [];
};
PDG_Node.prototype.add_edges_in = function(froms) {
    for(var i = 0; i < froms.length; i++)   
      this.edges_in.push(new PDG_Edge(froms[i], this));
};

PDG_Node.prototype.add_edges_out= function(tos) {
    for(var i = 0; i < tos.length; i++) {
      var totype = tos[i],
          e = new PDG_Edge(this,totype[0],totype[1]);
      this.edges_out.push(e);
      totype[0].edges_in.push(e);
    }
};

PDG_Node.prototype.add_edge_out = function(to,type,label) {
  var e = new PDG_Edge(this,to, type,label);
  this.edges_out.push(e);
  to.edges_in.push(e);
};

PDG_Node.prototype.remove_edge_out = function(to) {
	var idx = 0,
		outs = this.edges_out;
	while(idx < outs.length && !(outs[idx].to.equals(to))) {
		idx++;
	}
	this.edges_out = this.edges_out.slice(0,idx).concat(this.edges_out.slice(idx+1));
}

PDG_Node.prototype.equals = function(n) {
    return n.id === this.id;
};

PDG_Node.prototype.filter_out_nodes = function(f) {
	return this.edges_out.map(function(e) {
		return filter(e.to);
	})
};

PDG_Node.prototype.filter_in_nodes = function(f) {
	return this.edges_in.map(function(e) {
		return filter(e.from);
	})
};

PDG_Node.prototype.toString = function() {
	return this.id;
	
}

// Aux function
var contains = function(els,el) {
	return els.filter(function(e) {
		return e.equals(el)			
	}).length >= 1;
}


PDG_Node.prototype.pathExistsTo = function(to) {
	var out = this.edges_out.slice(),
	    visited = [],
	    found = false;
	while(out.length > 0) {
		var edge = out.shift(),
		    target = edge.to;
		if(to.equals(target)) {
			found = true;
			break;
		}
		else {
			var tout = target.edges_out;
			tout.map(function(e) {
				if(!(contains(visited,e))) {
					visited = visited.concat([e]);
					out = out.concat([e]);
				}
			})
		}
	}
	return found;
}


PDG_Node.prototype.dataDependentNodes= function() {
	var set = [],
	    data_out = this.edges_out.slice().filter(function (e) {
	    	return e.equalsType(EDGES.DATA)
	    })
	while(data_out.length > 0) {
		var e  = data_out.shift(),
		    to = e.to,
		    tout = to.edges_out.filter(function(e) {
		    	return e.equalsType(EDGES.DATA)
		    });
		    if(!(contains(set, to))) {
		    	set = set.concat([to]);
		    	data_out = data_out.concat(tout);
		    }
	}
	return set;

}

// entry nodes, denoted by "e+index". (Entry)
var EntryNode = function (id,parsenode) {
  PDG_Node.call(this,'e'+id);
  this.parsenode = parsenode;
  this.isEntryNode = true;
  this.isCalled = false;
  this.clientCalls = 0;
  this.serverCalls = 0;
};

EntryNode.prototype = new PDG_Node();

EntryNode.prototype.getFormalIn = function() {
    var edges = this.edges_out.filter(function(e) {
		return e.to.isFormalNode &&
		       e.to.direction === 1
	});
	return edges.map(function(e) {
		return e.to
	})
}

EntryNode.prototype.getFormalOut = function() {
	var edges = this.edges_out.filter(function(e) {
		return e.to.isFormalNode &&
		       e.to.direction === -1
	});
	return edges.map(function(e) {
		return e.to
	})
}

EntryNode.prototype.hasBody = function() {
	var edges = this.edges_out.filter(function(e) {
		return e.to.isStatementNode
	});
	return edges.length > 0
}

EntryNode.prototype.addCall = function(callnode) {
	this.isCalled = true;
	if(callnode.isServerNode())
		this.serverCalls += 1;
	else if(callnode.isClientNode())
		this.clientCalls += 1;
}

// Call nodes, denoted by "c+index". (Call)
var CallNode = function (id,parsenode) {
  PDG_Node.call(this, 'c'+id);
  this.parsenode = parsenode;
  this.isCallNode = true;
};

CallNode.prototype = new PDG_Node();

CallNode.prototype.getActualIn = function() {
	var edges = this.edges_out.filter(function(e) {
		return e.to.isActualPNode &&
			    e.to.direction === 1
	})
	return edges.map(function(e) {
		return e.to
	})
}

CallNode.prototype.getActualOut = function() {
	var edges = this.edges_out.filter(function(e) {
		return e.to.isActualPNode &&
			    e.to.direction === -1
	})
	return edges.map(function(e) {
		return e.to
	})
}

CallNode.prototype.getEntryNode = function() {
	var edges = this.edges_out.filter(function(e) {
		return e.to.isEntryNode &&
		       (e.equalsType(EDGES.CALL) ||
		       	e.equalsType(EDGES.REMOTEC))
	})
	return edges.map(function(e) {
		return e.to
	})
}

// Statement nodes, denoted by "s+index". (Statement)
var StatementNode = function (id, parsenode) {
  PDG_Node.call(this, 's'+id);
  this.parsenode = parsenode;
  this.isStatementNode = true;
};

StatementNode.prototype = new PDG_Node(); 


//Formal parameters (formal in and formal out)
// id + direction. 1 = formal in, -1 = formal out
var FormalPNode = function(id,name, direction) {
  PDG_Node.call(this, 'f'+id+'_'+ (direction == 1 ? 'in' : 'out'));
  this.direction = direction;
  this.name = name;
  this.isFormalNode = true;
}

FormalPNode.prototype = new PDG_Node();

// Actual paramaters (actual in and actual out)
// id + direction. 1 = actual in, -1 = actual out
ActualPNode = function(id, direction,parsenode,value) {
  PDG_Node.call(this, 'a'+id+'_'+ (direction == 1 ? 'in' : 'out'));
  this.direction = direction;
  this.isActualPNode = true;
  this.parsenode = parsenode;
  this.value = value;
}

ActualPNode.prototype = new PDG_Node();

//////////////////////////////////////////
//			Distributed nodes			//
//////////////////////////////////////////

var DNODES = {
	CLIENT : {value:0, name:"client"},
	SERVER : {value:1, name:"server"},
	SHARED : {value:2, name:"shared"}
}

DistributedNode = function(type) {
	PDG_Node.call(this, 'D'+type.name);
	this.type = type;
	this.isDistributedNode = true;
}

PDG_Node.prototype.isClientNode = function () {
	var dtype = this.getdtype();
	this.dtype = dtype;
	return dtype.value === DNODES.CLIENT.value
}

PDG_Node.prototype.isServerNode = function () {
	var dtype = this.getdtype();
	this.dtype = dtype;
	return dtype.value === DNODES.SERVER.value
}

PDG_Node.prototype.getdtype = function() {
	if(this.dtype) 
	  return this.dtype
	else{
		var incoming = this.edges_in.filter(function(e) {
			if (e.to.equals(e.from)) 
			  return false
			else if (e.to.parsenode && e.to.parsenode.type === "FunctionExpression" &&
			    e.from.parsenode && e.from.parsenode.type === "VariableDeclaration") 
				return true
		 	else 
			    return e.equalsType(EDGES.CONTROL)
		});
		var node;
		while(incoming.length > 0) {
			var edge = incoming.shift();
			node = edge.from;
			if (node.dtype)
			  break;
			var proceed = node.edges_in.filter(function(e) {
				if (e.to.equals(e.from))
				  return false;
				else if (e.to.parsenode.type === "FunctionExpression" &&
				    e.from.parsenode && e.from.parsenode.type === "VariableDeclaration") 
					return true
				else
					return e.equalsType(EDGES.CONTROL)
			})
			incoming = incoming.concat(proceed);
		}
		if(node) 
			return node.dtype;
		else
		    return false;
	}
}


DistributedNode.prototype = new PDG_Node();
var EDGES = {
  CONTROL  : {value:0, name: "control"},
  DATA     : {value:1, name: "data"},
  SUMMARY  : {value:2, name: "summary"},
  CALL     : {value:3, name: "call"},
  PARIN    : {value:4, name: "par-in"},
  PAROUT   : {value:5, name: "par-out"},
  REMOTED  : {value:6, name: "remote data"},
  REMOTEC  : {value:7, name: "remote call"}
};

function PDG_Edge(from,to,type,label) {
    this.from = from;
    this.to = to;
    this.type = type;
    label ? this.label = label : this.label = true;
}

PDG_Edge.prototype.equalsType = function(etype) {
  return this.type.value === etype.value
}


PDG_Edge.prototype.equals = function(e) {
  return Eq.equals(this.from, e.from) &&
         Eq.equals(this.to, e.to) &&
         this.type.value === e.type.value;
}

// Parameter passing
Parameter_Edge = function Parameter_Edge(from,to,value) {
   PDG_Edge.call(this, from, to, EDGES.PARBIND); 
   this.value = value;
}

Parameter_Edge.prototype = new PDG_Edge();

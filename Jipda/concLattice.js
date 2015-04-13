"use strict";

function ConcValue(value)
{
  this.value = value;
}

ConcValue.prototype.equals =
  function (x)
  {
    return (x instanceof ConcValue)
      && Object.is(this.value, x.value)
  }

ConcValue.prototype.hashCode =
  function ()
  {
    return HashCode.hashCode(this.value);
  }

ConcValue.prototype.addresses =
  function ()
  {
    return [];
  }

ConcValue.prototype.toString =
  function ()
  {
    return String(this.value);
  }

ConcValue.prototype.join =
  function (x)
  {
    throw new Error("cannot join concrete values " + this + " and " + x);
  }

ConcValue.prototype.subsumes =
  function (x)
  {
    return this.equals(x);
  }

ConcValue.prototype.ToString =
  function (x)
  {
    return new ConcValue(String(this.value));
  }

ConcValue.prototype.ToNumber =
  function (x)
  {
    return new ConcValue(Number(this.value));
  }

ConcValue.prototype.ToUint32 =
  function (x)
  {
    return new ConcValue(this.value >>> 0);
  }

ConcValue.prototype.isTruthy =
  function ()
  {
    return !!this.value;
  }

ConcValue.prototype.isFalsy =
  function ()
  {
    return !this.value;
  }

ConcValue.prototype.isTrue =
  function ()
  {
    return this.value === true;
  }

ConcValue.prototype.isFalse =
  function ()
  {
    return this.value === false;
  }

ConcValue.prototype.isRef =
  function ()
  {
    return false;
  }

ConcValue.prototype.isNonRef =
  function ()
  {
    return true;
  }

ConcValue.prototype.projectRef =
  function ()
  {
    return BOT;
  }

function ConcAddr(addr)
{
  this.addr = addr;
}

ConcAddr.prototype.equals =
  function (x)
  {
    return (x instanceof ConcAddr)
      && this.addr === x.addr
  }

ConcAddr.prototype.hashCode =
  function ()
  {
    var prime = 11;
    var result = 1;
    result = prime * result + this.addr.hashCode();
    return result;
  }

ConcAddr.prototype.addresses =
  function ()
  {
    return [this.addr];
  }

ConcAddr.prototype.toString =
  function ()
  {
    return String(this.addr);
  }

ConcAddr.prototype.join =
  function (x)
  {
    throw new Error("cannot join concrete addresses " + this + " and " + x);
  }

ConcAddr.prototype.subsumes =
  function (x)
  {
    return this.equals(x)
  }

ConcAddr.prototype.isTruthy =
  function ()
  {
    return true;
  }

ConcAddr.prototype.isFalsy =
  function ()
  {
    return false;
  }

ConcAddr.prototype.isTrue =
  function ()
  {
    return false;
  }

ConcAddr.prototype.isFalse =
  function ()
  {
    return false;
  }

ConcAddr.prototype.isRef =
  function ()
  {
    return true;
  }

ConcAddr.prototype.isNonRef =
  function ()
  {
    return false;
  }

ConcAddr.prototype.projectRef =
  function ()
  {
    return this;
  }

function ConcLattice()
{
}

ConcLattice.prototype.toString =
  function ()
  {
    return "ConcLattice";
  }

ConcLattice.prototype.abst =
  function (cvalues)
  {
    assertTrue(cvalues.length === 1);
    return this.abst1(cvalues[0]);
  }

ConcLattice.prototype.abst1 =
  function (value)
  {
    return new ConcValue(value);
  }

ConcLattice.prototype.abstRef =
  function (addr)
  {
    return new ConcAddr(addr);
  }

ConcLattice.prototype.add =
  function (x, y)
  {
    return new ConcValue(x.value + y.value); 
  }

ConcLattice.prototype.lt =
  function (x, y)
  {
    return new ConcValue(x.value < y.value);
  }

ConcLattice.prototype.lte =
  function (x, y)
  {
    return new ConcValue(x.value <= y.value);
  }

ConcLattice.prototype.gt =
  function (x, y)
  {
    return new ConcValue(x.value > y.value);
  }

ConcLattice.prototype.gte =
  function (x, y)
  {
    return new ConcValue(x.value >= y.value);
  }

ConcLattice.prototype.sub =
  function (x, y)
  {
    return new ConcValue(x.value - y.value);
  }

ConcLattice.prototype.mul =
  function (x, y)
  {
    return new ConcValue(x.value * y.value);
  }

ConcLattice.prototype.div =
  function (x, y)
  {
    return new ConcValue(x.value / y.value);
  }

ConcLattice.prototype.eqq =
  function (x, y)
  {
    if (x instanceof ConcAddr && y instanceof ConcAddr)
    {
      return new ConcValue(x.addr === y.addr);  
    }
    return new ConcValue(x.value === y.value);
  }

ConcLattice.prototype.eq =
  function (x, y)
  {
    return new ConcValue(x.value == y.value);
  }

ConcLattice.prototype.neq =
  function (x, y)
  {
    return new ConcValue(x.value != y.value);
  }

ConcLattice.prototype.binor =
  function (x, y)
  {
    return new ConcValue(x.value | y.value);
  }

ConcLattice.prototype.binxor =
  function (x, y)
  {
    return new ConcValue(x.value ^ y.value);
  }

ConcLattice.prototype.binand =
  function (x, y)
  {
    return new ConcValue(x.value & y.value);
  }

ConcLattice.prototype.shl =
  function (x, y)
  {
    return new ConcValue(x.value << y.value);
  }

ConcLattice.prototype.shr =
  function (x, y)
  {
    return new ConcValue(x.value >> y.value);
  }

ConcLattice.prototype.binnot =
  function (x)
  {
    return new ConcValue(~x.value);
  }

ConcLattice.prototype.neg =
  function (x)
  {
    return new ConcValue(-x.value);
  }

ConcLattice.prototype.sqrt =
  function (x)
  {
    return new ConcValue(Math.sqrt(x.value));
  }
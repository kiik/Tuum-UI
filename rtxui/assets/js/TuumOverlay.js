


var Tool = function() {
  this.mInput = null;
}

Tool.prototype.bind = function(Input) {
  this.mInput = Input;
}

Tool.prototype.unbind = function() {
  this.mInput = null;
}

Tool.prototype.run = function(ctx) {
  if(this.mInput == null) return;
  this.process(ctx);
}

Tool.typeIdSeq = 1;



var VectorPicker = function() {
  Tool.apply(this, arguments);
  this.typeId = VectorPicker.typeId;

  var mPos0 = null, mPos1 = null;
  this.onVectorCallback = function() {};
}

VectorPicker.prototype = Tool.prototype;
VectorPicker.prototype.constructor = VectorPicker;

VectorPicker.prototype.reset = function() {
  this.mPos0 = null;
  this.mPos1 = null;
}

VectorPicker.prototype.calcVector = function(p0, p1) {
  var dp = [p1[0] - p0[0], p1[1] - p0[1]];

  var l = Math.sqrt(Math.pow(dp[0], 2) + Math.pow(dp[1], 2));
  /*
  for(var i = 0; i < dp[0]; i++) {
    for(var j = 0; j < dp[1]; j++) {

    }
  }*/
  this.onVectorCallback(p0, p1, dp, l);

  return 0;
}

VectorPicker.prototype.onVector = function(cb) {
  this.onVectorCallback = cb;
}

VectorPicker.prototype.bind = function(Input) {
  this.mInput = Input;

  var that = this;
  Input.on('mousedown', function() {
    that.mPos0 = Input.getMousePos();
    that.mPos1 = null;
  });

  Input.on('mouseup', function() {
    that.mPos1 = Input.getMousePos();
    if(that.mPos0 == undefined) return;
    var res = that.calcVector(that.mPos0, that.mPos1);
    if(res < 0) {
      console.log("'calcVector' error " + res);
    }
  });

}

VectorPicker.prototype.unbind = function() {
  //TODO: Unload event handlers
}

VectorPicker.prototype.process = function(ctx) {
  if(this.mPos0 != null) {
    // Draw start position

    if(this.mPos1 == null) {
      // Draw vector to mouse pos
      var p = this.mInput.getMousePos();
      ctx.stroke(ctx.color(0, 0, 0));
      ctx.line(this.mPos0[0], this.mPos0[1], p[0], p[1]);
    } else {
      // Draw vector
      ctx.stroke(ctx.color(0, 255, 0));
      ctx.line(this.mPos0[0], this.mPos0[1], this.mPos1[0], this.mPos1[1]);
    }
  }
}

VectorPicker.prototype.typeId = Tool.typeIdSeq++;



function calcMousePos(c, e) {
  var rect = c.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

function calcCanvasPos(c, p) {
  var rect = c.getBoundingClientRect();
  return [rect.left - p[0], rect.top - p[1]];
}

var CanvasInputHandler = function(elem) {
  var mTarget = elem;
  var mPos = [0, 0];

  var cbMap = {

  };

  var keyMap = {

  };

  var that = this;

  mTarget.addEventListener('mousemove', function(evt) {
    mPos = calcMousePos(mTarget, evt);
    that.emit('mousemove', mPos);
  }, false);

  mTarget.addEventListener('mousedown', function(evt) {
    keyMap['LMB'] = true;
    mPos = calcMousePos(mTarget, evt);
    that.emit('mousedown');
  }, false);

  mTarget.addEventListener('mouseup', function(evt) {
    keyMap['LMB'] = false;
    mPos = calcMousePos(mTarget, evt);
    that.emit('mouseup');
  }, false);


  this.getMousePos = function() { return mPos; }

  this.getMouseDown = function(k) {
    if(!(keyMap[k].hasOwnProperty(k))) return false;
    return keyMap[k];
  }


  this.on = function(ev, cb) {
    for(var k in cbMap) {
      if(!(cbMap.hasOwnProperty(k))) continue;
      if(k != ev) continue;
      cbMap[ev].push(cb);
      return;
    }

    cbMap[ev] = [cb];
  }

  this.emit = function(ev, dat) {
    if(!(cbMap.hasOwnProperty(ev))) return;

    for(var cId = 0; cId < cbMap[ev].length; cId++) {
      var cb = cbMap[ev][cId];
      cb(dat);
    }
  }

  return this;
}



var TuumOverlay = function(canv, w = 1280, h = 720) {
  var mTarget = canv,
      mInput  = CanvasInputHandler(canv);

  var that = this, mCtx;
  function initPJS(ctx) {
    mCtx = ctx;

    ctx.draw = function() {
      that.draw(ctx);
    }

    that.updateDimensions();
  }

  this.getInput = function() { return mInput; }

  this.updateDimensions = function() {
    mCtx.size(w, h, Processing.P2D);
  }

  var mProcJS = new Processing(canv, initPJS);
  var tools = [];
  var toolId = null;

  function initTools() {
    var t = new VectorPicker();

    tools.push(t);
    that.selectTool(0);
  }

  this.draw = function(ctx) {
    ctx.background(0, 0, 0, 0.0);

    if(toolId != null) {
      tools[toolId].run(ctx);
    }
  }

  this.selectTool = function(id) {
    if(tools.length <= id) return -1;
    if(id < 0) return -2;
    toolId = id;
    tools[id].bind(mInput);
    return 0;
  }

  this.delectTool = function() {
    toolId = null;
  }

  this.findTool = function(ToolClass) {
    var tId = ToolClass.typeId;
    for(var ix=0; ix < tools.length; ix++) {
      if(tools[ix].typeId != tId) continue;
      return tools[ix];
    }
    return null;
  }

  this.getTool = function() {
    if(toolId == null) return null;
    return tools[toolId];
  }

  initTools();

  return this;
}

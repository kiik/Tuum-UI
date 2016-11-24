

var RtexFFUI = function(canv) {
  var mTarget = canv,
      mInput  = CanvasInputHandler(canv);

  canv.width = 640;
  canv.height = 480;

  this.worldToLocalX = 1;
  this.worldToLocalY = 1;

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
    mCtx.size(canv.width, canv.height, Processing.P2D);
  }

  var mProcJS = new Processing(canv, initPJS);

  this.entities = [{"id": 1, "pos": [100, 100]}];

  return this;
}

RtexFFUI.prototype.draw = function(ctx) {
  ctx.background(0, 0, 0, 0.0);

  ctx.fill(255, 125, 0);
  ctx.stroke(255);

  for(var i in this.entities) {
    var e = this.entities[i];
    ctx.ellipse(e.pos[0] * this.worldToLocalX, e.pos[1] * this.worldToLocalY, 10, 10);
  }
}


RtexFFUI.prototype.updateEntities = function(data) {
  this.entities = [];

  var C = 0.142857143;
  for(var i in data.entities) {
    var e = data.entities[i];

    e.pos[0] = e.pos[0] * C + 640 / 2;
    e.pos[1] = e.pos[1] * C + 480 / 2;

    this.entities.push(e);
  }
}

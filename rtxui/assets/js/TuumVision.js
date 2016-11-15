

var TuumVision = function(canvas, w, h) {
  this.mCanvas = canvas;
  this.mCtx = canvas.getContext('2d');

  var that = this;
  function init() {
    that.mCanvas.width = w;
    that.mCanvas.height = h;

    that.mCtx.beginPath();
    that.mCtx.rect(0, 0, w, h);
    that.mCtx.fillStyle = "green";
    that.mCtx.fill();
  }

  init();

  return this;
}

TuumVision.prototype.debugLine = function(p0, p1) {
  var v = [p1[0] - p0[0], p1[1] - p0[1]];

  this.mCtx.beginPath();
  this.mCtx.moveTo(p0[0],p0[1]);
  this.mCtx.lineTo(p0[0] + v[0], p0[1]);
  this.mCtx.lineTo(p0[0] + v[0], p0[1] + v[1]);
  this.mCtx.lineTo(p0[0], p0[1] + v[1]);
  this.mCtx.lineTo(p0[0], p0[1]);
  this.mCtx.stroke();
}

TuumVision.prototype.renderFrame = function(png_data) {
  this.mCtx.clearRect(0, 0, this.mCanvas.width, this.mCanvas.width);

  var img = new Image();
  img.onload = function() {
    this.mCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, baseCanv.width, baseCanv.height);
  }
  img.src = "data:image/png;base64," + png_data;
}

TuumVision.prototype.getPixelsOnLine = function(p0, p1) {
  var v = [p1[0] - p0[0], p1[1] - p0[1]];
  var x0 = Math.min(p0[0], p1[0]), y0 = Math.min(p0[1], p1[1]),
      x1 = Math.max(p0[0], p1[0]), y1 = Math.max(p0[1], p1[1]);

  var idat = this.mCtx.getImageData(x0, y0, Math.abs(v[0]), Math.abs(v[1]));

  var data = idat.data;
  var pxs = [];
  var dy = v[1] * 1.0 / v[0];

  var i;
  for(var y = 0, x = 0; x < (x1 - x0); x++, y = dy * x) {
    if(dy < 0) y = Math.abs(v[1]) + y;

    i = (Math.round(Math.abs(y)) * idat.width + x) * 4;

    pxs.push([data[i], data[i++], data[i++]]);
    data[i] = 255;
  }

  this.mCtx.putImageData(idat, x0, y0);
  return pxs;
}

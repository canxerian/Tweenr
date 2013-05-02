/**
 * Stage draws display objects
 */
var Stage = {}

/**
 * Array of objects to draw on the stage
 */
Stage._objects = [];

/**
 * Number of objects at the top of the objects array
 */
Stage._objectsOnTop = 0;

/**
 * Set widht
 */
Stage.setWidth = function(w) {
	Stage.width = w;
}

/**
 * Set height
 */
Stage.setHeight = function(h) {
	Stage.height = h;
}

Stage.setBackgroundImg = function(img) {
	if (!img || !(img instanceof Image)) 
		return;
	
	Stage.bg = img;
	
	var bgSize = {
		width: img.width, 
		height: img.height
	};
	
	// Scaling logic
	// how much has the height of the bg img been scaled to accomodate this screen size?
/*
	Stage.heightScaleFactor =  SCREEN_HEIGHT / bgSize.height;
	
	Stage.drawWidth = bgSize.width * Stage.heightScaleFactor;
	
	Stage.xOffset = (SCREEN_WIDTH - Stage.drawWidth) / 2;
*/
}

/**
 * Draw stage objects
 *
 * @param ctx {CanvasContext}
 */
Stage.draw = function(ctx) {
	if (ctx === undefined) 
		return;
	
	if (this._objects.length === 0)
		return;
	
	if (window.isManvas) {
		ctx.startFrame();
	}
	
	ctx.save();
	applyDrawMargins();
	applyScale();
	
	// draw the background
	if (window.isAppMobi) {
		ctx.globalAlpha = 1;
	} else if (window.isManvas) {
		ctx.setAlpha(1.0);
	}

	for (var i = 0, l = this._objects.length; i < l; i++) {
		var o = this._objects[i];
		
		ctx.save();
		
		o.draw(ctx);
		
		ctx.restore();
	}
	
	ctx.restore();
	ctx.present();
}

/**
 * Add a display object to the top of the draw stack, so that it is drawn
 * last (on top)
 * 
 * @param arguments [{DisplayObject}] object to be drawn on top.
 */
Stage.addDisplayObject = function() {
	if (arguments.length === 0) return;
	
	for (var i = 0, l = arguments.length; i < l; i++) { 
		var o = arguments[i];
		if (typeof o === "undefined" || o === null || typeof o.draw !== "function")
			 continue;
		
		// The index of the object being added
		var index = this._objects.indexOf(o);
		
		if (index === -1) {
			if (-Stage._objectsOnTop === 0) {
				this._objects.push(o);
			}
			else {
				this._objects.splice(-Stage._objectsOnTop, 0, o);
			}
		}
		else {
			// remove, then add to end of list
			this._objects.splice(index, 1);
			
			if (-Stage._objectsOnTop === 0) {
				this._objects.push(o);
			}
			else {
				this._objects.splice(-Stage._objectsOnTop, 0, o);
			}
		}
	}
}

/**
 * Add display object to the bottom of the object stack
 */
Stage.addDisplayObjectUnshift = function() {
	if (arguments.length === 0) return;
	
	for (var i = 0, l = arguments.length;  i < l; i++) { 
		var o = arguments[i];
		if (typeof o === "undefined" || o === null || typeof o.draw !== "function")
			 continue;
		
		// The index of the object being added
		var index = this._objects.indexOf(o);
		
		if (index === -1) {
			this._objects.unshift(o);
		}
	}
}

/**
 * Add a display object to the top make it stay there
 */
Stage.addDisplayObjectOnTop = function(o) {
	if (typeof o === "undefined" || o === null || typeof o.draw !== "function")
		 return;
	
	// The index of the object being added
	var index = this._objects.indexOf(o);
	
	if (index === -1) {
		this._objects.push(o);
		Stage._objectsOnTop++;
	}
	else {
		// remove, then add to end of list
		this._objects.splice(index, 1);
		this._objects.push(o);
	}
}

Stage.removeObject = function() {
	if (arguments.length === 0) return;
	
	for (var i = 0, l = arguments.length; i < l; i++) {
		var _i = this._objects.indexOf(arguments[i]);
		
		// not found
		if (_i === -1) { 
			continue;
		}
		// if index is within the top area of the array (where objects are always drawn on top)
		else if (_i >= Stage._objects.length - Stage._objectsOnTop) {
			this._objects.splice(_i, 1);
			Stage._objectsOnTop--;
		}
		else {
			this._objects.splice(_i, 1);
		}
	}
}

Stage.clear = function() {
	Stage._objects = [];
	Stage._objectsOnTop = 0;
	delete Stage.bg;
//	ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}
/**
 * A base for displaying object on the screen
 *
 * @param {Number} props.x
 * @param {Number} props.y
 * @param {Number} props.w
 * @param {Number} props.h
 * @param {Boolean} props.draggable
 */
function DisplayObject(props) {
	this._init(props);
}

DisplayObject.defaults =  {
	opacity: 1,
	draggable: false,
	scaleX: 1,
	scaleY: 1
}

DisplayObject.prototype._init = function(props) {
	for(var k in props) {
		this[k] = props[k];
	}
	
	// Set defaults
	for(var k in DisplayObject.defaults) {
	 	if (typeof this[k] === "undefined") {
		 	this[k] = DisplayObject.defaults[k];
	 	}
	}	
}

/**
 * Add image 
 * @param img {Image} 
 */
DisplayObject.prototype.addImage = function(img) {
	if (!img instanceof Image)
		return;
		
	// if only one image, set images to point to a single object
	if (typeof this.images === "undefined") {
		this.images = img;	
	}
	// otherwise create an array
	else {
		if (this.images instanceof Array) {
			this.images.push(img);	
		}
		else {
			var existingImg = this.images;
			this.images = [];
			this.images.push(existingImg);
			this.images.push(img);
		}
	}
	
	return this;
}

// Replace the image stack with a single image
DisplayObject.prototype.replaceImages = function(img) {
	delete this.images;
	
	this.addImage(img);
}

/**
 * Remove images
 */
DisplayObject.prototype.removeImages = function() {
	delete this.images;
}

DisplayObject.prototype.draw = function(ctx) {
	if (window.isAppMobi) {
		ctx.globalAlpha = this.opacity;
	} else if (window.isManvas) {
		ctx.setAlpha(this.opacity);
	}
	
	ctx.translate(this.x, this.y);
	
	if (this.rotate || this.scaleX !== 1 || this.scaleY !== 1) {
		ctx.translate(this.w * 0.5, this.h * 0.5);
		
		if (this.rotate)
			ctx.rotate(this.rotate);
		
		if (this.scaleX !== 1 || this.scaleY !== 1) 
			ctx.scale(this.scaleX, this.scaleY);
			
		ctx.translate(-this.w * 0.5, -this.h * 0.5);
	}
	
	if (this.images instanceof Array === false) {
		ctx.drawImage(this.images, false, 0, 0, this.w, this.h);
	}
	else {
		for (var i = 0, l = this.images.length; i < l; i++) {
			ctx.drawImage(this.images[i], false, 0, 0, this.w, this.h);
		}
	}
	
	ctx.translate(-this.x, -this.y);
}
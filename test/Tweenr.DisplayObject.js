describe("lib.DisplayObject", function() {
	describe("#constructor", function() {
		it("should set this object according to defaults, if defaults are missing from the props arg", function() {
			var o = new DisplayObject({x: 10, y: 10, w: 10, h: 10});
			for(var k in DisplayObject.defaults) {
				o.should.have.property(k, DisplayObject.defaults[k]);
			}
		});
	});
	
	describe("#addImage", function() {
		var displayObject;
		
		before(function() {
			displayObject = new DisplayObject({x: 10, y: 10, w: 10, h: 10});
		});
		
		it("should set this.images as the img object if it is the first image passed to the instance", function() {
			var bg = new Image();
			bg.src = "testassets/bomberman.jpg";
			
			displayObject.addImage(bg);
			displayObject.images.should.be.an.instanceof(Image)
		});
		
		it("should set this.images to an array on subsequent images added to the object", function() {
			var bunny = new Image();
			bunny.src = "testassets/bunny.png";
			
			displayObject.addImage(bunny);
			displayObject.images.should.be.an.instanceof(Array);
			displayObject.images.should.have.length(2);
		});
		
		it("should return the object instance so that addImage can be chained", function() {
			var hare = new Image();
			hare.src = "testassets/hare.png";
			
			var o = displayObject.addImage(hare);
			o.should.be.instanceof(DisplayObject);
			
			(function() {
				displayObject
				.addImage(hare)
				.addImage(hare);
			}).should.not.throw(Error)
		});
	});
});
describe("lib.Stage.js", function() {
	var testImg;
	
	before(function(done) {
		// image loading is async
		testImg = new Image();
		testImg.onload = function() {
			done();
		};
		testImg.onerror = function() {
			done(new Error("Could not load 'testassets/hare.png'"));
		}
		testImg.src = "testassets/hare.png";
	});
	
	describe("#addDisplayObject", function() {
		var displayObject;
		
		before(function() {
			displayObject = new DisplayObject({x: 10, y: 20, w: 30, h: 30});
		});
		
		it("should append the object to Stage._objects", function() {
			Stage.addDisplayObject(displayObject);
			
			Stage._objects.should.have.length(1);
		});
		
		it("should append the object to the end of Stage._objects", function() {
			var o = new DisplayObject({x: 10, y: 20, w: 30, h: 30});
			Stage.addDisplayObject(o);
			
			Stage._objects.should.have.length(2);
			
			Stage._objects[1].should.equal(o);
			Stage._objects[0].should.not.equal(o);		
		});
		
		it("if the object already in Stage._objects it should be shifted to the end of the array", function() {
			// displayObject was added in the first test. Adding it again should shift it to the end
			Stage._objects[0].should.equal(displayObject);
			
			Stage.addDisplayObject(displayObject);
			
			// shouldn't expand the array
			Stage._objects.should.have.length(2);
			
			Stage._objects[1].should.equal(displayObject);
		});
	});
	
	describe("#clear", function() {
		it("should clear the Stage._objects array", function() {
			Stage.clear();
			Stage._objects.should.have.length(0);
		});
		
		it("should unreference Stage.bg (background image)", function() {
			Stage.setBackgroundImg(testImg);
			
			chai.assert(typeof Stage.bg !== "undefined");
			Stage.clear();
			chai.assert(typeof Stage.bg === "undefined");
		});
	});
});
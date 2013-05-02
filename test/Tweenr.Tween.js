describe("Tweenr.Tween.js", function() {
	var animateObject = {
		x: 100,
		y: 10,
		w: 300,
		h: 300
	}
	describe("#constructor", function() {
		var tween;
		
		before(function() {
			tween = new Tween(animateObject);
		});
		
		it("init _steps array member var", function() {
			tween._steps.should.be.instanceof(Array);
		});
		
		it("should reference the object", function() {
			tween.object.should.equal(animateObject);
		});
	});
	
	describe("#to & #then", function() {
		it("should return the Tween instance for chaining", function() {
			var t = new Tween(animateObject).to({x: 100}, 1);
			t.should.be.instanceof(Tween);
		});
		
		it("should modify the object properties over the specified time", function(done) {
			var anotherObj = {
				x: 100
			};
			
			var t = new Tween(anotherObj).to({x: 200}, 100);
			
			setTimeout(function() {
				anotherObj.x.should.be.above(100);
				done();
			}, 100);
		});
	
		it("should be able to accept a callback function that is called only once", function(done) {
			var called = 0
			
			var fn = function() {
				called++;
			}
			
			var t = new Tween(animateObject).to({x: 1}, 100).then(fn, 100);
			
			setTimeout(function() {
				called.should.equal(1);
				done();
			}, 500);
		});
		
		it("should set the object to the properties passed to the function at the end of the tween", function() {
			var object = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
			
			var t = new Tween(object).to({x: 123, y: 123, w: 123, h: 123}, 100);
			
			setTimeout(function() {
				object.should.have.property("x", 123);
				object.should.have.property("y", 123);
				object.should.have.property("w", 123);
				object.should.have.property("h", 123);
			}, 200);
		});
	});
	
	it("expose a fluent API i.e be chainable");
});
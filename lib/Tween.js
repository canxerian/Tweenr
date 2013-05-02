/*global Ticker*/
/**
 * Interface
 *
 * change a property over time
 * new Tween(object).to({prop1: 100, x: 100});
 */
var Tween = function(object) {
	// Core dependency
	if (typeof Ticker !== "object") {
		throw new Error("Ticker class required for tween hearbeat!");
	}
	
	/**
	 * The object to tween
	 */
	this.object = object;
	
	/**
	 * Tween steps
	 */
	this._steps = [];
	
	/**
	 * Total duration of this tween
	 */
	this._duration = 0;
	
	/**
	 * How long has this tween been going on for 
	 * used for the termination condition
	 */
	this._elapsedTime = 0;
	
	/**
	 * _currentQueueProps contains properties to tween to at the top of the queue
	 */
	this._currentQueueProps = {};
	
	/**
	 * Accumulate the initial properties of the target before tweening
	 */
	this._initQueueProps;
	
	Ticker.addListener(this);
	
	return this;
};

Tween.prototype.to = function(props, duration, ease) {
	var p0;
	
	if (typeof props === "function") {
		p0 = Tween._clone(this._currentQueueProps);
	}
	else {
		p0 = {};
		
		for (var k in props) {
			
			if (typeof this._currentQueueProps[k] !== "undefined") {
				p0[k] = this._currentQueueProps[k];
			}
			else {
				p0[k] = this.object[k];
			}
		}
		// Only update current queue props if there isn't a callback function
		// this is so that the next tween will retain the state at which the 
		// object was before the callback was called
		this._currentQueueProps = Tween._clone(props);
	}
	this._addStep({
		duration: duration || 500,		// default to 
		t: this._duration,
		p0: p0,
		p1: props,
		e: ease
	});
	
	if (this._currentStep === undefined) {
		this._currentStep = this._steps[0];
	}
	
	return this;
}

Tween.prototype.then = function(fn) {
	if (typeof fn !== "function") {
		throw new Error("Tween.prototype.then should be used to register callbacks - use Tween.prototype.to instead");
	}
	
	this.cb = fn;
}

Tween.prototype.wait = function(duration) {
	var p1 = {};
			
	for (var k in this._currentQueueProps) {
		p1[k] = this._currentQueueProps[k];
	}
	
	p1.wait = true;
	this._addStep({
		duration: duration,
		t: this._duration,
//		p0: p0,
		p1: p1
	});
	
	return this;
}

Tween.prototype._addStep = function(o) {
	this._duration += o.duration;
	
	this._steps.push(o);
}

/**
 * Update interface that is recognised by the Ticker class
 */ 
Tween.prototype.update = function(dt) {
	// step over each property
	if (this._steps.length === 0) {
		Ticker.removeListener(this);
		if (typeof this.cb === "function") {
			this.cb();
		}
		return;
	}
	
		
	// Termination condition and sequence
	if (this._elapsedTime > this._duration) {
		
		var lastStep = this._steps[this._steps.length - 1];
		
		if (lastStep.p1 === "loop") {
			// this will cause the update to take step at t === 0, causing a loop
			this._elapsedTime = 0;
			this._currentStep = this._steps[0];
		}
		// End of tween, set the object as instructed in the last step
		else {
			Ticker.removeListener(this);

			for (var k in lastStep.p1) {
				this.object[k] = lastStep.p1[k];
			}
		
			if (typeof this.cb === "function") {
				this.cb();
			}
			return;
		}
	}
	
	// find new step
	if (this._elapsedTime > this._currentStep.t + this._currentStep.duration) {
		this._lastStep = this._currentStep;
		
		// traverse through _steps backwards
		for (var i = this._steps.length - 1; i >= 0; i--) {
			// step start time within current frame
			if (this._steps[i].t < this._elapsedTime) {
				this._currentStep = this._steps[i];
				
				// set object properties to those of the last step
				for (var k in this._currentStep.p0) {
					this.object[k] = this._currentStep.p0[k];
				}
				break;
			}
		}
		
		// did we miss any steps?
		if (typeof DEBUG_MODE !== "undefined" && DEBUG_MODE === true) {
			var currentIndex = this._steps.indexOf(this._currentStep);
			var lastIndex = this._steps.indexOf(this._lastStep);
			
			if (currentIndex !== 0 && currentIndex - lastIndex !== 1) {
				console.log("A step between " + lastIndex + " and " + currentIndex + " was skipped. elapseTime = " + this._elapsedTime);
				console.log("Last step time: " + this._lastStep.t + "; current step time: " + this._currentStep.t);
			
				for (var i = lastIndex+1; i < currentIndex; i++) {
					console.log("Step info: " + this._steps[i].t + ", "+ this._steps[i].duration);
				}
				console.log(" ");					
			}
		}
	}
	
	var step = this._currentStep;
	
	if (step) {
		if (step.p1.wait !== true) {

			// update properties 
			this._stepPosition = this._elapsedTime - step.t;
	
			// ratio
			var t = this._stepPosition / step.duration;
			if (this.object.id === "bar") console.log("T equals", t)
			if (typeof step.e === "function") {
				t = step.e(t);
			}
			
			if (typeof step.p1 === "function") {
				// following condition now always met (depends on resolution of dt)
				// if (t > 1) 
				// instead see if the next tick will result in going over the step duration
				if (this._elapsedTime + dt > step.t + step.duration) {
					step.p1();
				}
					
			}
			// update properties
			else {
				for (var k in step.p1) {
					var diff = step.p1[k] - step.p0[k];
					var v = step.p0[k] + diff * t;
					this.object[k] = v;
				}
			}
		}
	}
	this._elapsedTime += dt;
}

/**
 * Used to loop over any previous .to and .from actions.
 * @param void
 * @return Tween Allowing looping
 */
Tween.prototype.loop = function () {
	this._addStep({
		p1: "loop",
		duration: 0
	});
	
	return this;
};

Tween.getPowIn = function(pow) {
	return function(t) {
		return Math.pow(t,pow);
	}
}

Tween.getPowOut = function(pow) {
	return function(t) {
		return 1-Math.pow(1-t,pow);
	}
}

Tween.ease = {
	quadIn: Tween.getPowIn(2),
	
	quadOut: Tween.getPowOut(2),
	
	easeIn: function(t) {
		return Math.pow(t,2);
	},
	
	easeOut: function(t) {
		return 1-Math.pow(1-t,2);
	},
	
	bounceOut: function(t) {
		if (t < 1 / 2.75) {
	    	return (7.5625 * t * t);
	    } else if (t < 2 / 2.75) {
	    	return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
	    } else if (t < 2.5 / 2.75) {
	    	return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
	    } else {
	    	return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
	    }
    },
    
    bounceIn: function(t) {
    	return 1 - this.bounceOut(1 - t);
    },
	
	bounceInOut: function(t) {
		if (t < 0.5) return Tween.ease.bounceIn(t * 2) * .5;
		return Tween.ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
	},
	
	sineIn: function(t) {
		return 1 - Math.cos(t * Math.PI / 2);
	},

	sineOut: function(t) {
		return Math.sin(t * Math.PI / 2);
	},

	sineInOut: function(t) {
		return -0.5 * (Math.cos(Math.PI * t) - 1)
	}
}

Tween._clone = function(obj) {
	var o = {}
	for (var k in obj) {
		o[k] = obj[k];
	}
	return o;
}
// interface: 
// new Tween(shape).to({x: 40}, "easeInOut").then({x:50}, );
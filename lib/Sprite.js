/**
 * Class for animating sprites from sprite sheets ordered in a horizontal sprite sheet
 *
 * @param {Number} props.x
 * @param {Number} props.y
 * @param {Number} props.w
 * @param {Number} props.h
 * @param {Number} props.nFrames	Number of frames on sprite sheet
 * @param {Number} props.tileW		Tile width
 * @param {Number} props.duration
 * @param {Boolean} props.loop
 * @param {Boolean} props.noTick	Use your own Ticker/interval
 * @param {String || Image} type 	String: "smoke" || "potionBlur" || "attack" OR 
 * 									an image instance with frameWidth, frameHeight, nFrames properties	
 */
function Sprite(spritesheet, props, type, image, cb) {
	if (image === undefined) {
		throw new Error("Sprite missing image.");
	}
/*
	
	if (typeof Sprite.data[type] === "undefined") {
		throw new Error("Sprite data doesn't exist for type: " + type);
	}
*/
	this.spritesheet = spritesheet;
	for(var k in Sprite.defaults) {
	 	if (typeof this[k] === "undefined") {
		 	this[k] = Sprite.defaults[k];
	 	}
	}
		
	// Sprite data
	if (type) {
		for(var k in Sprite.data[type]) {
			this[k] = Sprite.data[type][k]; 
		}
	}
	
	// Properties per constructor
	for(var k in props) {
		this[k] = props[k];
	}
	
	this.type = type;
	
	this.image = image;
	
	this.x = (this.x == "center") ? (SCREEN_WIDTH - this.w) / 2 : this.x;
	this.y = (this.y == "center") ? (SCREEN_HEIGHT - this.h) / 2 : this.y;
	
	
	// Add to Ticker
	if (!props.noTick && typeof Ticker !== "undefined")
		Ticker.addListener(this);
		
	if (typeof cb === "function") {
		this.callback = cb;
	}
}

Sprite.defaults = {
	offsetX: 0,
	offsetY: 0,
	scaleX: 1,
	scaleY: 1,
	columns: 100,
	currentFrame: 0,
	opacity: 1,
	loop: false,
	draggable: false
}

Sprite.prototype.update = function(dt) {
	// go to next line in spritesheet if we have a non-linear spritesheet
	if (this.frameHeight != this.image.height && 
		(this.offsetX >= this.image.width || 
		this.offsetX >= (this.columns*this.frameWidth))) 
	{
		this.offsetX = 0;
		this.offsetY += this.frameHeight;
	}
	
	// Termination based on frames rather than time (more accurate)
	// android fix - terminate a sprite animation if offset goes out of bounds
	if (this.currentFrame >= this.nFrames || this.offsetX >= this.image.width || this.currentFrame >= this._stopAt) {
		
		if (this._loop && this._nLoops !== 0) {
			this.playSegment(this._loopStart, this._loopEnd);
	
//			this.offsetX = 0;
//			this.offsetY = 0;
//			this.currentFrame = 0;

			if (this._nLoops !== undefined) {
				this._nLoops--;
			}
		}
		else {
			// Stop listening to the animation heartbeat
			Ticker.removeListener(this);
			delete this.Ticker;
			
			if (typeof this.callback === "function") {
				this.callback();
			}
		}
	}
}

Sprite.prototype.draw = function(ctx) {
	if (window.isAppMobi) {
		ctx.globalAlpha = this.opacity;
	} else if (window.isManvas) {
		ctx.setAlpha(this.opacity);
	}
	
	ctx.save();
	// translate to center of sprite so that scale is symmetrical
	ctx.translate(this.x + this.w * 0.5, this.y + this.h * 0.5);
	ctx.scale(this.scaleX, this.scaleY);
	if (this.rotate) {
		ctx.rotate(this.rotate);
	}
	ctx.translate(-this.w * 0.5, -this.h * 0.5);
	
	
	this.spritesheet.drawAnimationImage(this.image, this.currentFrame, 0, 0, this.w, this.h);
	ctx.translate(-this.x, -this.y);

	ctx.restore();

	// Skip update if we're stopping at the current frame
	if (this.currentFrame >= this._stopAt) {
		return;
	}
	else {
		// update offsetX for next iteration 
		this.offsetX += this.frameWidth;
		this.currentFrame++;
	}
}

/**
 * 
 */
Sprite.prototype.stopAt = function(frame) {
	this._stopAt = frame;
	
	// For chaining
	return this;
}

/**
 * Loop?
 *
 * @param {Number} n		Number of times to loop		
 * @param {Number} start	Frame to start looping from
 * @param {Number} end		Frame to end loop
 */
Sprite.prototype.loop = function(n, start, end) {
	delete this._stopAt;
	this._loop = true;

	this._loopStart = start || 0;
	this._loopEnd = end || this.nFrames;
	
	this._stopAt = this._loopEnd;
	
	this._nLoops = n;
	
	return this;
}

/**
 * Play a segment of the sprite
 *
 * @params {Number} start	Frame to start playing
 * @params {Number} end		Frame to stop at
 */
Sprite.prototype.playSegment = function(start, end) {
	this.currentFrame = start || 0;
	this._stopAt = end;
	
	
	// Re calculate offsetX and offsetY as a product of currentFrame
	
	// n frames in a row
	var nFramesRow = this.image.width / this.frameWidth,
		nFramesCol = this.image.height / this.frameHeight;
	
	var frameX = this.currentFrame % nFramesRow,
		frameY = Math.floor(this.currentFrame / nFramesRow);
	
	this.offsetX = this.frameWidth * frameX;
	this.offsetY = this.frameHeight * frameY;

	// Add to Ticker if not currently playing
	if (typeof this.Ticker === "undefined")
		Ticker.addListener(this);
}

Sprite.prototype.stop = function() {
	Ticker.removeListener(this);
	
	delete this.Ticker;
	
	if (typeof this.callback === "function") {
		this.callback();
	}
}

Sprite.prototype.swapImage = function(src) {
	
	var d = this.spritesheet.dimensions(src);
	
	this.image = src;
	
	// update w and h
	this.w = d.width;
	this.h = d.height;
}

/**
 * Reset frame to zero
 */
Sprite.prototype.reset = function() {
	
}

/**
 * Sprite data
 */
Sprite.data = {}

Sprite.IMG_DIR = "minigame/animations/common";

Sprite.data.smoke = {
	src: "minigame/animations/anim/animSmoke.png",
	frameWidth: 150,
	frameHeight: 137,
	nFrames: 13,
	
	scaleX: 1.4,
	scaleY: 1.4
}

Sprite.data.courageSmoke = {
	src: "minigame/animations/anim/animSmokeGreen.png",
	frameWidth: 150,
	frameHeight: 137,
	nFrames: 13,
	
	scaleX: 1.4,
	scaleY: 1.4
}

Sprite.data.speedSmoke = {
	src:  "minigame/animations/anim/animSmokeBlue.png",
	frameWidth: 150,
	frameHeight: 137,
	nFrames: 13,
	
	scaleX: 1.4,
	scaleY: 1.4
}

Sprite.data.brainsSmoke =  {
	src:  "minigame/animations/anim/animSmokeYellow.png",
	frameWidth: 150,
	frameHeight: 137,
	nFrames: 13,
	
	scaleX: 1.4,
	scaleY: 1.4
}

Sprite.data.muscleSmoke = {
	src:  "minigame/animations/anim/animSmokeRed.png",
	frameWidth: 150,
	frameHeight: 137,
	nFrames: 13,
	
	scaleX: 1.4,
	scaleY: 1.4
}

Sprite.data.potionBlur = {
	src: "minigame/animations/anim/animPotionBlur.png",
	frameWidth: 256,
	frameHeight: 256,
	nFrames: 13
}

Sprite.data.attack = {
// 	src: Sprite.IMG_DIR + "/animAttackSheen.png",

	src: "minigame/animations/anim/whiteSheen.png",
	frameWidth: 200,
	frameHeight: 144,
	nFrames: 10,

	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.courageAttack = {
	src: "minigame/animations/anim/greenSheen.png",
	frameWidth: 200,
	frameHeight: 144,
	nFrames: 10,
	
	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.speedAttack = {
	src: "minigame/animations/anim/blueSheen.png",
	frameWidth: 200,
	frameHeight: 144,
	nFrames: 10,
	
	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.brainsAttack = {
	src: "minigame/animations/anim/yellowSheen.png",
	frameWidth: 200,
	frameHeight: 144,
	nFrames: 10,
	
	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.muscleAttack = {
	src: "minigame/animations/anim/redSheen.png",
	frameWidth: 200,
	frameHeight: 144,
	nFrames: 10,
	
	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.zees = {
	src: "minigame/animations/anim/zSprite.png",
//	src: Sprite.IMG_DIR + "/z_loop70x120.png",
	frameWidth: 70,
	frameHeight: 120,
	nFrames: 40,
	
	scaleX: 1.7,
	scaleY: 1.2
}

Sprite.data.cardBorder = {
	src: "minigame/animations/card/cardBorder.png",
	frameWidth: 128,
	frameHeight: 128,
	nFrames: 30
}

Sprite.data.furi = {
	frameWidth: 190,
	frameHeight: 162,
	nFrames: 64,
	
	// sprite animations.
	attackSrc: "minigame/avatars/furi/attack.png",
	fatigueSrc: "minigame/avatars/furi/fatigue.png"
}

Sprite.data.diavlo = {
	frameWidth: 190,
	frameHeight: 150,
	nFrames: 60,
	
	// sprite animations.
	attackSrc: "minigame/avatars/diavlo/attack.png",
	fatigueSrc: "minigame/avatars/diavlo/fatigue.png"
}

Sprite.data.poppet = {
	frameWidth: 190,
	frameHeight: 132,
	nFrames: 57,
	
	// sprite animations.
	attackSrc: "minigame/avatars/poppet/attack.png",
	fatigueSrc: "minigame/avatars/poppet/fatigue.png"
}

Sprite.data.katsuma = {
	frameWidth: 190,
	frameHeight: 176,
	nFrames: 59,
	
	// sprite animations.
	attackSrc: "minigame/avatars/katsuma/attack.png",
	fatigueSrc: "minigame/avatars/katsuma/fatigue.png"
}

Sprite.data.luvli = {
	frameWidth: 190,
	frameHeight: 158,
	nFrames: 55,
	
	// sprite animations.
	attackSrc: "minigame/avatars/luvli/attack.png",
	fatigueSrc: "minigame/avatars/luvli/fatigue.png"
}

Sprite.data.zommer = {
	frameWidth: 190,
	frameHeight: 120,
	nFrames: 68,
	
	// sprite animations.
	attackSrc: "minigame/avatars/zommer/attack.png",
	fatigueSrc: "minigame/avatars/zommer/fatigue.png"
}

Sprite.data.criticalBlast = {
	src: "minigame/animations/anim/miniBlastWave.png",
	frameWidth: 150,
	frameHeight: 143,
	nFrames: 32,
	
	scaleX: 2,
	scaleY: 2
}

Sprite.data.doubleDamage = {
	src: "minigame/animations/anim/double_damage.png",
	frameWidth: 150,
	frameHeight: 150,
	nFrames: 22,
	
	// how many x larger is this sprite vs card
	scaleX: 1.3, 
	scaleY: 1.3
}

Sprite.data.tutorialDrag = {
	src: "minigame/animations/card/tutorialDrag.png",
	frameWidth: 100,
	frameHeight: 125,
	nFrames: 24
}

Sprite.data.oomphLevelup = {
	src: "minigame/animations/bars/oomphRefill.png",
	frameWidth: 282,
	frameHeight: 200,
	nFrames: 32,
	
	refillEnd: 13
}

Sprite.data.energyLevelup = {
	src: "minigame/animations/bars/energyRefill.png",
	frameWidth: 280,
	frameHeight: 145,
	nFrames: 32,
	
	refillEnd: 14
}

Sprite.data.bossDefeatedMain = {
	src: "minigame/animations/effects/boss_defeat.png",
	frameWidth: 170,
	frameHeight: 170,
	nFrames: 32,
	scaleX: 2.5,
	scaleY: 2.5
}

Sprite.data.boss10xAttack = {
	src: "minigame/animations/effects/boss_10x_attack.png",
	frameWidth: 142,
	frameHeight: 152,
	nFrames: 34,
	scaleX: 1.8,
	scaleY: 1.8
}

Sprite.data.bossNormalAttack = {
	src: "minigame/animations/effects/boss_attack_normal.png",
	frameWidth: 170,
	frameHeight: 170,
	nFrames: 29,
	scaleX: 2,
	scaleY: 2
}

Sprite.data.bossNemesis = {
	src: "minigame/animations/effects/nemesis.png",
	frameWidth: 170,
	frameHeight: 170,
	nFrames: 29,
	scaleX: 2,
	scaleY: 2
}

Sprite.data.transitionStar = {
	src: "transition_screen/common/common/shine.png",
	frameWidth: 200,
	frameHeight: 182,
	nFrames: 50
}

Sprite.data.cardGlow = {
	src: Sprite.IMG_DIR + "/card_glow_100x100.png",
	frameWidth: 100,
	frameHeight: 100,
	nFrames: 30
}

Sprite.data.dizzy = {
	src: "minigame/animations/anim/dizzy.png",
	frameWidth: 327,
	frameHeight: 270,
	nFrames: 11
}
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2014 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @class Phaser.Image
*
* @classdesc Create a new `Image` object. An Image is a light-weight object you can use to display anything that doesn't need physics or animation.
* It can still rotate, scale, crop and receive input events. This makes it perfect for logos, backgrounds, simple buttons and other non-Sprite graphics.
*
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate of the Imaget. The coordinate is relative to any parent container this Image may be in.
* @param {number} y - The y coordinate of the Image. The coordinate is relative to any parent container this Image may be in.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - The texture used by the Image during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
* @param {string|number} frame - If this Image is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Image = function (game, x, y, key, frame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;
    
    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;
 
    /**
    * @property {boolean} exists - If exists = false then the Sprite isn't updated by the core game loop or physics subsystem at all.
    * @default
    */
    this.exists = true;

    /**
    * @property {string} name - The user defined name given to this Sprite.
    * @default
    */
    this.name = '';

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.IMAGE;

    /**
    * @property {Phaser.Events} events - The Events you can subscribe to that are dispatched when certain things happen on this Sprite or its components.
    */
    this.events = new Phaser.Events(this);

    /**
    *  @property {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
    */
    this.key = key;

    this._frame = 0;
    this._frameName = '';

    PIXI.Sprite.call(this, PIXI.TextureCache['__default']);

    this.loadTexture(key, frame);

    this.position.set(x, y);

    /**
    * @property {Phaser.Point} world - The world coordinates of this Sprite. This differs from the x/y coordinates which are relative to the Sprites container.
    */
    this.world = new Phaser.Point(x, y);

    /**
    * Should this Sprite be automatically culled if out of range of the camera?
    * A culled sprite has its renderable property set to 'false'.
    * Be advised this is quite an expensive operation, as it has to calculate the bounds of the object every frame, so only enable it if you really need it.
    *
    * @property {boolean} autoCull - A flag indicating if the Sprite should be automatically camera culled or not.
    * @default
    */
    this.autoCull = false;

    /**
    * A Sprite that is fixed to the camera uses its x/y coordinates as offsets from the top left of the camera.
    * Note that if this Image is a child of a display object that has changed its position then the offset will be calculated from that.
    * @property {boolean} fixedToCamera - Fixes this Sprite to the Camera.
    * @default
    */
    this.fixedToCamera = false;

    /**
    * @property {Phaser.InputHandler|null} input - The Input Handler for this object. Needs to be enabled with image.inputEnabled = true before you can use it.
    */
    this.input = null;

    /**
    * @property {array} _cache - A small cache for previous step values. 0 = x, 1 = y, 2 = rotation, 3 = renderID
    * @private
    */
    this._cache = [0, 0, 0, 0];

};

Phaser.Image.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Image.prototype.constructor = Phaser.Image;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.Image#preUpdate
* @memberof Phaser.Image
*/
Phaser.Image.prototype.preUpdate = function() {

    this._cache[0] = this.world.x;
    this._cache[1] = this.world.y;
    this._cache[2] = this.rotation;

    if (!this.exists || !this.parent.exists)
    {
        this.renderOrderID = -1;
        return false;
    }

    if (this.autoCull)
    {
        //  Won't get rendered but will still get its transform updated
        this.renderable = this.game.world.camera.screenView.intersects(this.getBounds());
    }

    this.world.setTo(this.game.camera.x + this.worldTransform[2], this.game.camera.y + this.worldTransform[5]);

    if (this.visible)
    {
        this._cache[3] = this.game.world.currentRenderOrderID++;
    }

    return true;

};

/**
* Internal function called by the World postUpdate cycle.
*
* @method Phaser.Image#postUpdate
* @memberof Phaser.Image
*/
Phaser.Image.prototype.postUpdate = function() {

    if (this.key instanceof Phaser.BitmapData && this.key._dirty)
    {
        this.key.render();
    }

    if (this.fixedToCamera)
    {
        this.position.x = this.game.camera.view.x + this.x;
        this.position.y = this.game.camera.view.y + this.y;
    }

};

/**
* Changes the Texture the Sprite is using entirely. The old texture is removed and the new one is referenced or fetched from the Cache.
* This causes a WebGL texture update, so use sparingly or in low-intensity portions of your game.
*
* @method Phaser.Image#loadTexture
* @memberof Phaser.Image
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
* @param {string|number} frame - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Image.prototype.loadTexture = function (key, frame) {

    frame = frame || 0;

    if (key instanceof Phaser.RenderTexture)
    {
        this.key = key.key;
        this.setTexture(key);
        return;
    }
    else if (key instanceof Phaser.BitmapData)
    {
        this.key = key.key;
        this.setTexture(key.texture);
        return;
    }
    else if (key instanceof PIXI.Texture)
    {
        this.key = key;
        this.setTexture(key);
        return;
    }
    else
    {
        if (key === null || typeof key === 'undefined')
        {
            this.key = '__default';
            this.setTexture(PIXI.TextureCache[this.key]);
            return;
        }
        else if (typeof key === 'string' && !this.game.cache.checkImageKey(key))
        {
            this.key = '__missing';
            this.setTexture(PIXI.TextureCache[this.key]);
            return;
        }

        if (this.game.cache.isSpriteSheet(key))
        {
            this.key = key;

            var frameData = this.game.cache.getFrameData(key);

            if (typeof frame === 'string')
            {
                this._frame = 0;
                this._frameName = frame;
                this.setTexture(PIXI.TextureCache[frameData.getFrameByName(frame).uuid]);
                return;
            }
            else
            {
                this._frame = frame;
                this._frameName = '';
                this.setTexture(PIXI.TextureCache[frameData.getFrame(frame).uuid]);
                return;
            }
        }
        else
        {
            this.key = key;
            this.setTexture(PIXI.TextureCache[key]);
            return;
        }
    }

};

/**
* Crop allows you to crop the texture used to display this Image.
* Cropping takes place from the top-left of the Image and can be modified in real-time by providing an updated rectangle object.
*
* @method Phaser.Image#crop
* @memberof Phaser.Image
* @param {Phaser.Rectangle} rect - The Rectangle to crop the Image to. Pass null or no parameters to clear a previously set crop rectangle.
*/
Phaser.Image.prototype.crop = function(rect) {

    if (typeof rect === 'undefined' || rect === null)
    {
        //  Clear any crop that may be set
        if (this.texture.hasOwnProperty('sourceWidth'))
        {
            this.texture.setFrame(new Phaser.Rectangle(0, 0, this.texture.sourceWidth, this.texture.sourceHeight));
        }
    }
    else
    {
        //  Do we need to clone the PIXI.Texture object?
        if (this.texture instanceof PIXI.Texture)
        {
            //  Yup, let's rock it ...
            var local = {};

            Phaser.Utils.extend(true, local, this.texture);

            local.sourceWidth = local.width;
            local.sourceHeight = local.height;
            local.frame = rect;
            local.width = rect.width;
            local.height = rect.height;

            this.texture = local;

            this.texture.updateFrame = true;
            PIXI.Texture.frameUpdates.push(this.texture);
        }
        else
        {
            this.texture.setFrame(rect);
        }
    }

};

/**
* Brings a 'dead' Sprite back to life, optionally giving it the health value specified.
* A resurrected Sprite has its alive, exists and visible properties all set to true.
* It will dispatch the onRevived event, you can listen to Sprite.events.onRevived for the signal.
* 
* @method Phaser.Image#revive
* @memberof Phaser.Image
* @return {Phaser.Image} This instance.
*/
Phaser.Image.prototype.revive = function() {

    this.alive = true;
    this.exists = true;
    this.visible = true;

    if (this.events)
    {
        this.events.onRevived.dispatch(this);
    }

    return this;

};

/**
* Kills a Sprite. A killed Sprite has its alive, exists and visible properties all set to false.
* It will dispatch the onKilled event, you can listen to Sprite.events.onKilled for the signal.
* Note that killing a Sprite is a way for you to quickly recycle it in a Sprite pool, it doesn't free it up from memory.
* If you don't need this Sprite any more you should call Sprite.destroy instead.
* 
* @method Phaser.Image#kill
* @memberof Phaser.Image
* @return {Phaser.Image} This instance.
*/
Phaser.Image.prototype.kill = function() {

    this.alive = false;
    this.exists = false;
    this.visible = false;

    if (this.events)
    {
        this.events.onKilled.dispatch(this);
    }

    return this;

};

/**
* Destroys the Sprite. This removes it from its parent group, destroys the input, event and animation handlers if present
* and nulls its reference to game, freeing it up for garbage collection.
* 
* @method Phaser.Image#destroy
* @memberof Phaser.Image
*/
Phaser.Image.prototype.destroy = function() {

    if (this.filters)
    {
        this.filters = null;
    }

    if (this.parent)
    {
        this.parent.remove(this);
    }

    if (this.events)
    {
        this.events.destroy();
    }

    if (this.input)
    {
        this.input.destroy();
    }

    this.alive = false;
    this.exists = false;
    this.visible = false;

    this.game = null;

};

/**
* Resets the Sprite. This places the Sprite at the given x/y world coordinates and then sets alive, exists, visible and renderable all to true.
* 
* @method Phaser.Image#reset
* @memberof Phaser.Image
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @return {Phaser.Image} This instance.
*/
Phaser.Image.prototype.reset = function(x, y) {

    this.world.setTo(x, y);
    this.position.x = x;
    this.position.y = y;
    this.alive = true;
    this.exists = true;
    this.visible = true;
    this.renderable = true;

    return this;
    
};

/**
* Brings the Sprite to the top of the display list it is a child of. Sprites that are members of a Phaser.Group are only
* bought to the top of that Group, not the entire display list.
* 
* @method Phaser.Image#bringToTop
* @memberof Phaser.Image
* @return {Phaser.Image} This instance.
*/
Phaser.Image.prototype.bringToTop = function(child) {

    if (typeof child === 'undefined')
    {
        if (this.parent)
        {
            this.parent.bringToTop(this);
        }
    }
    else
    {

    }

    return this;

};

/**
* Indicates the rotation of the Sprite, in degrees, from its original orientation. Values from 0 to 180 represent clockwise rotation; values from 0 to -180 represent counterclockwise rotation.
* Values outside this range are added to or subtracted from 360 to obtain a value within the range. For example, the statement player.angle = 450 is the same as player.angle = 90.
* If you wish to work in radians instead of degrees use the property Sprite.rotation instead. Working in radians is also a little faster as it doesn't have to convert the angle.
* 
* @name Phaser.Image#angle
* @property {number} angle - The angle of this Image in degrees.
*/
Object.defineProperty(Phaser.Image.prototype, "angle", {

    get: function() {

        return Phaser.Math.wrapAngle(Phaser.Math.radToDeg(this.rotation));

    },

    set: function(value) {

        this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(value));

    }

});

/**
* Returns the delta x value. The difference between world.x now and in the previous step.
*
* @name Phaser.Image#deltaX
* @property {number} deltaX - The delta value. Positive if the motion was to the right, negative if to the left.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "deltaX", {

    get: function() {

        return this.world.x - this._cache[0];

    }

});

/**
* Returns the delta y value. The difference between world.y now and in the previous step.
*
* @name Phaser.Image#deltaY
* @property {number} deltaY - The delta value. Positive if the motion was downwards, negative if upwards.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "deltaY", {

    get: function() {
    
        return this.world.y - this._cache[1];

    }

});

/**
* Returns the delta z value. The difference between rotation now and in the previous step.
*
* @name Phaser.Image#deltaZ
* @property {number} deltaZ - The delta value.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "deltaZ", {

    get: function() {
    
        return this.rotation - this._cache[2];

    }

});

/**
* Checks if the Image bounds are within the game world, otherwise false if fully outside of it.
*
* @name Phaser.Image#inWorld
* @property {boolean} inWorld - True if the Image bounds is within the game world, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "inWorld", {

    get: function() {

        return this.game.world.bounds.intersects(this.getBounds());

    }

});

/**
* Checks if the Image bounds are within the game camera, otherwise false if fully outside of it.
*
* @name Phaser.Image#inCamera
* @property {boolean} inCamera - True if the Image bounds is within the game camera, even if only partially. Otherwise false if fully outside of it.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "inCamera", {

    get: function() {
    
        return this.game.world.camera.screenView.intersects(this.getBounds());

    }

});

/**
* @name Phaser.Image#frame
* @property {number} frame - Gets or sets the current frame index and updates the Texture for display.
*/
Object.defineProperty(Phaser.Image.prototype, "frame", {

    get: function() {
    
        return this._frame;

    },

    set: function(value) {

        if (value !== this.frame && this.game.cache.isSpriteSheet(this.key))
        {
            var frameData = this.game.cache.getFrameData(this.key);

            if (frameData && value < frameData.total && frameData.getFrame(value))
            {
                this.setTexture(PIXI.TextureCache[frameData.getFrame(value).uuid]);
                this._frame = value;
            }
        }

    }

});

/**
* @name Phaser.Image#frameName
* @property {string} frameName - Gets or sets the current frame by name and updates the Texture for display.
*/
Object.defineProperty(Phaser.Image.prototype, "frameName", {

    get: function() {
    
        return this._frameName;

    },

    set: function(value) {

        if (value !== this.frameName && this.game.cache.isSpriteSheet(this.key))
        {
            var frameData = this.game.cache.getFrameData(this.key);

            if (frameData && frameData.getFrameByName(value))
            {
                this.setTexture(PIXI.TextureCache[frameData.getFrameByName(value).uuid]);
                this._frameName = value;
            }
        }

    }

});

/**
* @name Phaser.Image#renderOrderID
* @property {number} renderOrderID - The render order ID, reset every frame.
* @readonly
*/
Object.defineProperty(Phaser.Image.prototype, "renderOrderID", {

    get: function() {

        return this._cache[3];

    }

});

/**
* By default an Image won't process any input events at all. By setting inputEnabled to true the Phaser.InputHandler is
* activated for this object and it will then start to process click/touch events and more.
*
* @name Phaser.Image#inputEnabled
* @property {boolean} inputEnabled - Set to true to allow this object to receive input events.
*/
Object.defineProperty(Phaser.Image.prototype, "inputEnabled", {
    
    get: function () {

        return (this.input && this.input.enabled);

    },

    set: function (value) {

        if (value)
        {
            if (this.input === null)
            {
                this.input = new Phaser.InputHandler(this);
                this.input.start();
            }
        }
        else
        {
            if (this.input && this.input.enabled)
            {
                this.input.stop();
            }
        }
    }

});
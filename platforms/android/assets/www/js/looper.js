//!
//! 
//!

// devices = [];
deviceCount = -1;

disableEventCreate = false;
showPalette = false;

interfaces = []; // TODO: Move this into Looper class?

/**
* super simple carousel
* animation between panes happens with css transitions
*/
function Carousel (element) {
    var self = this;
    element = $(element);

    var container = $(">ul", element);
    var panes = $(">ul>li", element);

    var pane_width = 0;
    var pane_count = panes.length;

    var current_pane = 0;


    /**
     * initial
     */
    this.setup = function() {
        setPaneDimensions();

        $(window).on("load resize orientationchange", function() {
            setPaneDimensions();
            //updateOffset();
        })
    };


    /**
     * set the pane dimensions and scale the container
     */
    function setPaneDimensions () {
        pane_width = element.width ();
        panes.each (function () {
            $(this).width (pane_width);
        });
        container.width (pane_width*pane_count);
    };


    /**
     * show pane by index
     * @param   {Number}    index
     */
    this.showPane = function (index) {
        // between the bounds
        index = Math.max (0, Math.min(index, pane_count-1));
        current_pane = index;

        var offset = -((100 / pane_count) * current_pane);
        setContainerOffset (offset, true);
    };


    /**
     * show pane by index
     * @param   {Number}    index
     */
    this.getCurrentPane = function() {
        return current_pane;
    };


    function setContainerOffset(percent, animate) {
        container.removeClass("animate");

        if (animate) {
            container.addClass ("animate");
        }

        if (Modernizr.csstransforms3d) {
            container.css ("transform", "translate3d("+ percent + "%,0,0) scale3d(1,1,1)");
        }
        else if (Modernizr.csstransforms) {
            container.css ("transform", "translate ("+ percent + "%,0)");
        }
        else {
            var px = ((pane_width*pane_count) / 100) * percent;
            container.css ("left", px + "px");
        }
    }

    this.next = function () { return this.showPane (current_pane + 1, true); };
    this.prev = function () { return this.showPane (current_pane - 1, true); };



    function handleHammer (ev) {
        // console.log(ev);
        // disable browser scrolling
        ev.gesture.preventDefault();

        // Update state of touch-based interaction
        if (looper.hasCurrentDevice () === true) {
            looper.processGesture ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY });
        }

        if (!disableEventCreate) { // && !looper.getCurrentDevice().processing.draggingCanvas) {

            switch (ev.type) {
                case 'dragright':
                case 'dragleft':
                    // stick to the finger
                    var pane_offset = -(100 / pane_count) * current_pane;
                    var drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count;

                    // slow down at the first and last pane
                    if ((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
                        (current_pane == pane_count-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
                        drag_offset *= .4;
                    }

                    setContainerOffset (drag_offset + pane_offset);
                    break;

                case 'swipeleft':
                    self.next ();
                    ev.gesture.stopDetect ();
                    break;

                case 'swiperight':
                    self.prev ();
                    ev.gesture.stopDetect ();
                    break;

                case 'release':
                    // more then 50% moved, navigate
                    if (Math.abs (ev.gesture.deltaX) > pane_width / 2) {
                        if (ev.gesture.direction == 'right') {
                            self.prev();
                        } else {
                            self.next ();
                        }
                    }
                    else {
                        self.showPane (current_pane, true);
                    }
                    break;
            }

        }
    }

    // Set up touch event handlers (with Hammer.js)
    element.hammer ({ drag_lock_to_axis: true }).on ("release dragleft dragright swipeleft swiperight", handleHammer);
}

//var carousel = new Carousel ("#carousel");
// carousel = new Carousel ("#carousel");
// carousel.setup();

/**
 * Setup screen gesture callback functions.
 */
function setupGestures (device) {

    var currentCanvas = '#' + device.canvas;

    /**
     * Handle "tap" events.
     */
    $(currentCanvas).hammer({ drag_max_touches: 0 }).on ("tap", function (ev) {
        console.log ("'tap' event!");

        var touches = ev.gesture.touches;

        if (looper.hasCurrentDevice () === true) {

            // Update the previous touch state history
            // looper.touch = { touching: true, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, touch: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
            console.log("FOOO");
            console.log (looper.touch);
            looper.touch.touching = true;
            looper.touch.holding = false;
            looper.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
            looper.touch.touch = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

            //
            // Get the touched event node, if one exists
            //
            //var eventCount = device.processing.loopSequence.behaviors.length;
            var eventCount = looper.behaviors.length;

            for (var i = 0; i < eventCount; i++) {
                var loopBehavior = looper.behaviors[i];
                if ((ev.gesture.center.pageX - 50 < loopBehavior.x && loopBehavior.x < ev.gesture.center.pageX + 50)
                    && (ev.gesture.center.pageY - 50 < loopBehavior.y && loopBehavior.y < ev.gesture.center.pageY + 50)) {

                    // TODO: Handle "tap" event.
                }
            }

            for (var i = 0; i < interfaces.length; i++) {
                // console.log(interfaces[i].touches(looper.zoomedCanvasMouseX, looper.zoomedCanvasMouseY));

                // Map raw touch coordinates onto the current device's Processing rendering context coordinates
                var newX = looper.zoomedCanvasMouseX; // (ev.gesture.center.pageX - $(window).width() / 2) - device.processing.xOffset;
                var newY = looper.zoomedCanvasMouseY; // (ev.gesture.center.pageY - ($(window).height() / 2)) - device.processing.yOffset;

                //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                if (interfaces[i].touches (newX, newY)) {
                    interfaces[i].events.tap ();
                    break;
                }




                //
                // #draw-behavior
                //
                // TODO: Hack! Move this into a more well-designed touch handler!
                //
                currentBehavior = interfaces[i].structure;

                var distanceFromCenter = Math.sqrt (newX * newX + newY * newY);
                var touchAngle = device.processing.getAngleFixed (newX, newY);

                // if (currentBehavior.conditionType === undefined) {
                //     currentBehavior.conditionType = "none"; // i.e., "none", "stimulus", "message", "gesture")
                // }

                // TODO: Move this to the click handler, so it's only executed once
                if (distanceFromCenter > 175 && distanceFromCenter < 225) {

                    if (touchAngle > currentBehavior.condition.startAngle && touchAngle < currentBehavior.condition.endAngle) {

                        if (currentBehavior.conditionType === "none") {
                            currentBehavior.conditionType = "stimulus";
                        } else if (currentBehavior.conditionType === "stimulus") {
                            currentBehavior.conditionType = "message";
                        } else if (currentBehavior.conditionType === "message") {
                            currentBehavior.conditionType = "gesture";
                        } else if (currentBehavior.conditionType === "gesture") {
                            currentBehavior.conditionType = "none";
                        }

                    }
                }


            }

        }
    });

    /**
     * Handle "touch" events.
     */
    $(currentCanvas).hammer ({ drag_max_touches: 0 }).on ("touch", function (ev) {
        console.log ("'touch' event!");

        var touches = ev.gesture.touches;

        if (looper.hasCurrentDevice () === true) {

            console.log ("1");

            looper.processGesture ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }); // looper.processGesture (ev);

            // DEBUG: console.log (((looper.getCurrentPane () + 1) * $(window).width ()) + device.processing.mouseX);
            // DEBUG: console.log (device.processing.mouseY);

            // Save mouse touch location
            //device.processing.mouse_x = (((looper.getCurrentPane () + 1) * $(window).width ()) + device.processing.mouseX);
            device.processing.mouse_x = device.processing.mouseX;
            device.processing.mouse_y = device.processing.mouseY;

            // Store previous offset
            looper.xOffsetPrevious = looper.xOffset;
            looper.yOffsetPrevious = looper.yOffset;

            // Update the previous touch state history
            // looper.touch = { touching: true, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, touch: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
            looper.touch.touching = true;
            looper.touch.holding = false;
            looper.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
            looper.touch.touch = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

            // device.processing.draggingCanvas = false; // looper.touch.draggingCanvas = false;

            // var touchingCanvas = true;

            // Check for interaction with interfaces
            for (var i = 0; i < interfaces.length; i++) {
                console.log(interfaces[i]);

                // Map raw touch coordinates onto the current device's Processing rendering context coordinates
                var newX = looper.zoomedCanvasMouseX; // (ev.gesture.center.pageX - $(window).width() / 2) - device.processing.xOffset;
                var newY = looper.zoomedCanvasMouseY; // (ev.gesture.center.pageY - ($(window).height() / 2) - device.processing.yOffset);

                //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                if (interfaces[i].touches (newX, newY)) {
                    interfaces[i].events.touch ();
                    // touchingCanvas = false; // Flag that an interface is being touched
                    break;
                }
            }

        }

        // Uncomment to enable dragging canvas:
        // if (touchingCanvas) {
        //     //looper.touch.draggingCanvas = true;
        //     device.processing.draggingCanvas = true;
        // }




        // if (!disableEventCreate) {
        //     disableEventCreate = true;

        //     var touches = ev.gesture.touches;

        //     if (device.processing.behaviorPalette == null) {
        //         console.log("looperInstance = ");
        //         console.log(device.processing.looperInstance);
        //         device.processing.behaviorPalette = new BehaviorPalette({ looperInstance: device });
        //         device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
        //         device.processing.behaviorPalette.updatePosition();
        //         device.processing.setupBehaviorPalette();
        //         console.log(device.processing.behaviorPalette);
        //     }

        //     // Show behavior palette
        //     // device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
        //     device.processing.behaviorPalette.show();
        //     console.log(device.processing.behaviorPalette);
        // }

        ev.gesture.preventDefault ();
        ev.stopPropagation ();
        ev.gesture.stopPropagation ();
        return;
    });

    /**
     * Detect "release" event.
     */
    $(currentCanvas).hammer ({ drag_max_touches: 0 }).on ("release", function (ev) {
        console.log("'release' event!");

        if (looper.hasCurrentDevice () === true) {

            looper.processGesture ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }); // looper.processGesture (ev);
            // i.e., save, process

            var touches = ev.gesture.touches;

            // if (device.processing.draggingCanvas == true) {
            //     //looper.touch.draggingCanvas = true;
            //     device.processing.draggingCanvas = false;

            //     // Save mouse touch location
            //     var currentMouseX = (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
            //     var currentMouseY = device.processing.mouseY;

            //     // Store previous offset
            //     device.processing.xOffset = currentMouseX - device.processing.mouse_x + device.processing.xOffsetPrevious;
            //     device.processing.yOffset = currentMouseY - device.processing.mouse_y + device.processing.yOffsetPrevious;
            // }

            // Update the previous touch state history
            // looper.touch = { touching: false, holding: false, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }, release: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
            looper.touch.touching = false;
            looper.touch.holding = false;
            looper.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };
            looper.touch.release = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

            // Check for touches on interfaces
            for (var i = 0; i < interfaces.length; i++) {
                // DEBUG: console.log(interfaces[i]);

                // Map raw touch coordinates onto the current device's Processing rendering context coordinates
                var newX = looper.zoomedCanvasMouseX; // (ev.gesture.center.pageX - $(window).width() / 2) - device.processing.xOffset;
                var newY = looper.zoomedCanvasMouseY; // (ev.gesture.center.pageY - ($(window).height() / 2) - device.processing.yOffset);

                if (interfaces[i].touches (newX, newY)) {
                    interfaces[i].events.release ();
                    looper.touch.behavior = null; // Free the behavior from touch history
                    break;
                }
            }

            // Check if the touch was momentary
            if (looper.touch.release.t - looper.touch.touch.t < 200) {
                // TODO: Create a "none" behavior
            }

            // ev.gesture.preventDefault();
            // ev.stopPropagation();
            // ev.gesture.stopPropagation();
            // return;
        }
    });

    /**
     * Handle "hold" touch event.
     */
    $(currentCanvas).hammer ({ drag_max_touches: 0, hold_timeout: 200 }).on ("hold", function (ev) {
        console.log("'hold' event!");

        if (looper.hasCurrentDevice () === true) {

            looper.processGesture ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY }); // looper.processGesture (ev);

            var touches = ev.gesture.touches;

            // console.log ("Processing (mouseX, mouseY): " + device.processing.mouseX + ", " + device.processing.mouseY);

            // if (device.processing.draggingCanvas == true) {
            //     //looper.touch.draggingCanvas = true;
            //     device.processing.draggingCanvas = false;

            //     // Save mouse touch location
            //     var currentMouseX = (((looper.getCurrentPane() + 1) * $(window).width()) + device.processing.mouseX);
            //     var currentMouseY = device.processing.mouseY;

            //     // Store previous offset
            //     device.processing.xOffset = currentMouseX - device.processing.mouse_x + device.processing.xOffsetPrevious;
            //     device.processing.yOffset = currentMouseY - device.processing.mouse_y + device.processing.yOffsetPrevious;
            // }




            // Update the previous touch state history
            // looper.touch = { touching: true, holding: true, current: { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY } };
            looper.touch.touching = true;
            looper.touch.holding = true;
            looper.touch.current = { x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, t: (new Date()).getTime() };

            // If the canvas is being dragged, cancel the drag since a hold is detected
            // if (device.processing.draggingCanvas) {
            //     device.processing.draggingCanvas = false;
            // }

            for (var i = 0; i < interfaces.length; i++) {
                // DEBUG: console.log(interfaces[i]);

                // Map raw touch coordinates onto the current device's Processing rendering context coordinates
                var newX = looper.zoomedCanvasMouseX; // device.processing.zoomedCanvasMouseX; // (ev.gesture.center.pageX - $(window).width() / 2) - device.processing.xOffset;
                var newY = looper.zoomedCanvasMouseY; // device.processing.zoomedCanvasMouseY; // (ev.gesture.center.pageY - ($(window).height() / 2) - device.processing.yOffset);

                //if (interfaces[i].touches(ev.gesture.center.pageX, ev.gesture.center.pageY)) {
                if (interfaces[i].touches(newX, newY)) {
                    //looper.interfaces[i].events.hold();
                    interfaces[i].events.release ();
                    break;
                }
            }



            // Check if "behavior palette" was requested
            if (!disableEventCreate) {
                disableEventCreate = true;

                var touches = ev.gesture.touches;

                if (device.processing.behaviorPalette == null) {
                    // console.log("looperInstance = ");
                    // console.log(device.processing.looperInstance);
                    device.processing.behaviorPalette = new BehaviorPalette ({ parent: device });
                    
                    device.processing.behaviorPalette.setPosition (looper.zoomedCanvasMouseX, looper.zoomedCanvasMouseY); //device.processing.behaviorPalette.setPosition (device.processing.zoomedCanvasMouseX, device.processing.zoomedCanvasMouseY);
                    device.processing.behaviorPalette.updatePosition ();
                    device.processing.setupBehaviorPalette ();
                    // console.log (device.processing.behaviorPalette);

                    // Zoom into behavior palette
                    looper.stackedZoomedCanvasMouseX = looper.xOffset; // device.processing.stackedZoomedCanvasMouseX = device.processing.xOffset;
                    looper.stackedZoomedCanvasMouseY = looper.yOffset;
                    looper.stackedScaleFactor = looper.zoomFactor;
                    // TODO: Uncomment to enable panning and scaling perspective on behavior selector
                    // device.processing.scaleTo (1.0);
                    // device.processing.panTo (device.processing.zoomedCanvasMouseX, -1 * device.processing.zoomedCanvasMouseY);

                    // Center behavior palette on screen and zoom in on it
                    // looper.zoomIn ({ x: ev.gesture.center.pageX, y: ev.gesture.center.pageY, factor: 2.0 });
                }

                // Show behavior palette
                // device.processing.behaviorPalette.setPosition(ev.gesture.center.pageX, ev.gesture.center.pageY);
                device.processing.behaviorPalette.show();
                // DEBUG: console.log(device.processing.behaviorPalette);
            }

        }

        ev.gesture.preventDefault();
        ev.stopPropagation();
        ev.gesture.stopPropagation();
        return;
    });
}

//------------
// looper.js
//------------

/**
 * The main Looper class.
 */
function Looper (options) {
    var defaults = {
        devices: []
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    /** The behavior palette. */
    this.palette = null;

    /** The devices in the local mesh network. */
    this.devices = [];

    /**
     * Add a device to the list of devices in the mesh network.
     */
    this.addDevice = function (options) {
        var defaults = {
            address: null
        };
        var options = options || {};
        var options = $.extend({}, defaults, options);

        deviceCount = deviceCount + 1;

        // var overlay = '';
        // overlay += '<div id="overlay' + deviceCount + '" style="width: 100%; height: 100%; position: relative; z-index: 5000;">';
        // overlay += '<input type="button" value="close" onclick="saveScript();$(\'#overlay' + deviceCount + '\').hide();" />';
        // overlay += '</div>';
        // <script>
        //     $('#overlay').hide();
        // </script>


        // $('#panes').append('<li class="pane' + deviceCount + '"><canvas id="canvas' + deviceCount + '" style="width: 100%; height: 100%;"></canvas></li>');
        // canvas = "canvas" + deviceCount;
        canvas = "looperCanvas";

        // Create device object
        var device = new LooperInstance ({ canvas: canvas, address: options['address'] });
        device.looper = this;
        device.index = deviceCount; // TODO: Replace with node/node UUID
        setupGestures (device);
        this.devices.push (device);

        /**
         * Re-initialize Carousel after adding the new device pane
         */
        // this.carousel = new Carousel ("#carousel");
        // this.carousel.setup ();
        // this.carousel.showPane (deviceCount);

        $('#overlay' + deviceCount).hide();
    }

    /**
     * Returns the device at the specified index.
     */
    this.getDevice = function (index) {
        return this.devices[index];
    }

    /**
     * Returns the device at the specified index.
     */
    this.getDeviceCount = function () {
        return this.devices.length;
    }

    /**
     * Returns the device at the specified index.
     */
    this.getCurrentDevice = function () {
        // var currentDeviceIndex = this.getCurrentPane ();
        // return this.devices[currentDeviceIndex];
        return this.devices[0];
    }

    /**
     * Returns true if a device is selected, and false if no device is selected. A device is selected if a loop is shown, but not if the "title" pane is shown.
     */
    this.hasCurrentDevice = function () {
        // var currentDeviceIndex = this.getCurrentPane ();
        // if (currentDeviceIndex === -1) {
        //     return false;
        // } else {
        //     return true;
        // }
        return true;
    }

    /**
     * Returns the current device's address.
     */
    this.getCurrentDeviceAddress = function () {
        return this.devices[this.getCurrentPane()].address;
    }

    this.showDeviceByIndex = function (index) {
        this.carousel.showPane(index + 1);
    }

    this.getCurrentPane = function () {
        // return this.carousel.getCurrentPane() - 1;
        return carousel.getCurrentPane() - 1;
    }

    // Attaches an interface to the currently selected Looper instance.
    this.attachInterface = function (options) {

        var currentLooper = this.getCurrentDevice ();
        currentLooper.attachInterface (options);
    }

    // Returns the interface of the currently selected Looper instance.
    this.getInterface = function (options) {
        var currentLooper = this.getCurrentDevice ();
        return currentLooper.getInterface (options);
    }
}

function Loop (options) {
    var defaults = {
        behaviors: []
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.behaviors = options.behaviors; // behaviors on the event loop

    /**
     * Re-orders the behaviors in the event loop.
     */
    this.updateOrdering = function () {
        var behaviorSequence = [];

        var eventCount = this.behaviors.length;

        // Populate array for sorting
        for (var i = 0; i < eventCount; i++) {
            var loopBehavior = this.behaviors[i];
            if (loopBehavior.state === 'ENGAGED') {
                behaviorSequence.push({
                    event: loopBehavior,
                    angle: getAngle(loopBehavior.x, loopBehavior.y)
                });
            }
        }

        // Perform insertion sort
        var i, j;
        var loopBehavior;
        eventCount = behaviorSequence.length;
        for (var i = 0; i < eventCount; i++) {
            loopBehavior = behaviorSequence[i];

            for (j = i-1; j > -1 && behaviorSequence[j].angle > loopBehavior.angle; j--) {
                behaviorSequence[j+1] = behaviorSequence[j];
            }

            behaviorSequence[j+1] = loopBehavior;
        }

        // Update the sequence to the sorted list of behaviors
        var updatedEventLoop = [];
        for (var i = 0; i < behaviorSequence.length; i++) {
            loopBehavior = behaviorSequence[i];
            loopBehavior.event.options.index = i; // HACK: Update the behavior's index in the loop
            updatedEventLoop.push(loopBehavior.event);
        }

        this.behaviors = updatedEventLoop;
    }

    function getAngle(x, y) {
        var deltaX = x - ($(window).width() / 2);
        var deltaY = y - ($(window).height() / 2);
        var angleInRadians = Math.atan2(deltaY, deltaX); // * 180 / PI;
        if (angleInRadians < 0) {
            angleInRadians = Math.PI + (Math.PI + angleInRadians);
        }
        angleInRadians = angleInRadians + (Math.PI / 2); // Offset by (PI / 2) radians
        if (angleInRadians > (2 * Math.PI)) {
            angleInRadians = angleInRadians - (2 * Math.PI);
        }
        return angleInRadians;
    }
}

function Behavior (options) {
    var defaults = {
        parent: null,

        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        state: 'PROTOTYPE', // NONE, PROTOTYPE, DISENGAGED, MOVING, ENTANGLED, ENGAGED
        //visible: true
        procedure: null,
        properties: [],
        options: {},
        label: '?',

        uuid: null // NOTE: This is set after receiving a response from Looper (containing the Behavior's UUID set by Looper.)
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.uuid = options.uuid;

    this.properties = options.properties;

    this.procedure = options.procedure;
    this.options = options.options;
    this.options.behavior = this; // Set the behavior associated with the procedure and options

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.state = options.state;

    this.label = options.label;

    //this.looperInstance = options.looperInstance;
    this.parent = options.parent; // The parent is the structure that semantically contains this structure as a component. The parent may also contain structure other this one.
    this.children = []; // The children are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getParent = function (options) {
        return this.parent;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getChild = function (options) {
        return this.substructure;
    }

    //! Returns the Looper for which the structure was created.
    //!
    // this.getLooper = function (options) {
    //     return this.parent;
    // }

    //! Attaches an interface to this structure, enabling it to be rendered.
    //!
    this.attachInterface = function (options) {

        // Create and attach the specified interface to this structure
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        // If no default interface has been specified, set the one that was just added as the default.
        if (this.interface === null) {
            this.interface = this.interfaces[0];
        }
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    //! TODO: Rename this to "fabricate", "visualize", "render", or something else that's more general that makes sense for any kind of representation, including but not limited to 2D screens and 3D headsets (i.e., VR).
    //!
    this.draw = function (options) {
        // console.log ("drawing behavior");
        //var interface = this.getInterface ();
        if (this.interface !== undefined && this.interface !== null) {

            // Draw this structure
            this.interface.draw ();

            // Draw the substructure
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].draw ();
            }
        }
    }
}

function Interface (options) {
    var defaults = {
        // parent: null,
        structure: null,

        type: 'none',

        xOrigin: 0,
        yOrigin: 0,
        x: 100,
        y: 100,
        xOffset: 0,
        yOffset: 0,
        xTarget: 0,
        yTarget: 0,

        // TODO: state: {},
        events: {}, // Event handlers for interaction (i.e., tap, touch, hold, swipe, etc.)
        update: null, // Function to update the state of the interface
        draw: null, // Function to draw the control interface

        visible: true,

        processing: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    //this.parent = options.parent; // The interface's "parent" that it represents graphically
    this.structure = options.structure;

    this.interfaces = []; // The interface's within this interface (if any), i.e., hierarchical/fractal interface.

    this.xOrigin = options.xOrigin;
    this.yOrigin = options.yOrigin;
    this.x = options.x;
    this.y = options.y;
    this.xOffset = options.xOffset;
    this.yOffset = options.yOffset;
    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.processing = options.processing;
    this.events = options.events;
    this.update = options.update;
    this.draw = options.draw;
    this.touches = options.touches;

    this.setPosition = function(x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }

    this.updatePosition = function() {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }

    this.show = function() {
        this.visible = true;
    }

    this.hide = function() {
        this.visible = false;
    }

    // TODO: this.attachInterface = function (options, name/tag, condition) {
    this.attachInterface = function (options) {

        // Attach the specified interface to the specified object
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        return newInterface;
    }

    // Add interface to list of interfaces
    // interfaces.push (this);
}

function BehaviorPalette (options) {
    console.log ("BehaviorPalette");

    var defaults = {
        //looperInstance: null,
        parent: null,

        x: null,
        y: null,
        xTarget: null,
        yTarget: null,
        behaviors: [],
        label: '?',
        visible: false
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    console.log ("\tCreating BehaviorPalette");
    // DEBUG: console.log (options);

    this.x = options.x;
    this.y = options.y;

    this.xTarget = options.xTarget;
    this.yTarget = options.yTarget;

    this.behaviors = options.behaviors;

    // this.state = options.state;

    this.label = options.label;

    this.visible = options.visible;

    this.setPosition = function (x, y) {
        this.xTarget = x;
        this.yTarget = y;
    }

    this.updatePosition = function () {
        this.x = this.xTarget;
        this.y = this.yTarget;
    }

    //this.looperInstance = options.looperInstance;
    this.parent = options.parent; // The parent is the structure that semantically contains this structure as a component. The parent may also contain structure other this one.
    this.children = []; // The children are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    // Add this structure to the parent's substructure.
    if (this.parent !== undefined && this.parent !== null) {
        this.parent.children.push (this);
    }

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getParent = function (options) {
        return this.parent;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getChild = function (options) {
        return this.children;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getLooper = function (options) {
        return this.parent;
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    //! TODO: Rename this to "fabricate", "visualize", "render", or something else that's more general that makes sense for any kind of representation, including but not limited to 2D screens and 3D headsets (i.e., VR).
    //!
    this.draw = function (options) {
        // console.log ("drawing palette");
        //var interface = this.getInterface ();
        if (this.interface !== undefined && this.interface !== null) {

            // Draw this structure
            this.interface.draw ();
        }

        // Draw the substructure
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw ();
        }
    }

    /**
     * Adds a behavior node to the behavior palette
     */
    this.addBehavior = function (options) {
        var defaults = {
            x: 0,
            y: 0,

            type: 'none',
            label: 'none',

            procedure: null,
            options: null,

            properties: []
        };
        var options = options || {};
        var options = $.extend({}, defaults, options);

        // Set the parent to the behavior palette
        //options.parent = this;
        options.parent = this;

        console.log("\tAdding Behavior");
        DEBUG: console.log(options);

        // Construct the behavior
        var behavior = new Behavior ({
            // parent: options.parent,
            parent: options.parent,

            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            type: options.type,
            label: options.label,

            state: 'PROTOTYPE', // Set state to prototype (i.e., showing up in the palette, still a "template")

            procedure: options.procedure,
            options: options.options,

            properties: options.properties, // Add properties to the behavior

            // TODO: Remove 'qualities'. Instead, make 'state' an object that can have multiple properties.
            //qualities: {}  // The "character" of the behavior based on it's type.
            qualities: options.qualities
        });

        // Add the Behavior to the palette's substructure
        this.children.push (behavior);

        // Attach Interface to behavior
        behavior.attachInterface ({

            // parent: behavior, // The "entity" that this interface represents visually.
            structure: behavior,

            processing: this.parent.processing,

            // xOrigin: parent.x,
            // yOrigin: parent.y,
            x: options.x, // was ev.gesture.center.pageX,
            y: options.y, // was ev.gesture.center.pageY,
            xTarget: options.x,
            yTarget: options.y,

            touches: function (x, y) {
                var radius = 50;
                console.log ("touches:");
                console.log (y + ", " + x);
                console.log (this.x + ", " + this.y);
                if ((this.x - radius < x && this.x + radius > x) && (this.y - radius < y && this.y + radius > y)) {
                    return true;
                }
                return false;
            },

            draw: function() {

                // Check if the ENGAGED action is being dragged off of the loop, and if it is, then set the state to MOVING
                // TODO: Move this to a touch event handler
                if (looper.touch.touching === true) {
                    if (looper.touch.behavior === behavior) {
                        if (behavior.state === 'ENGAGED') {

                            var distance = Math.sqrt ( Math.pow ((looper.touch.current.x) - (looper.touch.touch.x), 2) + Math.pow ((looper.touch.current.y) - (looper.touch.touch.y), 2) );
                            console.log (distance);
                                
                            if (distance > 25) {
                                behavior.state = 'MOVING';
                            }

                        }
                    }
                }

                //
                // Reset states as needed at beginning of loop
                //

                // TODO: Call this only when the user lifts finger (i.e., stops an interaction)
                looper.loop.entangled = false;
                
                //
                // Update state of entities (e.g., the behavior's position if it's moving)
                //

                if (behavior.state === 'MOVING') {

                    // currentMouseX = (behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX) - (behavior.interface.processing.screenWidth / 2);
                    // currentMouseY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);

                    // looper.zoomedCanvasMouseX = (currentMouseX - behavior.interface.processing.xOffset) / looper.zoomFactor;
                    // looper.zoomedCanvasMouseY = (currentMouseY - behavior.interface.processing.yOffset) / looper.zoomFactor;
                    // console.log (looper.canvasMouseX + ", " + looper.canvasMouseY);
                    // console.log (looper.pannedCanvasMouseX + ", " + looper.pannedCanvasMouseY);
                    // console.log (looper.canvasMouseX);
                    // console.log (looper.xOffset);
                    // console.log (looper.zoomFactor);
                    // console.log (looper.zoomedCanvasMouseX + ", " + looper.zoomedCanvasMouseY);

                    // TODO: Update zoomedCanvasMouseX and zoomedCanvasMouseY
                    // var mouseX = looper.zoomedCanvasMouseX; // var mouseX = looper.zoomedCanvasMouseX; // behavior.interface.processing.mouseX - (behavior.interface.processing.screenWidth / 2); // - behavior.interface.processing.xOffset;
                    // var mouseY = looper.zoomedCanvasMouseY; // behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2); // - behavior.interface.processing.yOffset;
                    //var nearestPosition = behavior.interface.processing.getNearestPositionOnEventLoop (mouseX, mouseY);
                    var nearestPosition = looper.getNearestPositionOnEventLoop (looper.zoomedCanvasMouseX, looper.zoomedCanvasMouseY);


                    // DEBUG: console.log ("Nearest Position: " + nearestPosition.x + ", " + nearestPosition.y);
                    
                    behavior.interface.xTarget = nearestPosition.x;
                    behavior.interface.yTarget = nearestPosition.y;

                    // behavior.interface.processing.updatePosition(behavior);

                    // // Standard update for a moving event
                    // currentMouseX = behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX;
                    // behavior.interface.x = currentMouseX;
                    // behavior.interface.y = behavior.interface.processing.mouseY;

                    // deltaX = currentMouseX - (behavior.interface.processing.screenWidth / 2);
                    // deltaY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);
                    // angleInDegrees = Math.atan2(deltaY, deltaX);

                    // behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                    // behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);

                    // behavior.state = 'MOVING';

                }



                // if (this.processing.behaviorPalette.visible) {
                if (behavior.state === 'PROTOTYPE') {

                    //this.processing.behaviorPalette.updatePosition();
                    // this.processing.updatePosition(behavior);

                    this.processing.pushMatrix();

                    // Draw the behavior
                    //this.processing.fill(66, 214, 146);
                    this.processing.noStroke(); //this.processing.stroke(200, 200, 200)
                    this.processing.fill(240, 240, 240, 200);
                    this.processing.ellipse(this.x, this.y, 100, 100);

                    primaryFont = this.processing.createFont("Comfortaa-Regular.ttf", 32);
                    this.processing.textFont(primaryFont, 20);
                    this.processing.textAlign(this.processing.CENTER);
                    this.processing.fill(65, 65, 65);
                    this.processing.text(behavior.label, this.x, this.y + 5);

                    this.processing.popMatrix();

                } else if (behavior.state === 'DISENGAGED') {

                    this.processing.noStroke();
                    this.processing.fill(66, 214, 146, 50);
                    this.processing.ellipse(behavior.interface.x, behavior.interface.y, 0.8 * behavior.geometry.diameter, 0.8 * behavior.geometry.diameter);

                } else {

                    this.processing.pushMatrix();

                    if (behavior.state === 'MOVING') {

                        // Standard update for a moving event
                        // TODO: Update this code to use existing calculated mouse coordinates
                        // currentMouseX = (behavior.interface.processing.screenWidth * (behavior.interface.processing.deviceCount + 1) + behavior.interface.processing.mouseX) - (behavior.interface.processing.screenWidth / 2);
                        // currentMouseY = behavior.interface.processing.mouseY - (behavior.interface.processing.screenHeight / 2);

                        // looper.zoomedCanvasMouseX = (currentMouseX - behavior.interface.processing.xOffset) / behavior.interface.processing.zoomFactor;
                        // looper.zoomedCanvasMouseY = (currentMouseY - behavior.interface.processing.yOffset) / behavior.interface.processing.zoomFactor;

                        // behavior.interface.x = (currentMouseX - behavior.interface.processing.xOffset) / behavior.interface.processing.zoomFactor;
                        // behavior.interface.y = (currentMouseY - behavior.interface.processing.yOffset) / behavior.interface.processing.zoomFactor;

                        // behavior.interface.x = looper.stackedZoomedCanvasMouseX;
                        // behavior.interface.y = looper.stackedZoomedCanvasMouseY;

                        behavior.interface.x = looper.zoomedCanvasMouseX;
                        behavior.interface.y = looper.zoomedCanvasMouseY;


                        //
                        // Check if under certain distance from the loop itself
                        //

                        var distanceFromLoop = looper.lineDistance (this.x, this.y, this.xTarget, this.yTarget);

                        if (distanceFromLoop < looper.loop.entanglingDistance) { // ENTANGLED

                            navigator.vibrate (5);

                            this.processing.stroke (200, 200, 200);
                            this.processing.line (this.x, this.y, this.xTarget, this.yTarget);

                            // Draw the "would be" position that the event node would occupy
                            this.processing.noStroke ();
                            this.processing.fill (66, 214, 146, 50);
                            this.processing.ellipse (behavior.interface.xTarget, behavior.interface.yTarget, 50, 50);

                            // Snap to event loop
                            if (!disableEventCreate) {
                                deltaX = this.processing.mouseX - (this.processing.screenWidth / 2);
                                deltaY = this.processing.mouseY - (this.processing.screenHeight / 2);
                                //angleInDegrees = Math.atan(deltaY / deltaX) * 180 / PI;
                                angleInDegrees = Math.atan2 (deltaY, deltaX); // * 180 / PI;

                                // behavior.interface.x = this.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                                // behavior.interface.y = this.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
                                behavior.interface.x = this.xTarget;
                                behavior.interface.y = this.yTarget;
                            }

                            // Set loop state to entangled
                            looper.loop.entangled = true;
                        }
                    }



                    // Update list of behavior (interfaces)
                    var found = false;
                    for (var i = 0; i < looper.behaviors.length; i++) {
                        if (behavior === looper.behaviors[i]) {
                            found = true;
                        }
                    }
                    if (found === false) {
                        //looper.loop.behaviors.push (behavior);
                        looper.behaviors.push (behavior);
                    }

                    // get index of current behavior (interface)
                    var behaviorIndex = -1;
                    for (var i = 0; i < looper.behaviors.length; i++) {
                        if (behavior === looper.behaviors[i]) {
                            behaviorIndex = i;
                            break;
                        }
                    }
                    currentBehavior = looper.behaviors[behaviorIndex];

                    // Update current behavior's geometry
                    // TODO: Move this elsewhere to make faster
                    currentBehavior.geometry.position = { x: this.x, y: this.y };
                    currentBehavior.geometry.diameter = 120;
                    currentBehavior.geometry.angle = this.processing.getAngleFixed (currentBehavior.geometry.position.x, currentBehavior.geometry.position.y);

                    //
                    // Draw the behavior
                    //

                    // Draw the behavior itself
                    this.processing.stroke (255, 255, 255); // (65, 65, 65);
                    this.processing.fill(220, 220, 220, 150); // (220, 220, 220, 150); // (255, 255, 255, 193);
                    this.processing.ellipse(this.x, this.y, currentBehavior.geometry.diameter, currentBehavior.geometry.diameter);
                    this.processing.fill(255, 255, 255, 200);
                    this.processing.ellipse(this.x, this.y, 0.8 * currentBehavior.geometry.diameter, 0.8 * currentBehavior.geometry.diameter);
                    primaryFont = this.processing.createFont("Comfortaa-Regular.ttf", 32);
                    this.processing.textFont(primaryFont, 20);
                    this.processing.textAlign(this.processing.CENTER);
                    this.processing.fill(65, 65, 65);
                    this.processing.text(behavior.label, this.x, this.y + 5);

                    this.processing.popMatrix();




                    //
                    // Update behavior coordinate system orientation #draw-behavior
                    //

                    if (behavior.state === 'ENGAGED') {

                        behaviorIndex = looper.loop.behaviors.indexOf (behavior);

                        //
                        // Draw the condition segment
                        //
                        if (looper.loop.behaviors[behaviorIndex].conditionType === "none") {

                            // Unconditional
                            this.processing.pushMatrix();
                            this.processing.strokeWeight (4.0);
                            this.processing.stroke (65, 65, 65);
                            this.processing.noFill ();
                            this.processing.smooth ();
                            this.processing.arc (0, 0, 2 * looper.geometry.loop.radius, 2 * looper.geometry.loop.radius, currentBehavior.condition.startAngle - (this.processing.PI / 2), currentBehavior.condition.endAngle - (this.processing.PI / 2));
                            this.processing.popMatrix();

                        } else if (looper.loop.behaviors[behaviorIndex].conditionType === "stimulus") {

                            // Draw a "stimulus" condition
                            this.processing.pushMatrix();
                            this.processing.strokeWeight (4.0);
                            this.processing.stroke (65, 65, 65);
                            this.processing.noFill ();
                            this.processing.smooth ();
                            this.processing.arc (0, 0, 2 * looper.geometry.loop.radius, 2 * looper.geometry.loop.radius, currentBehavior.condition.startAngle - (this.processing.PI / 2), currentBehavior.condition.endAngle - (this.processing.PI / 2));
                            this.processing.popMatrix();

                            // Draw the condition arc's arrowhead to indicate its sequence order
                            this.processing.pushMatrix();
                            this.processing.strokeWeight(4.0);
                            this.processing.stroke (65, 65, 65); // (65, 65, 65);
                            this.processing.rotate(-1 * currentBehavior.condition.endAngleOffset); // adjust rotation to account for offset from action
                            this.processing.translate(currentBehavior.geometry.position.x, currentBehavior.geometry.position.y);
                            this.processing.rotate(currentBehavior.geometry.angle);
                            this.processing.line(0, 0, -8, 8);
                            this.processing.line(0, 0, -8, -8);
                            this.processing.popMatrix();

                        } else if (looper.loop.behaviors[behaviorIndex].conditionType === "message") {

                            // Draw a "message" condition
                            var segmentArcLength = 0.1;
                            for (var currentAngle = currentBehavior.condition.startAngle; currentAngle < currentBehavior.condition.endAngle; currentAngle += segmentArcLength) {

                                // Draw a condition sub-segment (one of the multiple that together form a dashed line)
                                this.processing.pushMatrix();
                                this.processing.strokeWeight (4.0);
                                this.processing.stroke (65, 65, 65);
                                this.processing.noFill ();
                                this.processing.smooth ();
                                this.processing.arc (0, 0, 2 * looper.geometry.loop.radius, 2 * looper.geometry.loop.radius, currentAngle - (this.processing.PI / 2), (currentAngle + (segmentArcLength / 2)) - (this.processing.PI / 2));
                                this.processing.popMatrix();
                            }

                            // Draw the condition arc's arrowhead to indicate its sequence order
                            this.processing.pushMatrix();
                            this.processing.strokeWeight(4.0);
                            this.processing.stroke (65, 65, 65); // (65, 65, 65);
                            // this.translate(this.screenWidth / 2, this.screenHeight / 2);
                            this.processing.rotate(-1 * currentBehavior.condition.endAngleOffset); // adjust rotation to account for offset from action
                            this.processing.translate(currentBehavior.geometry.position.x, currentBehavior.geometry.position.y);
                            this.processing.rotate(currentBehavior.geometry.angle);
                            this.processing.line(0, 0, -8, 8);
                            this.processing.line(0, 0, -8, -8);
                            this.processing.popMatrix();

                        } else if (looper.loop.behaviors[behaviorIndex].conditionType === "gesture") {

                            // Draw a "gesture" condition
                            var segmentArcLength = 0.1;
                            var previousSegmentEndpoint = null;
                            var maximumAmplitude = 50;
                            for (var currentAngle = currentBehavior.condition.startAngle; currentAngle < currentBehavior.condition.endAngle; currentAngle += segmentArcLength) {

                                var breakLoop = false;
                                if ((currentAngle + segmentArcLength) > (currentBehavior.condition.endAngle)) {
                                //if ((currentAngle + segmentArcLength) > (currentBehavior.condition.endAngle - currentBehavior.condition.endAngleOffset)) {
                                    segmentArcLength = (currentBehavior.condition.endAngle) - currentAngle;
                                    // currentAngle = currentBehavior.condition.startAngle + currentBehavior.condition.startAngleOffset;
                                    breakLoop = true;
                                }

                                // if (currentAngle  currentBehavior.condition.startAngle) {
                                //     currentAngle = currentBehavior.condition.startAngle + currentBehavior.condition.startAngleOffset;
                                // }

                                // Draw the condition
                                this.processing.pushMatrix();
                                this.processing.strokeWeight (4.0);
                                this.processing.stroke (65, 65, 65);
                                this.processing.noFill ();
                                this.processing.smooth ();

                                var computedStartAmplitude = 2 * looper.geometry.loop.radius + Math.random () * maximumAmplitude - (maximumAmplitude / 2);
                                if (currentAngle === currentBehavior.condition.startAngle) { computedStartAmplitude = 2 * looper.geometry.loop.radius; }
                                var startPosition = this.processing.getPosition (currentAngle, computedStartAmplitude);
                                if (previousSegmentEndpoint !== null) { startPosition = previousSegmentEndpoint; }
                                var computedEndAmplitude = 2 * looper.geometry.loop.radius + Math.random () * maximumAmplitude - (maximumAmplitude / 2);
                                if ((currentAngle + segmentArcLength) >= currentBehavior.condition.endAngle) { computedEndAmplitude = 2 * looper.geometry.loop.radius; }
                                var endPosition = this.processing.getPosition (currentAngle + segmentArcLength, computedEndAmplitude);
                                previousSegmentEndpoint = endPosition;

                                // this.processing.rotate(-1 * currentBehavior.condition.endAngleOffset); // adjust rotation to account for offset from action
                                this.processing.rotate(-1 * this.processing.PI / 2);
                                this.processing.line(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                                this.processing.popMatrix();

                                if (breakLoop === true) {
                                    break;
                                }
                            }

                            // Draw the condition arc segment's arrow
                            this.processing.pushMatrix();

                            // Draw the loop's arrowhead to indicate its sequence order
                            this.processing.strokeWeight(4.0);
                            this.processing.stroke (65, 65, 65); // (65, 65, 65);
                            this.processing.rotate(-1 * currentBehavior.condition.endAngleOffset); // adjust rotation to account for offset from action
                            this.processing.translate(currentBehavior.geometry.position.x, currentBehavior.geometry.position.y);
                            this.processing.rotate(currentBehavior.geometry.angle);
                            this.processing.line(0, 0, -8, 8);
                            this.processing.line(0, 0, -8, -8);

                            this.processing.popMatrix();

                        }

                    }

                    this.processing.strokeWeight (2.0);



                    if (behavior.state === 'FOCUS') {

                        // TODO: Zoom in on behavior and lay out its properties on the side of it

                        var sliderCount = behavior.properties.length;
                        var sliderGapLength = 50;
                        var sliderGroupLength = (sliderCount - 1) * sliderGapLength;
                        var sliderOffsetY = -1 * (sliderGroupLength / 2);

                        for (var i = 0; i < sliderCount; i++) {

                            // slider = new Slider ({ parent: looper.getCurrentDevice() });
                            if (behavior.sliders === undefined || behavior.sliders === null) {
                                behavior.sliders = {};
                            }

                            if (behavior.sliders.hasOwnProperty (behavior.properties[i].name) === false) {
                                // console.log ("EH?");
                                // console.log (behavior);
                                newSlider = new Slider ({ parent: behavior, xOrigin: behavior.interface.x, yOrigin: behavior.interface.y, properties: behavior.properties[i] });
                                newSlider.x = 0;
                                newSlider.yTarget = sliderOffsetY + i * sliderGapLength;
                                // behavior.sliders.push (newSlider);
                                behavior.sliders[(behavior.properties[i].name)] = newSlider;

                                // if (behavior.slider1 === undefined || behavior.slider === null) {
                                //     // console.log ("EH?");
                                //     // console.log (behavior);
                                //     behavior.slider1 = new Slider ({ parent: behavior, xOrigin: behavior.interface.x, yOrigin: behavior.interface.y, properties: behavior.properties[1] });
                                //     console.log(behavior.slider1);
                                //     behavior.slider1.x = 0;
                                //     behavior.slider1.yTarget = 0 + i * 50;
                                // }
                            }

                            // Draw sub-interfaces!
                            for (var j = 0; j < behavior.interface.interfaces.length; j++) {
                                behavior.interface.interfaces[j].xOrigin = behavior.interface.x;
                                behavior.interface.interfaces[j].yOrigin = behavior.interface.y;
                                behavior.interface.interfaces[j].draw ();
                            }

                        }
                    }

                }

            },

            events: {
                tap: function() {
                    console.log("tap Behavior");
                },

                touch: function() {
                    console.log("touch Behavior");

                    looper.touch.behavior = behavior;

                    disableEventCreate = true;

                    if (behavior.state === 'PROTOTYPE') {

                        // console.log("touched PROTOTYPE Behavior. Setting to MOVING.");
                        behavior.state = 'MOVING';

                        // Hide the behavior palette
                        behavior.interface.processing.behaviorPalette.visible = false;

                        if (behavior.interface.processing.behaviorPalette != null) {

                            // Remove interfaces associated with the removed behaviors
                            var interfaceCount = interfaces.length;
                            // var interfaceCount = behavior.interface.processing.loopSequence.behaviors.length;
                            // console.log("interfaceCount = " + interfaceCount);
                            for (var i = 0; i < interfaceCount; ) {

                                // DEBUG: console.log(interfaces[i]);

                                if (interfaces[i].structure.state === 'PROTOTYPE') {

                                    // Remove from structure
                                    // TODO: interfaces[i].structure.deleteInterface ();
                                    interfaces[i].structure.interface = null;

                                    // Remove from global array
                                    // TODO: Clean this up so it's not a global array! Eliminate the global array!
                                    interfaces.splice (i, 1);
                                    interfaceCount--;
                                    console.log("Removing behavior from palette...");
                                    continue;                                
                                }

                                i++;
                            }

                            // Destroy behavior palette!
                            // TODO: Make sure deleting the behavior palette doesn't ruin the structure/substructure tree.
                            behavior.interface.processing.behaviorPalette = null;

                            // Return to previous perspective
                            // TODO: Uncomment to return from palette perspective
                            // looper.zoomedCanvasMouseX = behavior.interface.processing.stackedZoomedCanvasMouseX;
                            // looper.zoomedCanvasMouseY = behavior.interface.processing.stackedZoomedCanvasMouseY;
                            // behavior.interface.processing.zoomFactor = behavior.interface.processing.stackedScaleFactor;
                            // behavior.interface.processing.panScale (looper.zoomedCanvasMouseX, -1 * looper.zoomedCanvasMouseY, behavior.interface.processing.zoomFactor);
                        }

                        if (behavior.interface.processing.behaviorPalette === null) {

                            // Zoom out to default perspective
                            //looper.zoomOut ({ x: behavior.interface.processing.screenWidth / 2, y: behavior.interface.processing.screenHeight / 2, factor: 2.0 });
                            // looper.zoomIn ({ x: 0, y: 0, factor: 0.5 });

                        }


                        // Add behavior to the Looper
                        // TODO: Delete!
                        //behavior.interface.processing.loopSequence.behaviors.push (behavior);

                        // Add behavior to the Looper #draw-behavior
                        if (behavior.geometry === undefined) { behavior.geometry = {}; }
                        if (behavior.geometry.position === undefined) { behavior.geometry.position = {}; }
                        if (behavior.condition === undefined) { behavior.condition = {}; }

                        behavior.condition.endAngleOffset = 0.35;
                        behavior.condition.startAngleOffset = 0.6;

                        looper.behaviors.push (behavior);

                        console.log ("Added behavior");

                    } else if (behavior.state === 'DISENGAGED') {

                        behavior.state = 'MOVING';

                    } else if (behavior.state === 'ENGAGED') {

                        // var distance = looper.getDistanceFromEventLoop (behavior.interface);

                        var distance = Math.sqrt ( Math.pow ((looper.touch.current.x) - (looper.touch.touch.x), 2) + Math.pow ((looper.touch.current.y) - (looper.touch.touch.y), 2) );
                        
                        if (distance > 25) {
                            behavior.state = 'MOVING';
                        }

                    }
                },

                hold: function() {
                    console.log("hold Behavior");
                },

                release: function() {
                    console.log("release Behavior");

                    if (behavior.state === 'PROTOTYPE') {

                        console.log("Releasing action prototype.");

                    }

                    if (behavior.state === 'MOVING') {

                        var distance = looper.getDistanceFromEventLoop (behavior.interface);

                        if (distance < looper.loop.entanglingDistance) {

                            looper.loop.entangled = true;

                            // TODO: Green
                            // TODO: Update position of the event node and set as "sequenced"
                            // behavior.interface.xTarget = behavior.interface.processing.screenWidth / 2 + (400 / 2) * Math.cos(angleInDegrees);
                            // behavior.interface.yTarget = behavior.interface.processing.screenHeight / 2 + (400 / 2) * Math.sin(angleInDegrees);
                            behavior.interface.x = behavior.interface.xTarget;
                            behavior.interface.y = behavior.interface.yTarget;
                            behavior.state = 'ENGAGED';

                            //
                            // Update loop ordering
                            // Tags: #draw-behavior
                            //

                            if (looper.loop.behaviors.indexOf (behavior) === -1) {
                                looper.loop.behaviors.push (behavior);
                            }

                            // Sort the list by angle
                            // Note: This should only be done when a behavior is added or removed from the loop.
                            for (var i = 0; i < looper.loop.behaviors.length; i++) {
                                for (var j = i; j < looper.loop.behaviors.length; j++) {
                                    if (looper.loop.behaviors[i].geometry.angle > looper.loop.behaviors[j].geometry.angle) {
                                        var tmp = looper.loop.behaviors[i];
                                        looper.loop.behaviors[i] = looper.loop.behaviors[j];
                                        looper.loop.behaviors[j] = tmp;
                                    }
                                }
                            }

                            // TODO: Automatically optimize position (reposition) on the loop (relative the latest inserted)
                            // var behaviorCount = looper.loop.behaviors.length;
                            // if (behaviorCount > 1) {
                            //     var angleSeparation = (2 * Math.PI) / behaviorCount;
                            //     for (var i = 0; i < behaviorCount; i++) {
                            //         var newAngle = angleSeparation * (i + 1);
                            //         var newPosition = behavior.interface.processing.getPosition (newAngle, looper.loop.radius);

                            //         looper.loop.behaviors[i].geometry.angle = newAngle;

                            //         looper.loop.behaviors[i].geometry.position = newPosition;
                            //         looper.loop.behaviors[i].interface.x = looper.loop.behaviors[i].interface.xTarget = newPosition.x; // HACK: TODO: Unify with geometry... get rid of "interface". Only the above line should be needed.
                            //         looper.loop.behaviors[i].interface.y = looper.loop.behaviors[i].interface.yTarget = newPosition.y; // HACK: TODO: Unify with geometry... get rid of "interface". Only the above line should be needed.
                            //     }
                            // }

                            // TODO: Automatically look for recognizable patterns based on updated loop and refactor if possible

                            // TODO: Upload/Submit/Push/Send the update to MCU.

                            // Callback to server to update the program
                            behavior.procedure (behavior.options);

                        } else {

                            // TODO: Remove behavior from the behavior loop!

                            console.log("DELETING");

                            // Update position of the event node and set as "disengaged"
                            behavior.state = 'DISENGAGED';

                            //
                            // Update behavior coordinate system orientation
                            // Tags: #draw-behavior
                            //

                            // Delete behavior from the loop
                            if (looper.loop.behaviors.indexOf (behavior) !== -1) {
                                looper.loop.behaviors.splice (looper.loop.behaviors.indexOf (behavior), 1); // Remove the behavior from the loop's list of behaviors
                            }

                            // Sort the list by angle
                            // Note: This should only be done when a behavior is added or removed from the loop.
                            for (var i = 0; i < looper.loop.behaviors.length; i++) {
                                for (var j = i; j < looper.loop.behaviors.length; j++) {
                                    if (looper.loop.behaviors[i].geometry.angle > looper.loop.behaviors[j].geometry.angle) {
                                        var tmp = looper.loop.behaviors[i];
                                        looper.loop.behaviors[i] = looper.loop.behaviors[j];
                                        looper.loop.behaviors[j] = tmp;
                                    }
                                }
                            }

                            // DEBUG: console.log(behavior);

                            // console.log("Deleting " + behavior.options.index);

                            //deleteBehavior({ index: behavior.options.index });
                            // deleteBehavior ({ uuid: behavior.uuid });

                            // Update loop ordering
                            // device.processing.loopSequence.updateOrdering();

                            // Push the behavior change to the server
                            // TODO: Remove the behavior from the program
                        }

                        //
                        // Update the behavior geometry
                        //
                        for (var i = 0; i < looper.loop.behaviors.length; i++) {
                            currentBehavior = looper.loop.behaviors[i];

                            currentBehavior.condition.endAngle = currentBehavior.geometry.angle - currentBehavior.condition.endAngleOffset;

                            // Set condition start angle
                            if (i > 0) {
                                var previousBehavior = looper.loop.behaviors[i - 1];
                                currentBehavior.condition.startAngle = previousBehavior.geometry.angle + previousBehavior.condition.endAngleOffset;
                            } else {
                                currentBehavior.condition.startAngle = looper.geometry.loop.startAngle + looper.geometry.loop.startAngleOffset; // currentBehavior.condition.startAngle = 0;
                            }


                            if (currentBehavior.conditionType === undefined) {
                                currentBehavior.conditionType = "none"; // i.e., "none", "stimulus", "message", "gesture")
                            }
                        }

                        // TODO: Deploy behavior to device (via HTTP requests).

                        disableEventCreate = false;

                        if (!disableEventCreate) {
                            if (behavior.interface.processing.behaviorPalette != null) {

                                // Remove interfaces associated with the removed behaviors
                                var interfaceCount = interfaces.length;
                                // DEBUG: console.log("interfaceCount = " + interfaceCount);
                                for (var i = 0; i < interfaceCount; ) {

                                    // DEBUG: console.log(interfaces[i]);

                                    if (interfaces[i].structure !== undefined && interfaces[i].structure !== null) {
                                        if (interfaces[i].structure.state === 'PROTOTYPE') {

                                            // Remove from structure
                                            // TODO: interfaces[i].structure.deleteInterface ();
                                            interfaces[i].structure.interface = null;

                                            // Remove from global array
                                            // TODO: Clean this up so it's not a global array! Eliminate the global array!
                                            interfaces.splice (i, 1);
                                            interfaceCount--;
                                            console.log ("removing...");
                                            continue;                                
                                        }
                                    }

                                    i++;
                                }

                                // Destroy behavior palette!
                                // TODO: Make sure deleting the behavior palette doesn't ruin the structure/substructure tree.
                                behavior.interface.processing.behaviorPalette = null;
                            }

                            // if (behavior.interface.processing.behaviorPalette === null) {
                            //     // Zoom out
                            //     // Center behavior palette on screen and zoom in on it
                            //     behavior.interface.processing.scaleFactor = 1.0;
                            //     behavior.interface.processing.previousCenterX = behavior.interface.processing.centerX;
                            //     behavior.interface.processing.previousCenterY = behavior.interface.processing.centerY;
                            //     behavior.interface.processing.centerX = ev.gesture.center.pageX;
                            //     behavior.interface.processing.centerY = ev.gesture.center.pageY;
                            // }
                        }

                    } else if (behavior.state === 'ENGAGED') {

                        if (behavior.properties.length > 0) {
                            disableEventCreate = true;
                            behavior.state = 'FOCUS';
                        } else {
                            disableEventCreate = false;
                        }

                    } else if (behavior.state === 'FOCUS') {

                        disableEventCreate = false;
                        behavior.state = 'ENGAGED';

                    }
                }
            }
        });



        // Specialize the standard behavior constructed above
        // IDEA: Add "behavior.history" to store the history of states (or maybe the state transformations)
        // if (behavior.type === 'light') {
        //     // behavior.qualities = {}; // Add the "character" or characteristic qualities of the behavior based on it's type.
        //     behavior.qualities = {
        //         brightness: 0
        //     };

        //     behavior.setBrightness = function(options) {
        //         var defaults = {
        //             brightness: 100
        //         };
        //         var options = options || {};
        //         var options = $.extend({}, defaults, options);

        //         // Change the brightness
        //         this.qualities.brightness = options['brightness'];
        //     }

        //     behavior.onClick = function() {
        //         if (this.qualities.brightness > 0) {
        //             this.qualities.brightness = 0;
        //             console.log("off");

        //             // Perform behavior
        //             //behavior.procedure(behavior.options);
        //             updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 0 });
        //         } else {
        //             this.qualities.brightness = 100;
        //             console.log("on");

        //             // Perform behavior
        //             //behavior.procedure(behavior.options);
        //             updateBehavior({ index: 0, pin: 5, operation: 1, type: 0, mode: 1, value: 1 });
        //         }
        //     }
        // }

        // DEBUG: console.log(behavior);
        
        this.behaviors.push (behavior); // Add the behavior to the loop.
    }
}

/**
 * Add an expressive interface to a device.
 *
 * TODO: Integrate LooperInstance with Looper
 */
function LooperInstance (options) {

    var defaults = {
        address: null,
        canvas: null
    };
    var options = options || {};
    var options = $.extend({}, defaults, options);

    this.interface = null; // The current interface to draw. Users can customize and share their Looper interface designs and use each others' designs.
    this.interfaces = []; // References to the interfaces associated with this Looper instance.

    if (options.canvas === null) {
        alert("No canvas specified.");
        return;
    }

    // this.touch = { touch: { x: null, y: null }, current: { x: null, y: null }, release: { x: null, y: null } };

    this.address = options['address'];

    this.canvas = options.canvas;

    // this.disableEventCreate = false;
    this.showPalette = false;
    this.font = null;

    /**
     * Returns the looper associated with the device.
     */
    this.getLooper = function () {
      return this.looper;
    }

    /**
     * Returns the device at the specified index.
     */
    this.getDevice = function getDevice(index) {
      return this.looper.devices[index];
    }

    /**
     * Returns the device at the specified index.
     */
    this.getAddress = function getAddress() {
      return this.address;
    }

    /**
     * Returns the behavior of the device with the specified index.
     */
    // this.getBehaviorSequence = function getBehaviorSequence (deviceIndex) {
    //   return this.looper.devices[deviceIndex].processing.loopSequence.behaviors;
    // }

    

    //this.looperInstance = options.looperInstance;
    this.parent = options.looperInstance; // The parent is the structure that semantically contains this structure as a component. The parent may also contain structure other this one.
    this.children = []; // The children are the structures that are semantically components of this structure. In other words, they are contained by this structure.

    //! Interfaces
    // TODO: (?) Set a default interface rather than null
    this.interface = null;
    this.interfaces = [];

    //! Shows the structure
    //!
    this.show = function () {
        this.visible = true;
    }

    //! Hides the structure
    //! 
    this.hide = function () {
        this.visible = false;
    }

    //! Returns the Looper for which the structure was created.
    //!
    this.getParent = function (options) {
        return this.parent;
    }

    //! Returns the components of this structure. These components may be defined statically or generatively.
    //!
    this.getChild = function (options) {
        return this.substructure;
    }

    //! Returns the Looper for which the structure was created.
    //!
    // this.getLooper = function (options) {
    //     return this.parent;
    // }

    //! Attaches an interface to this structure, enabling it to be rendered.
    //!
    this.attachInterface = function (options) {

        // Create and attach the specified interface to this structure
        var newInterface = new Interface (options);
        options.events.interface = newInterface;
        this.interfaces.push (newInterface);
        interfaces.push (newInterface);

        // If no default interface has been specified, set the one that was just added as the default.
        if (this.interface === null) {
            this.interface = this.interfaces[0];
        }
    }

    //! Returns the current interface (if any) set for this structure.
    //!
    this.getInterface = function (options) {
        return this.interface;
    }

    //! Draws the structure using the interface currently selected, if any. If there's no interface, nothing is drawn.
    //!
    this.draw = function (options) {

        // Draw this structure
        if (this.interface !== undefined && this.interface !== null) {
            this.interface.draw ();
        }

        // Draw the substructure
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw ();
        }
    }

    // TODO:
    // - setInterface (options) : allows switching the interface to visualize Looper and its tools.

    this.processing = P;
    // this.processing.canvas = canvas;
    this.processing.deviceCount = deviceCount;
    this.processing.looperInstance = this;

    looper.looperInstance = this;
}

g_deviceUrl = "";

moduleList = [];
moduleObjects = {};

// Get modules every 5 seconds
// setInterval(function () {
//     getModules ();
// }, 6000);
///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
///<reference path="../utils.ts" />
/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Start the date and time display
            TSOS.Utils.startDateDisplay();
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Build the log string.
            var str = "<div class='hostlog-item'><div class='hostlog-time'>" + this.timeHHMMSSmmm() + "</div>";
            str += "<span class='badge badge-primary'>" + source + "</span>";
            str += "<span> " + msg + "</span>";
            str += "<div class='hostlog-clock'>clock: " + clock + "</div></div>";
            var taLog = document.getElementById("taHostLog");
            // Update the log console.
            var scroll = false;
            if (Math.floor(taLog.scrollTop) == taLog.scrollHeight - 250)
                scroll = true;
            taLog.innerHTML = taLog.innerHTML + str;
            // Scroll to the bottom of the log console if we were already at the bottom
            if (scroll)
                taLog.scrollTop = taLog.scrollHeight;
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        Control.hostUpdateMemoryDisplay = function (segment) {
            TSOS.Devices.updateMemoryDisplay(segment);
        };
        Control.hostUpdateCPUDisplay = function (pc, ir, acc, x, y, zf) {
            TSOS.Devices.updateCPUDisplay(pc, ir, acc, x, y, zf);
        };
        Control.hostUpdatePCB = function (pcb) {
            TSOS.Devices.updatePCB(pcb);
        };
        Control.hostAddPCB = function (pcb) {
            TSOS.Devices.addPCB(pcb);
        };
        Control.hostRemovePCB = function (pcb) {
            TSOS.Devices.removePCB(pcb);
        };
        Control.hostUpdateHDDDisplay = function (tsb) {
            TSOS.Devices.updateHDDDisplay(tsb);
        };
        Control.hostUpdateSchedulingAlgorithm = function (algorithm) {
            TSOS.Devices.updateSchedulingAlgorithm(algorithm);
        };
        Control.hostHighlightCurrentInstruction = function (segment, pc, operands) {
            TSOS.Devices.highlightCurrentInstruction(segment, pc, operands);
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // Memory
            _Memory = new TSOS.Memory();
            console.log("created memory");
            _MemoryAccessor = new TSOS.MemoryAccessor();
            console.log("created memory accessor");
            // Memory display
            TSOS.Devices.initMemoryDisplay();
            console.log("initialized memory display");
            // HDD
            _HDD = new TSOS.HDD();
            TSOS.Devices.initHDDDisplay();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostToggleSingleStep = function () {
            _SingleStepEnabled = !_SingleStepEnabled;
            TSOS.Devices.updateSingleStepButton();
        };
        Control.hostStep = function () {
            _Kernel.krnOnStep();
        };
        Control.timeHHMMSSmmm = function () {
            var now = new Date();
            var hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds(), milliseconds = now.getMilliseconds();
            var hh = (hours < 10) ? "0" + hours.toString() : hours.toString(), mm = (minutes < 10) ? "0" + minutes.toString() : minutes.toString(), ss = (seconds < 10) ? "0" + seconds.toString() : seconds.toString(), mmm = (milliseconds < 100) ? ((milliseconds < 10) ? "00" + milliseconds.toString() : "0" + milliseconds.toString()) : milliseconds.toString();
            return hh + ":" + mm + ":" + ss + "." + mmm;
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));

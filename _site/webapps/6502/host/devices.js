///<reference path="../globals.ts" />
/* ------------
     Devices.ts

     Requires global.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and simulation scripts) is the only place that we should see "web" code, like
     DOM manipulation and TypeScript/JavaScript event handling, and so on.  (Index.html is the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Devices = /** @class */ (function () {
        function Devices() {
            _hardwareClockID = -1;
        }
        //
        // Hardware/Host Clock Pulse
        //
        Devices.hostClockPulse = function () {
            // Increment the hardware (host) clock.
            _OSclock++;
            // Call the kernel clock pulse event handler.
            _Kernel.krnOnCPUClockPulse();
        };
        //
        // Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in our text book.)
        //
        Devices.hostEnableKeyboardInterrupt = function () {
            // Listen for key press (keydown, actually) events in the Document
            // and call the simulation processor, which will in turn call the
            // OS interrupt handler.
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostDisableKeyboardInterrupt = function () {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        };
        Devices.hostOnKeypress = function (event) {
            // The canvas element CAN receive focus if you give it a tab index, which we have.
            // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
            if (event.target.id === "display") {
                event.preventDefault();
                // Note the pressed key code in the params (Mozilla-specific).
                var params = new Array(event.which, event.shiftKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        };
        Devices.initHDDDisplay = function () {
            var tableBody = document.getElementById("HDDTableBody");
            for (var i = 0; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        var tr = "<tr id='tsb" + i.toString() + j.toString() + k.toString() + "'>";
                        tr += "<td>" + i.toString() + j.toString() + k.toString() + "</td>";
                        tr += "<td>0</td>";
                        tr += "<td>---</td>";
                        tr += "<td>" + this.repeat("0", 60);
                        tableBody.innerHTML += tr;
                    }
                }
            }
        };
        Devices.updateHDDDisplay = function (tsb) {
            var tr = document.getElementById("tsb" + tsb);
            tr.children[1].innerHTML = _HDD.read(tsb)[0]; // used/unused
            tr.children[2].innerHTML = _HDD.read(tsb).slice(1, 4); // pointer
            var dataString = TSOS.Utils.stringToHexString(_HDD.read(tsb).slice(4));
            dataString += this.repeat("0", 60 - dataString.length);
            tr.children[3].innerHTML = dataString; // data
        };
        Devices.updateSchedulingAlgorithm = function (algorithm) {
            var p = document.getElementById("schedulingAlgorithm");
            p.innerText = algorithm;
        };
        Devices.initMemoryDisplay = function () {
            var rows = MEM_SEGMENTS * SEG_SIZE / 8;
            var htmlTable = document.getElementById("memoryTable");
            for (var i = 0; i < rows; i++) {
                var htmlRow = document.createElement("tr");
                // row lablel
                var hex = (i * 8).toString(16).toUpperCase();
                // pad with 0's
                while (hex.length < 3) {
                    hex = "0" + hex;
                }
                var htmlLabel = document.createElement("td");
                htmlLabel.innerText = "0x" + hex;
                htmlRow.appendChild(htmlLabel);
                // 8 fields
                for (var j = 0; j < 8; j++) {
                    var htmlField = document.createElement("td");
                    htmlField.innerText = "00";
                    htmlRow.appendChild(htmlField);
                }
                htmlTable.appendChild(htmlRow);
            }
        };
        Devices.updateMemoryDisplay = function (segment) {
            var htmlTable = document.getElementById("memoryTable");
            var htmlRows = htmlTable.childNodes;
            var segmentString = "";
            for (var i = 0; i < SEG_SIZE; i++) {
                var thisByte = _MemoryAccessor.readAddress(i, segment).toString(16).toUpperCase();
                if (thisByte.length < 2)
                    thisByte = "0" + thisByte;
                segmentString += thisByte;
            }
            var startRow = segment * SEG_SIZE / 8;
            var endRow = (segment + 1) * SEG_SIZE / 8;
            for (var i = startRow, k = 0; i < endRow; i++, k++) {
                var rowString = segmentString.slice(k * 16, k * 16 + 16);
                //console.log(rowString);
                var htmlRow = htmlRows[i];
                // write 8 bytes to a row
                for (var j = 0; j < 8; j++) {
                    htmlRow.childNodes[j + 1].innerText = rowString[2 * j] + rowString[2 * j + 1];
                }
            }
        };
        Devices.updateCPUDisplay = function (pc, ir, acc, x, y, zf) {
            var htmlTableRow = document.getElementById("cpuDisplayRow");
            htmlTableRow.children[0].innerHTML = pc.toString(16).toUpperCase();
            htmlTableRow.children[1].innerHTML = ir.toString(16).toUpperCase();
            htmlTableRow.children[2].innerHTML = acc.toString(16).toUpperCase();
            htmlTableRow.children[3].innerHTML = x.toString(16).toUpperCase();
            htmlTableRow.children[4].innerHTML = y.toString(16).toUpperCase();
            htmlTableRow.children[5].innerHTML = zf.toString(16).toUpperCase();
        };
        Devices.updatePCB = function (pcb) {
            var tr = document.getElementById('pcb' + pcb.PID);
            if (!tr)
                return;
            tr.children[0].innerHTML = pcb.PID.toString(10);
            tr.children[1].innerHTML = pcb.priority.toString(10);
            tr.children[2].innerHTML = pcb.state;
            tr.children[3].innerHTML = pcb.PC.toString(16).toUpperCase();
            tr.children[4].innerHTML = (pcb.IR === undefined ? 0 : pcb.IR).toString(16).toUpperCase();
            tr.children[5].innerHTML = pcb.Acc.toString(16).toUpperCase();
            tr.children[6].innerHTML = pcb.Xreg.toString(16).toUpperCase();
            tr.children[7].innerHTML = pcb.Yreg.toString(16).toUpperCase();
            tr.children[8].innerHTML = pcb.ZF.toString(16);
            tr.children[9].innerHTML = (pcb.inMemory ? "memory" : "disk");
        };
        Devices.addPCB = function (pcb) {
            var tbody = document.getElementById('pcbTableBody');
            var row = "<tr id='pcb" + pcb.PID + "'>";
            row += "<td>" + pcb.PID + "</td>";
            row += "<td>" + pcb.priority + "</td>";
            row += "<td>" + pcb.state + "</td>";
            row += "<td>" + pcb.PC.toString(16).toUpperCase() + "</td>";
            row += "<td>" + (pcb.IR === undefined ? 0 : pcb.IR).toString(16).toUpperCase() + "</td>";
            row += "<td>" + pcb.Acc.toString(16).toUpperCase() + "</td>";
            row += "<td>" + pcb.Xreg.toString(16).toUpperCase() + "</td>";
            row += "<td>" + pcb.Yreg.toString(16).toUpperCase() + "</td>";
            row += "<td>" + pcb.ZF + "</td>";
            row += "<td>" + (pcb.inMemory ? "memory" : "disk") + "</td>";
            row += "</tr>";
            tbody.innerHTML += row;
        };
        Devices.removePCB = function (pcb) {
            var child = document.getElementById('pcb' + pcb.PID);
            child.parentNode.removeChild(child);
        };
        Devices.highlightCurrentInstruction = function (segment, pc, operands) {
            // console.log(operands);
            // clear highlights
            this.removeClassEverywhere("memCurrentInstruction");
            this.removeClassEverywhere("memCurrentOperand");
            var htmlTable = document.getElementById("memoryTable");
            var htmlRows = htmlTable.childNodes;
            var startRow = segment * SEG_SIZE / 8;
            var thisRow = htmlRows[startRow + Math.floor(pc / 8)];
            var cells = [];
            var cellNumber = (pc % 8) + 1;
            //console.log(cellNumber);
            cells.push(thisRow.childNodes[cellNumber]);
            for (var i = 0; i < operands; i++) {
                cellNumber += 1;
                if (cellNumber > 8) {
                    thisRow = htmlRows[startRow + Math.floor(pc / 8) + 1]; // go to next row
                    cellNumber = 1;
                }
                //console.log(cellNumber);
                cells.push(thisRow.childNodes[cellNumber]);
            }
            // instruction
            cells[0].classList.add("memCurrentInstruction");
            //operands
            for (var i = 1; i < cells.length; i++) {
                cells[i].classList.add("memCurrentOperand");
            }
        };
        Devices.updateSingleStepButton = function () {
            var toggleSingleStepButton = document.getElementById("btnToggleSingleStep");
            var stepButton = document.getElementById("btnStep");
            if (_SingleStepEnabled) {
                toggleSingleStepButton.value = "Single Step: Enabled";
                stepButton.style.display = "initial";
            }
            else {
                toggleSingleStepButton.value = "Single Step: Disabled";
                stepButton.style.display = "none";
            }
        };
        Devices.removeClassEverywhere = function (className) {
            var elements = document.getElementsByClassName(className);
            while (elements[0])
                elements[0].classList.remove(className);
        };
        Devices.repeat = function (string, n) {
            if (n < 0)
                return "";
            if (n === 1)
                return string;
            return string + this.repeat(string, n - 1);
        };
        return Devices;
    }());
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));

/**
 * Mmeory manager
 * Handles reading and writing in memory
 *
 * Requires globals.ts
 */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            this.segments = {
                0: true,
                1: true,
                2: true
            };
        }
        MemoryManager.prototype.loadProgram = function (bytes) {
            if (bytes.length > SEG_SIZE * 2) {
                console.log("Memory manager: program too large");
                return -1; // too large for a segment
            }
            var segment = this.firstFreeSegment();
            console.log("Free segment:" + segment);
            if (segment > -1) {
                // write the program to segment
                // pad to SEG_SIZE bytes or length SEG_SIZE * 2
                for (var i = bytes.length; i < SEG_SIZE * 2; i++) {
                    bytes += "0";
                }
                //console.log("Padded program: " + bytes);
                // write 256 bytes to a segment
                for (var address = 0; address < SEG_SIZE; address++) {
                    // to number from hex string
                    var hexString = bytes[address * 2] + bytes[address * 2 + 1];
                    var toWrite = parseInt("0x" + hexString);
                    //console.log(toWrite);
                    _MemoryAccessor.writeAddress(address, segment, toWrite);
                }
                // segment is no longer free
                this.segments[segment] = false;
                // update memory display
                TSOS.Control.hostUpdateMemoryDisplay(segment);
                return segment;
            }
            // raise error
            else {
                console.log("Memory manager: out of memory");
                return -1;
            }
        };
        MemoryManager.prototype.getSegment = function (segment) {
            var segmentData = "";
            for (var address = 0; address < SEG_SIZE; address++) {
                var value = _MemoryAccessor.readAddress(address, segment);
                segmentData += (value < 0x10) ? "0" + value.toString(16) : value.toString(16);
            }
            while (segmentData.charAt(segmentData.length - 1) === "0") {
                segmentData = segmentData.slice(0, -1);
            }
            return segmentData;
        };
        MemoryManager.prototype.firstFreeSegment = function () {
            if (this.segments[0] == true)
                return 0;
            if (this.segments[1] == true)
                return 1;
            if (this.segments[2] == true)
                return 2;
            return -1;
        };
        MemoryManager.prototype.clearSegment = function (segment) {
            for (var address = 0; address < SEG_SIZE; address++) {
                _MemoryAccessor.writeAddress(address, segment, 0);
            }
            this.segments[segment] = true;
            TSOS.Control.hostUpdateMemoryDisplay(segment);
        };
        MemoryManager.prototype.clearAll = function () {
            for (var i = 0; i < 3; i++) {
                this.clearSegment(i);
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));

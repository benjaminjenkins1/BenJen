var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    var DeviceDriverHDD = /** @class */ (function (_super) {
        __extends(DeviceDriverHDD, _super);
        function DeviceDriverHDD() {
            var _this = _super.call(this) || this;
            _this.formatted = false;
            return _this;
        }
        DeviceDriverHDD.prototype.rollOut = function (pid, program) {
            // format hdd if not formatted
            if (!this.formatted)
                this.formatHDD();
            console.log("Rolling out " + pid);
            // log message
            var msg = "Scheduler: Rolling out process " + pid + " to disk";
            TSOS.Control.hostLog(msg, "OS");
            var pcb = _ProcessManager.processList[pid];
            // clear and free the segment
            if (pcb.inMemory) {
                _MemoryManager.clearSegment(pcb.segment);
                pcb.inMemory = false;
            }
            var filename = pcb.PID.toString(10) + ".swp";
            this.createOrOverwriteFile(filename, program);
        };
        DeviceDriverHDD.prototype.rollIn = function (pid) {
            console.log("Rolling in " + pid);
            // log message
            var msg = "Scheduler: Rolling in process " + pid + " from disk";
            TSOS.Control.hostLog(msg, "OS");
            var pcb = _ProcessManager.processList[pid];
            var filename = pid + ".swp";
            console.log("filename " + filename);
            var file = this.readFile(filename);
            var segment = _MemoryManager.loadProgram(file);
            pcb.inMemory = true;
            pcb.segment = segment;
        };
        DeviceDriverHDD.prototype.createOrOverwriteFile = function (filename, data) {
            // check if formatted
            if (!this.formatted)
                return "Disk not formated. Use the format command.";
            // check if file exists
            if (this.directoryLookup(filename) !== "---") {
                this.writeFile(filename, data);
            }
            else { // file does not exist so create then write
                this.createFile(filename);
                this.writeFile(filename, data);
            }
        };
        /**
         * Format the disk
         */
        DeviceDriverHDD.prototype.formatHDD = function () {
            // mbr block
            var mbr = this.emptyBlock();
            mbr = "1" + mbr.slice(1);
            _HDD.write("000", mbr);
            // empty blocks
            for (var i = 0; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        if (i === 0 && j === 0 && k === 0) {
                            // mbr
                            var first = this.emptyBlock();
                            first = "1---";
                            _HDD.write("000", first);
                            TSOS.Control.hostUpdateHDDDisplay("000");
                        }
                        else {
                            // empty block
                            var tsb = i.toString() + j.toString() + k.toString();
                            _HDD.write(tsb, this.emptyBlock());
                            TSOS.Control.hostUpdateHDDDisplay(tsb);
                        }
                    }
                }
            }
            this.formatted = true;
        };
        /**
         * Create a new file
         */
        DeviceDriverHDD.prototype.createFile = function (filename) {
            // check if formatted
            if (!this.formatted)
                return "Disk not formated. Use the format command.";
            // check if file exists
            if (this.directoryLookup(filename) !== "---")
                return "File already exists";
            if (filename.length > 30)
                return "File name too long.";
            var nextFreeBlock = this.nextFreeBlock();
            if (nextFreeBlock === "---")
                return "Ouf of disk space.";
            var directoryEntry = "1" + nextFreeBlock + filename;
            var directoryTsb = this.nextFreeDirectoryEntry();
            _HDD.write(directoryTsb, directoryEntry);
            _HDD.write(nextFreeBlock, "1---");
            TSOS.Control.hostUpdateHDDDisplay(directoryTsb);
            TSOS.Control.hostUpdateHDDDisplay(nextFreeBlock);
            console.log("Created file " + filename);
            return "Created file " + filename;
        };
        /**
         * Write a file to the disk
         */
        DeviceDriverHDD.prototype.writeFile = function (filename, data) {
            // check if formatted
            if (!this.formatted)
                return "Disk not formated. Use the format command.";
            // look for file in directory
            var firstBlockTsb = this.directoryLookup(filename);
            console.log("file location:" + firstBlockTsb);
            if (firstBlockTsb === "---")
                return "File not found";
            // free any blocks linked to the first, in case we are overwriting
            if (firstBlockTsb !== "---")
                this.freeLinkedBlocks(firstBlockTsb);
            // linked file allocation
            var nextTsb = firstBlockTsb;
            var nextTsbPointer;
            while (data.length > 30) {
                console.log("writing " + data.slice(0, 30) + " to " + nextTsb);
                _HDD.write(nextTsb, "1");
                nextTsbPointer = this.nextFreeBlock();
                _HDD.write(nextTsb, "1" + nextTsbPointer + data.slice(0, 30));
                TSOS.Control.hostUpdateHDDDisplay(nextTsb);
                data = data.slice(30);
                console.log("left: " + data);
                TSOS.Control.hostUpdateHDDDisplay(nextTsb);
                nextTsb = nextTsbPointer;
            }
            _HDD.write(nextTsb, "1---" + data);
            TSOS.Control.hostUpdateHDDDisplay(nextTsb);
            console.log("Wrote " + data + " to " + filename);
            return "Wrote data to " + filename;
        };
        /**
         * Read a file and return a string containing the data
         */
        DeviceDriverHDD.prototype.readFile = function (filename) {
            // check if formatted
            if (!this.formatted)
                return "Disk not formated. Use the format command.";
            // look for file in directory
            var fileLocation = this.directoryLookup(filename);
            if (fileLocation === "---")
                return "File not found";
            var dataString = "", pointer = fileLocation;
            // check if there is a pointer to the next block
            do { // read linked blocks
                dataString += _HDD.read(pointer).slice(4);
                pointer = this.pointerForBlock(pointer);
            } while (pointer !== "---");
            return dataString;
        };
        /**
         * Clear the pointer and used flag for this block and each block linked to it
         */
        DeviceDriverHDD.prototype.freeLinkedBlocks = function (tsb) {
            var pointer = _HDD.read(tsb).slice(1, 4);
            _HDD.write(tsb, "0---");
            if (pointer !== "---")
                this.freeLinkedBlocks(pointer);
            TSOS.Control.hostUpdateHDDDisplay(tsb);
        };
        /**
         * Delete a file from the disk
         */
        DeviceDriverHDD.prototype.deleteFile = function (filename) {
            // check if formatted
            if (!this.formatted)
                return "Disk not formated. Use the format command.";
            // look for file in directory
            var fileLocation = this.directoryLookup(filename);
            if (fileLocation === "---")
                return "File not found";
            // get location from directory entry
            // free blocks linked to starting location
            this.freeLinkedBlocks(fileLocation);
            // write empty block to file location
            _HDD.write(fileLocation, this.emptyBlock());
            TSOS.Control.hostUpdateHDDDisplay(fileLocation);
            // write empty block to directory entry location
            _HDD.write(fileLocation, this.emptyBlock());
            TSOS.Control.hostUpdateHDDDisplay(fileLocation);
            return "Deleted file " + filename;
        };
        /**
         * Get an array of the filenames of files currenttly on the disk
         */
        DeviceDriverHDD.prototype.fileList = function () {
            // Read filenames from all useed blocks in the directory
            var files = [];
            for (var j = 0; j <= 7; j++) {
                for (var k = 0; k <= 7; k++) {
                    var tsb = "0" + j.toString() + k.toString();
                    if (tsb !== "000") { // skip mbr
                        // check used/unused
                        if (_HDD.read(tsb)[0] === "1") {
                            var filename = _HDD.read(tsb).slice(4);
                            files.push(filename);
                        }
                    }
                }
            }
            return files;
        };
        /**
         * Find the next unused block in the hard drive
         */
        DeviceDriverHDD.prototype.nextFreeBlock = function () {
            // Find the first block in disk with used/unused = 0
            for (var i = 1; i <= 3; i++) {
                for (var j = 0; j <= 7; j++) {
                    for (var k = 0; k <= 7; k++) {
                        var tsb = i.toString() + j.toString() + k.toString();
                        // check valid/invalid bit
                        if (_HDD.read(tsb)[0] === "0")
                            return tsb;
                    }
                }
            }
            return "---";
        };
        DeviceDriverHDD.prototype.pointerForBlock = function (tsb) {
            return _HDD.read(tsb).slice(1, 4);
        };
        /**
         * Find the next unused block in the directory
         */
        DeviceDriverHDD.prototype.nextFreeDirectoryEntry = function () {
            // Find the first block in the directory with used/unused = 0
            for (var j = 0; j <= 7; j++) {
                for (var k = 0; k <= 7; k++) {
                    var tsb = "0" + j.toString() + k.toString();
                    if (tsb !== "000") { // skip mbr
                        // check used/unused
                        if (_HDD.read(tsb)[0] === "0")
                            return tsb;
                    }
                }
            }
            return "---";
        };
        /**
         * Get a pointer to the location of a file by searching the directory
         */
        DeviceDriverHDD.prototype.directoryLookup = function (filename) {
            // Look up a filename in the directory
            for (var j = 0; j <= 7; j++) {
                for (var k = 0; k <= 7; k++) {
                    var tsb = "0" + j.toString() + k.toString();
                    if (tsb !== "000") { // skip mbr
                        // check used/unused
                        if (_HDD.read(tsb)[0] === "1") {
                            // check filename
                            if (_HDD.read(tsb).slice(4) == filename)
                                return _HDD.read(tsb).slice(1, 4); // pointer only
                        }
                    }
                }
            }
            return "---"; // file not found
        };
        DeviceDriverHDD.prototype.emptyBlock = function () {
            return "0" + "---";
        };
        return DeviceDriverHDD;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));

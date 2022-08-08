///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, commandHistory, commandHistoryIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (commandHistoryIndex === void 0) { commandHistoryIndex = -1; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.commandHistory = commandHistory;
            this.commandHistoryIndex = commandHistoryIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // Enter
                    // The enter key marks the end of a console command, so 
                    // tell the shell 
                    _OsShell.handleInput(this.buffer);
                    // push the command to the front of the history and reset the command history index to 0, if the buffer isnt empty
                    if (this.buffer != "") {
                        this.commandHistoryIndex = -1;
                        this.commandHistory.unshift(this.buffer);
                    }
                    // and reset our buffer
                    this.buffer = "";
                }
                else if (chr == String.fromCharCode(9)) { // Tab
                    if (this.buffer.length > 0) {
                        this.tabCompletion(this.buffer);
                    }
                }
                else if (chr == String.fromCharCode(38)) { // Up arrow
                    // If we are at the last index in the command history, do nothing
                    if (this.commandHistoryIndex == this.commandHistory.length - 1) {
                        return;
                    }
                    // increment the command history index
                    this.commandHistoryIndex++;
                    // display the command at the current index
                    // set x position to 0
                    this.currentXPosition = 0;
                    // clear the line 
                    this.clearLine();
                    // print the prompt and the command at the current index, and assign the buffer to the command
                    this.putText(_OsShell.promptStr + this.commandHistory[this.commandHistoryIndex]);
                    this.buffer = this.commandHistory[this.commandHistoryIndex];
                }
                else if (chr == String.fromCharCode(40)) { // Down arrow
                    // If the command history index is -1
                    //    do nothing
                    if (this.commandHistoryIndex == -1) {
                        console.log(this.commandHistoryIndex);
                        console.log(this.buffer);
                        return;
                    }
                    // If the command history index is 0
                    //    clear the line
                    //    clear the buffer
                    //    set the index to -1 if it is zero
                    if (this.commandHistoryIndex == 0) {
                        this.clearLine();
                        this.buffer = "";
                        this.putText(_OsShell.promptStr);
                        this.commandHistoryIndex = -1;
                        console.log(this.commandHistoryIndex);
                        console.log(this.buffer);
                        return;
                    }
                    // display the previous command in the command history
                    // decrement the command history index
                    this.commandHistoryIndex--;
                    // set x position to 0
                    this.currentXPosition = 0;
                    // clear the line 
                    this.clearLine();
                    // print the prompt and the command at the current index, and assign the buffer to the command
                    this.putText(_OsShell.promptStr + this.commandHistory[this.commandHistoryIndex]);
                    this.buffer = this.commandHistory[this.commandHistoryIndex];
                    console.log(this.commandHistoryIndex);
                    console.log(this.buffer);
                }
                else if (chr == String.fromCharCode(8) && this.buffer.length > 0) { // Backspace
                    this.clearChar();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };
        Console.prototype.tabCompletion = function (buffer) {
            var _this = this;
            var matches = [];
            _OsShell.commandList.forEach(function (command) {
                if (command.command.startsWith(buffer))
                    matches[matches.length] = command.command;
            });
            if (matches.length === 1) {
                this.currentXPosition = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, buffer);
                _DrawingContext.clearText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, buffer);
                this.putText(matches[0]);
                this.buffer = matches[0];
            }
            else if (matches.length > 1) {
                this.advanceLine();
                matches.forEach(function (match) {
                    _this.putText(match);
                    _this.advanceLine();
                });
                this.putText(_OsShell.promptStr + this.buffer);
            }
        };
        Console.prototype.putText = function (text) {
            //console.log('put ' + text);
            if (text == "")
                return;
            var self = this;
            if (text.includes("\n")) {
                var lines = text.split("\n");
                lines.forEach(function (line) {
                    self.putText(line);
                    self.advanceLine();
                });
            }
            else {
                var lineWidth = TSOS.CanvasTextFunctions.measure(_DefaultFontFamily, _DefaultFontSize, text);
                var remainingSpace = 500 - this.currentXPosition;
                // if there is not enough space remaining break the line and try again
                if (lineWidth > remainingSpace) {
                    if (text.length == 1) {
                        self.advanceLine();
                        self.putText(text);
                    }
                    else {
                        self.putText(self.breakLine(text, remainingSpace));
                    }
                }
                else {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            var newYPosition = this.currentYPosition +
                _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // Take a snapshot of the canvas, increase the canvas size, and redraw from the snapshot
            if (newYPosition > 500) {
                var canvasImage = _DrawingContext.canvas.toDataURL();
                _DrawingContext.canvas.setAttribute("height", String(newYPosition + 5) + "px");
                var imgToDraw = new Image;
                imgToDraw.onload = function () {
                    _DrawingContext.drawImage(imgToDraw, 0, 0);
                };
                imgToDraw.src = canvasImage;
            }
            // Scroll to the bottom of the container
            var canvasContainer = document.getElementById("canvasContainer");
            canvasContainer.scrollTop = canvasContainer.scrollHeight;
            this.currentYPosition = newYPosition;
        };
        Console.prototype.clearLine = function () {
            this.currentXPosition = 0;
            var line = _OsShell.promptStr + this.buffer;
            _DrawingContext.clearText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, line);
        };
        Console.prototype.clearChar = function () {
            var lastChar = this.buffer[this.buffer.length - 1];
            // Move x position back the width of lastChar
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - offset;
            // Clear a rectangle the width of the last char
            _DrawingContext.clearText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, lastChar);
            // Remove the last character from the buffer
            this.buffer = this.buffer.slice(0, -1);
        };
        Console.prototype.breakLine = function (line, remainingSpace, idx) {
            if (idx === void 0) { idx = line.length - 1; }
            if (line.length == 1)
                return "\n" + line;
            var newLine = line.slice(0, idx) + "\n" + line.slice(idx);
            var firstLineSize = TSOS.CanvasTextFunctions.measure(_DefaultFontFamily, _DefaultFontSize, line.slice(0, idx));
            if (firstLineSize < remainingSpace) {
                return newLine;
            }
            return this.breakLine(line, remainingSpace, idx - 1);
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));

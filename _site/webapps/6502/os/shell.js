///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the currently running version of BenOS.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays the user's current location.");
            this.commandList[this.commandList.length] = sc;
            // cal
            sc = new TSOS.ShellCommand(this.shellCal, "cal", "- Displays the calendar for the current month.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Set the status message in the task bar.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validate the user program input and load it into memory.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Run a program that has been loaded into memory.");
            this.commandList[this.commandList.length] = sc;
            // test the bsod message
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Cause the kernel to trap an os error and display the BSOD message.");
            this.commandList[this.commandList.length] = sc;
            // kill a process
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- Kill a process.");
            this.commandList[this.commandList.length] = sc;
            // run all processes
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Run all resident processes.");
            this.commandList[this.commandList.length] = sc;
            // list non-terminated processes
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- List all processes.");
            this.commandList[this.commandList.length] = sc;
            // clear memory segments
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clear all memory or segment <segment>.");
            this.commandList[this.commandList.length] = sc;
            // Set the round robin quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- Set the round robin quantum.");
            this.commandList[this.commandList.length] = sc;
            // Format the hdd
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Format the hard disk.");
            this.commandList[this.commandList.length] = sc;
            // Create a file
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "- Create a file.");
            this.commandList[this.commandList.length] = sc;
            // Delete a file
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "- Delete a file.");
            this.commandList[this.commandList.length] = sc;
            // Write data to a file
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "- Write data to a file.");
            this.commandList[this.commandList.length] = sc;
            // List files
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- List files on the hard disk.");
            this.commandList[this.commandList.length] = sc;
            // Set the scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "- Set the algorithm used by the scheduler [rr, fcfs, priority].");
            this.commandList[this.commandList.length] = sc;
            // Get the scheduling algorithm
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- Get the algorithm currently in use by the scheduler.");
            this.commandList[this.commandList.length] = sc;
            // Read a file
            sc = new TSOS.ShellCommand(this.shellRead, "read", "- Read a file.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else if (cmd == "") { // Check for an empty command.
                    _StdOut.advanceLine();
                    this.putPrompt();
                }
                else { // It's just a bad command.
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lowercase the first word of the buffer
            buffer = buffer.split(" ")[0].toLowerCase() + " " + buffer.split(" ").slice(1).join(" ");
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            TSOS.Utils.resetConsoleHeight();
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText(Date());
        };
        Shell.prototype.shellCal = function (args) {
            _StdOut.putText(TSOS.Utils.calendar());
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("You are where you will have been once you get to where you're headed");
        };
        Shell.prototype.shellStatus = function (args) {
            var status = args.join(" ");
            TSOS.Utils.setStatus(status);
        };
        Shell.prototype.shellLoad = function (args) {
            if (args.length !== 0 && args.length !== 1) {
                _StdOut.putText("Usage: load [priority]\n");
                _StdOut.putText("Load a new process with priority [priority].");
                return;
            }
            else if (args.length === 1 && isNaN(parseInt(args[0]))) {
                _StdOut.putText("Priority must be numeric.");
                return;
            }
            var input = document.getElementById("taProgramInput").value;
            if (TSOS.Utils.validHex(input)) {
                var input_no_whitespace = input.replace(/\s/g, '');
                var priority = parseInt(args[0]);
                if (isNaN(priority))
                    priority = 0;
                var pid = _ProcessManager.newProcess(input_no_whitespace, priority);
                _StdOut.putText("Program loaded with PID " + pid);
            }
            else {
                _StdOut.putText("Error: Input was not valid hex.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            var pid = parseInt(args[0]);
            _ProcessManager.runProcess(pid);
        };
        Shell.prototype.shellBSOD = function (args) {
            // Cause the kernel to trap an OS error
            _Kernel.krnInterruptHandler(undefined, undefined);
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: kill <PID>\n");
                _StdOut.putText("Kill the process with pid <pid>.");
                return;
            }
            _StdOut.putText("Killing process " + args[0] + ".");
            _ProcessManager.endProcess(args[0]);
        };
        Shell.prototype.shellRunAll = function (args) {
            if (!_ProcessManager.runAll()) {
                _StdOut.putText("No processes to run.");
            }
        };
        Shell.prototype.shellPs = function (args) {
            var activeProcesses = _ProcessManager.processList.filter(function (pcb) { return pcb.state !== "terminated"; });
            if (activeProcesses.length < 1) {
                _StdOut.putText("No processes to show.");
                return;
            }
            activeProcesses.forEach(function (pcb) { return _StdOut.putText("PID:" + pcb.PID + " State: " + pcb.state + "\n"); });
        };
        Shell.prototype.shellClearMem = function (args) {
            if (args.length != 1) {
                // clear all
                _MemoryManager.clearAll();
                _StdOut.putText("Cleared all segments.");
            }
            else {
                _MemoryManager.clearSegment(args[0]);
                _StdOut.putText("Cleared segment " + args[0] + ".");
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: quantum <quantum>");
                return;
            }
            else if (!isNaN(parseInt(args[0])) && parseInt(args[0]) > 0) {
                _Scheduler.quantum = parseInt(args[0]);
                _StdOut.putText("Round robin quantum set to " + _Scheduler.quantum + ".");
                console.log(_Scheduler.quantum);
            }
            else {
                _StdOut.putText("Can't set quantum to " + args[0] + ".");
            }
        };
        Shell.prototype.shellFormat = function (args) {
            _krnHDDDriver.formatHDD();
            if (_krnHDDDriver.formatted === true)
                _StdOut.putText("Formatted HDD.");
            else
                _StdOut.putText("Error formatting HDD.");
        };
        Shell.prototype.shellCreate = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Usage: create <filename>");
                return;
            }
            var msg = _krnHDDDriver.createFile(args[0]);
            _StdOut.putText(msg);
        };
        Shell.prototype.shellDelete = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Usage: delete <filename>");
                return;
            }
            var msg = _krnHDDDriver.deleteFile(args[0]);
            _StdOut.putText(msg);
        };
        Shell.prototype.shellWrite = function (args) {
            var filename = args[0];
            var data = args.slice(1).join(" ");
            if (!(data.startsWith("'") || data.startsWith('"')) || !(data.endsWith("'") || data.endsWith('"'))) {
                _StdOut.putText("Usage: write <file> '<data>'");
                return;
            }
            var msg = _krnHDDDriver.writeFile(filename, data.slice(1, -1));
            _StdOut.putText(msg);
        };
        Shell.prototype.shellLs = function (args) {
            var files = _krnHDDDriver.fileList();
            files.forEach(function (filename) {
                _StdOut.putText(filename + "\n");
            });
        };
        Shell.prototype.shellSetSchedule = function (args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: setschedule < rr | fcfs | priority>");
                return;
            }
            switch (args[0]) {
                case "rr":
                    _Scheduler.algorithm = "Round Robin";
                    _StdOut.putText("Scheduling algorithm set to Round Robin");
                    break;
                case "fcfs":
                    _Scheduler.algorithm = "First Come First Serve";
                    _StdOut.putText("Scheduling algorithm set to First Come First Serve");
                    break;
                case "priority":
                    _Scheduler.algorithm = "Priority";
                    _StdOut.putText("Scheduling algorithm set to Priority");
                    break;
                default:
                    _StdOut.putText("Could not set scheduling algorithm to " + args[0]);
            }
            TSOS.Control.hostUpdateSchedulingAlgorithm(_Scheduler.algorithm);
        };
        Shell.prototype.shellGetSchedule = function (args) {
            _StdOut.putText("Current scheduling algorithm: " + _Scheduler.algorithm);
        };
        Shell.prototype.shellRead = function (args) {
            if (args.length != 1) {
                _StdOut.putText("Usage: read <filename>");
                return;
            }
            _StdOut.putText(_krnHDDDriver.readFile(args[0]));
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Displays the current version of JSOS.");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("Usage: man <topic>");
                        _StdOut.putText("Displays the manual entry for a command.");
                        break;
                    case "trace":
                        _StdOut.putText("Usage: trace <on | off>");
                        _StdOut.putText("Turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Usage: rot13 <string>");
                        _StdOut.putText("Apply rot13 obfuscation to <string>");
                        break;
                    case "prompt":
                        _StdOut.putText("Usage: prompt <string>");
                        _StdOut.putText("Set the prompt to <string>");
                        break;
                    case "date":
                        _StdOut.putText("Displays the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Displays the user's current location.");
                        break;
                    case "cal":
                        _StdOut.putText("Displays the calendar for the current month.");
                        break;
                    case "status":
                        _StdOut.putText("Usage: status <string>");
                        _StdOut.putText("Sets the status in the status bar to <string>.");
                        break;
                    case "load":
                        _StdOut.putText("Validate the user program input and load it into memory.");
                        break;
                    case "bsod":
                        _StdOut.putText("Cause the kernel to trap an os error and display the BSOD message.");
                        break;
                    case " load":
                        _StdOut.putText("Usage: run <PID>");
                        _StdOut.putText("Run the program previously loaded into memory with PID <PID>.");
                        break;
                    case "kill":
                        _StdOut.putText("Usage: kill <PID>");
                        _StdOut.putText("Kill the process with pid <pid>.");
                        break;
                    case "runall":
                        _StdOut.putText("Run all resident processes.");
                        break;
                    case "ps":
                        _StdOut.putText("List all processes.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Usage: clearmem [segment]");
                        _StdOut.putText("Clear memory segment [segment] if specified, or all segments otherwise.");
                        break;
                    case "quantum":
                        _StdOut.putText("Usage: quantum <quantum>");
                        _StdOut.putText("Set the round robin quantum to <quantum>.");
                        break;
                    case "format":
                        _StdOut.putText("Format the hard disk.");
                        break;
                    case "create":
                        _StdOut.putText("Usage: create <filename>");
                        _StdOut.putText("Create a file with filename <filename>");
                        break;
                    case "delete":
                        _StdOut.putText("Usage: delete <filename>");
                        _StdOut.putText("Delete the file with filename <filename>");
                        break;
                    case "write":
                        _StdOut.putText("Usage: write <file> '<data>'");
                        _StdOut.putText("Write <data> to file with filename <filename>");
                        break;
                    case "ls":
                        _StdOut.putText("List the files on the hard disk.");
                        break;
                    case "setschedule":
                        _StdOut.putText("Usage: setschedule < rr | fcfs | priority >");
                        _StdOut.putText("Set the algorithm used by the scheduler to < rr | fcfs | priority >");
                        break;
                    case "read":
                        _StdOut.putText("Usage: read <filename>");
                        _StdOut.putText("Display the contents of the file with filename <filename>");
                        break;
                    case "getschedule":
                        _StdOut.putText("Print the algorithm in use by the scheduler.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));

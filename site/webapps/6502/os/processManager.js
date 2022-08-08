var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager() {
            this.processList = [];
            this.readyQueue = new TSOS.Queue();
            this.runningPCB = null;
        }
        /**
         * Create a new process from a string
         * Roll out the process to the HDD if out of space
         */
        ProcessManager.prototype.newProcess = function (bytes, priority) {
            // try to load the program
            var segment = _MemoryManager.loadProgram(bytes);
            // create pcb
            var pcb = new TSOS.PCB(this.processList.length, segment, 1, true);
            pcb.priority = priority;
            // set inMemory according to segment
            pcb.inMemory = segment > -1 ? true : false;
            this.processList.push(pcb);
            // roll out if out of memory
            if (!pcb.inMemory) {
                _krnHDDDriver.rollOut(pcb.PID, bytes);
                console.log("rolling out bytes: " + bytes);
            }
            TSOS.Control.hostAddPCB(pcb);
            return this.processList.length - 1; // pid
        };
        ProcessManager.prototype.runProcess = function (pid) {
            var pcb = this.processList[pid];
            if (pcb === undefined) {
                _Kernel.krnWriteConsole("No process with PID " + pid);
                return false;
            }
            else if (pcb.state === "terminated") {
                _Kernel.krnWriteConsole("Process " + pid + " was terminated");
                return false;
            }
            pcb.state = "ready";
            this.readyQueue.enqueue(pcb);
            TSOS.Control.hostUpdatePCB(pcb);
            if (!_CPU.isExecuting) {
                _Scheduler.loadNext();
                _CPU.isExecuting = true;
            }
            return true;
        };
        ProcessManager.prototype.endProcess = function (pid) {
            var pcb = this.processList[pid];
            if (!pcb) {
                _Kernel.krnWriteConsole("No process with PID " + pid);
            }
            pcb.state = "terminated";
            pcb.inMemory = false;
            // remove the pcb from the ready queue if it is there (killed)
            if (_ProcessManager.readyQueue.q.indexOf(pcb) > -1) {
                _ProcessManager.readyQueue.q.splice(_ProcessManager.readyQueue.q.indexOf(pcb), 1);
            }
            // context switch to the next process in the ready queue
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
            _MemoryManager.clearSegment(pcb.segment);
            TSOS.Control.hostRemovePCB(pcb);
            return true;
        };
        ProcessManager.prototype.getRunningProcess = function () {
            return _CPU.PID;
        };
        ProcessManager.prototype.loadOnCPU = function () {
            _CPU.loadProcess(this.runningPCB);
        };
        ProcessManager.prototype.runAll = function () {
            var _this = this;
            var residentProcesses = _ProcessManager.processList.filter(function (pcb) { return pcb.state === "resident"; });
            if (residentProcesses.length > 0) {
                residentProcesses.forEach(function (pcb) { return _this.runProcess(pcb.PID); });
                return true;
            }
            return false;
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
})(TSOS || (TSOS = {}));

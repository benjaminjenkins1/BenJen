var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            this.quantum = 6;
            this.algorithm = "Round Robin";
            this.counter = 0;
        }
        Scheduler.prototype.check = function () {
            this.counter++;
            switch (this.algorithm) {
                case "First Come First Serve":
                    this.fcfs();
                    break;
                case "Priority":
                    this.priority();
                    break;
                default:
                    this.roundRobin();
            }
        };
        Scheduler.prototype.unloadProcess = function (pid) {
            //console.log(_ProcessManager.readyQueue)
            //console.log('unloading ' + pid);
            var pcb = _ProcessManager.processList[pid];
            // if the process was terminated (ended or killed)
            //    do not change its state or return it to the ready queue
            if (pcb.state != "terminated") {
                _ProcessManager.processList[pid].state = "ready";
                _ProcessManager.readyQueue.enqueue(pcb);
            }
            this.loadNext();
            TSOS.Control.hostUpdatePCB(pcb);
            //console.log(_ProcessManager.readyQueue)
        };
        Scheduler.prototype.loadNext = function () {
            // if there is no next program, stop cpu execution
            if (_ProcessManager.readyQueue.getSize() < 1) {
                _CPU.isExecuting = false;
                return;
            }
            //console.log(_ProcessManager.readyQueue)
            var pid = _ProcessManager.readyQueue.dequeue().PID;
            if (pid !== undefined) {
                console.log('loading ' + pid);
                var pcb = _ProcessManager.processList[pid];
                // roll in program if not in memory
                if (!pcb.inMemory) {
                    console.log("not in memory");
                    if (_MemoryManager.firstFreeSegment() === -1) { // out of memory so must roll out a program
                        console.log("out of memory");
                        var victim = this.getVictim(); // pcb for victim
                        console.log(victim);
                        var program = _MemoryManager.getSegment(victim.segment);
                        _krnHDDDriver.rollOut(victim.PID, program);
                        TSOS.Control.hostUpdatePCB(victim);
                        _krnHDDDriver.rollIn(pid);
                        TSOS.Control.hostUpdatePCB(pcb);
                    }
                    else
                        _krnHDDDriver.rollIn(pid); // there was a free segment so program will be rolled in there
                }
                _ProcessManager.runningPCB = pcb;
                _ProcessManager.processList[pid].state = "running";
                _ProcessManager.loadOnCPU();
                TSOS.Control.hostUpdatePCB(_ProcessManager.processList[pid]);
            }
            //console.log(_ProcessManager.readyQueue)
        };
        Scheduler.prototype.roundRobin = function () {
            if (this.counter >= this.quantum && _ProcessManager.readyQueue.getSize() > 0) {
                // switch to the next process in the ready queue
                console.log('rr switch');
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, 0));
            }
        };
        Scheduler.prototype.fcfs = function () {
            // Nothing here, processes are already scheduled fcfs via the ready queue
        };
        Scheduler.prototype.priority = function () {
            // sort ready queue by priority if it is not already
            if (!this.prioritySorted(_ProcessManager.readyQueue.q)) {
                _ProcessManager.readyQueue.q = this.prioritySort(_ProcessManager.readyQueue.q);
            }
        };
        Scheduler.prototype.contextSwitch = function () {
            //console.log(_ProcessManager.readyQueue)
            this.counter = 0;
            //console.log("Context switch");
            var msg = "Scheduler: Context switch";
            this.unloadProcess(_ProcessManager.runningPCB.PID);
            msg += " to pid " + _ProcessManager.runningPCB.PID;
            //console.log(" to pid " + _ProcessManager.runningPCB.PID);
            TSOS.Control.hostLog(msg, "OS");
            //console.log(_ProcessManager.readyQueue)
        };
        Scheduler.prototype.prioritySorted = function (q) {
            for (var i = 0; i < q.length - 1; i++) {
                // should be in descending order
                if (q[i].priority < q[i + 1].priority)
                    return false;
            }
            return true;
        };
        Scheduler.prototype.prioritySort = function (q) {
            var new_q = q.sort(function (a, b) {
                return b.priority - a.priority;
            });
            return new_q;
        };
        /**
         * Randomly select a victim for roll-out from the processes in memory
         * only happens when memory is full
         *
         * Returns the pid of the process
         */
        Scheduler.prototype.getVictim = function () {
            var n = Math.floor(Math.random() * 3);
            var processesInMemory = _ProcessManager.processList.filter(function (pcb) { return pcb.inMemory; }); // should be 3... hopefully
            return processesInMemory[n];
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));

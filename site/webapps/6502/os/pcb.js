/**
 * PCB prototype
 *
 * Requires globals.ts
 */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(pid, segment, priority, inMemory) {
            this.state = "resident";
            this.PID = pid;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.ZF = 0;
            this.segment = segment;
            this.priority = priority;
            this.inMemory = inMemory;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));

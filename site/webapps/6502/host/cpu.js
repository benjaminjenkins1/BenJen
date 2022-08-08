///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PID, PC, Acc, IR, Xreg, Yreg, ZF, isExecuting, segment, numOperands) {
            if (PID === void 0) { PID = 0; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (IR === void 0) { IR = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (ZF === void 0) { ZF = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (segment === void 0) { segment = 0; }
            if (numOperands === void 0) { numOperands = {}; }
            this.PID = PID;
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.ZF = ZF;
            this.isExecuting = isExecuting;
            this.segment = segment;
            this.numOperands = numOperands;
        }
        Cpu.prototype.init = function () {
            this.PID = 0;
            this.PC = 0;
            this.Acc = 0;
            this.IR = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.ZF = 0;
            this.isExecuting = false;
            this.segment = 0;
            this.numOperands = {
                "A9": 1,
                "AD": 2,
                "8D": 2,
                "6D": 2,
                "A2": 1,
                "AE": 2,
                "A0": 1,
                "AC": 2,
                "EA": 0,
                "0": 0,
                "EC": 2,
                "D0": 1,
                "EE": 2,
                "FF": 0
            };
        };
        Cpu.prototype.loadPCB = function (pcb) {
            this.PID = pcb.PID;
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.ZF = pcb.ZF;
            this.segment = pcb.segment;
        };
        Cpu.prototype.updatePCB = function () {
            var pcb = _ProcessManager.processList[this.PID];
            pcb.PC = this.PC;
            pcb.IR = this.IR;
            pcb.Acc = this.Acc;
            pcb.Xreg = this.Xreg;
            pcb.Yreg = this.Yreg;
            pcb.ZF = this.ZF;
            pcb.segment = this.segment;
            TSOS.Control.hostUpdatePCB(pcb);
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            TSOS.Control.hostUpdateCPUDisplay(this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.ZF);
            // fetch
            this.IR = _MemoryAccessor.readAddress(this.PC, this.segment);
            // update memory display
            //console.log('ir ' + this.IR);
            var operands = this.numOperands[this.IR.toString(16).toUpperCase()];
            TSOS.Control.hostHighlightCurrentInstruction(this.segment, this.PC, operands);
            // decode and execute
            switch (this.IR) {
                case 0xA9:
                    this.LDAconstant();
                    break;
                case 0xAD:
                    this.LDAmemory();
                    break;
                case 0x8D:
                    this.STA();
                    break;
                case 0x6D:
                    this.ADC();
                    break;
                case 0xA2:
                    this.LDXconstant();
                    break;
                case 0xAE:
                    this.LDXmemory();
                    break;
                case 0xA0:
                    this.LDYconstant();
                    break;
                case 0xAC:
                    this.LDYmemory();
                    break;
                case 0xEA:
                    this.NOP();
                    break;
                case 0x00:
                    this.BRK();
                    break;
                case 0xEC:
                    this.CPX();
                    break;
                case 0xD0:
                    this.BNE();
                    break;
                case 0xEE:
                    this.INC();
                    break;
                case 0xFF:
                    this.SYS();
                    break;
                default:
            }
            // increment counter
            this.PC += 1;
            this.PC += operands;
            // update CPU display
            TSOS.Control.hostUpdateCPUDisplay(this.PC, this.IR, this.Acc, this.Xreg, this.Yreg, this.ZF);
            // update pcb
            this.updatePCB();
        };
        Cpu.prototype.loadProcess = function (pcb) {
            this.PID = pcb.PID;
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.ZF = pcb.ZF;
            this.isExecuting = true;
            this.segment = pcb.segment;
            var firstInstructionString = _MemoryAccessor.readAddress(0, this.segment).toString(16).toUpperCase();
            TSOS.Control.hostHighlightCurrentInstruction(pcb.segment, pcb.PC, this.numOperands[firstInstructionString]);
        };
        Cpu.prototype.terminate = function () {
            this.isExecuting = false;
        };
        Cpu.prototype.getConstant = function (addr) {
            return _MemoryAccessor.readAddress(this.PC + 1, this.segment);
        };
        Cpu.prototype.getAddress = function (addr) {
            var firstAddressByte = _MemoryAccessor.readAddress(this.PC + 1, this.segment);
            var secondAddressByte = _MemoryAccessor.readAddress(this.PC + 2, this.segment);
            var address = secondAddressByte * 256 + firstAddressByte; // little-endian
            return address;
        };
        Cpu.prototype.LDAconstant = function () {
            this.Acc = this.getConstant(this.PC);
        };
        Cpu.prototype.LDAmemory = function () {
            var addr = this.getAddress(this.PC);
            this.Acc = _MemoryAccessor.readAddress(addr, this.segment);
            ;
        };
        Cpu.prototype.STA = function () {
            var addr = this.getAddress(this.PC);
            _MemoryAccessor.writeAddress(addr, this.segment, this.Acc);
            TSOS.Devices.updateMemoryDisplay(this.segment);
        };
        Cpu.prototype.ADC = function () {
            var addr = this.getAddress(this.PC);
            this.Acc += _MemoryAccessor.readAddress(addr, this.segment);
            ;
        };
        Cpu.prototype.LDXconstant = function () {
            this.Xreg = this.getConstant(this.PC);
        };
        Cpu.prototype.LDXmemory = function () {
            var addr = this.getAddress(this.PC);
            this.Xreg = _MemoryAccessor.readAddress(addr, this.segment);
        };
        Cpu.prototype.LDYconstant = function () {
            this.Yreg = this.getConstant(this.PC);
        };
        Cpu.prototype.LDYmemory = function () {
            var addr = this.getAddress(this.PC);
            this.Yreg = _MemoryAccessor.readAddress(addr, this.segment);
        };
        Cpu.prototype.NOP = function () {
            // do nothing
        };
        Cpu.prototype.BRK = function () {
            _ProcessManager.endProcess(this.PID);
        };
        Cpu.prototype.CPX = function () {
            var addr = this.getAddress(this.PC);
            var memVal = _MemoryAccessor.readAddress(addr, this.segment);
            this.ZF = memVal == this.Xreg ? 1 : 0;
        };
        Cpu.prototype.BNE = function () {
            if (this.ZF == 0) {
                var n = this.getConstant(this.PC);
                this.PC = (this.PC + n) % SEG_SIZE;
                //console.log(this.PC);
            }
        };
        Cpu.prototype.INC = function () {
            var addr = this.getAddress(this.PC);
            var value = _MemoryAccessor.readAddress(addr, this.segment) + 1;
            _MemoryAccessor.writeAddress(addr, this.segment, value);
            TSOS.Devices.updateMemoryDisplay(this.segment);
        };
        Cpu.prototype.SYS = function () {
            if (this.Xreg == 1) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONSOLE_WRITE_IRQ, "" + this.Yreg));
            }
            else if (this.Xreg == 2) {
                var addr = this.Yreg;
                var str = "";
                while (_MemoryAccessor.readAddress(addr, this.segment) != 0) {
                    var byte = _MemoryAccessor.readAddress(addr, this.segment);
                    //console.log(byte);
                    var charCode = byte;
                    str += String.fromCharCode(charCode);
                    addr++;
                }
                //console.log(str);
                _Kernel.krnWriteConsole(str);
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));

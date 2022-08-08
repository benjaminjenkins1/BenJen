/**
 * Memory Accessor
 *
 */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.readAddress = function (addr, segment) {
            if (addr <= SEG_SIZE && addr > -1) {
                return _Memory.segments[segment][addr];
            }
        };
        MemoryAccessor.prototype.writeAddress = function (addr, segment, value) {
            _Memory.segments[segment][addr] = value;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));

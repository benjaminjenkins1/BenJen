/**
 * Core memory prototype
 *
 * Requires globals.ts
 */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.segments = {};
            for (var i = 0; i < MEM_SEGMENTS; i++) {
                this.segments[i] = new Array(SEG_SIZE);
                this.segments[i].fill(0);
            }
        }
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));

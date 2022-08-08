var TSOS;
(function (TSOS) {
    var HDD = /** @class */ (function () {
        function HDD() {
        }
        HDD.prototype.write = function (tsb, data) {
            sessionStorage.setItem("HDD" + tsb, data);
        };
        HDD.prototype.read = function (tsb) {
            return sessionStorage.getItem("HDD" + tsb);
        };
        return HDD;
    }());
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));

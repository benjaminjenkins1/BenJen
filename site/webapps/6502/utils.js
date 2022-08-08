/* --------
   Utils.ts

   Utility functions.

   now requires globals.ts
   -------- */
var TSOS;
(function (TSOS) {
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        };
        Utils.rot13 = function (str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) { // We need to cast the string to any for use in the for...in construct.
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };
        Utils.calendar = function () {
            var now = new Date();
            var thisMonth = now.getMonth();
            var thisYear = now.getFullYear();
            var firstOfMonth = new Date(thisYear, thisMonth, 1);
            var firstDay = firstOfMonth.getDay();
            var cal = "";
            for (var i = 0; i < firstDay; i++) {
                cal += "   "; // 3 spaces for each day of this week not in this month
            }
            var nextDay = firstOfMonth;
            while (nextDay.getMonth() == thisMonth) {
                if (nextDay.getDay() == 0) {
                    cal += "\n"; // Add new line before Sundays
                }
                var spaces = String(nextDay.getDate()).length == 1 ? "  " : " "; // 2 spaces for 1 char dates, 1 space for 2 char dates 
                cal += String(nextDay.getDate()) + spaces;
                nextDay.setDate(nextDay.getDate() + 1); // Go to the next day
            }
            return cal;
        };
        Utils.startDateDisplay = function () {
            var _this = this;
            var elem = document.getElementById("dateDisplay");
            var date = new Date();
            elem.innerText = date.toLocaleDateString() + " - " + date.toLocaleTimeString();
            setTimeout(function () {
                _this.startDateDisplay();
            }, 500);
        };
        Utils.setStatus = function (text) {
            var elem = document.getElementById("statusDisplay");
            elem.innerText = text;
        };
        Utils.resetConsoleHeight = function () {
            var canvas = document.getElementById("display");
            canvas.setAttribute("height", "500px");
        };
        Utils.validHex = function (str) {
            var regexp = /^[0-9a-fA-f\s]+$/; // Digits, a-f, A-F, and whitespace
            return regexp.test(str);
        };
        Utils.changeConsoleColor = function (color) {
            var canvas = document.getElementById("display");
            canvas.style.background = color;
        };
        Utils.stringToHexString = function (str) {
            var hexString = "";
            for (var i = 0; i < str.length; i++) {
                hexString += str.charCodeAt(i).toString(16);
            }
            return hexString;
        };
        return Utils;
    }());
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));

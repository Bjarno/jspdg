function $(ids) {
    function n() {
        this.add = function () {
            return new n();
        };
        this.html = function() {
        	return new n();
        };
        this.addClass = function () {
            return new n();
        };
        this.append = function () {
            return new n();
        };
        this.click = function () {
            return new n();
        };
        this.empty = function () {
            return new n();
        };
        this.map = function () {
            return new n();
        };
        this.on = function () {
            return new n();
        };
        this.show = function () {
            return new n();
        };
        this.hide = function () {
            return new n();
        };
        this.text = function (txt) {
            return '';
        };
        this.val = function () {
            return '';
        };
        this.getContext = function () {
            return {};
        };
    }
    ;
    return new n();
}
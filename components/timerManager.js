export default class timerManager {
    constructor(props) {
        this.options = Object.assign({}, props);
        this.start;
        this.remaining = this.options.time;
        this.callback = this.options.callback;
        this.resume();
    }

    pause() {
        window.clearTimeout(window.timerId);
        this.remaining -= Date.now() - this.start;
    };

    resume() {
        this.start = Date.now();
        window.clearTimeout(window.timerId);
        window.timerId = window.setTimeout(this.callback, this.remaining);
    };

    clear() {
        window.clearTimeout(window.timerId);
    };

}
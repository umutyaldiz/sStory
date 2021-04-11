export default class swipe {
    constructor() {
        this.xDown = null;
        this.yDown = null;
        this.bounce = 100;
    }

    handleTouchStart(evt) {
        const firstTouch = evt.touches || evt.originalEvent.touches;
        this.xDown = firstTouch[0].clientX;
        this.yDown = firstTouch[0].clientY;
    }

    handleTouchMove = (evt) => {

        if (!this.xDown || !this.yDown) {
            return;
        }
        
        let xUp = evt.changedTouches[0].clientX;
        let yUp = evt.changedTouches[0].clientY;

        let xDiff = this.xDown - xUp;
        let yDiff = this.yDown - yUp;
        let dimension = "";

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > this.bounce) {
                dimension = "left";
            } else if (xDiff < -Math.abs(this.bounce)) {
                dimension = "right";
            }
        } else {
            if (yDiff > this.bounce) {
                dimension = "up";
            } else if (yDiff < -Math.abs(this.bounce)) {
                dimension = "down";
            }
        }
        this.xDown = null;
        this.yDown = null;
        return dimension;
    }
}
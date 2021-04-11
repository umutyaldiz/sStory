export default class modal {
    constructor(props) {
        this.options = Object.assign({}, props);
        this.mediaWrapper = document.querySelector(this.options.mediaWrapperClass);
        
    }
    clear() {
        this.videoClear();
        this.mediaWrapper.innerHTML = "";
    }

    videoClear() {

        let videos = this.mediaWrapper.querySelectorAll('video');
        for (let i = 0, videoLength = videos.length; i < videoLength; i++) {
            videos[i].pause();
            videos[i].currentTime = 0;
            videos[i].removeAttribute("src");
            videos[i].load();
        }

    }

    close() {
        this.mediaWrapper.classList.remove("active");       
        this.clear();
        if(window.timerId){
            window.clearTimeout(window.timerId);
        }
    }



}
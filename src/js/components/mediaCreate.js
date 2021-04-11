import EventEmitter from 'events';
import timerManager from './timerManager';
import storage from './sessionStorage';
import modal from './modal';
import dataSend from './fetch';

export default class mediaCreate extends EventEmitter {
    constructor(props) {
        super(props);

        this.defaults = props;
        this.options = Object.assign(this.defaults, props);

        this.mediaWrapper = document.querySelector(this.options.mediaWrapperClass)
        this.mediaItemClass = this.options.mediaItemClass;

        this.data = this.options.data;
        this.timer;
        this.currentItem = 0;
        this.selectedItem = [];
        this.progressItem = [];
        this.currentVideo = "";
        this.storage = new storage();
        this.dataSend = new dataSend();
        this.videoMute = this.storage.get("storyMuted");
        this.mediaLoaded = true;

        this.prevButton = document.createElement("button");
        this.nextButton = document.createElement("button");

        this.resumed = false;
        this.paused = false;
        this.modal = new modal(this.options);

        this.init();
    }

    buildItem() {

        const self = this;
        const item = self.data;
        const media = item.media;

        self.modal.clear();

        let mediasDiv = document.createElement("div");
        mediasDiv.className = "media-wrapper";

        let items = document.createElement("div");
        items.className = "items";

        let progress = document.createElement("div");
        progress.className = "progress";

        items.appendChild(progress);

        for (let i = 0, itemLength = media.length; i < itemLength; i++) {
            let progressItem = document.createElement("span");
            progressItem.className = "progress-item";

            let progressBar = document.createElement("span");
            progressBar.style["-webkit-animation-duration"] = media[i].time + "s";

            progressItem.appendChild(progressBar);
            progress.appendChild(progressItem);

            let html = document.createElement("div");
            html.className = this.mediaItemClass;
            html.setAttribute("data-id", i);

            const buttonClose = self.buildCloseButton(); //close button
            const head = self.buildHead(item); //head
            const body = self.buildBody(media[i]); //body
            const buttons = self.buildButtons(media[i]); //buttons
            const sharePopup = self.buildSharePopup(media[i].social); //share popup

            html.appendChild(buttonClose);
            html.appendChild(head);
            html.appendChild(body);
            html.appendChild(buttons);
            html.appendChild(sharePopup);

            items.appendChild(html)
            mediasDiv.appendChild(items);

            if (i == (itemLength - 1)) {

                this.prevButton = document.createElement("button");
                this.prevButton.className = "navigation prev-button";
                this.prevButton.innerHTML = "Geri";
                this.prevButton.addEventListener("click", () => {
                    this.prev();
                });

                this.nextButton = document.createElement("button");
                this.nextButton.className = "navigation next-button";
                this.nextButton.innerHTML = "İleri";
                this.nextButton.addEventListener("click", () => {
                    this.next();
                });

                items.appendChild(this.prevButton);
                items.appendChild(this.nextButton);
                self.append(mediasDiv);
                self.open();
            }
        }

    }

    timeRelative(ts) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsedTime = new Date() - new Date(parseInt(ts));
        var returnItem = "";

        if (elapsedTime < msPerMinute) {
            returnItem = Math.round(elapsedTime / 1000) + ' saniye önce';
        } else if (elapsedTime < msPerHour) {
            returnItem = Math.round(elapsedTime / msPerMinute) + ' dakika önce';
        } else if (elapsedTime < msPerDay) {
            returnItem = Math.round(elapsedTime / msPerHour) + ' saat önce';
        } else if (elapsedTime < msPerMonth) {
            returnItem = Math.round(elapsedTime / msPerDay) + ' gün önce';
        } else if (elapsedTime < msPerYear) {
            returnItem = Math.round(elapsedTime / msPerMonth) + ' ay önce';
        } else {
            returnItem = Math.round(elapsedTime / msPerYear) + ' yıl önce';
        }

        return returnItem;
    }

    buildHead(item) {
        const self = this;
        let head = document.createElement("div");
        head.className = "head";

        let headInfo = document.createElement("div");
        headInfo.className = "head-info";

        let buttons = document.createElement("div");
        buttons.className = "buttons";

        // let closeButton = document.createElement("button");
        // closeButton.className = "close";
        // closeButton.innerHTML = "Kapat";

        // closeButton.addEventListener("click", () => {
        //     this.close();
        // });

        // buttons.appendChild(closeButton);

        let cover = document.createElement("span");
        cover.className = "cover";

        let coverImg = document.createElement("img");
        coverImg.src = item.cover;

        let storyInfo = document.createElement("div");
        storyInfo.className = "story-info";

        let storyTitle = document.createElement("span");
        storyTitle.className = "title";
        storyTitle.innerText = item.title;

        let storyTime = document.createElement("span");
        storyTime.className = "time";
        storyTime.innerText = self.timeRelative(item.updateTime);

        storyInfo.appendChild(storyTitle);
        storyInfo.appendChild(storyTime);

        cover.appendChild(coverImg);
        headInfo.appendChild(cover);
        headInfo.appendChild(storyInfo);
        head.appendChild(headInfo);


        head.appendChild(buttons);
        return head;
    }

    buildCloseButton() {
        let closeDiv = document.createElement('div');
        closeDiv.className = "close-button";

        let closeButton = document.createElement("button");
        closeButton.className = "close";
        closeButton.innerHTML = "Kapat";

        closeButton.addEventListener("click", () => {
            this.close();
        });

        closeDiv.appendChild(closeButton);
        return closeDiv;
    }

    buildBody(item) {
        const self = this;

        let body = document.createElement("div");
        body.className = "body";

        let mediaItem = document.createElement("div");
        mediaItem.className = "media-item";

        let mediaTitle = document.createElement("label");
        mediaTitle.innerText = item.title;

        let media = "";
        if (item.type === "video") {
            media = document.createElement("video");
            media.muted = true;
            media.autoplay = false;
            media.setAttribute("webkit-playsinline", true);
            media.setAttribute("playsinline", true);
            media.preload = "metadata";
            //media.src = item.src;
            media.setAttribute("data-src", item.src);
        } else if (item.type === "image" || item.type === "survey") {
            media = document.createElement("img");
            media.src = item.src;
            media.onerror = () => {
                media.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjkiIGhlaWdodD0iMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGlkPSJzdmdfMiIgZmlsbD0iI2ZmZmZmZiIgZD0ibTI2LjQ3NSwyLjk1Yy0yLjg4OSwtMi44ODkgLTcuNDAxLC0zLjE0NiAtMTAuNTksLTAuNzljMC4yNzcsMC40NTQgMC41NjMsMC45MDQgMC44MywxLjM2M2MwLjUyMywwLjg2OCAxLjAxMiwxLjc1MiAxLjQ5MywyLjYzOWMwLjQ5MywwLjg4MiAwLjk2OCwxLjc3MiAxLjQyNywyLjY2OWwwLjU2MywxLjA5OGwtMS4xODgsMC42NjhjLTIuMjQyLDEuMjYxIC00LjUyOSwyLjQzNSAtNi44MzgsMy41NjNjMC42MzksMi4xMTEgMS4yMzIsNC4yMzkgMS43NTEsNi4zOTFjMC4xNjksMC42MzkgMC4yOTgsMS4yOTEgMC40NDMsMS45MzZjMC4xNDMsMC42NDcgMC4yODksMS4yOTMgMC40MDYsMS45NDljMC4wOSwwLjQ2NCAwLjE3MSwwLjkzMiAwLjI1MywxLjM5OGMwLjI0OCwtMC4xOTYgMC40OTIsLTAuNDAzIDAuNzIxLC0wLjYzM2wxMC43MjksLTEwLjcyOWMzLjE4MSwtMy4xODEgMy4xODEsLTguMzQgMCwtMTEuNTIyeiIvPgogIDxwYXRoIGlkPSJzdmdfMyIgZmlsbD0iI2ZmZmZmZiIgZD0ibTEyLjY5NywyMy4wNDNjLTAuMjcxLC0wLjYwNCAtMC41NTksLTEuMjAyIC0wLjgwNywtMS44MTRjLTEuMDQ2LC0yLjQyOSAtMi4wMDcsLTQuODg3IC0yLjg4MywtNy4zNzJsLTAuNDE2LC0xLjE4MmwxLjE1NiwtMC42MDRjMi4yODUsLTEuMTkzIDQuNjA1LC0yLjMxNSA2Ljk1NSwtMy4zNzhjLTAuMiwtMC41MjQgLTAuNDA3LC0xLjA0NSAtMC41OTcsLTEuNTc1Yy0wLjM1MiwtMC45NDYgLTAuNjk3LC0xLjg5NiAtMS4wMDcsLTIuODYxYy0wLjEyNCwtMC4zNjUgLTAuMjMxLC0wLjczNyAtMC4zNDksLTEuMTA0bC0wLjI0MywwLjI0M2wtMC41NzIsLTAuNDQ2Yy0zLjE4MiwtMy4xODIgLTguNDY4LC0zLjE4MiAtMTEuNjUsMGMtMy4xODMsMy4xODIgLTMuMTE5LDguMzQxIDAuMDYzLDExLjUyMmwxMC43OTIsMTAuNzI5YzAuMjgyLDAuMjgxIDAuNjAzLDAuNTI5IDAuOTYyLDAuNzZjLTAuMTg4LC0wLjM3MSAtMC4zNzgsLTAuNzQyIC0wLjU2LC0xLjExNWMtMC4zLC0wLjU5NSAtMC41NjksLTEuMiAtMC44NDQsLTEuODAzeiIvPgogPC9nPgo8L3N2Zz4=";
            };
        } else if (item.type === "twitter-embed") {
            media = document.createElement("div");
            media.className = "twitter-embed";
            media.innerHTML = item.src;
        } else if (item.type === "youtube-embed") {
            media = document.createElement("div");
            media.className = "youtube-embed";
            let embeded = document.createElement("div");
            embeded.className = "embeded";
            embeded.innerHTML = item.src;
            media.appendChild(embeded);
        }


        mediaItem.appendChild(media);

        if (item.type != "twitter-embed") {
            mediaItem.appendChild(mediaTitle);
        }



        // mediaItem.removeEventListener("click");

        if (mediaItem.removeEventListener) {
            mediaItem.removeEventListener("click", () => { });
        }
        mediaItem.addEventListener("click", (e) => {
            const pageActivated = this.pageCoordinate(e.pageX, e.pageY);
            if (!pageActivated && this.mediaLoaded) {
                if (self.resumed) {
                    self.pause();
                    self.mediaPause();
                } else {
                    self.resume();
                    self.mediaPlay();
                }
            }
        });

        if (item.type === "survey") {
            const survey = self.buildSurvey(item); //survey
            body.appendChild(survey);
        }
        body.appendChild(mediaItem);

        return body;
    }

    voteEvent(e, item) {
        let value = e.target.value;

        this.dataSend.post(item.api, {
            "id": item.id,
            "value": value
        });

        const storageSet = JSON.parse(this.storage.get("mediaWatchSet")) || [];

        if (storageSet.length) {
            for (let i = 0, storageLength = storageSet.length; i < storageLength; i++) {
                const element = storageSet[i];
                if (element.id == this.data.id) {
                    element.time = new Date().getTime();
                    element.vote = true;
                }
            }
        }

        this.storage.set("mediaWatchSet", JSON.stringify(storageSet));

        this.selectedItem.querySelector('.body .survey').remove();
        this.selectedItem.querySelector('.body').appendChild(this.buildSurvey(item));

    }

    buildSurvey(item) {
        const self = this;

        let survey = item.survey;
        const voted = item.voted;

        let html = document.createElement("div");
        html.className = "survey";

        for (let i = 0, length = survey.length; i < length; i++) {
            const element = survey[i];
            let button = document.createElement("button");
            button.className = "button";
            button.setAttribute('value', element.value);
            button.style.color = element.textColor;
            button.style.backgroundColor = element.bgColor;

            let voteSpan = document.createElement('span');
            let voteCalculate = element.vote;

            const storageSet = JSON.parse(this.storage.get("mediaWatchSet")) || [];
            let votedTemp = false;
            if (storageSet.length) {
                for (let i = 0, storageLength = storageSet.length; i < storageLength; i++) {
                    const el = storageSet[i];
                    if (el.id == this.data.id) {
                        if (el.vote) {
                            votedTemp = true;
                        }
                    }
                }
            }

            if (voted || votedTemp) {
                voteSpan.style.width = voteCalculate;
                voteSpan.innerHTML = "<i>" + voteCalculate + "</i>";
            } else {
                button.addEventListener("click", (e) => {
                    self.voteEvent(e, item);
                });
            }
            button.innerText = element.name;
            button.appendChild(voteSpan);

            html.appendChild(button);
        }
        return html;
    }

    pageCoordinate(x, y) {
        var activated = false;
        if (x <= 50 && y >= 100) {
            this.prev();
            activated = true;
        } else if (x >= (window.innerWidth - 50) && y >= 100) {
            this.next();
            activated = true;
        }
        return activated;
    }

    buildButtons(item) {

        let buttons = document.createElement("div");
        buttons.className = "media-buttons";

        if (item.type === "video") {
            let mediaLoading = document.createElement("button");
            mediaLoading.className = "media-loading";
            mediaLoading.innerHTML = "<div></div><div></div><div></div><div></div>";
            buttons.appendChild(mediaLoading);

            let soundButton = document.createElement("button");
            soundButton.className = "sound";

            soundButton.addEventListener("click", () => {
                if (this.currentVideo.muted) {

                    this.storage.set("storyMuted", "false");
                    this.videoMute = "false";

                    this.currentVideo.muted = false;
                    soundButton.innerText = "Ses Kapat";
                    soundButton.classList.remove("off");

                } else {

                    this.storage.set("storyMuted", "true");
                    this.videoMute = "true";

                    this.currentVideo.muted = true;
                    soundButton.innerText = "Ses Aç";
                    soundButton.classList.add("off");

                }
            });
            buttons.appendChild(soundButton);
        }

        let shareButton = document.createElement("button");
        shareButton.className = "share";
        shareButton.innerText = this.options.language.sendLabel;

        shareButton.addEventListener("click", () => {
            this.selectedItem.querySelector('.popup').classList.toggle("active");
            this.prevButton.classList.toggle("share-active");
            this.nextButton.classList.toggle("share-active");

            this.pause();
            this.mediaPause();
        });
        buttons.appendChild(shareButton);


        return buttons;
    }

    checkSocial() {
        let valid = false;
        if (this.selectedItem.querySelectorAll('.popup .button.active').length) {
            this.selectedItem.querySelector('.popup .send').classList.add("active");
            valid = true;
        } else {
            this.selectedItem.querySelector('.popup .send').classList.remove("active");
        }
        return valid;
    }

    buildSharePopup(data) {
        let popup = document.createElement("div");
        popup.className = "popup";

        let popupClose = document.createElement("button");
        popupClose.className = "close";
        popupClose.innerHTML = "Kapat";
        popupClose.addEventListener("click", () => {
            this.selectedItem.querySelector('.popup').classList.toggle("active");
            this.prevButton.classList.toggle("share-active");
            this.nextButton.classList.toggle("share-active");

            this.resume();
            this.mediaPlay();
        });

        let label = document.createElement("label");
        label.innerHTML = this.options.language.sendLabel;

        popup.appendChild(popupClose);
        popup.appendChild(label);

        for (let i = 0, length = data.length; i < length; i++) {
            const item = data[i];
            let button = this.buildSocialItem(item.type, item.text, item.shortLink);
            button.addEventListener("click", () => {
                button.classList.toggle("active");
                this.checkSocial();
            });
            popup.appendChild(button);
        }

        let sendButton = document.createElement("button");
        sendButton.className = "send";
        sendButton.innerHTML = this.options.language.sendButton;
        sendButton.addEventListener("click", () => {
            if (this.checkSocial()) {
                const socials = this.selectedItem.querySelectorAll('.popup .button.active button');
                for (let i = 0, socialLength = socials.length; i < socialLength; i++) {
                    const element = socials[i];
                    const url = element.getAttribute("data-url");
                    window.open(url, "_blank");
                }
            } else {
                return false;
            }
        });

        popup.appendChild(sendButton);

        return popup;
    }

    buildSocialItem(type, text, link) {
        let itemShare = document.createElement("div");
        itemShare.className = "button " + type;

        let button = document.createElement("button");
        button.className = "button-" + type;
        button.innerHTML = text;
        button.setAttribute("data-type", type);
        button.setAttribute("data-url", link);

        itemShare.appendChild(button);
        return itemShare;
    }

    append(item) {
        this.mediaWrapper.appendChild(item);

        this.start();
    }

    open() {
        this.mediaWrapper.classList.add("active");
    }

    close() {
        this.modal.close();
        if (this.timer) { this.timer.clear(); }
    }

    start() {

        const self = this;
        const item = self.data;
        const media = item.media;

        if (self.currentItem > (media.length - 1)) {
            self.nextStory();
            return false;
        } else if (self.currentItem < 0) {
            self.prevStory();
            return false;
        }

        let time = media[self.currentItem].time;

        this.resumed = true;
        this.paused = false;

        window.clearTimeout(window.timerId);

        self.selectedItem = document.querySelectorAll('.' + this.mediaItemClass)[self.currentItem];
        self.selectedItem.classList.add("active");
        setTimeout(() => {
            self.selectedItem.querySelector('.media-item').classList.add("animation");
        }, 25);

        self.progressItem = this.mediaWrapper.querySelectorAll('.progress .progress-item')[self.currentItem];
        self.progressItem.classList.add("active");

        self.modal.videoClear();

        if (media[self.currentItem].type === "video") {
            this.soundButtonClass();
            this.play();
        } else {
            if (media[self.currentItem].type === "twitter-embed") {
                (twttr ? twttr.widgets.load() : "")
            }
            this.currentVideo = "";
        }

        this.selectedItem.querySelector('.popup').classList.remove("active");
        this.prevButton.classList.remove("share-active");
        this.nextButton.classList.remove("share-active");

        this.timer = new timerManager({
            callback: () => {

                if (self.currentItem < (media.length - 1)) {

                    this.next(); //&Next

                } else {

                    self.nextStory(); // Next Story

                }

            },
            time: (time * 1000)
        });
    }

    play() {
        const self = this;
        this.modal.videoClear();

        this.currentVideo = this.selectedItem.querySelector("video");

        if (this.currentVideo.getAttribute('src') != this.currentVideo.getAttribute('data-src')) {
            this.currentVideo.setAttribute('src', this.currentVideo.getAttribute('data-src'));
        }

        this.currentVideo.onwaiting = () => {
            self.pause();
            this.mediaLoaded = false;
            this.selectedItem.querySelector('.media-loading').classList.add("active");

            self.progressItem = self.mediaWrapper.querySelectorAll('.progress .progress-item')[self.currentItem];
            self.progressItem.classList.add("loading");
        };

        this.currentVideo.onplaying = () => {
            self.resume();
            this.mediaLoaded = true;
            this.selectedItem.querySelector('.media-loading').classList.remove("active");

            self.progressItem = self.mediaWrapper.querySelectorAll('.progress .progress-item')[self.currentItem];
            self.progressItem.classList.remove("loading");
        };


        var playPromise = this.currentVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
            }).catch(error => {
                // Auto-play was prevented
                // Show paused UI.
            });
        }

        this.currentVideo.muted = this.videoMute == "false" ? false : true;
    }

    soundButtonClass() {
        const button = this.selectedItem.querySelector(".media-buttons .sound");
        if (this.videoMute == "false") {
            button.innerText = "Ses Kapat";
            button.classList.remove("off");
        } else {
            button.innerText = "Ses Aç";
            button.classList.add("off");
        }
    }

    mediaPlay() {

        if (this.currentVideo) {
            if (this.currentVideo.paused) { //video durdurulmuşsa
                this.currentVideo.play();
            }
        }
    }
    mediaPause() {
        if (this.currentVideo) {
            if (!this.currentVideo.paused) { //video devam ediyor ise
                this.currentVideo.pause();
            }
        }
    }
    resume() {
        this.timer.resume();
        this.resumed = true;
        this.paused = false;

        this.itemClassControl(true);
        this.progressClassControl(true);
    }

    pause() {
        this.timer.pause();
        this.resumed = false;
        this.paused = true;

        this.itemClassControl(false);
        this.progressClassControl(false);
    }

    itemClassControl(status) {
        if (status) {
            this.selectedItem.classList.remove("pause");
        } else {
            this.selectedItem.classList.add("pause");
        }
    }

    progressClassControl(status) {
        if (status) {
            this.progressItem.classList.remove("pause");
        } else {
            this.progressItem.classList.add("pause");
        }
    }

    next() {
        this.selectedItem.classList.remove("active");
        this.selectedItem.querySelector('.media-item').classList.remove("animation");
        this.selectedItem.classList.remove("pause");
        this.selectedItem.classList.add("seen");

        this.progressItem.classList.remove("active");
        this.progressItem.classList.remove("pause");
        this.progressItem.classList.remove("loading");
        this.progressItem.classList.add("seen");

        this.currentItem++; // Next
        this.start();
    }

    prev() {
        this.selectedItem.classList.remove("active");
        this.selectedItem.querySelector('.media-item').classList.remove("animation");
        this.selectedItem.classList.remove("pause");
        this.selectedItem.classList.remove("seen");

        this.progressItem.classList.remove("active");
        this.progressItem.classList.remove("pause");
        this.progressItem.classList.remove("loading");
        this.progressItem.classList.remove("seen");

        this.currentItem--; // Prev
        if (this.currentItem >= 0) {
            this.selectedItem = document.querySelectorAll('.' + this.mediaItemClass)[this.currentItem];
            this.selectedItem.classList.remove("seen");
            this.progressItem = this.mediaWrapper.querySelectorAll('.progress .progress-item')[this.currentItem];
            this.progressItem.classList.remove("seen");
        }
        this.start();
    }

    nextStory() {
        this.emit('nextStory');
    }

    prevStory() {
        this.emit('prevStory');
    }

    keydown() {
        const self = this;
        document.onkeydown = function (evt) {
            if (document.querySelector(self.options.mediaWrapperClass).classList.contains("active")) {
                evt = evt || window.event;
                if (evt.keyCode === 27) { // esc
                    self.close();
                } else if (evt.keyCode === 39) { //arrow right
                    self.next();
                } else if (evt.keyCode === 37) { //arrow left
                    self.prev();
                } else if (evt.keyCode === 38) {//arrow up

                } else if (evt.keyCode === 40) {//arrow down
                    self.close();
                }
            }
        };
    }


    init() {
        if (this.data) {
            this.buildItem();
            this.keydown();

        } else {
            this.close();
        }
    }
}
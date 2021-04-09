import mediaCreate from './mediaCreate';
import storage from './sessionStorage';
import swipe from './swipe';
import modal from './modal';

export default class thumbCreate {
    constructor(props) {
        this.default = {
            thumbWrapperClass: '.sStory-thumb-wrapper',
            thumbItemClass: 'item',
            mediaWrapperClass: '.sStory-media-wrapper',
            mediaItemClass: 'media',
            language: {
                button: "Detaylı Bilgi",
                sendLabel: "Paylaş",
                sendButton: "Gönder"
            }
        };
        this.options = Object.assign(this.default, props);
        this.thumbWrapper = document.querySelector(this.options.thumbWrapperClass);
        this.thumbItemClass = this.options.thumbItemClass;
        this.data = this.options.data;
        this.currentIndex = 0;
        this.storage = new storage();
        this.swipe = "";
        this.media = "";
        this.modal = new modal(this.options);
        this.init();
    }

    buildItem() {
        const item = this.data;
        const self = this;

        self.destroy();

        for (let i = 0, length = item.length; i < length; i++) {
            let html = document.createElement("div");
            html.className = this.thumbItemClass + (this.checkSeen(item[i]) ? " seen" : "");
            html.setAttribute("data-id", item[i].id);

            let imgWrap = document.createElement("div");
            imgWrap.className = "img";

            let img = document.createElement("img");
            img.src = item[i].cover;
            imgWrap.appendChild(img);

            let title = document.createElement("span");
            title.className = "title";
            title.innerText = item[i].title;


            html.appendChild(imgWrap);
            html.appendChild(title);

            html.addEventListener("click", () => {
                this.handleClick(i);
            });

            self.append(html);
        }
    }


    handleNext = () => {
        this.currentIndex++;
        this.handleClick(this.currentIndex);
    }

    handlePrev = () => {
        this.currentIndex--;
        this.handleClick(this.currentIndex);
    }

    handleClick(index) {
        this.currentIndex = index;
        this.media = "";
        this.media = new mediaCreate({
            data: this.data[this.currentIndex],
            mediaWrapperClass: this.options.mediaWrapperClass,
            mediaItemClass: this.options.mediaItemClass,
            language: this.options.language
        });
        this.media.on("nextStory", this.handleNext);
        this.media.on("prevStory", this.handlePrev);

        if (this.data[this.currentIndex]) {
            this.storySessionList();
        }

    }

    storySessionList() {
        var storageSet = [];
        var setStatus = true;
        storageSet = JSON.parse(this.storage.get("mediaWatchSet")) || [];

        if (storageSet.length) {
            for (let i = 0, storageLength = storageSet.length; i < storageLength; i++) {
                const element = storageSet[i];
                if (element.id == this.data[this.currentIndex].id) {
                    element.time = new Date().getTime();
                    setStatus = false;
                }
                if (i == (storageSet.length - 1)) {
                    if (setStatus) {
                        storageSet.push({
                            "id": this.data[this.currentIndex].id,
                            "title": this.data[this.currentIndex].title,
                            "time": new Date().getTime()
                        });
                    }
                }
            }
        } else {
            storageSet.push({
                "id": this.data[this.currentIndex].id,
                "title": this.data[this.currentIndex].title,
                "time": new Date().getTime()
            });
        }

        this.storage.set("mediaWatchSet", JSON.stringify(storageSet));

        setTimeout(() => {
            this.buildItem();
        }, 600);

    }

    append(item) {
        this.thumbWrapper.appendChild(item);
    }

    destroy() {
        this.thumbWrapper.innerHTML = "";
    }

    checkSeen(item) {
        let seen = false;
        const sessionSeen = JSON.parse(this.storage.get("mediaWatchSet")) || [];
        if (sessionSeen.length) {
            for (let i = 0, storageLength = sessionSeen.length; i < storageLength; i++) {
                const element = sessionSeen[i];
                if (element.id == item.id) {
                    if (new Date(parseInt(item.updateTime)) < new Date(parseInt(element.time))) {
                        seen = true;
                    }
                }
            }
        }
        return seen;
    }
    close() {
        this.modal.close();
    }
    dimension() {
        const self = this;

        document.querySelector(this.options.mediaWrapperClass).addEventListener('touchstart', (event) => {
            self.swipe.handleTouchStart(event);
        }, false);
        document.querySelector(this.options.mediaWrapperClass).addEventListener('touchend', (event) => {
            const dimension = self.swipe.handleTouchMove(event);
            if (dimension == "left") {
                self.handleNext();
            } else if (dimension == "right") {
                self.handlePrev();
            } else if (dimension == "up") {
                // self.up();
            } else if (dimension == "down") {
                self.close();
            }
        }, false);

    }

    init() {
        this.buildItem();
        this.swipe = new swipe();
        this.dimension();
    }
}
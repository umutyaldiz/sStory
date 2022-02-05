import EventEmitter from "events";
import timerManager from "./timer-manager";
import storage from "./storage";
import modal from "./modal";
import dataSend from "./fetch";
import mediaType from "./media-type";
import timeformat from "./time-format";
import scriptAdd from "./3dparty-add";

export default class mediaCreate extends EventEmitter {
  constructor(props) {
    super(props);

    this.defaults = props;
    this.options = Object.assign(this.defaults, props);

    this.mediaWrapper = document.querySelector(this.options.mediaWrapperClass);
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

      items.appendChild(html);
      mediasDiv.appendChild(items);

      if (i == itemLength - 1) {
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
    storyTime.innerText = timeformat(item.updateTime,this.options.language.date);

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
    let closeDiv = document.createElement("div");
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

    let mediaItem = mediaType(item);
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
      id: item.id,
      value: value,
    });

    const storageSet = JSON.parse(this.storage.get("mediaWatchSet")) || [];

    if (storageSet.length) {
      for (
        let i = 0, storageLength = storageSet.length;
        i < storageLength;
        i++
      ) {
        const element = storageSet[i];
        if (element.id == this.data.id) {
          element.time = new Date().getTime();
          element.vote = true;
        }
      }
    }

    this.storage.set("mediaWatchSet", JSON.stringify(storageSet));

    this.selectedItem.querySelector(".body .survey").remove();
    this.selectedItem
      .querySelector(".body")
      .appendChild(this.buildSurvey(item));
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
      button.setAttribute("value", element.value);
      button.style.color = element.textColor;
      button.style.backgroundColor = element.bgColor;

      let voteSpan = document.createElement("span");
      let voteCalculate = element.vote;

      const storageSet = JSON.parse(this.storage.get("mediaWatchSet")) || [];
      let votedTemp = false;
      if (storageSet.length) {
        for (
          let i = 0, storageLength = storageSet.length;
          i < storageLength;
          i++
        ) {
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
    } else if (x >= window.innerWidth - 50 && y >= 100) {
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
      this.selectedItem.querySelector(".popup").classList.toggle("active");
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
    if (this.selectedItem.querySelectorAll(".popup .button.active").length) {
      this.selectedItem.querySelector(".popup .send").classList.add("active");
      valid = true;
    } else {
      this.selectedItem
        .querySelector(".popup .send")
        .classList.remove("active");
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
      this.selectedItem.querySelector(".popup").classList.toggle("active");
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
        const socials = this.selectedItem.querySelectorAll(
          ".popup .button.active button"
        );
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
    if (this.timer) {
      this.timer.clear();
    }
  }

  start() {
    const self = this;
    const item = self.data;
    const media = item.media;

    if (self.currentItem > media.length - 1) {
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

    self.selectedItem = document.querySelectorAll("." + this.mediaItemClass)[
      self.currentItem
    ];
    self.selectedItem.classList.add("active");
    setTimeout(() => {
      self.selectedItem.querySelector(".media-item").classList.add("animation");
    }, 25);

    self.progressItem = this.mediaWrapper.querySelectorAll(
      ".progress .progress-item"
    )[self.currentItem];
    self.progressItem.classList.add("active");

    self.modal.videoClear();

    if (media[self.currentItem].type === "video") {
      this.soundButtonClass();
      this.play();
    } else {
      if (media[self.currentItem].type === "twitter-embed") {
        typeof twttr === 'undefined' ? scriptAdd("twitter") : twttr.widgets.load();
      }
      this.currentVideo = "";
    }
    
    this.selectedItem.querySelector(".popup").classList.remove("active");
    this.prevButton.classList.remove("share-active");
    this.nextButton.classList.remove("share-active");

    this.timer = new timerManager({
      callback: () => {
        if (self.currentItem < media.length - 1) {
          this.next(); //&Next
        } else {
          self.nextStory(); // Next Story
        }
      },
      time: time * 1000,
    });
  }

  play() {
    const self = this;
    this.modal.videoClear();

    this.currentVideo = this.selectedItem.querySelector("video");

    if (
      this.currentVideo.getAttribute("src") !=
      this.currentVideo.getAttribute("data-src")
    ) {
      this.currentVideo.setAttribute(
        "src",
        this.currentVideo.getAttribute("data-src")
      );
    }

    this.currentVideo.onwaiting = () => {
      self.pause();
      this.mediaLoaded = false;
      this.selectedItem.querySelector(".media-loading").classList.add("active");

      self.progressItem = self.mediaWrapper.querySelectorAll(
        ".progress .progress-item"
      )[self.currentItem];
      self.progressItem.classList.add("loading");
    };

    this.currentVideo.onplaying = () => {
      self.resume();
      this.mediaLoaded = true;
      this.selectedItem
        .querySelector(".media-loading")
        .classList.remove("active");

      self.progressItem = self.mediaWrapper.querySelectorAll(
        ".progress .progress-item"
      )[self.currentItem];
      self.progressItem.classList.remove("loading");
    };

    var playPromise = this.currentVideo.play();
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          // Automatic playback started!
          // Show playing UI.
        })
        .catch((error) => {
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
      if (this.currentVideo.paused) {
        //video durdurulmuşsa
        this.currentVideo.play();
      }
    }
  }
  mediaPause() {
    if (this.currentVideo) {
      if (!this.currentVideo.paused) {
        //video devam ediyor ise
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
    this.selectedItem
      .querySelector(".media-item")
      .classList.remove("animation");
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
    this.selectedItem
      .querySelector(".media-item")
      .classList.remove("animation");
    this.selectedItem.classList.remove("pause");
    this.selectedItem.classList.remove("seen");

    this.progressItem.classList.remove("active");
    this.progressItem.classList.remove("pause");
    this.progressItem.classList.remove("loading");
    this.progressItem.classList.remove("seen");

    this.currentItem--; // Prev
    if (this.currentItem >= 0) {
      this.selectedItem = document.querySelectorAll("." + this.mediaItemClass)[
        this.currentItem
      ];
      this.selectedItem.classList.remove("seen");
      this.progressItem = this.mediaWrapper.querySelectorAll(
        ".progress .progress-item"
      )[this.currentItem];
      this.progressItem.classList.remove("seen");
    }
    this.start();
  }

  nextStory() {
    this.emit("nextStory");
  }

  prevStory() {
    this.emit("prevStory");
  }

  keydown() {
    const self = this;
    document.onkeydown = function (evt) {
      if (
        document
          .querySelector(self.options.mediaWrapperClass)
          .classList.contains("active")
      ) {
        evt = evt || window.event;
        if (evt.keyCode === 27) {
          // esc
          self.close();
        } else if (evt.keyCode === 39) {
          //arrow right
          self.next();
        } else if (evt.keyCode === 37) {
          //arrow left
          self.prev();
        } else if (evt.keyCode === 38) {
          //arrow up
        } else if (evt.keyCode === 40) {
          //arrow down
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

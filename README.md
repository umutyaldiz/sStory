# sStory
Pure Javascript Story web application

https://storiesjs.com/
https://storiesjs.com/demos

## Installation

script:
```sh
npm i sstory
```

style:
```sh
@import '~sstory/src/sass/sstory.scss';
or
@import '~sstory/dist/sStory.min.css';
```


## Example of HTML

```html
<div class="story-area">
    <div class="sStory-thumb-wrapper"></div> //default
    <div class="sStory-media-wrapper"></div> //default
</div>
```

## Example of CODE
```javascript
var story = new sStory({
    thumbWrapperClass: '.sStory-thumb-wrapper', //default
    thumbItemClass: 'item', //default
    mediaWrapperClass: '.sStory-media-wrapper', //default
    mediaItemClass: 'media', //default
    language: { 
        button: "Detaylı Bilgi", //default
        sendLabel: "Paylaş", //default
        sendButton: "Gönder" //default
    }, 
    data: storiesData //stories-data.js JSON List
});
```

![alt text](https://storiesjs.com/sStory-cover.png)

# sStory
instagram alternative story pure javascript

https://storiesjs.com/ <br />
https://storiesjs.com/demos

<h2>Example of HTML</h2>
```html
<div class="story-area">
    <div class="sStory-thumb-wrapper"></div> //default
    <div class="sStory-media-wrapper"></div> //default
</div>
```
<h2>Example of CODE</h2>
```html

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
        data: storiesData //storiesData.js JSON List
    });
    
```
![alt text](https://storiesjs.com/sStory-ss.png)

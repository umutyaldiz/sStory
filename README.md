# sStory
instagram alternative story pure javascript

https://storiesjs.com/ <br />
https://storiesjs.com/demos

<h2>Example of code</h2>

<pre>
    <div class="story-area">
        <div class="sStory-thumb-wrapper"></div> //default
        <div class="sStory-media-wrapper"></div> //default
    </div>
</pre>

<pre>
    <code>
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
    </code>
</pre>

![alt text](https://storiesjs.com/sStory-ss.png)

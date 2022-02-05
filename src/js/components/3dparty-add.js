const scriptAdd = (type) => {

    const scripts = {
        "twitter": {
            "src": "https://platform.twitter.com/widgets.js?v=23",
            "async": true,
            "onload": () => {
                twttr.widgets.load();
                console.log('sStory twitter script added');
            }
        }
    }

    

    const script = document.createElement('script');
    script.src = scripts[type].src;
    script.async = scripts[type].async;
    script.onload = scripts[type].onload;
    document.getElementsByTagName('head')[0].appendChild(script);

}

export default scriptAdd;
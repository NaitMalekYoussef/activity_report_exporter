var debug=false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debug && console.log("req= "+request);
    if (request.action === "getCourseInfo") {

        let title = document.getElementsByClassName("h2")[0].innerText; 
        let lang=document.documentElement.lang;
        
        var links = document.getElementsByTagName("a");
        var url="";
        // Iterate over each anchor element to locate the link that downloads the data as csv file
        for (var i = 0; i < links.length; i++) {
            // Get the value of the href attribute for each anchor element
            var href = links[i].getAttribute("href");
            // Check if the href includes the string "format=csv"
            if (href && href.includes("format=csv")) {
                debug && console.log(href); 
                url=href;
            }
        }

        sendResponse({ title: title, lang:lang,url:url });
    }
});
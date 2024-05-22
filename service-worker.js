
var debug=false;

chrome.action.onClicked.addListener((tab) => {  // listen for click event on the extension

  // if the click event happend in the course completion report page
  if (tab.url.includes('/report/completion')) {
    chrome.tabs.sendMessage(tab.id, { action: "getCourseInfo" }, (response) => {
      debug && console.log("resp= "+response);
        if (response && response.title) {
            let newURL = `outline_page.html?title=${encodeURIComponent(response.title)}&lang=${encodeURIComponent(response.lang)}&url=${encodeURIComponent(response.url)}`;
            chrome.tabs.create({ url: newURL });
        } else {
          debug && console.log("No h2 element found or no response from content script.");
        }
    });
  }else{

    // if the click event happend somewhere else
    let theFunction=notImplimented

    // if the click event happend in the activity report page
    if (tab.url.includes('/report/outline')) {
      theFunction=outlineReport
    }else{

       // if the click event happend in the statistics page
      if (tab.url.includes('/report/stats')) {
        theFunction=statsReport
      }
    }
    

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: theFunction
});
    
  }
});

//function that exports the statistics table to excel and downloads the chart image
function statsReport(){
  let lang=document.documentElement.lang;
  var cours_name=document.getElementsByClassName("h2")[0].innerText.replace(/[^\w\s]/gi, '_');

  var fileName="Statistics";

  if(lang=='ar'){ // arabic labels
      fileName="إحصاءات";
  }else{
      if(lang=='fr'){ // french labels
          fileName= "Statistiques";
      }       
  }

  debug && console.log(cours_name);
  /// handling the chart image
  var canvas = document.getElementsByTagName("canvas");
  debug && console.log(canvas)
  var myCanvas=canvas[0];

  var canvas0 = document.createElement('canvas');
  var mergedCanvas = document.createElement('canvas');
  canvas0.width = mergedCanvas.width = myCanvas.width;
  canvas0.height = mergedCanvas.height = myCanvas.height;


  var ctx0=canvas0.getContext('2d');
  var ctx1 = mergedCanvas.getContext('2d');

  ctx0.fillStyle = 'white';  // white background
  ctx0.fillRect(0, 0, canvas0.width, canvas0.height);

  // Draw the contents of the canvas for the background
  ctx1.drawImage(canvas0, 0, 0);
  // Draw the contents of the second canvas that contain the chart
  ctx1.drawImage(myCanvas, 0, 0);
 
  var link = document.createElement('a');
  link.href = mergedCanvas.toDataURL('image/png');
  link.download = fileName+'_'+cours_name+'_'+'.png';
  link.click();

  //function to download html table as excel sheet (source: https://stackoverflow.com/questions/17142427/javascript-to-export-html-table-to-excel)
  var tableToExcel = (function() {
    var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
      , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
      , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
    return function(table,name) {
      
      var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
      var link = document.createElement('a');
      link.download = name;
      link.href = uri + base64(format(template, ctx));
      link.click();
    }
  })()
  
  let tbl = document.getElementsByClassName('generaltable')[2];
  tableToExcel(tbl, cours_name+" "+fileName);
  
  debug && console.log("done");

}

// function that shows a message when the extension is clicked in non supported pages
function notImplimented(){
  let lang=document.documentElement.lang;
  var message="This functionality has not been implemented yet.";
  if(lang=="ar"){
    message="لم يتم إدراج هذه الوظيفة بعد."
  }else{
    if(lang=="fr"){
      message="Cette fonctionnalité n'a pas encore été implémentée."
    }
  }
  alert(message);
}


// function that exports the activity report to excel sheet
function outlineReport() {

    //getting the platform language
    lang=document.documentElement.lang;
    debug && console.log("language = "+lang);

    // configuration
    //default to english labels 
    var activityLbl="Activity";
    var viewsLbl="Views";
    var accessLbl="Last access";
    var viewsTxt="views by";
    var usersTxt="users";
    var usersNbr="users count";
    var fileName="Activity report";
    var activityIndex=-1;
    var viewsIndex=-1;
    var accessIndex=-1;


    if(lang=='ar'){ // arabic labels
        activityLbl="نشاط";
        viewsLbl="المعاينات";
        accessLbl="آخردخول";
        viewsTxt="معاينات من قبل";
        usersTxt="مستخدم/مستخدمين";
        usersNbr="عدد المستخدمين" ; 
        fileName="تقرير النشاط";
    }else{
        if(lang=='fr'){ // french labels
            activityLbl="Activité";
            viewsLbl="Affichages";
            accessLbl="Dernier accès";
            viewsTxt="consultations par";
            usersTxt="utilisateurs";  
            usersNbr="Nombre d'utilisateurs";
            fileName= "Activités du cours";
        }       
    }

    const body = document.body,
    tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.style.border = '1px solid black';
    tbl.style.borderSpacing='collapse'
    var spanNumber=0;
    
    var table = document.getElementById("outlinetable"); // the id of the table containing statistic data is 'outlinetable'

    for(let i =0; i<table.rows.length;i++){
        const tr =tbl.insertRow();
        debug && console.log(i+'== '+table.rows[i].cells.length);
        if(table.rows[i].cells.length==1){
            const td = tr.insertCell();
            td.setAttribute('colSpan', spanNumber+1);
            td.style.textAlign='center';
            td.style.fontWeight='bold';
            td.style.border='1px solid black';
            td.appendChild(document.createTextNode(table.rows[i].cells[0].innerText));
        }else{

            // extracting the columns span number
            spanNumber = (spanNumber==0)?table.rows[i].cells.length:spanNumber;
            

            for(let j=0;j<table.rows[i].cells.length;j++){

              let label=table.rows[i].cells[j].innerText;

              // if we are at the row with table headers
              if(label==activityLbl){activityIndex=j; const td = tr.insertCell(); td.appendChild(document.createTextNode(activityLbl));}
              if(label==accessLbl) {accessIndex=j; const td = tr.insertCell(); td.appendChild(document.createTextNode(accessLbl));}
              
              if(label==viewsLbl) {
                viewsIndex=j; 
                const td = tr.insertCell(); 
                const td2 = tr.insertCell(); 

                // split the view cell into two cells, one for displaying the number of users, and the other one for displying the number of views
                td.appendChild(document.createTextNode(viewsLbl));
                td2.appendChild(document.createTextNode(usersNbr));
              }
                
              if(j==viewsIndex && label!=viewsLbl){ // if we are at the cell with views information

                //extracting number of views and number of users from the cell data (55 views by 27 users)
                let tmpLabel=label.replace(usersTxt,"").split(viewsTxt);
                let nbViews=tmpLabel[0];
                let nbUsers=tmpLabel[1];

                const td = tr.insertCell(); 
                const td2 = tr.insertCell(); 
                if(nbUsers==undefined ||nbViews==undefined  ){
                  td.appendChild(document.createTextNode("0"));
                  td2.appendChild(document.createTextNode("0"));
                }else{
                  td.appendChild(document.createTextNode(nbViews));
                  td2.appendChild(document.createTextNode(nbUsers));
                }
                
              }

              if(label != viewsLbl && label !=  activityLbl && label != accessLbl & j!=viewsIndex){
                const td = tr.insertCell(); 
                td.appendChild(document.createTextNode(label));
              }
            }
            }
        }

        // function to transform html table to excel (source: https://stackoverflow.com/questions/17142427/javascript-to-export-html-table-to-excel)
        var tableToExcel = (function() {
          var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
            , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
          return function(table,name) {
            
            var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
            var link = document.createElement('a');
            link.download = name;
            link.href = uri + base64(format(template, ctx));
            link.click();
          }
        })()

        var cours_name=document.getElementsByClassName("h2")[0].innerText.replace(/[^\w\s]/gi, '_');
        tableToExcel(tbl,cours_name+" "+fileName);
  }

  function tableCreate() {

    //getting the platform language
    lang=document.documentElement.lang;
    console.log("language = "+lang);

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
            // console.log(i+'== '+table.rows[i].cells.length);
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
        // console.log(tbl);

        // function to transform html table to excel (source: https://stackoverflow.com/questions/17142427/javascript-to-export-html-table-to-excel)
        var tableToExcel = (function() {
          var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
            , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
          return function(table,name) {
            // if (!table.nodeType) table = document.getElementById(table)
              var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
            // uri.setAttribute('download', "thename");
            var link = document.createElement('a');
            link.download = name;
            link.href = uri + base64(format(template, ctx));
            link.click();
            // window.location.href = uri + base64(format(template, ctx))
          }
        })()

        var cours_name=document.getElementsByClassName("h2")[0].innerText;
        tableToExcel(tbl,cours_name+" "+fileName);
  }
  
  chrome.action.onClicked.addListener((tab) => {
    if (!tab.url.includes('chrome://') ) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: tableCreate
      });
    }
  });

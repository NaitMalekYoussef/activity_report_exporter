var debug=false;

$(document).ready(function() {
  function getQueryParam(name) {
    let results = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results !== null ? decodeURIComponent(results[1]) : null;
  }

  var course_title = getQueryParam('title');
  var course_lang= getQueryParam('lang');
  var csv_url= getQueryParam('url');

  var loadingText="  Loading, please wait...  ";
  var completed="Completed";
  var notCompleted="Not completed";
  var completedGrad="Completed (achieved pass grade)";
  var fileName="Course_completion";
  var columnDeleted="Column number # deleted successfully";
  var downloadText="Download the file  ";

  if( course_lang == "ar"){
     loadingText="  جاري التحميل, المرجو اﻹنتضار...  ";
     completed="اكتمل";
     notCompleted="لم يكتمل";
     completedGrad="اكتمل (حقق درجة النجاح)";
     fileName="إكمال_المساق";
     columnDeleted="تم حذف العمود رقم # بنجاح";
     downloadText="تحميل الملف  ";
  }else{
    if(course_lang=="fr"){
       loadingText="  Chargement en cours, veuillez patienter...  ";
       completed="Terminé";
       notCompleted="Pas terminé";
       completedGrad="Terminé (note minimale de réussite atteinte)";
       fileName="Achèvement_de_cours";
       columnDeleted="Colonne numéro # supprimée avec succès";
       downloadText="Téléchargez le fichier  ";
    }
  }

  $spinner=$('<span></span>',{class:'spinner-border spinner-border-sm',role: 'status', 'aria-hidden': 'true',});
  $label=$('<i></i>',{text:loadingText});
  $btnLoader=$('<button></button>',{class:'btn btn-primary',disabled:true});
  $btnLoader.append($spinner);
  $btnLoader.append($label);

  $("#loader").append($btnLoader);
  $("#title").text(course_title);

  debug && console.log("url= "+csv_url);

  $('#loader').show();
  $('#csv-data').hide();
  $('#btnDownload').hide();

  $.get(csv_url, function(data) {
    // Process CSV data
    const lines = data.split('\n');
    const result = [];

    lines.forEach(line => {
      const columns = line.split(',');
      
      result.push(columns);
    });
    
    // Output the result to the page
    displayCsvData(result);
    // Hide the loader and show the CSV data
    $('#loader').hide();
    $('#csv-data').show();
    $('#btnDownload').show();
    
  });

  function delCol(colNumber){

    debug && console.log(colNumber);
    $('#ccTable th:nth-child('+colNumber+')').remove();
    $('#ccTable td:nth-child('+colNumber+')').remove();
    //show an alert
    $('#myAlert').text(columnDeleted.replace("#",colNumber));
    $('#myAlert').show();
    $('#myAlert').show();
    setTimeout(() => {
      $('#myAlert').hide();
    }, 2000);
  }
  
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
    })();
    
            
  function displayCsvData(data) {
    var table = $('<table>');
    table.attr('id', 'ccTable');

    data.forEach((row, index) => {
      const tableRow = $('<tr></tr>');
      var colNumber=0;
      row.forEach(cell => {
        if(index===0){
          debug && console.log(colNumber);

          var $button = $('<button></button>', {           
            id: 'myButton'+colNumber,             
            class: 'btn btn-danger',     
            click: function(event) {
            
              event.preventDefault();

              // Get the index of the parent header cell
                var columnIndex = $(this).closest('th').index();
                
                debug && console.log("clicked ===> "+columnIndex);
              
                delCol(columnIndex+1); 
            }
          }).append($('<i></i>', {
            class: 'bi bi-trash3'
          }));
          colNumber++;
        }
        const tableCell = index === 0 ? $('<th></th>').text(cell.replaceAll('"','')).append($('</br>')).append($button).css('text-align', 'center') : $('<td></td>').text(cell.replace(completedGrad,1).replace(notCompleted,0).replace(completed,1).replaceAll('"',''));
        tableRow.append(tableCell);
      });

      table.append(tableRow);
    });
    $('#csv-data').append(table);

    var $btnDownload = $('<button></button>', {
      id: 'btnDownload',              
      class: 'btn btn-success',      
      text:downloadText,
      click: function() {          
        let title=course_title.replace(/[^\w\s]/gi, '_')// to remove special characters from course title
        tableToExcel(table.get(0),fileName+" "+title);
      }
    }).append($('<i></i>', {
      class: 'bi bi-download'
    }));

    $('#centerElem').append($btnDownload);

  }
});



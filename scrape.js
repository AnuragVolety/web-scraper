const puppeteer = require('puppeteer');
const fs = require('fs');
const xlsx = require('node-xlsx');

let scrape = async () => {
  console.log('Please wait...');
  var pIdArray = [];
  var inputFileName = 'inputArray.xlsx';
  const workSheetsFromFile = xlsx.parse(`${__dirname}/${inputFileName}`);
  for(var i=1; i<workSheetsFromFile[0].data.length; i++){
    pIdArray.push(workSheetsFromFile[0].data[i][0]);
  }

  const browser = await puppeteer.launch({headless: false});

  var initPages = new Array(pIdArray.length);
  console.log('Taking input from',inputFileName);

  for(var i=0; i<initPages.length; i++){
    initPages[i] = await browser.newPage();
    await initPages[i].goto('https://maharerait.mahaonline.gov.in/SearchList/Search', {"waitUntil" : "networkidle0"});
  
    const checkbox = await initPages[i].$('input[value="Promoter"]');
    await checkbox.click();

    await initPages[i].$eval('input[name=CertiNo]', (el,value) => el.value = value, pIdArray[i]);
    await initPages[i].click('input[type="submit"]');
    await initPages[i].waitFor(1500);
    await initPages[i].click('#gridview > div.grid-mvc > div > table > tbody > tr > td:nth-child(5) > b > a');
    await initPages[i].waitFor(500);
  }
  
  let pages = await browser.pages();
  
  var postPages =[];
  pages.forEach(page => {
    if(page.url() != "https://maharerait.mahaonline.gov.in/SearchList/Search"){
      postPages.push(page);
    }
  })
  
  var rows = [['Name', 'Apartment Type', 'Carpet Area (in Sqmts)', 'Number of Apartments', 'Number of Booked Apartments']]; 

  const tableSelector = '#DivBuilding > div > table > tbody > tr:nth-child(3) > td:nth-child(3) > table';
  for(var i=1; i<postPages.length; i++){
    const allElements = await postPages[i].$$eval(tableSelector, trs => trs.map(tr => {
      const tds = [...tr.getElementsByTagName('td')];
      return tds.map(td => td.textContent);
    }));

    const promoterName = await postPages[i].evaluate(() => {
      let name = document.querySelector('#fldFirm > div.x_panel > div.x_content > div:nth-child(1) > div > div:nth-child(2)').innerText;
      return name;
    });

    for(var j=0; j<allElements[0].length; j++){
      if(j%5 === 0){
        allElements[0][j] = promoterName;
      }
    }

    while(allElements[0].length) rows.push(allElements[0].splice(0,5));
  }

  browser.close();
  return rows;
};

function downloadExcel(rows) {
  var dataTable = new Array();

  rows.forEach(function(row) {
    dataTable.push(row);
  });

  let csvContent = '';
  dataTable.forEach(function(rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });
  
  var fileName = 'myFile.csv'
  fs.writeFile(fileName, csvContent, (err) => {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved with name", fileName);
  }); 
}

scrape().then((value) => {
   downloadExcel(value);
});
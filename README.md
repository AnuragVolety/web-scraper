# web-scraper
A web-scraper tool for getting building details from Maharashtra Real Estate Regulatory Authority website by using MahaRERA Project / Agent Registration Number

See the `Video2.mp4 file` for the working of this project.

This project scrapes data from https://maharerait.mahaonline.gov.in/SearchList/Search

Run `npm install` in the directory after cloning the project to get node modules. (Make sure to have node and npm installed in your device by typing `node -v` and `npm -v` respectively.

Create a list of MahaRERA Project / Agent Registration Numbers in the `inputArray.xlsx` under the heading PiDs as these registration numbers start with character P.

Open terminal/Command Prompt and run `node scrape.js`. This command will start the scraping process and collect data which shall be saved in `myFile.csv`.

Note: If you wish to disable the opening of Chrome Window in the process of running, got to line number `14` of file `scrape.js` and remove the snippet `{headless: false}`. So the whole command will look as follows:

`const browser = await puppeteer.launch();`

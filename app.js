const express = require("express");
const app = express();
const { Builder, By, until, Browser } = require('selenium-webdriver');
require('chromedriver');

const port = 8000;
const url = "https://www.nvidia.com/en-in/geforce/buy/";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next(); 
});

async function scrape() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    let details = [];

    try {
        await driver.get(url);
        await driver.wait(
            until.elementLocated(
                By.xpath('.//div[contains(@class, "aem-Grid aem-Grid--10 aem-Grid--default--10")]')
            ), 10000);

        let elements = await driver.findElements(
            By.xpath('.//div[contains(@class, "aem-Grid aem-Grid--10 aem-Grid--default--10")]')
        );

        for (let element of elements) {
            let name = await element.findElement(By.xpath('.//div[contains(@class, "text-center lap-text-center tab-text-center mob-text-center")]')).getText();
            let price;
            try {
                price = await element.findElement(By.xpath('.//div[contains(@class, "startingprice")]')).getText();
            } catch (e) {
                price = "N/A";
            }
            details.push(`${name} : ${price}`);
        }
    } catch (e) {
        console.log("error:", e);
        res.send("error");
    } finally {
        await driver.quit();
    }
    return details;
}

app.get("/scrape", async (req, res) => {
    try {
        const data = await scrape();
        console.log("scraped data:", data);
        res.json(data);
    } catch (e) {
        res.send("error");
    }
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

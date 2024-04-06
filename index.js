const scrapeIt = require('scrape-it');
const cheerio = require('cheerio');
const fs = require('fs');



function getDateFromString(str) {
    const datePattern = /(\w+\s\d{1,2},\s\d{4})/;
    const matches = str.match(datePattern);

    if (matches && matches.length >= 2) {
        const dateValue = matches[1];
        const year = new Date(dateValue).getFullYear();
        const month = String(new Date(dateValue).getMonth() + 1).padStart(2, '0');
        const day = String(new Date(dateValue).getDate()).padStart(2, '0');
        const Listing_Date = `${year}-${month}-${day}`;
        const _year = new Date().getFullYear();
        const _month = String(new Date().getMonth() + 1).padStart(2, '0');
        const _day = String(new Date().getDate()).padStart(2, '0');
        const days_Marketing = `${_year}-${_month}-${_day}`;
        const startDate = new Date(Listing_Date);
        const endDate = new Date(days_Marketing);
        const timeDifference = endDate - startDate;
        const numberOfDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return {
            Listing_Date,
            numberOfDays
        };

    } else {
        console.log("Date not found in the input string.");
    }

}

function objectToCSV(obj) {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    const formattedValues = values.map(value => {
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
        }
        return value;
    });

    return formattedValues.join(',');
}

let total_length = 0;
let _baseUrl = 'https://www.land.com/United-States/all-land/over-250000/zoom-4/bounds-10.009743101726063-n152.8628311522594-63.56704174504707-n59.6987686522594/?sk=oi|aH|{`hUvjw_Aun`GytvMo}go@wiqo@}clLmhbKfmiw@f}sIzclL'
const _domain = 'https://www.land.com'

async function main() {
    //https://www.land.com/property/35.14-acres-in-Flathead-County-Montana/18048090/

    const {
        data,
        status
    } = await scrapeIt(_baseUrl, {
        lands: {
            listItem: ".cc74c",
            data: null
        },
    });

    const dis_length = data.lands.length;
    total_length = data.lands[dis_length - 1];

    for (var i = 1; i <= dis_length; i++) {
        let _in = 'page-' + i + '/?'
        let baseUrl = "https://www.land.com/United-States/all-land/over-250000/zoom-4/bounds-10.009743101726063-n152.8628311522594-63.56704174504707-n59.6987686522594/" + _in + "sk=oi|aH|{`hUvjw_Aun`GytvMo}go@wiqo@}clLmhbKfmiw@f}sIzclL"

        await scrapeIt(baseUrl, {
            lands: {
                listItem: ".d086e",
                data: {
                    price: {
                        selector: "._0e5d5 > a",
                    },
                    props: {
                        selector: "._0e5d5 > a",
                        attr: 'href'
                    }
                },
            },

        }).then(async ({
            data,
            status
        }) => {

            for (var i = 0; i < data['lands'].length; i++) {
                await scrapeIt(_domain + data['lands'][i]['props'], {
                    lands: {
                        listItem: ".d0d45",
                        data: {
                            MLS_Number: {
                                selector: "._24a29 > div:nth-child(2)",
                            },
                            Open_Status: {
                                selector: "._9829b > span",
                            },
                            Listing_Date: {
                                selector: "._24a29 > div:last-child",
                            },
                            LISTING_PRICE: {
                                selector: "._1e694 > div",
                            },
                            Location: {
                                selector: "._0e55d > div",
                            },
                            Sold_Price: {
                                selector: "._1e694",
                                how: (element) => {
                                    return element.html();
                                }
                            },
                        }
                    },

                    htmlContent: {
                        selector: 'html',
                        how: (element) => {
                            return element.html();
                        },
                    },

                    url: {
                        selector: 'html',
                        how: (element) => {
                            return _domain + data['lands'][i]['props'];
                        },
                    },
                }).then(async ({
                    data,
                    status
                }) => {

                    const latitudePattern = /"latitude":(-?\d+\.\d+)/;
                    const longitudePattern = /"longitude":(-?\d+\.\d+)/;
                    const $ = cheerio.load(data.htmlContent);
                    const script_content = $('script').text();
                    const arra_content = script_content.split('<script data-react-helmet=\"true\" type=\"application/ld+json\">');
                    let latitude_Value = '',
                        longitude_Value = '';

                    for (var i = 0; i < arra_content.length; i++) {
                        let matched_lati = arra_content[i].match(latitudePattern);
                        let matched_longi = arra_content[i].match(longitudePattern);
                        latitude_Value = (matched_lati && matched_lati.length >= 2) ? parseFloat(matched_lati[1]) : null;
                        longitude_Value = (matched_longi && matched_longi.length >= 2) ? parseFloat(matched_longi[1]) : null;

                    }

                    data.lands[0]["latitude"] = latitude_Value;
                    data.lands[0]["longitude"] = longitude_Value;
                    data.lands[0]["url"] = data.url;
                    let matches = data.lands[0]["MLS_Number"].indexOf('Source: MLS#') !== -1 ? true : false;
                    data.lands[0]['MLS_Number'] = (matches !== false) ? data.lands[0]["MLS_Number"].split('#')[1] : 'null';

                    let _price = data.lands[0]['Sold_Price'].split('<span aria-hidden="true" class="f8832"><span class="_039e5"></span></span>')[0];
                    let _acres = data.lands[0]['Sold_Price'].split('<span aria-hidden="true" class="f8832"><span class="_039e5"></span></span>')[1];
                    const {
                        Listing_Date,
                        numberOfDays
                    } = getDateFromString(data.lands[0]['Listing_Date']);
                    data.lands[0]['Listing_Date'] = Listing_Date;
                    data.lands[0]['Days_ON_MERKET'] = numberOfDays;
                    data.lands[0]['LISTING_PRICE'] = _price;
                    data.lands[0]['ACRES'] = _acres;
                    data.lands[0]['Sold_Price'] = _price;


                    let _temp = {
                        MLS_NUMBER: data.lands[0]['MLS_Number'],
                        OPEN_STATUS: data.lands[0]['Open_Status'],
                        LISTING_DATE: data.lands[0]['Listing_Date'],
                        LISTING_PRICE: data.lands[0]['LISTING_PRICE'],
                        LOCATION: data.lands[0]['Location'],
                        SOLD_PRICE: parseInt(data.lands[0]['Sold_Price'].split('$')[1].replace(/,/g, ''), 10),
                        URL: data.lands[0]['url'],
                        DAYS_ON_MARKET: data.lands[0]['Days_ON_MERKET'],
                        LATITUDE: data.lands[0]['latitude'],
                        LONGTIDUE: data.lands[0]['longitude'],
                        ACRES: parseFloat(data.lands[0]['ACRES'].split(' ')),
                        PRICE_PER_ACR: Math.round(parseInt(data.lands[0]['Sold_Price'].split('$')[1].replace(/,/g, ''), 10) / parseFloat(data.lands[0]['ACRES'].split(' ')), 3)
                    }

                    console.log(_temp);
                    let dataQueue = [];
                    dataQueue.push(_temp);
                    let _data = dataQueue.map(objectToCSV).join('\n') + '\n';

                    fs.appendFile('data.csv', _data, (err) => {
                        if (err) {
                            console.error('Error writing to CSV file:', err);
                        } else {
                            console.log('Data successfully written to CSV file.');
                            dataQueue.length = 0; // Clear the data queue after writing
                        }
                    });

                });
            }
        });

    }
}

main();
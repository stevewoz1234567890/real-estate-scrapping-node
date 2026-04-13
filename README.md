# Real estate scraping (Node.js)

A Node.js script that scrapes land listings from [Land.com](https://www.land.com): it walks paginated search results, opens each listing, and appends structured rows to a CSV file.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

## Setup

```bash
npm install
```

## Run

```bash
node index.js
```

The script writes (and appends) to `data.csv` in the project root.

## Output columns

Each row includes:

| Column | Description |
|--------|-------------|
| `MLS_NUMBER` | MLS identifier when present |
| `OPEN_STATUS` | Listing status |
| `LISTING_DATE` | Normalized listing date (`YYYY-MM-DD`) |
| `LISTING_PRICE` | Display listing price text |
| `LOCATION` | Location string |
| `SOLD_PRICE` | Parsed numeric sold/listing price |
| `URL` | Full listing URL |
| `DAYS_ON_MARKET` | Days from listing date to run date |
| `LATITUDE` / `LONGTIDUE` | Coordinates from embedded JSON (column name matches the script output) |
| `ACRES` | Acreage |
| `PRICE_PER_ACR` | Rounded price per acre |

## Configuration

Search scope is controlled in `index.js` via `_baseUrl` and the paginated `baseUrl` pattern (filters such as price threshold and map bounds are in those URLs). Update those URLs if you need a different region or criteria.

## Notes

- **Site structure**: Selectors target Land.com’s current HTML/CSS. If the site changes, `index.js` may need updates.
- **Rate limiting & terms**: Scraping may be restricted by the site’s terms of service or robots policy; use responsibly and consider official APIs or data feeds where available.
- **`requirements.txt`**: Contains reference URLs and notes; this project does not use Python dependencies for the scraper itself.

## Dependencies

- [scrape-it](https://github.com/IonicaBizau/scrape-it) — HTML scraping
- [cheerio](https://cheerio.js.org/) — DOM parsing for coordinates

Other packages listed in `package.json` are included as dependencies but the main flow uses `scrape-it` and `cheerio`.

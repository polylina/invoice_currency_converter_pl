# Invoice Currency Converter PL

A browser extension for **Chrome** and **Firefox** that converts USD or EUR amounts to PLN using the official [NBP (National Bank of Poland)](https://api.nbp.pl/) exchange rates.

## Features

- Sidebar UI built with Vue 3, injected alongside the current web page
- Enter any sum in USD or EUR, pick a date, and get the PLN equivalent
- Uses NBP Table A mid exchange rates (`api.nbp.pl`)
- One-click copy of the converted amount
- Auto-generated invoice-style notes (bilingual PL/EN) with one-click copy

## Usage

1. Click the **Currency Converter PL** icon in the browser toolbar to open the sidebar
2. Enter the amount, select the currency (USD or EUR), and pick a date
3. Click **Convert to PLN** to fetch the NBP exchange rate and calculate the result
4. Use the copy buttons to copy the PLN amount or the full invoice notes

## Installation

### Load the pre-built extension

The `dist/` directory contains the ready-to-load extension.

**Chrome / Chromium:**
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** and select `dist/manifest.json`

### Build from source

```bash
npm install
npm run build
```

The built extension will be in the `dist/` folder.

## API

Exchange rate data is fetched from the [NBP Web API](https://api.nbp.pl/):

```
GET https://api.nbp.pl/api/exchangerates/rates/a/{currency}/{date}/?format=json
```

Note: NBP publishes rates on business days only. Selecting a weekend or public holiday will show an error.

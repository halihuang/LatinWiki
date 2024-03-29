# Latin Wiki

Latin Wiki is a website built with Framework7 and Vue.js that translates Latin to English and back.
It translates words by using the MediaWiki API to obtain information from Wikitionary, an online multi-lingual dictionary.
Searches will also provide you with more detailed information about your word's latin form such as its declension, conjugation, and synonyms.

LatinWiki was also originally a Cordova web app and can still be built and installed as a mobile application on your phone.

## Local Usage

### 1. Clone this repository

```
git clone https://github.com/halihuang/LatinWiki
```
### 2. Install dependencies

```
cd LatinWiki
npm install
```

### 3. Running the app locally

```
npm run serve
```

App will be opened in browser at `http://localhost:8080/`

## Downloading to Device
Connect your computer and device with a cable and run the following command depending on your phone's operating system

```
cordova run android
```
```
cordova run ios
```

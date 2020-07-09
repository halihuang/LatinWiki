// generates a json that holds all latin words on wikitionary
// run node www/js/wordList.js to generate json

const jsonfile = require('jsonfile');
const axios = require('axios');
const htmlToText = require('html-to-text');

var latinLemmas = "Category%3ALatin%20lemmas";
var latinNonLemmas = "Category%3ALatin%20non-lemma%20forms";


var getLatinCategory = async function(category, continuePoint){
  var data;
  if(continuePoint){
    data = await axios.get('https://en.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=' + category + '&cmtype=page&cmcontinue='
     + continuePoint + '&cmlimit=max&cmsort=sortkey&origin=*')
    .catch((err) =>{
      console.log("predictive.js: encountered an error getting words" + err);
    });
  }
  else{
    data = await axios.get('https://en.wiktionary.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=' + category + '&cmtype=page&cmcontinue=&cmlimit=max&cmsort=sortkey&origin=*')
    .catch((err) =>{
      console.log("predictive.js: encountered an error getting words" + err);
    });
  }
  return data.data;

}

var getAllCategoryWords = async function(category){
  var categoryData = await getLatinCategory(category);
  while(categoryData.continue != undefined){
    let nextData = await getLatinCategory(category, categoryData.continue.cmcontinue);
    categoryData.query.categorymembers = categoryData.query.categorymembers.concat(nextData.query.categorymembers);
    categoryData.continue = nextData.continue;
  }
  return categoryData.query.categorymembers;
}

var wordList = async function(){
  var lemmas = await getAllCategoryWords(latinLemmas);
  var nonLemmas = await getAllCategoryWords(latinNonLemmas);
  var combinedWords = lemmas.concat(nonLemmas);
  var latinWords = {wordList:[]};
  combinedWords.forEach((item, i) => {
    latinWords.wordList.push(item.title);
  });
  jsonfile.writeFile('www/wordList.json', latinWords, (err) =>{
    if(err){
      console.log("wordList.js: saveWords() encountered:" + err);
    }
    else{
      console.log('word list sucessfully created');
    }
  });
}


var definitionsList = async function()
{
  var lemmas = await getAllCategoryWords(latinLemmas);
  console.log("obtained lemmas");

  // start off from the lemma it left off on
  var currentList = await jsonfile.readFile('www/definitions.json');
  var allDefinitions = currentList;
  if(currentList.length != 0){
    var lastDefinedWord = currentList[currentList.length - 1];
    console.log("last word", lastDefinedWord);
    lemmas = lemmas.slice(lemmas.findIndex((word) => {
      if(word.title == lastDefinedWord.latin){return true}
    }));
  }

  // split lemmas into chunks to call asynchronously
  var lemmaChunks = [];
  var chunkSize = 40;
  for(var i = 0; i < lemmas.length; i+= chunkSize){
    let chunk = lemmas.splice(i, i + chunkSize);
    lemmaChunks.push(chunk);
  }

  // call chunks asynchronously in batches
  for(chunk of lemmaChunks){
    chunk = chunk.filter((lemma) => {return validLemma(lemma.title)})
    var promises = await chunk.map(async (lemma) => {
      var data = await findDefinitions(lemma).catch((err) => {
        console.log("word( " + lemma + ") encountered:" + err);
      });
      return data;
    });
    var results = await Promise.all(promises);
    for(result of results){
      if(result && result.definitions.length > 0){
        console.log(result);
        allDefinitions.push(result);
      }
    }
    jsonfile.writeFile('www/definitions.json', allDefinitions, (err) =>{
      if(err){
        console.log("wordList.js: definitions encountered" + err);
      }
      // else{
      //   console.log('definitions sucessfully created');
      // }
    });
  }

  // for(lemma of lemmas)
  // {
  //   if(validLemma(lemma.title))
  //   {
  //     var data = await findDefinitions(lemma);
  //     if(data && data.definitions.length > 0)
  //     {
  //       console.log(data);
  //       allDefinitions.push(data);
  //       jsonfile.writeFile('www/definitions.json', allDefinitions, (err) =>{
  //         if(err){
  //           console.log("wordList.js: definitions encountered" + err);
  //         }
  //         // else{
  //         //   console.log('definitions sucessfully created');
  //         // }
  //       });
  //     }
  //   }
  // }
  console.log("finished generating definitions list!");
}

var findDefinitions = async function(lemma){
    var response = await axios.get('https://en.wiktionary.org/w/api.php?action=parse&pageid='+ lemma.pageid + '&noimages=true' +'&prop=sections'
    + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' + '&origin=*')
    .catch((err) => {console.log("could not find page of lemma")});
    if(response){
      var sections = response.data.parse.sections;
      var sectionNumber = "";
      var latinSections = [];
      for(item of sections)
      {
        var sectionNumber = item.number.split(".")[0];
        if(item.line == 'Latin')
        {
          var latinSection = sectionNumber
        }
        if(latinSection == sectionNumber && (checkWhitelist(item.line)))
        {
          let validSection = {id:item.index, partOfSpeech:item.line}
          latinSections.unshift(validSection);
        }
      }
      var latinWord = {latin: lemma.title, definitions: [], partsOfSpeech:[]}
      for(section of latinSections)
      {
        if(!latinWord.partsOfSpeech.includes(section.partOfSpeech)){
          latinWord.partsOfSpeech.push(section.partOfSpeech);
        }
        latinPage = await axios.get('https://en.wiktionary.org/w/api.php?action=parse&pageid='+ lemma.pageid + '&noimages=true'
        + '&section='+ section.id + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' +'&mobileformat=true' + '&prop=text'+ '&origin=*')
        .catch((err) => {console.log("could not find sections of page")});
        if(latinPage){
          var blackListed = ["wiktQuote", "/wiki/Category", "citation-whole", "form-of-definition", "extiw", "external", 'p\\.\\s?\\d+']
          let data = latinPage.data.parse.text["*"].split("Latn headword")[1].split("mw-headline")[0].split(/<li[^>]*>/ig);
          data = data.filter((text) => {
            return !includes(text, blackListed)})
          data.forEach((line, i) => {
            if(i > 0){
              line = line.split("<dl>")[0];
              line = line.split(/<[^>]+"maintenance-line"[^>]+>/)[0];
              line = substringLine(line, ":");
              line = substringLine(line, 'ib-brac">)');
              line = line.split("</li>")[0];
              line = htmlToText.fromString(line, {
                wordwrap: false,
                ignoreHref: true,
              });
              var defs = line.split(",");
              for(def of defs){
                var finalDefs = def.split(";");
                for(finalDef of finalDefs){
                  filterAddDef(finalDef, latinWord.definitions);
                }
              }
            }
          });
        }
      }
      return latinWord;
    }
    else{
      return undefined;
    }
}


function checkWhitelist(item)
{
  var whitelistedSections = ['Verb','Adjective','Conjunction','Adverb','Pronoun','Preposition','Determiner', 'Noun', 'Participle', 'Interjection', 'Numeral', 'Proverb', "Phrase", "Postposition", "Proper Noun"]
  for(element of whitelistedSections){
    if(element == item){
      return true;
    }
  }
}

function validLemma(word){
  if(/\d/.test(word) || word.length == 1 || word.includes("Reconstruction")){
    return false;
  }
  return true;
}

function includes( definition, list) {
  for(element of list){
    var regex = new RegExp(element, 'ig')
    if(regex.test(definition)){
      return true;
    }
  }
  return false;
}

function substringLine(line, str){
  var index = line.indexOf(str);
  if(index != -1){
    return line.substring(index + str.length);
  }
  return line;
}

function isLetter(str, index, exceptions){
  var char = str.charAt(index);
  if (char.toUpperCase() != char.toLowerCase() || exceptions.includes(char)){
    return true;
  }
  return false;
}

function filterAddDef(str, arr){
  if(str.charAt(0) == " "){
    str = str.substring(1);
  }
  var lastChar = str.charAt(str.length - 1)
  if(lastChar == " " || lastChar == "."){
    str = str.substring(0, str.length - 1);
  }
  if(!arr.includes(str)){
    arr.push(str);
  }
}



// wordList();
definitionsList();

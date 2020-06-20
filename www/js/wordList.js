// generates a json that holds all latin words on wikitionary
// run node www/js/wordList.js to generate json

const jsonfile = require('jsonfile');
const axios = require('axios');

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
  console.log(categoryData);
  while(categoryData.continue != undefined){
    let nextData = await getLatinCategory(category, categoryData.continue.cmcontinue);
    categoryData.query.categorymembers = categoryData.query.categorymembers.concat(nextData.query.categorymembers);
    categoryData.continue = nextData.continue;
    console.log(categoryData);
  }
  return categoryData.query.categorymembers;
}

var saveWordList = async function(){
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

saveWordList();

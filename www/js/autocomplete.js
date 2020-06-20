// adds autocomplete to translation input field

async function getWords(){
  var latinWords = await axios.get('./wordList.json').catch((err) => {
    if(err){
      console.log(err);
    }
    else{
      console.log("sucessfully got wordList.json");
    }
  });
  return latinWords;
}


async function createAutoComplete(){
  var latinWords = await getWords();
  latinWords = latinWords.data.wordList;
  // console.log(latinWords);
  new Autocomplete('#autocomplete', {
  search: input => {
    // console.log(main.latinToEng);
    if (main.latinToEng && input.length > 2) {
      var count = 0;
      var matching = latinWords.filter((word) => {
        if(word.toLowerCase().startsWith(input.toLowerCase())){
          return true;
        }
      });
      matching.sort((a,b) =>{
        if(a.length < b.length) return -1;
        if(a.length > b.length) return 1;
        return 0;
      });
      return matching.splice(0, 6);
    }
    return [];
  },
  onsubmit: (result) => {
    main.input = result;
  }
})
}

createAutoComplete();

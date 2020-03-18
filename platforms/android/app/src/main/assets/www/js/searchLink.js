


window.linkSearcher = {};

linkSearcher.searchLink = function(){
  $('translationBlock > a').click((event) =>
  {
    let clickedHTML = event.target.innerHTML;
    if(clickedHTML != "Translate" && clickedHTML != "Saved" && clickedHTML != "History" && clickedHTML != "About" && clickedHTML != "Forget"){
      if(navigation.title != "About"){
        main.input = clickedHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        previousSetting = main.latinToEng;
        main.latinToEng = true;
        main.searchLatin();
        if(main.errored = true && main.translation == ""){
          main.latinToEng = false;
          main.searchLatin();
        }
        main.latinToEng = previousSetting;
      }
    }
  });
};

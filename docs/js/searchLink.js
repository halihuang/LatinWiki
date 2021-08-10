


window.linkSearcher = {};

linkSearcher.searchLink = function(){
  $('#translationBlock a').click(async (event) =>
  {
    let clickedHTML = event.target.innerHTML;
    if(clickedHTML != "Translate" && clickedHTML != "Saved" && clickedHTML != "History" && clickedHTML != "About" && clickedHTML != "Forget"){
      main.input = clickedHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      previousSetting = main.latinToEng;
      main.latinToEng = true;
      await main.searchLatin();
      if(main.errored = true && main.translation == ""){
        main.latinToEng = false;
        await main.searchLatin();
      }
      main.latinToEng = previousSetting;
    }
  });
};

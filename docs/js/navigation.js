var translatedBlock;
var savedBlock;
var historyBlock;
var aboutBlock;
var helpBlock;

var setPageBlocks = function(){
  translatedBlock = document.getElementById('pageTranslate');
  savedBlock = document.getElementById('pageSaved');
  historyBlock = document.getElementById('pageHistory');
  aboutBlock = document.getElementById('pageAbout');
  helpBlock = document.getElementById('pageHelp');
}

var moveToSaved = function()
{
  main.loadSaved();
  translatedBlock.style.display= "none";
  savedBlock.style.display= "block";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "none";
  helpBlock.style.display= "none";
  main.title='<i class="icon material-icons no-padding inlined" style="margin-bottom:5px">bookmark</i>';
}

var moveToHistory = function()
{
  main.loadRecent();
  translatedBlock.style.display= "none";
  savedBlock.style.display= "none";
  historyBlock.style.display= "block";
  aboutBlock.style.display= "none";
  helpBlock.style.display= "none";
  main.title='<i class="icon material-icons no-padding inlined" style="margin-bottom:5px">history</i>';
}

var moveToAbout = function()
{
  translatedBlock.style.display= "none";
  savedBlock.style.display= "none";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "block";
  helpBlock.style.display= "none";
  main.title='<i class="icon material-icons no-padding inlined" style="margin-bottom:5px">info</i>';
}

var moveToTranslate = function()
{
  translatedBlock.style.display= "block";
  savedBlock.style.display= "none";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "none";
  helpBlock.style.display= "none";
  main.title='<i class="icon material-icons no-padding inlined" style="margin-bottom:5px">find_in_page</i>';
}


var moveToHelp = function()
{
  translatedBlock.style.display= "none";
  savedBlock.style.display= "none";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "none";
  helpBlock.style.display= "block";
  main.title='<i class="icon material-icons no-padding inlined" style="margin-bottom:5px">help</i>';
}

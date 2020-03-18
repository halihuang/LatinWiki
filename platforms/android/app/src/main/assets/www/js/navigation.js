window.navigation = {};


navigation.moveToSaved = function()
{
  var translatedBlock = document.getElementById('pageTranslate');
  var savedBlock = document.getElementById('pageSaved');
  var historyBlock = document.getElementById('pageHistory');
  var aboutBlock = document.getElementById('pageAbout');
  translatedBlock.style.display= "none";
  savedBlock.style.display= "block";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "none";
  this.title="Saved";
}

navigation.moveToHistory = function()
{
  var translatedBlock = document.getElementById('pageTranslate');
  var savedBlock = document.getElementById('pageSaved');
  var historyBlock = document.getElementById('pageHistory');
  var aboutBlock = document.getElementById('pageAbout');
  translatedBlock.style.display= "none";
  savedBlock.style.display= "none";
  historyBlock.style.display= "block";
  aboutBlock.style.display= "none";
  this.title="History"
}

navigation.moveToAbout = function()
{
  var translatedBlock = document.getElementById('pageTranslate');
  var savedBlock = document.getElementById('pageSaved');
  var historyBlock = document.getElementById('pageHistory');
  var aboutBlock = document.getElementById('pageAbout');
  translatedBlock.style.display= "none";
  savedBlock.style.display= "none";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "block";
  this.title="About"
}

navigation.moveToTranslate = function()
{
  var translatedBlock = document.getElementById('pageTranslate');
  var savedBlock = document.getElementById('pageSaved');
  var historyBlock = document.getElementById('pageHistory');
  var aboutBlock = document.getElementById('pageAbout');
  translatedBlock.style.display= "block";
  savedBlock.style.display= "none";
  historyBlock.style.display= "none";
  aboutBlock.style.display= "none";
  this.title="Latin Wiki";
}
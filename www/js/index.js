/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },


    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


window.main = new Vue({
  el: '#mainpage',
  data:{
    input:"",
    prevInput:"",
    section:"",
    sectionList:"",
    loading: false,
    translation: "",
    latinToEng:false,
    word:"",
    errored:"",
    sidebarCollapse:true,
    recent: [],
    mostRecentKeys:[],
    saved: [],
    bookmark:"",

  },
  methods:{
    searchLatin: function()
    {
      if(this.input.length > 0 || this.input != this.prevInput){
        this.bookmark = "";
        this.errored = false
        this.translation = "";
        this.loading = true;
        this.prevInput = this.input.toLowerCase();
        if(this.latinToEng)
        {
          this.getSections()
          .catch((error) => {
            this.error(error);
          })
          .then(this.findLatinSection)
          .then(this.loadLatin)
          .catch((error) => {
            this.error(error);
          })
          .then(this.noResultError)
          .then(this.displayBookmark)
          .then(this.addToRecent)
          .then(() => {this.loading = false; this.errored = false;})
          .finally(this.translateLink);
        }
        else
        {
          this.convertToLatin()
          .catch(error => {
            this.error(error);
          })
          .then(this.getSections)
          .catch(error => {
            this.error(error);
          })
          .then(this.findLatinSection)
          .then(this.loadLatin)
          .catch(error => {
            this.error(error);
          })
          .then(this.noResultError)
          .then(this.displayBookmark)
          .then(this.addToRecent)
          .then(() => {this.loading = false; this.errored = false;})
          .finally(this.translateLink);
        }
      }
    },

    // uses yandex api to convert from english to latin
    convertToLatin: function(){
      this.word = this.input.toLowerCase();
      var yandexUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key="
      var apiKey= "trnsl.1.1.20190714T230320Z.2e2b73632e03279d.2719a3a3df5c1756bb6bde87c5bef4d4142ebee0"
      var url = yandexUrl + apiKey + "&text=" + this.word + "&lang=en-la&format=html";
      return(
      axios
      .get(url)
      .then((response) => {this.word = response.data.text[0];})
      )
    },

    // Goes through each sectionid stored in section list and calls wikitionary
     // to get the html content and load it
    loadLatin: function()
    {
      for(item of this.sectionList)
      {
        return (
        axios
        .get('https://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true'
        + '&section='+ item + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' +'&mobileformat=true' + '&prop=text'+ '&origin=*')
        .then((response) => {
          this.translation = response.data.parse.text["*"];
        }));
      }
    },

    //This function will filter the section data recieved from Wikitionary
    // to create an array of the section ids belonging to the sections with
    // the important latin content so they may be loaded later
    getSections: function()
    {
      if(this.latinToEng){
        this.word = this.input.toLowerCase();
      }
      return (
      axios
      .get('https://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true' +'&prop=sections'
      + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' + '&origin=*')
      .then((response) => {this.section = response.data.parse.sections;}));
    },

    // Filters sections of the wikitionary page to find the important latin content
    findLatinSection: function(){
      var sectionNumber = "";
      this.sectionList = [];
      for(item of this.section)
      {
        if(item.line == 'Latin')
        {
          var sectionNumber = item.number.charAt(0);
        }
        function checkWhitelist()
        {
          var whitelistedSections = ['Verb','Adjective','Declension','Usage notes','Conjugation','Conjunction','Adverb','Pronoun','Preposition','Determiner', 'Noun', 'Participle', 'Interjection', 'Numeral']
          for(element of whitelistedSections){
            if(element == item.line){
              return true;
            }
          }
        }
        if(item.number.charAt(0) == sectionNumber && (checkWhitelist())){
          this.sectionList.push(item.index);
        }
      }
    },

    // changes from latin to eng and vice versa
    changeLanguage: function(){
      if(this.latinToEng == true)
      {
        this.latinToEng = false;
      }
      else
      {
        this.latinToEng = true;
      }
    },

    // alerts app to error if no result was found
    noResultError: function()
    {
      if(this.translation === ""){
        this.errored = true;
        return Promise.reject('err');
        this.loading = false;
      }
      else{
        // do nothing
      }
    },

    // adds the latest word and its translation to an array in local storage, only adds
    // if word isn't already in array
    addToRecent: function()
    {
      // localStorage.removeItem('recent');
      if(!(this.errored) && this.translation != ""){
        var recentArray = JSON.parse(localStorage.getItem('recent'));
        console.log(recentArray);
        if (recentArray == null)
        {
          recentArray = [{translation:this.translation, input:this.prevInput, collapsed:true}];
        }
        else
        {
          var duplicate = false;
          for(item of recentArray)
          {
            if(item.input == this.prevInput)
            {
              duplicate = true;
            }
          };
          if(!(duplicate)){
            recentArray.unshift({translation:this.translation, input:this.prevInput, collapsed:true});
            if(recentArray.length > 10)
            {
              recentArray.pop();
            }
          }
        };
        console.log(recentArray);
        var localRecent = JSON.stringify(recentArray);
        localStorage.setItem('recent', localRecent);
      }
    },

    // gets the array of recent translations and sets the recent vue data object to interval
    // so we can access it in the html
    loadRecent:function(){
      try{
        var recentArray = JSON.parse(localStorage.getItem('recent'));
        if(recentArray != null && recentArray.length != 0){
          for(item of recentArray){
            this.collapsed = true;
          }
          this.recent = recentArray;
        }
      }
      catch(err){
        console.log("error", err);
        recentArray = [];
        var localRecent = JSON.stringify(recentArray);
        localStorage.setItem('recent', localRecent);
        for(item of recentArray){
          this.collapsed = true;
        }
        this.recent = recentArray;
      }

    },

    addToSaved:function(){
      var savedArray = JSON.parse(localStorage.getItem('saved'));
      if(savedArray == null)
      {
        savedArray = [];
      }
      if(this.bookmark == "bookmark")
      {
        for(item of savedArray)
        {
          if(item.input == this.prevInput) {
            var index = savedArray.indexOf(item);
            savedArray.splice(index, 1);
          }
        }
        this.bookmark = "bookmark_border";

      }
      else
      {
        savedObject = {translation:this.translation,input:this.prevInput, collapsed:true};
        if(savedArray == null)
        {
          savedArray = [];
        }
        savedArray.unshift(savedObject);
        this.bookmark = "bookmark"
      };
      var localSaved = JSON.stringify(savedArray);
      localStorage.setItem('saved', localSaved);
    },

    loadSaved: function(){
      var savedArray = JSON.parse(localStorage.getItem('saved'));
      if(savedArray != null){
        for (item of savedArray){
          this.collapsed = true;
        }
        this.saved = savedArray;
      }
    },

    removeSaved: function(elementId){
      var savedArray = JSON.parse(localStorage.getItem('saved'));
      for(item of savedArray)
      {
        if(item.input == elementId) {
          var index = savedArray.indexOf(item);
          savedArray.splice(index, 1);
          if(item.input == this.prevInput){
            this.bookmark = "bookmark_border";
          }
        }
      }
      this.saved = savedArray;
      var localSaved = JSON.stringify(savedArray);
      localStorage.setItem('saved', localSaved);
    },

    displayBookmark: function(){
      var savedArray = JSON.parse(localStorage.getItem('saved'));
      if(savedArray == null)
      {
        savedArray = [];
      }
      for(item of savedArray)
      {
        if(item.input == this.prevInput) {
          this.bookmark = "bookmark";
          break;
        }
      }
      if(!(this.bookmark == "bookmark")) {
        this.bookmark = "bookmark_border";
      }
    },

    error: function(err) {
      console.log(err);
      this.loading = false;
      this.errored = true;
      this.prevInput = "";
    },

    changeSideBar: function() {
      sideBar.changeSideBar();
    },

    closeSideBar: function(){
      sideBar.closeSideBar();
    },


    moveToTranslate: function()
    {
      navigation.moveToTranslate();
    },

    moveToSaved: function()
    {
      navigation.moveToSaved();
    },

    moveToHistory: function()
    {
      navigation.moveToHistory();
    },

    moveToAbout: function()
    {
      navigation.moveToAbout();
    },

    translateLink: function()
    {
      linkSearcher.searchLink();
    },



  },
  mounted(){
    this.translateLink();
    setTimeout(() => {
      this.$refs.startLoader.style.display = 'none';
      this.$refs.pages.style.display = 'block';
    }, 200)

  }

});


app.initialize();

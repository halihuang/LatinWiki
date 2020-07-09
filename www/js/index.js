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
    latinToEng:true,
    word:"",
    errored:"",
    sidebarCollapse:true,
    recent: [],
    mostRecentKeys:[],
    saved: [],
    bookmark:"",
    possibleLatin: [],
    engWord:""

  },
  methods:{
    searchLatin:async function(resetEng)
    {
      if(this.input.length > 0 && this.input != this.prevInput){
        this.bookmark = "";
        this.translation = "";
        this.possibleLatin = [];
        this.loading = true;
        this.errored = false;
        if(resetEng == undefined){
          this.engWord = "";
        }
        this.prevInput = this.input.toLowerCase();
        if(this.latinToEng)
        {
          await this.getSections().catch((err) => {
            this.error(err);
          });
          if(!this.errored){
            this.findLatinSection();
            var res = await this.loadLatin().catch((err) => {
              this.error(err);
            });
            if(res == 'failure'){
              this.error();
            }
          }
          if(!this.errored && !this.noResultError()){
            this.displayBookmark();
            this.addToRecent();
            this.loading = false; this.errored = false;
            this.translateLink();
          }
        }
        else
        {
          var response = await this.convertToLatin()
          .catch((err) => {
            this.error(err);
          });
          if(!(response.length > 0 || this.errored)){
            this.errored = true;
          }
          else{
            this.possibleLatin = response;
            this.addToRecent();
          }
          this.loading = false;
        }
      }
    },


    searchTranslatedWord: async function(word){
      this.engWord = this.word;
      this.input = word;
      this.latinToEng = true;
      await this.searchLatin(false);
      this.translateLink();
      this.latinToEng = false;

    },

    // pulls from a json of latin lemmas and their definitions to find the definition
    convertToLatin: async function(){
      this.word = this.input.toLowerCase();
      var definitions = await axios.get("./definitions.json").catch((err) => {
        console.log("defs error:", err);
      })
      definitions = definitions.data;
      var possibleLatin = [];
      for(item of definitions){
        for(definition of item.definitions){
          var filter = new RegExp("\\b" + this.word + "\\b", "gi");
          if(filter.test(definition)){
            let rating = this.word.length / definition.length;
            if(!item.rating || rating > item.rating){
              item.rating = rating;
              item.bestMatch = definition;
            }
          }
        }
        if(item.rating && item.rating >= 0.4){
          if(item.bestMatch == item.definitions[0]){
            item.rating += 0.1;
          }
          possibleLatin.push(item);
        }
      }
      possibleLatin.sort((a,b) => {
        if(a.rating < b.rating){
          return 1;
        }
        if(a.rating > b.rating){
          return -1;
        }
        return 0
      });
      return possibleLatin;
      // var yandexUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key="
      // var apiKey= "trnsl.1.1.20190714T230320Z.2e2b73632e03279d.2719a3a3df5c1756bb6bde87c5bef4d4142ebee0"
      // var url = yandexUrl + apiKey + "&text=" + this.word + "&lang=en-la&format=html";
      // return(
      // axios
      // .get(url)
      // .then((response) => {this.word = response.data.text[0];})
      // )
    },

    // Goes through each sectionid stored in section list and calls wikitionary
     // to get the html content and load it
    loadLatin: function()
    {
      var promise = Promise.resolve('failure');
      for(section of this.sectionList)
      {
        promise = axios.get('https://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true'
        + '&section='+ section + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' +'&mobileformat=true' + '&prop=text'+ '&origin=*')
        .then((response) => {
          this.translation += response.data.parse.text["*"] + '<br>';
        });
      }
      return promise;
    },



    //This function will filter the section data recieved from Wikitionary
    // to create an array of the section ids belonging to the sections with
    // the important latin content so they may be loaded later
    getSections: function()
    {
      if(this.latinToEng){
        this.word = this.input.toLowerCase();
      }
      var promise =
      axios.get('https://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true' +'&prop=sections'
      + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' + '&origin=*')
      .then((response) => {
        if(!this.errored){
          this.section = response.data.parse.sections;
        }
      });
      return promise
    },

    // Filters sections of the wikitionary page to find the important latin content
    findLatinSection: function(){
      var sectionNumber = "";
      this.sectionList = [];
      for(item of this.section)
      {
        var sectionNumber = item.number.split(".")[0];
        if(item.line == 'Latin')
        {
          var latinSection = sectionNumber;
        }
        if(sectionNumber == latinSection && (this.checkWhitelist(item.line))){
          this.sectionList.unshift(item.index);
        }
      }
    },

    checkWhitelist: function(item)
    {
      var whitelistedSections = ['Verb','Adjective','Conjunction','Adverb','Pronoun','Preposition','Determiner', 'Noun', 'Participle', 'Interjection', 'Numeral', 'Proverb', "Phrase", "Postposition", "Proper Noun"]
      for(element of whitelistedSections){
        if(element == item){
          return true;
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
        this.loading = false;
        return true;
      }
      else{
        // do nothing
        return false;
      }
    },

    // adds the latest word and its translation to an array in local storage, only adds
    // if word isn't already in array
    addToRecent: function()
    {
      // localStorage.removeItem('recent');
      var recentArray = JSON.parse(localStorage.getItem('recent'));
      var recentObj = {input:this.prevInput, collapsed:true}
      if(this.latinToEng){
        recentObj.translation = this.translation;
      }
      else{
        this.$nextTick(() => {
          recentObj.translation = this.$refs.engResults.innerHTML;
        });
      }
      if(this.engWord.length > 0){
        recentObj.eng = this.engWord;
      }
      if (recentArray == null)
      {
        recentArray = [recentObj];
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
          recentArray.unshift(recentObj);

          if(recentArray.length > 10)
          {
            recentArray.pop();
          }
        }
      };
      var localRecent = JSON.stringify(recentArray);
      localStorage.setItem('recent', localRecent);
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
        if(this.engWord.length > 0){
          savedObject.eng = this.engWord;
        }
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
  computed: {
    bookmarkMessage: function(){
      if(this.bookmark == 'bookmark'){
        return "Saved";
      }
      else {
        return "Save Word";
      }
    }
  },
  mounted(){
    this.translateLink();
    setTimeout(() => {
      this.$refs.startLoader.style.display = 'none';
      this.$refs.pages.style.display = 'block';
    }, 200);
  }

});


app.initialize();

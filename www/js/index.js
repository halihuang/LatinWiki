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


var main = new Vue({
  el: '#mainpage',
  data:{
    input:"",
    section:"",
    sectionList:"",
    whitelistedSections:"",
    loading: false,
    translation: "",
    latinToEng:false,
    word:"",
    errored:"",
  },
  methods:{
    searchLatin: function()
    {
      this.errored = false
      this.translation = "";
      if(this.latinToEng){
        this.getSections()
        .catch(error => {
          console.log(error)
          this.errored = true
        })
        .then(() => this.loading = true)
        .then(this.findLatinSection)
        .then(this.loadLatin)
        .catch(error => {
          console.log(error)
          this.errored = true
        })
        .finally(() => this.loading = false)
      }
      else{
        this.convertToLatin()
        .then(() => this.loading = true)
        .then(this.getSections)
        .catch(error => {
          console.log(error)
          this.errored = true
        })
        .then(this.findLatinSection)
        .then(this.loadLatin)
        .catch(error => {
          console.log(error)
          this.errored = true
        })
        .finally(() => this.loading = false)
      }
      this.loading = false;
    },
    convertToLatin: function(){
      this.word = this.input.toLowerCase();
      var yandexUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key="
      var apiKey= "trnsl.1.1.20190714T230320Z.2e2b73632e03279d.2719a3a3df5c1756bb6bde87c5bef4d4142ebee0"
      var url = yandexUrl + apiKey + "&text=" + this.word + "&lang=en-la&format=html";
      console.log(url)
      return(
      axios
      .get(url)
      .then((response) => {this.word = response.data.text[0];}))
    },

    loadLatin: function()
    {
      for(item of this.sectionList)
      {
        return (
        axios
        .get('http://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true'
        + '&section='+ item + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' +'&mobileformat=true' + '&prop=text'+ '&origin=*')
        .then((response) => {this.translation = response.data.parse.text["*"];}));
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
      .get('http://en.wiktionary.org/w/api.php?action=parse&page='+ this.word + '&noimages=true' +'&prop=sections'
      + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' + '&origin=*')
      .then((response) => {this.section = response.data.parse.sections;}));
    },

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
          this.whitelistedSections = ['Verb','Adjective','Declension','Usage notes','Conjugation','Conjunction','Adverb','Pronoun','Preposition','Determiner', 'Noun', 'Participle']
          for(element of this.whitelistedSections){
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
    checkLoading: function(){
      if(this.loading)
      {
        this.loading = false;
      }
      else
      {
        this.loading = true;
      }
    }

  }
});


app.initialize();

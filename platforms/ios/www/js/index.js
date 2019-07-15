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
  el: '#app',
  data:{
    input:"",
    englishWord:"",
    section:"",
    sectionList:"",
    whitelistedSections:"",
    loading: false,
    translation: "",
    latinToEng:true
  },
  methods:{
    searchLatin: function()
    {
      if(this.latinToEng){
        this.getSections()
        .then(this.findLatinSection)
        .then(this.loadLatin)
      }
      else{
        this.convertToLatin()
        .then(this.getSections)
        .then(this.findLatinSection)
        .then(this.loadLatin)
      }
    },
    convertToLatin: function(){
      const translate = require('google-translate-api');
      translate(this.input, {from: 'en', to: 'la'})
      .then(response => {this.input = response.text;})
    },

    loadLatin: function()
    {
      for(item of this.sectionList)
      {
        return (
        axios
        .get('http://en.wiktionary.org/w/api.php?action=parse&page='+ this.input + '&noimages=true'
        + '&section='+ item + '&disablelimitreport=true' + '&disableeditsection=true' + '&format=json' + '&prop=text'+ '&origin=*')
        .then((response) => {this.translation = response.data.parse.text["*"];}));
      }
    },

    //This function will filter the section data recieved from Wikitionary
    // to create an array of the section ids belonging to the sections with
    // the important latin content so they may be loaded later
    getSections: function()
    {
      return (
      axios
      .get('http://en.wiktionary.org/w/api.php?action=parse&page='+ this.input + '&noimages=true' +'&prop=sections'
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
          this.whitelistedSections = ['Verb','Adjective','Declension','Usage notes','Conjugation','Conjunction','Adverb','Pronoun','Preposition','Determiner']
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
    }
  }

});


app.initialize();

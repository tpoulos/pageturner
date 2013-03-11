//load the speech event object
this.SpeechRecognition = window.SpeechRecognition || 
                          window.webkitSpeechRecognition || 
                          window.mozSpeechRecognition || 
                          window.oSpeechRecognition || 
                          window.msSpeechRecognition;   


//Words that are common and hard for speech recognition to hear
var removedWords = ["a", "the", "to", "be", "of", 
                    "and", "in", "that", "have", 
                    "i", "it", "not", "on", "with", 
                    "he", "as", "you", "do", "at", 
                    "this", "but", "his", "by", "from", 
                    "they", "we", "say", "her", "she",
                    "or", "an", "will", "my", "one", "am", 
                    "is", "would", "was", "there", "their"];

var removedWordsRegExp = [];
for (var i = 0; i < removedWords.length; i++) {
  removedWordsRegExp.push(new RegExp("\\s" + removedWords[i] + "\\s", "g"));
};

function Prompter() {
  //the visual display of the current document
  this.$ = $("#transcript");
  this.text = this.$.text();
}

function SpeechListener() {
  //the processer of the speech events
  this.listener = new SpeechRecognition();
  this.prompter = new Prompter();
  this.transcript = this.makeTranscript(this.prompter.text);
  this.position = 0;
  this.previousInputTranscript = [];
}

SpeechListener.prototype.startListener = function() {
  sp.listener.onaudiostart = function() {
    console.log("Speak now"); 
  };

  sp.listener.onerror = function(event) {
    console.log("Error");
    console.log(event);
  };

  sp.listener.onresult = sp.processEvent.bind(sp);
  //starts the listener
  sp.listener.continuous = true;
  sp.listener.interimResults = true;
  sp.listener.maxResults = 3;
  sp.listener.start();
}

SpeechListener.prototype.clean = function(input) {
  //cleans inputted strings so that they are readble
  var letters = ("abcdefghijklmnopqrstuvwxyz 0123456789");
  var returnString = "";
  var input = input.toLowerCase().trim();
  for(c in input) {
    if(letters.indexOf(input[c]) !== -1){
      returnString += input[c];
    }
  }
  for (var i = 0; i < removedWordsRegExp.length; i++) {
    returnString = returnString.replace(removedWordsRegExp[i], ' ');
  };
  return returnString;
}

SpeechListener.prototype.makeTranscript = function(input) {
  //makes the strings into a transcript
  //that is full of word objects
  cleanText = this.clean(input).split(" ");
  transcript = [];
  numberRemoved = 0;
  for (var i = 0; i < cleanText.length; i++) {
    var newObject = {};
    newObject.word = cleanText[i];
    newObject.highlighted = false;
    newObject.index = i - numberRemoved;
    transcript.push(newObject);
  };
  return transcript;
}

SpeechListener.prototype.printTranscript = function(input) {
  //prints a transcript
  var fullString = "";
  for (var i = 0; i < input.length; i++) {
    if(sp.position === i) {
      fullString += "|";
    }
    else {
      fullString += " ";
    }
    if(input[i].highlighted === true) {
      fullString += "["
    }
    else {
      fullString += " ";
    }
    fullString += input[i].word;
    if(input[i].highlighted === true) {
      fullString += "]"
    }
    else {
      fullString += " ";
    }
    fullString += " ";
  }
  console.log(fullString);
}

SpeechListener.prototype.transcriptDiff = function(oldTranscript, newTranscripts) {
  //finds the first difference between two transcripts, and returns the rest of the new transcript
  if(oldTranscript.length > newTranscript.length){
    return newTranscript;
  }
  for (var i = 0; i < oldTranscript.length; i++) {
    if(oldTranscript[i].word !== newTranscript[i].word) {
      return newTranscript.slice(i);
    }
  }
  if(newTranscript.length > oldTranscript.length){
    return newTranscript.slice(oldTranscript.length);
  }
  return "";
}

SpeechListener.prototype.markRead = function(diff) {
  for (var i = this.position; i < this.transcript.length; i++) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.transcript[i].word) {
        this.transcript[i].highlighted = true;
        removeList += [j]
      }
    }
    for (var j = 0; j < removeList.length; j++) {
      diff.pop(j);
    }
  }
}

SpeechListener.prototype.processEvent = function(event) {
  //process speech events
  var transcriptArray = []
  for (var i = 0; i < event.results[0].length; i++) {
    event.results[0][i]
  };
  var transcript = transcriptArray[0];
  var diff =  this.transcriptDiff(this.previousInputTranscript, transcriptArray);
  this.printTranscript(diff);
  this.markRead(diff);
  this.printTranscript(this.transcript);
  this.previousInputTranscript = transcript;
}

var sp = new SpeechListener()


$(document).ready(function() {
  if (SpeechRecognition === undefined) {  
    $("#transcript").html("Your browser is bad, and you should feel bad.")
  }
  else {
    sp.startListener();
  }
});
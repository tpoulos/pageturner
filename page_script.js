//load the speech event object
this.SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.oSpeechRecognition ||
                          window.msSpeechRecognition;


//Words that are common and hard for speech recognition to hear
removedWords = ["a", "the", "to", "be", "of",
                    "and", "in", "that", "have",
                    "i", "it", "not", "on", "with",
                    "he", "as", "you", "do", "at",
                    "this", "but", "his", "by", "from",
                    "they", "we", "say", "her", "she",
                    "or", "an", "will", "my", "one", "am",
                    "is", "would", "was", "there", "their"];

//turns an array of strings
//into an array of regular expressions
//to search for those words
var makeRegExp = function (a) {
  var i, regExp;
  regExp = [];
  for (i = 0; i < a.length; i += 1) {
    regExp.push(new RegExp("\\s" + a[i] + "\\s", "g"));
  }
  return regExp;
}

removedWordsRegExp = makeRegExp(removedWords);


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
  this.listener.onaudiostart = function() {
    console.log("Speak now"); 
  }

  this.listener.onerror = function(event) {
    console.log("Error");
    console.log(event);
    sp.listener = new SpeechRecognition();
    sp.startListener();
  }

  this.listener.onresult = sp.processEvent.bind(sp);
  //starts the listener
  this.listener.continuous = true;
  this.listener.interimResults = true;
  this.listener.maxAlternatives = 2;
  this.listener.start();
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
  }
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

  var uniqueWords = [];
  //produces all of the unique words in the current speech event
  for (var i = 0; i < newTranscripts.length; i++) {
    var newTranscript = newTranscripts[i];
    for (var j = 0; j < newTranscript.length; j++) {
      var transcriptWord = newTranscript[j];
      for (var k = 0; k < uniqueWords.length; k++) {
        if(uniqueWords[k].word === transcriptWord.word) {
          transcriptWord.seen = true;
        }
      }
      if(transcriptWord.seen !== false) {
        uniqueWords.push(transcriptWord);
        transcriptWord.seen = false;
      }
    }
  }

  //Find all the words in the unique transcript which are not in
  //the old transcript
  var newWords = [];
  for (var i = 0; i < uniqueWords.length; i++) {
    var word = uniqueWords[i];
    for (var j = 0; j < oldTranscript.length; j++) {
      if(oldTranscript[j].word === word.word) {
        word.seen = true;
      }
    }
    if(word.seen !== true) {
      newWords.push(word);
      word.seen = false;
    }
  }
  return newWords;
}

SpeechListener.prototype.movePosition = function(index) {
  if(this.transcript[index - 2].highlighted && this.transcript[index - 1].highlighted) {
    this.position = index + 1;
    this.markAllUnread();
    console.log("cursor moved to: ", this.position);
    for (var i = this.position - 2; i < this.position + 2; i++) {
      console.log("context \t\t", this.transcript[i].word );
    };
  }
}

SpeechListener.prototype.markRead = function(diff) {
  for (var i = this.position; i < this.transcript.length; i++) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.transcript[i].word) {
        this.transcript[i].highlighted = true;
        removeList += [j];
        this.movePosition(i);
      }
    }
  }
  for (var i = this.position; i > 0; i--) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.transcript[i].word) {
        this.transcript[i].highlighted = true;
        removeList += [j];
        this.movePosition(i);
      }
    }
  }
}

SpeechListener.prototype.markAllUnread = function() {
  for (var i = 0; i < this.transcript.length; i++) {
    this.transcript[i].highlighted = false;
  }
}

SpeechListener.prototype.processEvent = function(event) {
  //process speech events
  var transcriptArray = []
  console.log(event);
  for (var i = 0; i < event.results[event.results.length - 1].length; i++) {
    transcriptArray.push(this.makeTranscript(event.results[event.results.length - 1][i].transcript));
  }
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
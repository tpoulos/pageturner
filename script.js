//load the speech event object
this.SpeechRecognition = window.SpeechRecognition ||
                          window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.oSpeechRecognition ||
                          window.msSpeechRecognition;

var forwardLookDistance = 20;
var debugColors = false;

//Words that are common and hard for speech recognition to hear
removedWords = ["a", "the", "to", "be", "of",
                "and", "in", "that", "have",
                "i", "it", "not", "on", "with",
                "he", "as", "you", "do", "at",
                "this", "but", "his", "by", "from",
                "they", "we", "say", "her", "she",
                "or", "an", "will", "my", "one", "am",
                "is", "would", "was", "there", "their",
                "were", "how"];

fontSettings =  [
                  {
                    "font-size": "2rem",
                    "width": "45%",
                    "margin": "15%"
                  },
                  {
                    "font-size": "3rem",
                    "width": "55%",
                    "margin": "15%"
                  },
                  {
                    "font-size": "4rem",
                    "width": "65%",
                    "margin": "10%"
                  }
                ];

ppSettings =  [
                  {
                    "margin-bottom": "2rem"
                  },
                  {
                    "margin-bottom": "3rem"
                  },
                  {
                    "margin-bottom": "4rem"
                  }
                ];
GETTYSBURG_ADDRESS = "Four score and seven years ago our fathers brought forth, upon this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. \n Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived, and so dedicated, can long endure. We are met here on a great battlefield of that war. We have come to dedicate a portion of it, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. \n But in a larger sense, we can not dedicate - we can not consecrate - we can not hallow - this ground. The brave men, living and dead, who struggled here, have consecrated it far above our poor power to add or detract. The world will little note, nor long remember, what we say here, but can never forget what they did here. \n It is for us, the living, rather to be dedicated here to the unfinished work which they have, thus far, so nobly carried on. It is rather for us to be here dedicated to the great task remaining before us - that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion - that we here highly resolve that these dead shall not have died in vain; that this nation shall have a new birth of freedom; and that this government of the people, by the people, for the people, shall not perish from the earth."

//turns an array of strings
//into an array of regular expressions
//to search for those words
var makeRegExp = function (a) {
  var i, regExp;
  regExp = [];
  for (i = 0; i < a.length; i += 1) {
    regExp.push(new RegExp("\\s" + a[i] + "\\s" , "g"));
  }
  return regExp;
}

removedWordsRegExp = makeRegExp(removedWords);



function Prompter() {
  //the visual display of the current document
  this.$ = $("#transcript");
  this.newText(GETTYSBURG_ADDRESS);
}

Prompter.prototype.newText = function(text) {
  this.text = text;
  this.processText(this.text);
  this.$.html(this.html);
}

Prompter.prototype.processText = function(rawText) {
  transcript = [];
  var splitText = rawText.split("\n");
  for (var i = 0; i < splitText.length; i++) {
    splitText[i] = splitText[i].split(" ");
  }
  var finalText = '';
  for (var i = 0; i < splitText.length; i++) {
    var pp = splitText[i]
    finalText += " <p> ";
    for (var j = 0; j < pp.length; j++) {
      finalText += " <span id='" + i + "-" + j + "'> ";
      finalText += pp[j];
      finalText += " </span> ";

      cleanText = this.cleanWord(pp[j])
      if(cleanText !== "") {
        var newObject = {};
        newObject.word = cleanText;
        newObject.highlighted = false;
        newObject.id = "#" + i + "-" + j;
        transcript.push(newObject);
      }
    }
    finalText += " </p> \n";
  }
  this.transcript = transcript;
  this.html = finalText;
}

function SpeechListener() {
  //the processor of the speech events
  this.prompter = new Prompter();
  this.position = 0;
  this.previousInputTranscript = [];
}

SpeechListener.prototype.startListener = function() {
  this.listener = new SpeechRecognition();
  this.listener.onaudiostart = function() {
    console.log("Speak now");
  }

  this.listener.onerror = function(event) {
    console.log("Error");
    console.log(event);
    sp.startListener();
  }

  this.listener.onresult = sp.processEvent.bind(sp);
  //starts the listener
  this.listener.continuous = true;
  this.listener.interimResults = true;
  this.listener.maxAlternatives = 5;
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
  }
  return returnString;
}

Prompter.prototype.cleanWord = function(input) {
  //cleans inputted strings so that they are readble
  var letters = ("abcdefghijklmnopqrstuvwxyz0123456789");
  var returnString = "";
  var input = input.toLowerCase();
  for(c in input) {
    if(letters.indexOf(input[c]) !== -1){
      returnString += input[c];
    }
  }
  if(-1 !== removedWords.indexOf(returnString)) {
    return "";
  }
  else {
    return returnString;
  }
}

SpeechListener.prototype.makeTempTranscript = function(input) {
  //makes the strings into a transcript
  //that is full of word objects
  cleanText = this.clean(input).split(" ");
  transcript = [];
  for (var i = 0; i < cleanText.length; i++) {
    var newObject = {};
    newObject.word = cleanText[i];
    newObject.highlighted = false;
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
  console.log(newWords)
  return newWords;
}

SpeechListener.prototype.movePosition = function(index) {
  if(index < 3) {
    return;
  }
  if(this.prompter.transcript[index - 1].highlighted || this.prompter.transcript[index + 1].highlighted) {
    this.position = index + 1;
    this.markAllUnread();
    for (var i = this.position - 2; i < this.position + 2; i++) {
      if(debugColors === true) {
        $(this.prompter.transcript[index].id).css("color", "blue");
      }

      $(this.prompter.transcript[index].id).scrollView();
    };
  }
}

SpeechListener.prototype.markReadAll = function(diff) {
  for (var i = this.position; i < this.prompter.transcript.length; i++) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.prompter.transcript[i].word) {
        this.prompter.transcript[i].highlighted = true;
        removeList += [j];
        this.movePosition(i);
      }
    }
  }
  for (var i = this.position; i > 0; i--) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.prompter.transcript[i].word) {
        this.prompter.transcript[i].highlighted = true;
        removeList += [j];
        this.movePosition(i);
      }
    }
  }
}

SpeechListener.prototype.markReadForward = function(diff) {
  for (var i = this.position; i < Math.min(this.prompter.transcript.length, this.position + forwardLookDistance) ; i++) {
    var removeList = [];
    for (var j = 0; j < diff.length; j++) {
      if(diff[j].word === this.prompter.transcript[i].word) {
        this.prompter.transcript[i].highlighted = true;
        if(debugColors = true) {
          $(this.prompter.transcript[i].id).css("color", "red");
        }
        removeList += [j];
        this.movePosition(i);
      }
    }
  }
}

SpeechListener.prototype.markAllUnread = function() {
  for (var i = 0; i < this.prompter.transcript.length; i++) {
    this.prompter.transcript[i].highlighted = false;
    $(this.prompter.transcript[i].id).css("color", "black");
  }
}

SpeechListener.prototype.processEvent = function(event) {
  //process speech events
  console.log(event);
  var transcriptArray = []
  for (var i = 0; i < event.results[event.results.length - 1].length; i++) {
    transcriptArray.push(this.makeTempTranscript(event.results[event.results.length - 1][i].transcript));
  }
  var transcript = transcriptArray[0];
  var diff =  this.transcriptDiff(this.previousInputTranscript, transcriptArray);
  this.markReadForward(diff);
  this.previousInputTranscript = transcript;
}

var sp = new SpeechListener()

function updateProgress() {
  var documentHeight = $("body").height();
  var scrollHeight = window.pageYOffset + (window.pageYOffset / $("body").height() * window.innerHeight);
  var percentage = Math.round(scrollHeight/documentHeight*100);
  $(".progress-bar").css("height", percentage + "%");
}

$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 100);

        updateProgress();
    });
}

$(document).ready(function() {
  if (SpeechRecognition === undefined) {
    $("#transcript").html("Your browser is bad, and you should feel bad.")
  }
  else {
    sp.startListener();
  }
  $(".menu").slideUp(0);

  var selectedMenu = "";
  var slideSpeed = 500;

  $("#settings-button").click(function() {
    if(selectedMenu === "#settings-menu") {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "";
    }
    else {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "#settings-menu";
      $(selectedMenu).slideDown(slideSpeed);
    }
  });

  $("#text-button").click(function() {
    if(selectedMenu === "#text-menu") {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "";
    }
    else {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "#text-menu";
      $(selectedMenu).slideDown(slideSpeed);
    }
  });

  $("#instructions-button").click(function() {
    if(selectedMenu === "#instructions-menu") {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "";
    }
    else {
      $(selectedMenu).slideUp(slideSpeed);
      selectedMenu = "#instructions-menu";
      $(selectedMenu).slideDown(slideSpeed);
    }
  });

  $("#debug-toggle").click(function(){
    if(debugColors === true) {
      $("#debug-toggle").text("off");
      debugColors = false;
    }
    else {
      $("#debug-toggle").text("on");
      debugColors = true;
    }
  });

  $("#fullscreen-toggle").click(function(){
    if($("#fullscreen-toggle").text() === "on") {
      $("#fullscreen-toggle").text("off");
      document.webkitCancelFullScreen();
    }
    else {
      $("#fullscreen-toggle").text("on");
      document.documentElement.webkitRequestFullScreen();
    }
  });

  $("#size-toggle").click(function(){
    if($("#size-toggle").text() === "small") {
      $("#size-toggle").text("medium");
      $("#transcript").css(fontSettings[1]);
      $("#transcript > p").css(ppSettings[1]);
    }
    else if ($("#size-toggle").text() === "medium"){
      $("#size-toggle").text("large");
      $("#transcript").css(fontSettings[2]);
      $("#transcript > p").css(ppSettings[2]);
    }
    else if ($("#size-toggle").text() === "large"){
      $("#size-toggle").text("small");
      $("#transcript").css(fontSettings[0]);
      $("#transcript > p").css(ppSettings[0]);
    }
  });

  $("#submit-text").click(function() {
    sp.prompter.newText($("#text-entry").val());
    sp.position = 0;
    $("#text-entry").val("");
  });


  $(document).scroll(function () {
    updateProgress();
  })
});

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
                    "margin": "20%"
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


randyPausch = "Most people don't know that this lecture series used to be called the Last Lecture. If you had one last lecture to give before you died, what would it be? I thought, damn, I finally nailed the venue and they renamed it. \n So, you know, in case there's anybody who wandered in and doesn't know the back story, my dad always taught me that when there's an elephant in the room, introduce them. If you look at my CAT scans, there are approximately 10 tumors in my liver, and the doctors told me 3-6 months of good health left. That was a month ago, so you can do the math. I have some of the best doctors in the world. \n So that is what it is. We can't change it, and we just have to decide how we're going to respond to that. We cannot change the cards we are dealt, just how we play the hand. If I don't seem as depressed or morose as I should be, sorry to disappoint you. And I assure you I am not in denial. It's not like I'm not aware of what's going on. My family, my three kids, my wife,we just decamped. We bought a lovely house in Virginia, and we're doing that because that's a better place for the family to be, down the road. And the other thing is I am in phenomenally good health right now. I mean it's the greatest thing of cognitive dissonance you will ever see is the fact that I am in really good shape. In fact, I am in better shape than most of you. [gets on the ground and starts doing pushups] So anybody who wants to cry or pity me can down and do a few of those, and then you may pity me. \n All right, so what we're not talking about today, we are not talking about cancer, because I spent a lot of time talking about that and I'm really not interested. If you have any herbal supplements or remedies, please stay away from me.  And we're not going to talk about things that are even more important than achieving your childhood dreams. We're not going to talk about my wife, we're not talking about my kids. Because I'm good, but I'm not good enough to talk about that without tearing up. So, we're just going to take that off the table. That's much more important. What is today's talk about then? It's about my childhood dreams and how I have achieved them. I've been very fortunate that way. How I believe I've been able to enable the dreams of others, and to some degree, lessons learned. I'm a professor, there should be some lessons learned and how you can use the stuff you hear today to achieve your dreams or enable the dreams of others. And as you get older, you may find that \"enabling the dreams of others\" thing is even more fun. \n So what were my childhood dreams? Well, you know, I had a really good childhood. I mean, no kidding around. I was going back through the family archives, and what was really amazing was, I couldn't find any pictures of me as a kid where I wasn't smiling. And that was just a very gratifying thing. There was our dog, right? Aww, thank you. And there I actually have a picture of me dreaming. I did a lot of that. You know, there's a lot of wake up's! I was born in 1960. When you are 8 or 9 years old and you look at the TV set, men are landing on the moon, anything's possible. And that's something we should not lose sight of, is that the inspiration and the permission to dream is huge. \n So what were my childhood dreams? You may not agree with this list, but I was there. Being in zero gravity, playing in the National Football League, authoring an article in the World Book Encyclopedia – I guess you can tell the nerds early. Being Captain Kirk, anybody here have that childhood dream? Not at CMU, nooooo. I wanted to become one of the guys who won the big stuffed animals in the amusement park, and I wanted to be an Imagineer with Disney. These are not sorted in any particular order, although I think they do get harder, except for maybe the first one."

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
  this.newText(randyPausch);
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
  //the processer of the speech events
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
  $("#instructions-menu").slideUp(0);
  $("#settings-menu").slideUp(0);
  $("#text-menu").slideUp(0);

  $("#settings-button").click(function() {
    $("#settings-menu").slideToggle(500);
  });
  $("#text-button").click(function() {
    $("#text-menu").slideToggle(500);
  });
  $("#instructions-button").click(function() {
    console.log("something")
    $("#instructions-menu").slideToggle(500);
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


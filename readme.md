#[Web Teleprompter](http://twp.io/teleprompter/)

This is the web teleprompter project. It started in March of 2013, a few days after the [web speech API](http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API) was released in chrome. I brainstormed projects that might use this API, and came up with the idea of making a teleprompter built entirely on web technologies, that could listen to you and move your script entirely automatically.

###Research
Most teleprompters use a small nob or dial as input, which the speaker is able to move back and forth to speed up or slow down the scrolling of the display. Typography in most teleprompters is rudimentary, with all caps text in white or green on a black background, generally in a sans-serif face. It is important for the text to be white on black, as it is often reflected (using reflective glass) under the hood of a camera, allowing the speaker to directly look into the camera while reading the text.

[See examples of teleprompters](https://www.google.com/search?q=teleprompter+images&safe=off&espv=2&biw=1280&bih=701&source=lnms&tbm=isch&sa=X&ei=pNcZVcDEB8mBU6D7gfgM&ved=0CAYQ_AUoAQ#safe=off&tbm=isch&q=teleprompter)

### Design
First, when designing my teleprompter, I focused on typography. I identified a typeface ([Pragmatica Web](https://typekit.com/fonts/pragmatica-web)) that was highly readable, with a large x-height and open apetures. Pragmatica was also a pragmatic choice because it was well kerned and hinted, so it would display well at both small and large sizes. It is also a sans-serif typeface based off helvetica, so it would look stylish while being familiar to most users.

Once I had chosen the typeface, I identified important features for the application to have. First of all, it was important for users to be able to adjust the size of the type, as I did not know how far they would be from the computer screen. Second, it was important for the speaker to know where they were in the speech, so that they could speed up or slow down accordingly. Thirdly, it was important for users to be able to use their own text easily, most likely copy and pasted from a word document.

Less essential features included a full-screen mode and a debug mode, both of which I included in the settings menu. I also included animations in the interface to make the text's movement fluid and easy to follow.

### Text following algorithm

An important implementation detail was the text following algorithm, which I spent a great deal of time on.

The problem with speech recognition is that it is not  precise, and it is important for a teleprompter to closely follow a speaker's words. If it gets ahead or fails to keep up, the results could be embarrassing.

Because speech recognition is so imprecise, a good teleprompter can't exactly follow the script, or else it will get very far behind. I needed to come up with a way for the algorithm to figure out approximately where a user was in the speech, and handle missed and incorrectly transcribed words gracefully.

Another problem with speech recognition is that it takes a long time. If I waited for the speech recognizer to make it's best guess about the sentence, it would get behind the speaker.

In order to solve these two problems, I worked through trial and error on an algorithm that intelligently figures out where you are.

First, the full text of the speech is taken and processed. Punctuation and commonly misheard words (monosylabic, common words that the teleprompter will often mishear) are removed, and put in an array. This array is called the speech transcript.

Each word of the transcript is cross-referenced to a word in the original text. Not every word in the original text of the speech is in the transcript, but as the algorithm moves through the transcript, it can tell where the user is in the original text.

Then, the algorithm assumes that the user is starting at the beginning. It listens for input, and when it gets input it sends it to the speech recognition API, with an optional flag enabled that sends preliminary results in addition to final results. When it gets each set of results (sometimes as many as five preliminary results and one final result) it checks the next fifteen words of the transcript. If one of the next fifteen words was in the result, it marks that word as read and moves on.

Once a certain number of previous words has been read (three of the last four is the number I chose after much tweaking) that word becomes the new starting point. The transcript moves forward to that word, and the full text is scrolled so that that word is at the top of the screen.

This allows the teleprompter to handle imprecise readings, while being performant and robust.

###Live Demo

You can see a [live demo](http://twp.io/teleprompter/) of the teleprompter.

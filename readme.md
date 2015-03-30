#Web Teleprompter


This is the web teleprompter project. It started in March of 2013, a few days after the [web speech API](http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API) was released in chrome. I brainstormed projects that might use this API, and came up with the idea of making a teleprompter built entirely on web technologies, that could listen to you and move your script entirely automatically.

###Research
Most teleprompters use a small nob or dial as input, which the speaker is able to move back and forth to speed up or slow down the scrolling of the display. Typography in most teleprompters is rudimentary, with all caps text in white or green on a black background, generally in a sans-serif face. It is important for the text to be white on black, as it is often reflected (using reflective glass) under the hood of a camera, allowing the speaker to directly look into the camera while reading the text.

[See examples of teleprompters](https://www.google.com/search?q=teleprompter+images&safe=off&espv=2&biw=1280&bih=701&source=lnms&tbm=isch&sa=X&ei=pNcZVcDEB8mBU6D7gfgM&ved=0CAYQ_AUoAQ#safe=off&tbm=isch&q=teleprompter)

### Design
First, when designing my teleprompter, I focused on typography. I identified a typeface ([Pragmatica Web](https://typekit.com/fonts/pragmatica-web)) that was highly readable, with a large x-height and open apetures. Pragmatica was also a pragmatic choice because it was well kerned and hinted, so it would display well at both small and large sizes. It is also a sans-serif typeface based off helvetica, so it would look stylish while being familiar to most users.

Once I had chosen the typeface, I identified important features for the application to have. First of all, it was important for users to be able to adjust the size of the type, as I did not know how far they would be from the computer screen. Second, it was important for the speaker to know where they were in the speech, so that they could speed up or slow down accordingly. Thirdly, it was important for users to be able to use their own text easily, most likely copy and pasted from a word document.

Less essential features included a full-screen mode and a debug mode, both of which I included in the settings menu. I also included animations in the interface to make the text's movement fluid and easy to follow.

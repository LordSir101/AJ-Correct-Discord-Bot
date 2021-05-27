var pos = require('pos');

module.exports = {
  name: 'ajify',

  execute(message, text){
    var words = new pos.Lexer().lex(text);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);

    //tagged words is an array with entries of the form: ['word', 'tag']
    for (var i = 0; i < taggedWords.length; i++) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        var tag = taggedWord[1];

        //Changes the word if it matches a specific criteria
        taggedWords[i] = modifyWord(word, tag, taggedWords[i]);
    }

    taggedWords = spellCheck(taggedWords);
    taggedWords = modifyQuestions(taggedWords);
    reply = createString(taggedWords);

    message.channel.send(reply);
  }
}

function modifyWord(word, tag, wordTag){
  //mark any special words as modified so the don't get mispelled by spellcheck()

  //Check for nouns
  if(tag == 'NNP'){
    wordTag[0] = 'Senpai';
    wordTag[1] = 'modified';
  }
  if(word.toLowerCase() === 'lol'){
    wordTag[0] = 'kekW';
    wordTag[1] = 'modified';
  }
  if(word.toLowerCase() === 'you'){
    wordTag[0] = 'u';
    wordTag[1] = 'modified';
  }
  if(word.toLowerCase() === 'come'){
    wordTag[0] = 'cum';
    wordTag[1] = 'modified';
  }

  return wordTag
}

//Will randomly select words to misspell
function spellCheck(words) {
  let unmodifiedWords = [];
  let corrected = false;

  for (var i = 0; i < words.length; i++){
    let pass = false;
    if(words[i][1] == 'modified'){ pass = true;}

    //keep track of all unmodified words as they may be randomly selected later
    let word = words[i][0];

    if(word.length > 2 && !pass){
      unmodifiedWords.push(word);

      let probability = Math.random();
      //25% chance to misspell a word
      if(probability > 0.75){
        words[i][0] = correct(word);
        corrected = true;
      }
    }
  }

  //correct a random unmodified word if none have been corrected
  //this guarentees at least one spelling mistake per message
  if(!corrected){
    let randWord = unmodifiedWords[Math.floor(Math.random() * unmodifiedWords.length)];

    for(var i = 0; i < words.length; i++){
      if(words[i][0] == randWord){
        words[i][0] = correct(randWord);
      }
    }
  }

  return words;
}

//Will swap positions of random characters in a word
function correct(word){
  let totalLetters = word.length;
  let lettersLeft = word.length;

  let corrected = false;
  let swapHappened = false;

  let last;
  let first;

  for(let i = 0; i < word.length; i++){
    swapHappened = false;

    //Swap the last two characters if no swap has been made
    if(i == word.length -1){
      if(!corrected){
        last = word.charAt(i);
        first = word.charAt(i-1);
        word = word.substr(0, i-1) + last + first
      }
    }
    else{
      //probability function that reaches 100% the closer to the end of the word
      let probability = 1 - ((lettersLeft - 1) / totalLetters);

      if(probability >= Math.random()){
        //swap two characters
        first = word.charAt(i);
        last = word.charAt(i+1);
        word = word.substr(0, i) + last + first + word.substr(i+2, word.length);

        //reset probability to reduce liklihood of successive swaps
        lettersLeft = word.length;
        corrected = true;
        swapHappened = true;

      }
      //increase probability for each letter if no swap was made
      if(!swapHappened){lettersLeft = word.length - (i + 1);}
    }
  }
  return word;
}

//Adds 'or nah' to requests such as wanna play x?
function modifyQuestions(words){
  let sentence = [];
  let invalidQuestionsTags = ['WDT', 'WP', 'WP$', 'WRB'];
  let invalidSentence = false;

  //add words to current sentence until a question mark is found
  for(var i = 0; i < words.length; i++){
    sentence.push(words[i][0]);

    //we want to avoid questions like who, what where when etc because we are adding or nah to the end
    let tag = words[i][1];
    if(invalidQuestionsTags.includes(tag)){
      invalidSentence = true;
    }

    if(words[i][0] == '?'){
      if(invalidSentence){
        invalidSentence = false;
        sentence = [];
      }
      else{
        //If the sentece is valid and is a question, add or nah before the question mark
        words.splice(i, 0, ['or', 'modified'], ['nah', 'modified']);
        i+=2;
      }
    }
    //If the sentence ends with a punctuation that isnt ?, start new sentence
    else if(words[i][1] == '.'){
      invalidSentence = false;
      sentence = [];
    }
  }

  return words;
}
//reconstructs the message as a string that the bot can send
function createString(words) {
  let response = "";
  for (var i = 0; i < words.length; i++){
    if(words[i][1] == '.'){
      response += words[i][0];
    }
    else{
      response += " " + words[i][0];
    }
  }

  return response;
}

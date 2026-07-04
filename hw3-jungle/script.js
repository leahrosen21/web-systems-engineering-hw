
// collecting all buttons 
var buttons = document.querySelectorAll('.btn');

// through the entire buttons array and add
// event listener to each button
for(var i=0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
        btnInnerHTML = this.innerHTML;
        playAnimalSound(btnInnerHTML);
        showButtonAnimation(btnInnerHTML);
        markInteraction();
    })};

// through the entire document and listen for keypress events
document.addEventListener('keypress', function(event) {
    playAnimalSound(event.key);
    showButtonAnimation(event.key);
    markInteraction();
});

// JS element not covered in class: setInterval()
// setInterval repeatedly runs a function every given 
// number of milliseconds, until it is stopped. 
// Here it checks every 10 seconds whether the visitor has
// been idle, and if so, nudges a random button with a 
// little pulses to invite them to play.
var lastInteractionTime = Date.now();

function markInteraction() {
    lastInteractionTime = Date.now();
}

setInterval(function() {
    var idleTime = Date.now() - lastInteractionTime;
    if (idleTime > 10000) {
        var randomButton = buttons[Math.floor(Math.random() * buttons.length)];
        randomButton.classList.add('nudge');
        setTimeout(function() {
            randomButton.classList.remove('nudge');
        }, 1800);
        markInteraction(); // reset the interaction time after nudging so that it doesn't keep nudging every 10 seconds
    }
}, 10000);

document.addEventListener('DOMContentLoaded', function(event) {
    var audio = new Audio('./sounds/magic_enter.mp3');
    audio.play();
});


function playAnimalSound(key) {
switch (key) {
    case 'w':
        // play sound for w
        var audio = new Audio('./sounds/winnie_the_pooh.mp3');
        audio.play();
        break;
    case 'a':
        // play sound for a
        var audio = new Audio('./sounds/piglet.mp3');
        audio.play();
        break;
    case 's':
        // play sound for s
        var audio = new Audio('./sounds/owl.mp3');
        audio.play();
        break;
    case 'd':
        // play sound for d
        var audio = new Audio('./sounds/tiger.mp3');
        audio.play();
        break;
    case 'j':
        // play sound for j
        var audio = new Audio('./sounds/rabbit.mp3');
        audio.play();
        break;
    case 'k':
        // play sound for k
        var audio = new Audio('./sounds/kangaroo.mp3');
        audio.play();
        break;
    case 'l':
        // play sound for l
        var audio = new Audio('./sounds/donkey.mp3');
        audio.play();
        break;
    default:
        alert("Invalid key pressed! Please press one of the following keys: w, a, s, d, j, k, l.");
}};

function showButtonAnimation(currentKey) {
    var activeButton = document.querySelector("." + currentKey);
    activeButton.classList.add("playing");
    setTimeout(function() {
        activeButton.classList.remove("playing");
    }, 100);
}






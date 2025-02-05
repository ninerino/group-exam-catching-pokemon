const log = (msg) => console.log(msg);

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if(validateForm()) {
        // initGame inkluderar funktionen randomizePokemon()
        
        canvas.classList.toggle("d-none")
        initGame(); // denna innehåller Randomize Pokemon så utan denna så får inte createPokemon något att visa
        createPokemon();
        startGame();
        drawOnCanvas();
        
            // Placerar pokemonen på spelfältet
    
            // startGame
        // Startar timern för att få pokemonen att röra på sig.
    }
});




const nickRef = document.querySelector('#nick');
const ageRef = document.querySelector('#age');
const boyRef = document.querySelector('#boy');
const girlRef = document.querySelector('#girl');
const formRef = document.querySelector('#formWrapper');
const gameFieldRef = document.querySelector('#gameField');
const canvas = document.querySelector('#canvas');


document.querySelector('#playAgainBtn').addEventListener('click', () => {
    // Göm gameField, visa formRef igen
    formRef.classList.toggle('d-none');
    gameFieldRef.classList.toggle('d-none');
    document.querySelector('#highScore').classList.toggle('d-none')
    
    // Sätt alla värden till "noll" igen
    oGameData.init();
    victoryAudio.pause();
    victoryAudio.currentTime = 0;

    const highscoreListRef = document.querySelector('#highscoreList');
    highscoreListRef.textContent = '';

} )

function validateForm() {
    const errorMsg = document.querySelector('#errorMsg');

    try {
        if(nickRef.value.length < 5 || nickRef.value.length > 10) {
            nickRef.focus();
            throw new Error('Namn måste vara mellan 5 och 10 bokstäver');

        }else if (isNaN(Number(ageRef.value)) || ageRef.value < 10 || ageRef.value > 15) {
            ageRef.focus();
            throw new Error('Ålder måste vara mellan 10 och 15');

        } else if (!boyRef.checked && !girlRef.checked) {
            throw new Error('Du måste välja ett kön');
        };
        errorMsg.classList.add('d-none');

        return true;
    } catch (error) {
        errorMsg.classList.remove('d-none');
        errorMsg.textContent = error.message;
        return false;
    };
}

function initGame() {
    oGameData.trainerName = nickRef.value;
    oGameData.trainerAge = ageRef.value;
    if (boyRef.checked) {
        oGameData.trainerGender = 'Boy';
    } else if (girlRef.checked) {
        oGameData.trainerGender = 'Girl';
    }
    randomizePokemon();
}

function randomizePokemon() {
    for (let i = 1; i <= 10; i++ ) {
        let randomValue = Math.floor(Math.random() * 151 ) + 1;
        let fixedNr = String(randomValue).padStart(3, '0');

        while(oGameData.pokemonNumbers.includes(fixedNr)) {
            randomValue = Math.floor(Math.random() * 151 ) + 1;
            fixedNr = String(randomValue).padStart(3, '0');
        }
        oGameData.pokemonNumbers.push(fixedNr);
    }
};

function createPokemon() {
    for(let number of oGameData.pokemonNumbers) {
        // gameFieldRef
        const imgElement = document.createElement('img');
        setPosition(imgElement);
        imgElement.src = `./assets/pokemons/${number}.png`;
        imgElement.id = `pkmnID${number}`;

        // Lägger till addEventListener('mouseover') till img så man kan fånga pokemonen
        catchPokemon(imgElement, number);

        gameFieldRef.appendChild(imgElement);
    }
}

function catchPokemon(img, number) {
    img.addEventListener('mouseover', () => {

        if(img.src.endsWith(`assets/pokemons/${number}.png`)) {
            img.src = './assets/ball.webp';
            oGameData.nmbrOfCaughtPokemons++;

        } else if (img.src.endsWith('assets/ball.webp')) {
            img.src = `./assets/pokemons/${number}.png`;
            oGameData.nmbrOfCaughtPokemons--;
        }
        if(oGameData.nmbrOfCaughtPokemons === 5) {
            endGame();
        }
    })
}

function movePokemon() {
    oGameData.timerId = setInterval(() => {
        for(let number of oGameData.pokemonNumbers) {
            const pkmnImage = document.querySelector(`#pkmnID${number}`);
            setPosition(pkmnImage);
        }
    }, 3000);
}


function setPosition(img) {
    const xPosition = oGameData.getLeftPosition();
    const yPosition = oGameData.getTopPosition();
    img.style.transform = `translate(${xPosition}px, ${yPosition}px)`;
}

function startGame() {
    const battleAudio = document.querySelector('#battleAudio');
    battleAudio.loop = true;
    battleAudio.volume = 0.1;
    battleAudio.play();
    movePokemon(); // Kan vi flytta denna högst upp så den börjar köra medan canvas kör?
    setTimeout(() => {
        oGameData.startTimeInMilliseconds();
        
    }, 3000);
    // Sparar exakta tiden i en variabel
}

function endGame() {
    // Stoppa tiden
    oGameData.endTimeInMilliseconds();
    oGameData.nmbrOfSeconds = Math.round(oGameData.nmbrOfMilliseconds() / 10) / 100;

    // Stoppa setInterval
    clearInterval(oGameData.timerId);

    // Dölj bilder
    const pkmnImgs = document.querySelectorAll('img');
    pkmnImgs.forEach( (img) => {
        img.remove();
    });

    // Stoppa spelmusiken
    battleAudio.pause();
    battleAudio.currentTime = 0;

    // Starta vinstmusiken
    const victoryAudio = document.querySelector('#victoryAudio');
    victoryAudio.loop = true;
    victoryAudio.volume = 0.1;
    victoryAudio.play();

    viewHighScore(updateLocalStorage());
}

function viewHighScore(highScore) {
    document.querySelector('#highScore').classList.toggle('d-none')

    // Vinstmeddelandet för aktuella spelet
    document.querySelector('#winMsg').textContent = `Well done ${oGameData.trainerName}! Your time was ${oGameData.nmbrOfSeconds} seconds.`

    // High Score-listan från localStorage
    const highscoreListRef = document.querySelector('#highscoreList');

    highScore.forEach( (score) => {
        const listItemElement = document.createElement('li');
        listItemElement.innerText = `${score.name}, ${score.age} years, ${score.gender}, ${score.time} sec`;
        highscoreListRef.appendChild(listItemElement);
    });

}

function updateLocalStorage() {
    const fromLocalStorage = JSON.parse(localStorage.getItem('highScore')) || [];

    compareHighScore(fromLocalStorage);

    localStorage.setItem('highScore', JSON.stringify(fromLocalStorage));

    return fromLocalStorage;
}

function compareHighScore(highScore) {

    const trainer = {
        name: oGameData.trainerName,
        age: oGameData.trainerAge,
        gender: oGameData.trainerGender,
        time: oGameData.nmbrOfSeconds
    }

    highScore.push(trainer);


    if(highScore.length > 1) {
        highScore.sort((a, b) => a.time - b.time);
    }

    if(highScore.length > 10){
        highScore.pop();
    }
}

function drawOnCanvas() {
    if(canvas.getContext) {
        // Skapar själva canvasen
        const ctx = canvas.getContext("2d")

        // Gör så canvasytan blir tom
        // Behövs ifall man vill spela om
        ctx.reset();
        
        // x och y-värden för vart JavaScript ska "rita" på canvas.
        let xValue = 0;
        let yValue = 0;

        // Boolean som kontroll för vilken riktning if-satserna nedan ska köra-
        let buildForward = true;

        // Indexvärde som kontroll för när varje varv gjorts
        let i = 0;
        
        // setInterval för att rita var 45 millisekunder
        const myTimer = setInterval(() => {

            // Vilken färg ska det jag ritar ha? Svart.
            ctx.fillStyle = "rgb(0 0 0)";

            // Vad ska ritas?
            // En rektangel på specifika x och y-positioner.
            // Ska även ha en storlek på "25" i längd och "25" i höjd.
            ctx.fillRect(xValue, yValue, 25, 25);


            // if-sats för höger och nedåt
            if(buildForward === true) {

                // Går höger
                if(xValue <= 250 - (i*25)) {
                    xValue += 25;
                    
                // Går nedåt
                } else if (xValue === 275 - (i*25)) {
                    yValue += 25;
                }

                // När ett halvt varv gjorts, "ändra riktning"
                if(yValue === 125 - (i*25)) {
                    buildForward = false;
                }
                
                // Vänster och uppåt
            } else if(buildForward === false) {

                // Går vänster
                if(xValue >= 25 + (i*25)) {
                    xValue -= 25;
                    
                // Går uppåt
                } else if (xValue === 0 + (i*25)) {
                    yValue -= 25;
                }
                
                // När resten av varvet gjorts, byt riktning igen
                // Inkrementera i
                if(yValue === 25 + (i*25) && i < 2) {
                    buildForward = true;
                    i++;
                    
                // Sista varvet så stoppas setInterval vid sista rutan
                } else if(xValue ===  0 + (i*25) && i === 2) {
                    ctx.fillRect(xValue, yValue, 25, 25);
                    clearInterval(myTimer);
                    canvas.classList.toggle("d-none");
                    formRef.classList.toggle('d-none');
                    gameFieldRef.classList.toggle('d-none');
                
                }
            }
        }, 42);
    }   
}
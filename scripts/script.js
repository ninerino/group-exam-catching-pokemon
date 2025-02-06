const log = (msg) => console.log(msg);
// När man trycker på 'Let's catch some pokemons' så körs denna lyssnare på förstasidan
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if(validateForm()) {
        // "initGame()" innehåller även "randomizePokemon()" så man får 10 slumpmässiga pokemon.
        initGame();

        // "createPokemon" skapar de img-element som varje pokemon tilldelas.
        createPokemon();

        // "playBattleAudio() kör igång ljudfilen"
        playBattleAudio()
        // "startGame()" kör "movePokemon()" samt startar "startTimeInMilliseconds()".

        // En animation på drygt tre sekunder som skapar en svart spiral som fyller hela skärmen innan man får se spelfältet.
        canvasRef.classList.toggle("d-none")
        drawOnCanvas();
    }
});

// De referenser som behövs i koden
const nickRef = document.querySelector('#nick');
const ageRef = document.querySelector('#age');
const boyRef = document.querySelector('#boy');
const girlRef = document.querySelector('#girl');
const formRef = document.querySelector('#formWrapper');
const gameFieldRef = document.querySelector('#gameField');
const canvasRef = document.querySelector('#canvas');
const battleAudioRef = document.querySelector('#battleAudio');
const victoryAudioRef = document.querySelector('#victoryAudio');
battleAudioRef.preload = "auto";

// "Spela igen?"-knappen
document.querySelector('#playAgainBtn').addEventListener('click', () => {

    // Göm gameField, göm highScore,  visa formRef igen
    formRef.classList.toggle('d-none');
    gameFieldRef.classList.toggle('d-none');
    document.querySelector('#highScore').classList.toggle('d-none')

    // Sätt alla oGameData-värden till "noll" igen
    oGameData.init();
    victoryAudioRef.pause();
    victoryAudioRef.currentTime = 0;

    // Töm highScore-listan
    const highscoreListRef = document.querySelector('#highscoreList');
    highscoreListRef.textContent = '';
});

// Funktion för att validera formuläret
function validateForm() {
    // Sätter id errorMsg som "target" för vart felmeddelandena kommer visas
    const errorMsgRef = document.querySelector('#errorMsg');

    try {
        // Kontrollerar att namn är mellan 5 och 10 tecken
        if(nickRef.value.length < 5 || nickRef.value.length > 10) {
            nickRef.focus();
            throw new Error('Your name may only be between 5 and 10 characters');

        // Kontrollerar att ålder är mellan 10 och 15
        // Kontrollerar även att input faktiskt är ett nummer
        // /^\d+$ innebär att endast numerärer får synas, medan test returnerar true (vilket innebär att vi har ! före)
        }else if (!/^\d+$/.test(ageRef.value) || ageRef.value < 10 || ageRef.value > 15) {
            ageRef.focus();
            throw new Error('Age must be between 10 and 15');

        // Kontrollerar att kön är valt
        } else if (!boyRef.checked && !girlRef.checked) {
            throw new Error('You have to pick a gender');
        };

        // Lägger till klassen "d-none" till errorMsgRef ifall den råkar vara synlig från att nyligen ha visat ett errormeddelande.
        errorMsgRef.classList.add('d-none');

        return true;
    } catch (error) {
        // Tar bort klassen "d-none" för att visa errormeddelandet
        errorMsgRef.classList.remove('d-none');

        // Visar felmeddelandet i errorMsg
        errorMsgRef.textContent = error.message;
        return false;
    };
};

// Funktion för att initiera spelet
function initGame() {
    // Sätter trainerName till namnet som användaren valt
    oGameData.trainerName = nickRef.value;

    // Sätter trainerAge till åldern som användaren valt
    oGameData.trainerAge = ageRef.value;

    // If-check beroende på vilken radio-button i gender som är fylld och lägger in det gender på tränaren
    if (boyRef.checked) {
        oGameData.trainerGender = 'Boy';
    } else if (girlRef.checked) {
        oGameData.trainerGender = 'Girl';
    }
    // Startar funktionen att randomisea vilka pokemon som väljs
    randomizePokemon();
};

// Funktion för att slumpmässigt välja ut tio pokemon
function randomizePokemon() {
    // For-loop som väljer ut tio pokemon
    for (let i = 1; i <= 10; i++ ) {
        let randomValue = Math.floor(Math.random() * 151 ) + 1;
        // Funktion som ser till att det läggs nollor framför siffran om det behövs, så att det matchar med filnamnen (001, 071 osv).
        // "padStart" ser till att det alltid är tre siffror och fyller ut med nollor före (därav Start) ifall det är mindre än tre siffror i det randomiserade värdet (exempelvis 71 blir 071)
        let fixedNr = String(randomValue).padStart(3, '0');

        // Ser till att det inte blir dubletter genom att kolla så att urvalet inte redan finns med i arrayen, och om den gör det så kör den en ny randomisering tills den hittar en Pokemon som inte redan finns med
        while(oGameData.pokemonNumbers.includes(fixedNr)) {
            randomValue = Math.floor(Math.random() * 151 ) + 1;
            fixedNr = String(randomValue).padStart(3, '0');
        }
        // Pushar den valda pokemon till arrayen
        oGameData.pokemonNumbers.push(fixedNr);
    };
};

// Funktion för att skapa pokemonbilder på skärmen
function createPokemon() {
    for(let number of oGameData.pokemonNumbers) {
        // Skapar ett imgElement
        const imgElement = document.createElement('img');
        // Sätter ut pokemon på en position på spelfältet genom att anropa funktionen setPosition
        setPosition(imgElement);
        imgElement.src = `./assets/pokemons/${number}.png`;
        imgElement.id = `pkmnID${number}`;

        // Lägger till addEventListener('mouseover') till img så man kan fånga pokemonen
        catchPokemon(imgElement, number);
        // Lägger till imgElementet i gameField
        gameFieldRef.appendChild(imgElement);
    };
};

// Funktion för att fånga pokemon
function catchPokemon(img, number) {
    img.addEventListener('mouseover', () => {
        // Om sökvägen till bilden slutar med pokemonnumret och man hovrar så ska den bytas till bilden på pokebollen och lägga till en i number of caught Pokemon
        if(img.src.endsWith(`assets/pokemons/${number}.png`)) {
            img.src = './assets/ball.webp';
            oGameData.nmbrOfCaughtPokemons++;
        // Om sökvägen slutar med ball.webp och man hovrar så ska den bytas till pokemonbilden igen och ta bort en i number of caught Pokemon
        } else if (img.src.endsWith('assets/ball.webp')) {
            img.src = `./assets/pokemons/${number}.png`;
            oGameData.nmbrOfCaughtPokemons--;
        }
        // Om tio pokemons har fångats så ska endGame-funktionen anropas
        if(oGameData.nmbrOfCaughtPokemons === 10) {
            endGame();
        }
    })
}

// Funktion för att dölja animationen och formuläret samt visa spelfältet
// Även att starta "movePokemon()" samt timern.
function startGame() {
    // Togglar av form och canvas och togglar på gameField
    canvasRef.classList.toggle("d-none");
    formRef.classList.toggle('d-none');
    gameFieldRef.classList.toggle('d-none');

    // Funktion för att alla pokemon får en ny position efter varje 3e sekund
    // En fördröjning på 50 millisekunder för att förhindra en bugg där pokemonen ibland inte flyttar på sig efter att animationen är färdig
    setTimeout(() => {
        movePokemon();
        oGameData.startTimeInMilliseconds();
        
    }, 50);
};

function playBattleAudio() {
        // Start av ljudfil under spelets gång
        battleAudioRef.loop = true;
        battleAudioRef.volume = 0.5;
        battleAudioRef.currentTime = 0.25;
        battleAudioRef.play();
};

// Funktion för att ge alla pokemon en ny position efter varje 3e sekund
function movePokemon() {
    // Interval för att få varje pokemon att röra på sig var 3e sekund
    for(let number of oGameData.pokemonNumbers) {
        const pkmnImage = document.querySelector(`#pkmnID${number}`);
        // Anropar en funktion som ger varje pokemon i denna iteration en ny x och y position. Pokemonen skickas med som ett argument
        setPosition(pkmnImage);
    };
    oGameData.timerId = setInterval(() => {
        for(let number of oGameData.pokemonNumbers) {
            const pkmnImage = document.querySelector(`#pkmnID${number}`);
            // Anropar en funktion som ger varje pokemon i denna iteration en ny x och y position. Pokemonen skickas med som ett argument
            setPosition(pkmnImage);
        }
    }, 3000);
};

// Funktion för att ge varje bild en slumpmässig position på spelfältet
function setPosition(img) {
    // Ny x-position
    const xPosition = oGameData.getLeftPosition();
    // Ny y-position
    const yPosition = oGameData.getTopPosition();
    // Skickar positionerna till bilden
    img.style.transform = `translate(${xPosition}px, ${yPosition}px)`;
};

// Funktion när spelet är avslutad då nmbrOfCaughtPokemons = 10
function endGame() {
    // Stoppa tiden
    oGameData.endTimeInMilliseconds();
    // Den slutgiltiga tiden omvandlas till sekunder sparas där det avrundas till två decimaler
    oGameData.nmbrOfSeconds = Math.round(oGameData.nmbrOfMilliseconds() / 10) / 100;

    // Stoppa setInterval
    clearInterval(oGameData.timerId);

    // Tar bort alla pokemonbilder
    const pkmnImgs = document.querySelectorAll('img');
    pkmnImgs.forEach( (img) => {
        img.remove();
    });

    // Stoppa spelmusiken
    battleAudioRef.pause();
    battleAudioRef.currentTime = 0;

    // Starta vinstmusiken
    victoryAudioRef.loop = true;
    victoryAudioRef.volume = 0.5;
    // Då originalmusiken inte startar förrän efter 1 sekund så sätts currentTime till 1
    victoryAudioRef.currentTime = 1;
    victoryAudioRef.play();
    // Funktion för att visa highScorerutan anropas där det returnerade arrayen från funktionen updateLocalStorage skickas med som argument
    viewHighScore(updateLocalStorage());
};

// Funktion för att visa High Score
function viewHighScore(highScore) {
    // Togglar av display none så att High Score kan visas
    document.querySelector('#highScore').classList.toggle('d-none')

    // Vinstmeddelandet för aktuella spelet
    document.querySelector('#winMsg').textContent = `Well done ${oGameData.trainerName}! Your time was ${oGameData.nmbrOfSeconds} seconds.`

    // High Score-listan från localStorage
    const highscoreListRef = document.querySelector('#highscoreList');

    // Lägger till en rad för varje high score som finns i listan
    highScore.forEach( (score) => {
        const listItemElement = document.createElement('li');
        listItemElement.innerText = `${score.name}, ${score.age} years, ${score.gender}, ${score.time} sec`;
        highscoreListRef.appendChild(listItemElement);
    });
};

// Funktion som returnerar en array från localStorage
function updateLocalStorage() {
    // Sparar ner en array från localStorage, om det inte finns någon 'highScore' så sparas en tom array
    const fromLocalStorage = JSON.parse(localStorage.getItem('highScore')) || [];

    // Anropar funktion som jämförtiden i arrayen
    compareHighScore(fromLocalStorage);

    // Sparar i localStorage
    localStorage.setItem('highScore', JSON.stringify(fromLocalStorage));

    return fromLocalStorage;
};

// Funktion för att jämföra tider på High Score
function compareHighScore(highScore) {

    // Tränardetaljer
    const trainer = {
        name: oGameData.trainerName,
        age: oGameData.trainerAge,
        gender: oGameData.trainerGender,
        time: oGameData.nmbrOfSeconds
    };
    // Pushar tränardetaljerna till highScore
    highScore.push(trainer);

    // Om High Score har mer än en entry så ska den sortera på lägst tid först
    if(highScore.length > 1) {
        highScore.sort((a, b) => a.time - b.time);
    }
    // Om High Score har mer än tio entries så ska nummer elva tas bort
    if(highScore.length > 10){
        highScore.pop();
    };
};

// Den här funktionen hade vi kunnat lägga i en annan scriptfil
function drawOnCanvas() {
    if(canvasRef.getContext) {
        // Skapar själva canvasen
        const ctx = canvasRef.getContext("2d")

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
                if(xValue ===  0 && i === 2) {
                    clearInterval(myTimer);

                    // Gömmer animationen, formuläret. Visar spelfältet.
                    // Startar "movePokemon()" samt timern
                    startGame();

                } else if(i === 2) {
                    xValue -= 25;

                // Går vänster
                } else if(xValue >= 25 + (i*25)) {
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
                }
            }
        }, 40);
    };
};
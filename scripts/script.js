const log = (msg) => console.log(msg);

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if(validateForm()) {
        initGame();
        // initGame inkluderar funktionen randomizePokemon()

        createPokemon();
        // Placerar pokemonen på spelfältet

        startGame();
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
    console.log("formRef toggld-none går igång")
    formRef.classList.toggle('d-none');
    console.log("formRef toggld-none går igång på riktigt")
    gameFieldRef.classList.toggle('d-none');
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
    movePokemon();

    oGameData.startTimeInMilliseconds();
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
        img.classList.add('d-none');
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
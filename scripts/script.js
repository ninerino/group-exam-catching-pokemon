const log = (msg) => console.log(msg);

// I denna fil skriver ni all er kod


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
const formRef = document.querySelector('#form');
const gameFieldRef = document.querySelector('#gameField');


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
    formRef.classList.toggle('d-none');
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
        console.log(number);
        // gameFieldRef
        const imgElement = document.createElement('img');
        setPosition(imgElement);
        imgElement.src = `./assets/pokemons/${number}.png`;
        imgElement.id = `pkmnID${number}`;
        imgElement.addEventListener('mouseover', () => {
            
            if(imgElement.src.endsWith(`assets/pokemons/${number}.png`)) {
                imgElement.src = './assets/ball.webp';
                oGameData.nmbrOfCaughtPokemons++
                console.log(oGameData.nmbrOfCaughtPokemons)
            } else if (imgElement.src.endsWith('assets/ball.webp')) {
                imgElement.src = `./assets/pokemons/${number}.png`;
                console.log('Det här ska ta bort en pokeboll')
                oGameData.nmbrOfCaughtPokemons--
                console.log(oGameData.nmbrOfCaughtPokemons)
            }
            // console.log(`I clicked pkmnID${number}`)
            
            // Vår source är "./assets/ball.webp"
            
        })
        
        gameFieldRef.appendChild(imgElement);
    }
}



const victoryAudio = document.querySelector('#victoryAudio');
// victoryAudio.loop = true;
// victoryAudio.play();

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
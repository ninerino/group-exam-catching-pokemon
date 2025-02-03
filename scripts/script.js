const log = (msg) => console.log(msg);

// I denna fil skriver ni all er kod


document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if(validateForm()) {
        initGame()
        // startGame();

    }
});

const nickRef = document.querySelector('#nick');
const ageRef = document.querySelector('#age');
const boyRef = document.querySelector('#boy');
const girlRef = document.querySelector('#girl');
const formRef = document.querySelector('#form');
const gameFieldRef = document.querySelector('#game-field');


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
    formRef.classList.toggle('d-none');
    gameFieldRef.classList.toggle('d-none');

    console.log(oGameData);
    // randomizePokemon();
    // Lägg in data i vår oGameData.
}
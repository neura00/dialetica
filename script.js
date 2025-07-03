// Your web app's Firebase configuration
// A sua configuração pessoal do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfYPffZgRQYpCQxHADxRhfUkcEqhyQs5w",
  authDomain: "platao-dialetica.firebaseapp.com",
  projectId: "platao-dialetica",
  storageBucket: "platao-dialetica.appspot.com",
  messagingSenderId: "632185967344",
  appId: "1:632185967344:web:d426ba7961f50c56eea835",
  measurementId: "G-5L1D3MFM1B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // A nossa base de dados

// --- LÓGICA DO SIMULADOR DIALÉTICO ---

const questionElement = document.getElementById('socrates-question');
const historyElement = document.getElementById('dialogue-history');
const answerInput = document.getElementById('user-answer');
const submitButton = document.getElementById('submit-button');

const dialogue = {
    "O que é a Justiça?": {
        keywords: {
            "lei": "Interessante. Mas se a lei for injusta? A sua alma reconhece uma justiça superior à própria lei dos homens?",
            "dar a cada um o que merece": "E quem decide o que cada um merece? Se um amigo em fúria lhe pede uma arma de volta, seria justo devolvê-la?",
            "ajudar amigos": "Isso implica também prejudicar os inimigos? E se nos enganarmos e ajudarmos um inimigo pensando que é amigo? Seria isso justiça?"
        },
        default: "Explique melhor. Como é que a sua alma reconhece esse conceito no mundo real?",
        nextQuestion: "O que é a Coragem?"
    },
    "O que é a Coragem?": {
        keywords: {
            "não ter medo": "Mesmo um soldado experiente sente medo no campo de batalha. Seria ele, então, desprovido de coragem? Ou a coragem é outra coisa?",
            "enfrentar o perigo": "Uma pessoa que se atira de uma ponte por diversão está a enfrentar o perigo. Isso é coragem ou imprudência? Qual a diferença?",
            "força": "A força física é suficiente para a coragem? Um touro é forte, mas tem coragem? Talvez a coragem resida na mente, e não nos músculos."
        },
        default: "Continue a refinar a sua ideia. O que distingue a verdadeira coragem?",
        nextQuestion: "O que é a Beleza?"
    },
    "O que é a Beleza?": {
        keywords: {
            "agrada aos olhos": "Um pôr do sol agrada aos olhos, mas a descrição de um ato de sacrifício também pode ser bela, sem que a vejamos. O que há em comum?",
            "harmonia": "Uma excelente definição! A harmonia entre as partes. Essa harmonia aplica-se tanto a uma música como à estrutura de uma teoria matemática. Parece que nos aproximamos de uma Forma universal."
        },
        default: "A sua alma está a esforçar-se. O que une todas as coisas que consideramos belas?",
        nextQuestion: null // Fim do diálogo
    }
};

let currentQuestion = "O que é a Justiça?";

function handleResponse() {
    const userAnswer = answerInput.value.toLowerCase();
    if (userAnswer.trim() === '') return;

    historyElement.innerHTML += `<p><strong>Você:</strong> ${answerInput.value}</p>`;

    const currentDialogue = dialogue[currentQuestion];
    let socratesResponse = currentDialogue.default;

    for (const keyword in currentDialogue.keywords) {
        if (userAnswer.includes(keyword)) {
            socratesResponse = currentDialogue.keywords[keyword];
            break;
        }
    }
    
    historyElement.innerHTML += `<p><strong>Sócrates:</strong> ${socratesResponse}</p>`;

    answerInput.value = '';
    historyElement.scrollTop = historyElement.scrollHeight;

    const next = currentDialogue.nextQuestion;
    if (next) {
        currentQuestion = next;
        questionElement.innerText = currentQuestion;
    } else {
        questionElement.innerText = "Diálogo Concluído";
        answerInput.style.display = 'none';
        submitButton.innerText = "Partilhar Descoberta no Mural";
        submitButton.onclick = shareDiscovery;
    }
}

function shareDiscovery() {
    const finalThought = prompt("Numa frase, qual foi a sua maior descoberta ou conclusão neste diálogo?");
    if (finalThought && finalThought.trim() !== '') {
        db.collection("conclusoes").add({
            texto: finalThought,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("A sua descoberta foi partilhada!");
            submitButton.style.display = 'none';
            loadMural();
        })
        .catch(error => console.error("Erro ao partilhar:", error));
    }
}

submitButton.onclick = handleResponse;

// --- LÓGICA DO MURAL DAS DESCOBERTAS ---

const muralContent = document.getElementById('mural-content');

function loadMural() {
    muralContent.innerHTML = '';
    db.collection("conclusoes").orderBy("timestamp", "desc").limit(10).get()
    .then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            muralContent.innerHTML += `<div>"${data.texto}"</div>`;
        });
    })
    .catch(error => console.error("Erro ao carregar o mural: ", error));
}

window.onload = loadMural;

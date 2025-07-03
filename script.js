// ***************************************************************
// PASSO 1: COLE A SUA CONFIGURAÇÃO DO FIREBASE AQUI
// ***************************************************************
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SUA_APP_ID"
};
// ***************************************************************

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Elementos da Interface ---
const pages = document.querySelectorAll('.page');
const startButton = document.getElementById('start-button');
const agreeButton = document.getElementById('agree-button');
const disagreeButton = document.getElementById('disagree-button');
const restartButton = document.getElementById('restart-button');

const dialogueQuestion = document.getElementById('dialogue-question');
const dialogueContext = document.getElementById('dialogue-context');
const dialogueOptions = document.getElementById('dialogue-options');
const progressBar = document.getElementById('progress-bar');

const loadingSpinner = document.getElementById('loading-spinner');
const resultContent = document.getElementById('result-content');
const resultText = document.getElementById('result-text');

// --- Estado da Aplicação ---
let currentStep = 0;
let userPath = []; // Guarda as escolhas do utilizador

// --- Navegação ---
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// --- Lógica do Diálogo ---

// Este é o coração filosófico do teste. Cada etapa tem uma pergunta, um contexto
// e opções. Cada opção leva a um próximo passo específico e atribui um "ponto"
// a uma escola de pensamento (platonico, aristotelico, estoico, etc.).

const dialogueTree = {
    0: {
        question: "Para começar, o que considera ser o 'Bem Supremo'?",
        context: "Sócrates, mestre de Platão, passava os seus dias a questionar os cidadãos de Atenas sobre conceitos como este. A sua resposta inicial é o ponto de partida da nossa jornada.",
        options: [
            { text: "A Felicidade e o bem-estar da maioria das pessoas.", next: 1, type: 'utilitarista' },
            { text: "Viver uma vida de virtude e razão, independentemente das circunstâncias.", next: 2, type: 'estoico' },
            { text: "A busca por um conhecimento perfeito e uma verdade que transcende este mundo.", next: 3, type: 'platonico' },
            { text: "A realização do potencial humano aqui na Terra, através da ação e do equilíbrio.", next: 4, type: 'aristotelico' }
        ]
    },
    // Caminho Utilitarista
    1: {
        question: "Se uma ação trouxer felicidade a muitos, mas prejudicar uma minoria inocente, ela continua a ser 'boa'?",
        context: "Esta é uma crítica clássica ao Utilitarismo. Estamos a ponderar se 'o maior bem' justifica qualquer meio.",
        options: [
            { text: "Sim, o bem-estar da maioria prevalece.", next: 5, type: 'utilitarista' },
            { text: "Não, certos direitos individuais são invioláveis, independentemente do resultado.", next: 6, type: 'deontologico' }
        ]
    },
    // Caminho Estoico
    2: {
        question: "Imagine que perdeu tudo o que valoriza (bens, amigos). Onde encontraria a força para continuar a viver de forma virtuosa?",
        context: "Epicteto, um filósofo Estoico que foi escravo, ensinava que a nossa mente e as nossas escolhas são as únicas coisas que realmente controlamos.",
        options: [
            { text: "Na minha capacidade de escolher como reagir. A minha paz interior não pode ser tirada.", next: 7, type: 'estoico' },
            { text: "Seria impossível. A virtude precisa de certas condições externas para florescer.", next: 4, type: 'aristotelico' }
        ]
    },
    // Caminho Platónico
    3: {
        question: "Essa 'verdade transcendente' que procura, onde é mais provável que a encontre?",
        context: "Platão, na sua Alegoria da Caverna, sugere que o mundo que vemos é como sombras na parede. A verdade está lá fora, no 'mundo inteligível'.",
        options: [
            { text: "Através da lógica pura, da matemática e da filosofia, que nos libertam dos sentidos.", next: 8, type: 'platonico' },
            { text: "Observando o mundo natural e as suas leis, pois a verdade está na imanência.", next: 4, type: 'aristotelico' }
        ]
    },
    // Caminho Aristotélico
    4: {
        question: "Como se alcança o 'equilíbrio' na vida? Qual é a chave para a 'Eudaimonia' (florescimento humano)?",
        context: "Aristóteles, discípulo de Platão, defendia a 'Doutrina do Meio-Termo'. A coragem, por exemplo, é o meio-termo entre a cobardia e a temeridade.",
        options: [
            { text: "Através da prática constante de hábitos virtuosos e da moderação em tudo.", next: 9, type: 'aristotelico' },
            { text: "Desafiando os limites e criando os meus próprios valores, mesmo que pareçam extremos.", next: 10, type: 'nietzscheano' }
        ]
    },
    // Continuações...
    5: { question: "Se pudesse garantir a paz mundial sacrificando uma criança inocente, fá-lo-ia?", context: "Levamos a lógica utilitarista ao seu extremo mais desconfortável.", options: [{ text: "Sim, é um sacrifício terrível pelo bem maior.", next: 11, type: 'utilitarista' }, { text: "Não, esse ato corromperia a própria natureza da 'paz' que se procura.", next: 6, type: 'deontologico' }] },
    6: { question: "De onde vêm esses 'direitos invioláveis'?", context: "Kant, um filósofo deontológico, chamou a isto o 'Imperativo Categórico': age de tal forma que a tua ação possa ser uma lei universal.", options: [{ text: "De um dever moral racional que todos partilhamos.", next: 11, type: 'deontologico' }, { text: "São construções sociais que concordamos em respeitar.", next: 11, type: 'contratualista' }] },
    7: { question: "Se a sua paz interior é o bem supremo, como deve agir em relação à sociedade e à política?", context: "Os Estoicos eram frequentemente figuras públicas. Marco Aurélio era imperador de Roma.", options: [{ text: "Cumprir o meu dever social com serenidade, aceitando os resultados sem perturbação.", next: 11, type: 'estoico' }, { text: "Retirar-me da sociedade para me focar apenas na minha tranquilidade.", next: 11, type: 'cinico' }] },
    8: { question: "Se a razão pura é o caminho, qual o papel das emoções e da arte?", context: "Platão era cético em relação aos poetas e à arte, pois achava que eles imitavam as 'sombras' e nos afastavam da verdade.", options: [{ text: "São distrações perigosas que nos prendem ao mundo das aparências.", next: 11, type: 'platonico' }, { text: "São essenciais para uma vida completa e podem revelar verdades que a razão não alcança.", next: 9, type: 'aristotelico' }] },
    9: { question: "A virtude pode ser ensinada ou é algo que se desenvolve apenas com a experiência?", context: "Este é o dilema central do diálogo 'Ménon' de Platão.", options: [{ text: "Pode ser ensinada através da instrução e da filosofia.", next: 11, type: 'platonico' }, { text: "É cultivada através da prática e do hábito, como aprender um instrumento musical.", next: 11, type: 'aristotelico' }] },
    10: { question: "Se criamos os nossos próprios valores, o que impede que o 'bem' de uma pessoa seja o 'mal' de outra?", context: "Nietzsche proclamou a 'morte de Deus', deixando a humanidade com a tarefa assustadora de criar o seu próprio sentido.", options: [{ text: "Nada impede. O 'super-homem' (Übermensch) está para além do bem e do mal tradicionais.", next: 11, type: 'nietzscheano' }, { text: "A empatia e a necessidade de cooperação para sobreviver.", next: 11, type: 'humanista' }] },
    11: {
        question: "Finalmente, ao refletir sobre este percurso, a verdade parece ser algo...",
        context: "A sua última escolha define a sua visão sobre a natureza da própria verdade, o culminar da nossa dialética.",
        options: [
            { text: "...objetivo e universal, que descobrimos através da razão.", next: 12, type: 'platonico' },
            { text: "...pragmático e útil, definido pelo que funciona melhor para a sociedade.", next: 12, type: 'utilitarista' },
            { text: "...pessoal e subjetivo, que cada um constrói para si.", next: 12, type: 'nietzscheano' },
            { text: "...baseado na nossa natureza e no nosso dever moral.", next: 12, type: 'deontologico' }
        ]
    }
};

function renderStep(stepIndex) {
    const step = dialogueTree[stepIndex];
    if (!step) return;

    // Atualiza a barra de progresso
    const totalSteps = Object.keys(dialogueTree).length;
    const progress = (stepIndex / (totalSteps -1)) * 100;
    progressBar.style.width = `${progress}%`;

    dialogueQuestion.textContent = step.question;
    dialogueContext.textContent = step.context;
    dialogueOptions.innerHTML = '';

    step.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.className = 'option-button';
        button.onclick = () => {
            userPath.push({ step: stepIndex, choice: option.type });
            if (option.next === 12) {
                endDialogue();
            } else {
                currentStep = option.next;
                renderStep(currentStep);
            }
        };
        dialogueOptions.appendChild(button);
    });
}

function startDialogue() {
    currentStep = 0;
    userPath = [];
    showPage('dialogue-page');
    renderStep(currentStep);
}

async function endDialogue() {
    showPage('final-result-page');
    loadingSpinner.style.display = 'block';
    resultContent.style.display = 'none';

    try {
        // Envia os resultados para o Firebase
        await db.collection('resultadosAnonimos').add({
            percurso: userPath,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Resultado guardado com sucesso!");
    } catch (error) {
        console.error("Erro ao guardar no Firebase: ", error);
    }

    // Calcula e mostra o resultado
    calculateAndShowResult();
}

function calculateAndShowResult() {
    const counts = {};
    userPath.forEach(choice => {
        counts[choice.choice] = (counts[choice.choice] || 0) + 1;
    });

    // Encontra a afinidade principal
    let majorAffinity = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'indefinido');

    const affinityDescriptions = {
        'platonico': "A sua jornada revela uma forte afinidade com o pensamento Platónico. Você valoriza a razão, a busca por uma verdade universal e acredita que o mundo que vemos é apenas um eco de uma realidade mais perfeita. A sua alma anseia pelo 'Mundo das Formas'.",
        'aristotelico': "O seu percurso ecoa o pensamento de Aristóteles. Você é pragmático, valoriza a experiência e acredita que a virtude e a felicidade se encontram no equilíbrio e na ação concreta neste mundo. O seu foco está no florescimento humano aqui e agora.",
        'estoico': "As suas escolhas demonstram uma forte inclinação Estoica. Você acredita que a verdadeira felicidade reside na virtude e na paz interior, coisas que estão sob o seu controlo, independentemente das circunstâncias externas. A sua fortaleza é a sua mente.",
        'utilitarista': "Você demonstra uma perspetiva Utilitarista. Para si, o 'bem' está intrinsecamente ligado ao bem-estar e à felicidade do maior número de pessoas. As suas decisões são guiadas pelas consequências práticas das ações.",
        'deontologico': "A sua afinidade é Deontológica, na linha de Kant. Você acredita que certas ações são intrinsecamente certas ou erradas, baseadas num dever moral universal, independentemente das suas consequências. A intenção e o dever são os seus guias.",
        'nietzscheano': "O seu caminho sugere uma afinidade com o pensamento de Nietzsche. Você valoriza a autonomia, a criação dos seus próprios valores e a superação das convenções. Para si, o sentido da vida não é descoberto, mas sim criado.",
        'default': "O seu percurso foi único e complexo, tocando em diversas escolas de pensamento. Isto reflete uma mente aberta e uma recusa em ser categorizada, a verdadeira marca de um filósofo em constante busca."
    };

    resultText.textContent = affinityDescriptions[majorAffinity] || affinityDescriptions['default'];
    
    loadingSpinner.style.display = 'none';
    resultContent.style.display = 'block';
}


// --- Event Listeners ---
startButton.addEventListener('click', () => showPage('consent-page'));
disagreeButton.addEventListener('click', () => showPage('home-page'));
agreeButton.addEventListener('click', startDialogue);
restartButton.addEventListener('click', () => {
    resultContent.style.display = 'none';
    showPage('home-page');
});

// Iniciar a aplicação
window.onload = () => showPage('home-page');

const allCardsDiv = document.getElementById('all-cards');
const cardTypeSelect = document.getElementById('card-type');
const deckCardsDiv = document.getElementById('deck-cards');
const dialog = document.querySelector('dialog');

let deck = JSON.parse(localStorage.getItem('deck')) || []; // Carrega o deck salvo ou inicia vazio

// Função para buscar dados da API
async function fetchCards() {
    try {
        const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php'); // Faz requisição à API
        const data = await response.json();
        displayCards(data.data.slice(0,50)); // Exibe as 10 primeiras cartas
        populateCardTypeFilter(data.data); // Preenche o filtro de tipos
    } catch (error) {
        console.error('Erro ao buscar cartas:', error);
    }
}

// Exibe as cartas na página principal
function displayCards(cards) {
    allCardsDiv.innerHTML = ''; // Limpa as cartas anteriores
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.innerHTML = `
            <h3>${card.name}</h3>
            <img src="${card.card_images[0].image_url}" alt="${card.name}">
        `;
        cardDiv.addEventListener('click', () => showCardDetails(card)); // Mostra detalhes ao clicar
        allCardsDiv.appendChild(cardDiv); 
    });
}

// Função para exibir detalhes da carta no modal
function showCardDetails(card) {
    document.getElementById('img').innerHTML = `<img src="${card.card_images[0].image_url}" alt="${card.name}">`;
    document.getElementById('info-card').innerHTML = `
        <h3>${card.name}</h3>
        <p>${card.desc}</p>
    `;
    dialog.showModal(); // Abre o modal
}

// Preenche o filtro de tipos de cartas
function populateCardTypeFilter(cards) {
    const uniqueTypes = [...new Set(cards.map(card => card.type))]; // Obtém os tipos únicos
    uniqueTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        cardTypeSelect.appendChild(option);
    });
}

// Filtra as cartas por tipo
cardTypeSelect.addEventListener('change', async () => {
    const selectedType = cardTypeSelect.value;
    const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
    const data = await response.json();
    const filteredCards = selectedType
        ? data.data.filter(card => card.type === selectedType) // Filtra pelo tipo
        : data.data.slice(0, 10); // Exibe as 10 primeiras se não houver filtro
    displayCards(filteredCards);
});

// Adiciona a carta ao deck e exibe no deck
document.getElementById('adicionar').addEventListener('click', () => {
    const cardName = document.getElementById('info-card').querySelector('h3').textContent;
    const cardImage = document.getElementById('img').querySelector('img').src;
    const cardToAdd = { name: cardName, image: cardImage }; // Guarda o nome e a imagem da carta

    if (!deck.some(card => card.name === cardName)) { // Verifica se já está no deck
        deck.push(cardToAdd); // Adiciona ao deck
        updateDeck();
    }
});

// Remove a carta do deck
document.getElementById('remover').addEventListener('click', () => {
    const cardName = document.getElementById('info-card').querySelector('h3').textContent;
    deck = deck.filter(card => card.name !== cardName); // Remove do deck
    updateDeck();
});

// Atualiza a exibição do deck
function updateDeck() {
    deckCardsDiv.innerHTML = ''; // Limpa o deck
    deck.forEach(card => {
        const cardDiv = document.createElement('div'); // Cria um div para cada carta no deck
        cardDiv.classList.add('deck-card');
        cardDiv.innerHTML = `<img src="${card.image}" alt="${card.name}" title="${card.name}">`; // Exibe a imagem da carta no deck
        cardDiv.addEventListener('click', () => {
            const cardDetails = { name: card.name, card_images: [{ image_url: card.image }] };
            showCardDetails(cardDetails); // Mostra detalhes ao clicar na imagem no deck
        });
        deckCardsDiv.appendChild(cardDiv); // Adiciona a carta ao container do deck
    });
    localStorage.setItem('deck', JSON.stringify(deck)); // Salva o deck no localStorage
}

// Fecha o modal
document.getElementById('sair').addEventListener('click', () => {
    dialog.close();
});

// Carrega as cartas e o deck ao iniciar a página
window.onload = () => {
    fetchCards(); // Carrega as cartas da API
    updateDeck(); // Atualiza o deck salvo no localStorage
};
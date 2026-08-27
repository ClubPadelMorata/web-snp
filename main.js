const API_URL = "https://script.google.com/macros/s/AKfycbyiVZDPJVvYLFB1RbnsrEIz4KGArimQRlVMnqpDOb1Bmu1gQLCFWERXWAlpSFJSH2nKzA/exec";
// JUGADORAS DE PRUEBA

let players = [];

//CARGAR A LAS JUGADORAS DESDE LA API
async function loadPlayers() {

    try {

        console.log("Cargando jugadoras...");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Datos recibidos:", data);

        players = data.map(player => ({
            id: Number(player.id),
            name: player.name,
            points: Number(player.points),
            position: player.position,

            registrations: 0,
            awayRegistrations: 0,
            selections: 0
        }));

        console.log("Jugadoras cargadas:", players);

        renderPlayers();
        updateStats();

    } catch (error) {

        console.error(
            "Error cargando jugadoras:",
            error
        );

    }

}

//AÑADIR JUGADORA A LA BASE DE DATOS
async function addPlayerToDatabase(player) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "add",
                player: player
            })

        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error("Error guardando jugadora:", error);

        throw error;

    }

}

//ELIMINAR JUGADORA DE LA BASE DE DATOS
async function deletePlayerFromDatabase(playerId) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "delete",
                id: playerId
            })

        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error("Error eliminando jugadora:", error);

        throw error;

    }

}

//EDITAR JUGADORA EN LA BASE DE DATOS
async function editPlayerInDatabase(playerId, player) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "edit",
                id: playerId,
                player: player
            })

        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error("Error editando jugadora:", error);

        throw error;

    }

}

function calculateParticipationPoints(player) {

    const registrationPoints = player.registrations * 1;

    const awayPoints = player.awayRegistrations * 2;

    const selectionPoints = player.selections * 3;

    return (
        registrationPoints +
        awayPoints +
        selectionPoints
    );

}

// ACTUALIZAR PUNTUACIONES DESDE SNP
async function updatePointsFromSNP() {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: "updatePoints"
            })

        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error(
            "Error actualizando puntuaciones:",
            error
        );

        throw error;

    }

}

// FORMATEAR PUNTOS A 2 DECIMALES

function formatPoints(points) {

    return new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(points) || 0);

}
// NÚMERO TOTAL DE JUGADORAS

function renderPlayers() {

    const playersList = document.getElementById("players-list");

    playersList.innerHTML = "";


    // Ordenamos por puntos de participación

    const sortedPlayers = [...players].sort((a, b) => {

        return (
            calculateParticipationPoints(b) -
            calculateParticipationPoints(a)
        );

    });


    sortedPlayers.forEach((player, index) => {

        const participationPoints =
            calculateParticipationPoints(player);


        const card = document.createElement("div");

        card.classList.add("player-card");


        card.innerHTML = `

            <div class="player-main-info">

                <div class="player-ranking">
                    #${index + 1}
                </div>

                <div class="player-info">
                    <h3>${player.name}</h3>

                 <p class="player-subtitle">
                    <span class="position-badge position-${player.position.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">
                        ${player.position}
                    </span>

                    <span class="player-snp-points">
                        ${formatPoints(player.points)} SNP
                    </span>
                </p> 
            </div>

            </div>


            <div class="player-stats">

                <div class="mini-stat">
                    <span>📋</span>
                    <strong>${player.registrations}</strong>
                    <small>Apuntada</small>
                </div>

                <div class="mini-stat">
                    <span>✈️</span>
                    <strong>${player.awayRegistrations}</strong>
                    <small>Fuera</small>
                </div>

                <div class="mini-stat">
                    <span>🎾</span>
                    <strong>${player.selections}</strong>
                    <small>Convocada</small>
                </div>

                <div class="participation-points">
                    <span>⭐</span>
                    <strong>${participationPoints}</strong>
                </div>

            </div>


            <div class="player-buttons">

                <button
                    class="icon-btn edit-player-btn"
                    data-id="${player.id}"
                    title="Editar jugadora"
                >
                    ✏️
                </button>

                <button
                    class="icon-btn delete-player-btn"
                    data-id="${player.id}"
                    title="Eliminar jugadora"
                >
                    🗑️
                </button>

            </div>

        `;


        playersList.appendChild(card);

    });

}

function updateStats() {

    const totalPlayers = document.getElementById("total-players");

    if (totalPlayers) {
        totalPlayers.textContent = players.length;
    }

}

// INICIAR

loadPlayers();

// ==============================
// MODAL DE JUGADORAS
// ==============================

const playerModal = document.getElementById("player-modal");
const addPlayerBtn = document.getElementById("add-player-btn");
const closeModalBtn = document.getElementById("close-modal");

const updatePointsBtn =
    document.getElementById("update-points-btn");

const playerForm = document.getElementById("player-form");
const modalTitle = document.getElementById("modal-title");

const playerNameInput = document.getElementById("player-name");
const playerPointsInput = document.getElementById("player-points");
const playerPositionInput = document.getElementById("player-position");
let editingPlayerId = null;

// ABRIR MODAL PARA NUEVA JUGADORA
addPlayerBtn.addEventListener("click", () => {
    editingPlayerId = null;
    modalTitle.textContent = "Nueva jugadora";
    playerForm.reset();
    playerModal.classList.add("show");
});

// ACTUALIZAR PUNTUACIONES SNP
updatePointsBtn.addEventListener("click", async () => {

    const textoOriginal = updatePointsBtn.textContent;

    try {

        updatePointsBtn.disabled = true;

        updatePointsBtn.textContent =
            "⏳ Actualizando...";

        const result =
            await updatePointsFromSNP();

        if (!result.success) {

            alert(
                "No se han podido actualizar las puntuaciones"
            );

            return;

        }

        await loadPlayers();

        alert(
            "✅ Puntuaciones actualizadas correctamente"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Ha ocurrido un error al actualizar las puntuaciones"
        );

    } finally {

        updatePointsBtn.disabled = false;

        updatePointsBtn.textContent =
            textoOriginal;

    }

});
// CERRAR MODAL
closeModalBtn.addEventListener("click", () => {
    playerModal.classList.remove("show");
});


// CERRAR AL PULSAR FUERA

playerModal.addEventListener("click", (event) => {

    if (event.target === playerModal) {

        playerModal.classList.remove("show");

    }

});


// GUARDAR NUEVA JUGADORA

playerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = playerNameInput.value;

    const points = Number(playerPointsInput.value);

    const position = playerPositionInput.value;


    // EDITAR JUGADORA

    if (editingPlayerId !== null) {

    const updatedPlayer = {
        name: name,
        points: points,
        position: position
    };

    const result = await editPlayerInDatabase(
        editingPlayerId,
        updatedPlayer
    );

    if (!result.success) {
        alert("No se ha podido editar la jugadora");
        return;
    }

}

    // CREAR NUEVA JUGADORA

   else {

    const newPlayer = {

        name: name,
        points: points,
        position: position

    };

    await addPlayerToDatabase(newPlayer);

}

await loadPlayers();

playerModal.classList.remove("show");

playerForm.reset();

editingPlayerId = null;

});


// NAVEGACIÓN

const navButtons = document.querySelectorAll(".nav-btn");

const sections = document.querySelectorAll(".section");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId = button.dataset.section;


        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });


        button.classList.add("active");


        sections.forEach(section => {
            section.classList.remove("active-section");
        });


        document
            .getElementById(sectionId)
            .classList.add("active-section");

    });

});
// ==============================
// EDITAR Y ELIMINAR JUGADORAS
// ==============================

document.addEventListener("click", (event) => {

    // EDITAR

    if (event.target.closest(".edit-player-btn")) {

        const button = event.target.closest(".edit-player-btn");

        const playerId = Number(button.dataset.id);

        const player = players.find(
            player => player.id === playerId
        );


        editingPlayerId = playerId;


        modalTitle.textContent = "Editar jugadora";


        playerNameInput.value = player.name;

        playerPointsInput.value = player.points;

        playerPositionInput.value = player.position;


        playerModal.classList.add("show");

    }


    // ELIMINAR

    if (event.target.closest(".delete-player-btn")) {

        const button = event.target.closest(".delete-player-btn");

        const playerId = Number(button.dataset.id);

        const player = players.find(
            player => player.id === playerId
        );


        const confirmDelete = confirm(
            `¿Seguro que quieres eliminar a ${player.name}?`
        );


        if (!confirmDelete) return;


        deletePlayerFromDatabase(playerId)
    .then(result => {

        if (!result.success) {

            alert("No se ha podido eliminar la jugadora");
            return;

        }

        loadPlayers();

    })
    .catch(error => {

        console.error(error);

        alert("Ha ocurrido un error al eliminar");

    });
    }

});
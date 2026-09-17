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
        return b.points - a.points;
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
                <span class="stat-icon stat-icon-clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"/>
                    <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"/>
                    <path d="M9 12h6"/>
                    <path d="M9 16h6"/>
                    </svg>
                </span>
                <strong>${player.registrations}</strong>
                <small>Apuntada</small>
                </div>

                <div class="mini-stat">
                <span class="stat-icon stat-icon-plane">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-plane">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                    </svg>
                </span>
                <strong>${player.awayRegistrations}</strong>
                <small>Fuera</small>
                </div>

                <div class="mini-stat">
                <span class="stat-icon stat-icon-tennis">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                    <path d="M6 5.3a9 9 0 0 1 0 13.4"/>
                    <path d="M18 5.3a9 9 0 0 0 0 13.4"/>
                    </svg>
                </span>
                <strong>${player.selections}</strong>
                <small>Convocada</small>
                </div>
                <div class="participation-points">
                <span class="stat-icon stat-icon-star">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
                    </svg>
                </span>
                <strong>${participationPoints}</strong>
                </div>

            </div>


            <div class="player-buttons">

                <button
                    class="icon-btn edit-player-btn"
                    data-id="${player.id}"
                    title="Editar jugadora"
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
                    </svg>
                </button>

                <button
                    class="icon-btn delete-player-btn"
                    data-id="${player.id}"
                    title="Eliminar jugadora"
                >
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M3 6h18"/>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
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
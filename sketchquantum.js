

let electronDx = 300;
let currentLevel = 2;
let targetLevel = 2;
let electronDy = 200;

const levelY = {
    1: 300,
    2: 200,
    3: 100
};

let photonAnimation = null;

// Calculate hydrogen's energy at level n.
function energyOfLevel(n) {
    return -13.6 / (n * n);
}

// Calculate photon energy and wavelength for a transition.
function calculatePhoton(fromLevel, toLevel) {
    const initialEnergy = energyOfLevel(fromLevel);
    const finalEnergy = energyOfLevel(toLevel);

    const energyChange = finalEnergy - initialEnergy;
    const photonEnergy = Math.abs(energyChange);

    const photonEnergyJoules =
        photonEnergy * 1.602176634e-19;

    const h = 6.62607015e-34;
    const c = 299792458;

    const wavelengthMetres =
        (h * c) / photonEnergyJoules;

    const wavelengthNm = wavelengthMetres * 1e9;

    return {
        energyChange,
        photonEnergy,
        wavelengthNm
    };
}

// Create the canvas and connect the buttons.
function setup() {
    const canvas = createCanvas(600, 400);
    canvas.parent("sketch-holder");

    document
        .getElementById("absorbButton")
        .addEventListener("click", absorbEnergy);

    document
        .getElementById("emitButton")
        .addEventListener("click", emitPhoton);

    document
        .getElementById("sendPhotonButton")
        .addEventListener("click", sendPhoton);

    document
        .getElementById("usePhotonButton")
        .addEventListener("click", useSelectedPhoton);


}

// Draw and animate the simulator.
function draw() {
    background(15, 20, 35);

    drawEnergyLevels();
    drawPhoton();
    drawElectron();
    drawInformation();

    // Smoothly move the electron to its target level.
    electronDy = lerp(
        electronDy,
        levelY[targetLevel],
        0.08
    );

    // Stop the tiny movement when it reaches its target.
    if (abs(electronDy - levelY[targetLevel]) < 0.2) {
        electronDy = levelY[targetLevel];
    }
}

// Draw the three energy levels and labels.
function drawEnergyLevels() {
    stroke(0, 220, 255);
    strokeWeight(3);

    for (let n = 1; n <= 3; n++) {
        line(100, levelY[n], 500, levelY[n]);
    }

    noStroke();
    fill(235, 240, 250);
    textSize(17);
    textAlign(LEFT, CENTER);

    for (let n = 1; n <= 3; n++) {
        text("n = " + n, 110, levelY[n] - 18);
    }
}

// Draw and animate a photon.
function drawPhoton() {
    if (photonAnimation === null) {
        return;
    }

    const p = photonAnimation;

    // Move the photon horizontally.
    p.x += p.speed;

    // Draw the glowing photon.
    noStroke();

    fill(0, 220, 255, 35);
    circle(p.x, p.y, 32);

    fill(0, 220, 255, 90);
    circle(p.x, p.y, 21);

    fill(170, 250, 255);
    circle(p.x, p.y, 10);

    // Remove the photon when it reaches its destination.
    if (
        (p.speed > 0 && p.x >= p.endX) ||
        (p.speed < 0 && p.x <= p.endX)
    ) {
        photonAnimation = null;
    }
}

// Draw the electron.
function drawElectron() {
    noStroke();

    fill(255, 190, 50, 35);
    circle(electronDx, electronDy, 42);

    fill(255, 190, 50, 75);
    circle(electronDx, electronDy, 28);

    fill(255, 215, 90);
    stroke(255, 245, 190);
    strokeWeight(1.5);
    circle(electronDx, electronDy, 15);

    noStroke();
}

// Display the electron's current energy.
function drawInformation() {
    const energy = energyOfLevel(currentLevel);

    fill(235, 240, 250);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);

    text(
        "Current level: n = " + currentLevel,
        300,
        25
    );

    text(
        "Hydrogen Energy: " + energy.toFixed(2) + " eV",
        300,
        48
    );

    textSize(12);
    fill(150, 175, 205);
    text("Illustrative energy level model", 300, 375);
}

// Start a photon animation for a transition.
function startPhotonAnimation(fromLevel, toLevel) {
    const absorbing = toLevel > fromLevel;

    photonAnimation = {
        x: absorbing ? 120 : electronDx,
        y: levelY[fromLevel],
        endX: absorbing ? electronDx : 480,
        speed: 6
    };
}

// Absorb energy and move to a higher level.
function absorbEnergy() {
    if (currentLevel >= 3) {
        setStatus(
            "The electron is already at the highest displayed level."
        );
        return;
    }

    const oldLevel = currentLevel;
    const newLevel = currentLevel + 1;

    const photon = calculatePhoton(oldLevel, newLevel);

    startPhotonAnimation(oldLevel, newLevel);

    currentLevel = newLevel;
    targetLevel = newLevel;

    setStatus(
        "Absorbing photon: " +
        photon.photonEnergy.toFixed(2) +
        " eV | Wavelength: " +
        photon.wavelengthNm.toFixed(1) +
        " nm | Transition: n = " +
        oldLevel + " → " + newLevel
    );
}

// Emit a photon and move to a lower level.
function emitPhoton() {
    if (currentLevel <= 1) {
        setStatus(
            "The electron is already at the lowest displayed level."
        );
        return;
    }

    const oldLevel = currentLevel;
    const newLevel = currentLevel - 1;

    const photon = calculatePhoton(oldLevel, newLevel);

    startPhotonAnimation(oldLevel, newLevel);

    currentLevel = newLevel;
    targetLevel = newLevel;

    setStatus(
        "Emitted photon: " +
        photon.photonEnergy.toFixed(2) +
        " eV | Wavelength: " +
        photon.wavelengthNm.toFixed(1) +
        " nm | Transition: n = " +
        oldLevel + " → " + newLevel
    );
}

// Update the status message on the HTML page.
function setStatus(message) {
    document.getElementById("status").textContent = message;
}

// Keyboard controls.
function keyPressed() {
    if (keyCode === UP_ARROW) {
        absorbEnergy();
        return false;
    }

    if (keyCode === DOWN_ARROW) {
        emitPhoton();
        return false;
    }
}
function sendPhoton() {
    const input = document.getElementById("photonEnergyInput");
    const photonEnergy = Number(input.value);

    if (
        input.value.trim() == "" ||
        !Number.isFinite(photonEnergy) ||
        photonEnergy <= 0

    ) {
        setStatus("Please enter a positive photon energy in eV")
        return;

    }

    for (
        let n = currentLevel + 1;
        n <= 3;
        n++

    ) {
        const photon = calculatePhoton(currentLevel, n);

        if (Math.abs(photonEnergy - photon.photonEnergy) <= 0.02) {
            const oldLevel = currentLevel;
            const newLevel = n;

            startPhotonAnimation(oldLevel, newLevel);

            currentLevel = newLevel;
            targetLevel = newLevel;

            setStatus(
                "Photon absorbed! Transition: n = " +
                oldLevel + "→ " + newLevel +
                "| Required energy:" +
                photon.photonEnergy.toFixed(2) + "eV" +
                "| Wavelength: " +
                photon.wavelengthNm.toFixed(1) + "nm "

            );

            return;

        }
    }
    setStatus(
        "No matching upward transition for " +
        photonEnergy.toFixed(2) +
        "eV from n = " + currentLevel +
        ". Try a different photon energy"

    );
}
function updateTransitionGuide() {
    const select = document.getElementById("transitionSelect");
    const info = document.getElementById("transitionInfo");

    const levels = select.value.split("-");

    const fromLevel = Number(levels[0]);
    const toLevel = Number(levels[1]);

    const photon = calculatePhoton(fromLevel, toLevel);

    info.textContent =
        "Energy required:" +
        photon.photonEnergy.toFixed(2) + "eV" +
        "| Wavelength: " +
        photon.wavelengthNm.toFixed(1) + "nm";

}

document
    .getElementById("transitionSelect")
    .addEventListener("change", updateTransitionGuide);

updateTransitionGuide();

function useSelectedPhoton() {
    const select = document.getElementById("transitionSelect");
    const levels = select.value.split("-");

    const fromLevel = Number(levels[0]);
    const toLevel = Number(levels[1]);

    const photon = calculatePhoton(fromLevel, toLevel);

    document.getElementById("photonEnergyInput").value = photon.photonEnergy.toFixed(2);

    setStatus(
        "Photon energy set to " +
        photon.photonEnergy.toFixed(2) +
        "eV Current electron level: n = " +
        currentLevel +
        "Click Send Photon to test it"

    );
}


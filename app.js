/* =========================================================
   KYNOVA
   OFFLINE FITNESS RPG ENGINE

   Current:
   Simulated sensor data

   Final:
   ESP32-S3 → BLE → Application

   No cloud
   No API
   No internet
========================================================= */


/* =========================================================
   STATE
========================================================= */

let workoutRunning = false;

let sensorTimer = null;
let workoutTimer = null;

let elapsedSeconds = 0;

let energyWh = 0;

let powerSamples = [];

let sensorIndex = 0;

let sessionXP = 0;

let currentHeartRate = 0;
let currentRPM = 0;
let currentPower = 0;


/* =========================================================
   DOM
========================================================= */

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");

const sessionStatus =
    document.getElementById("sessionStatus");

const heartRate =
    document.getElementById("heartRate");

const rpm =
    document.getElementById("rpm");

const voltage =
    document.getElementById("voltage");

const current =
    document.getElementById("current");

const power =
    document.getElementById("power");

const duration =
    document.getElementById("duration");

const energyHero =
    document.getElementById("energyHero");

const questEnergy =
    document.getElementById("questEnergy");

const questBar =
    document.getElementById("questBar");

const avgPower =
    document.getElementById("avgPower");

const calories =
    document.getElementById("calories");

const summaryEnergy =
    document.getElementById("summaryEnergy");

const sessionXPElement =
    document.getElementById("sessionXP");

const xpElement =
    document.getElementById("xp");

const nextXP =
    document.getElementById("nextXP");

const xpBar =
    document.getElementById("xpBar");

const level =
    document.getElementById("level");

const levelBadge =
    document.getElementById("levelBadge");

const rankName =
    document.getElementById("rankName");

const riderStatus =
    document.getElementById("riderStatus");

const streakElement =
    document.getElementById("streak");

const chatWindow =
    document.getElementById("chatWindow");

const chatInput =
    document.getElementById("chatInput");

const sendChat =
    document.getElementById("sendChat");


/* =========================================================
   SENSOR DATA
========================================================= */

const sensorData = [

    {
        heartRate: 102,
        rpm: 52,
        voltage: 11.8,
        current: 1.20
    },

    {
        heartRate: 106,
        rpm: 56,
        voltage: 12.0,
        current: 1.40
    },

    {
        heartRate: 110,
        rpm: 60,
        voltage: 12.2,
        current: 1.60
    },

    {
        heartRate: 115,
        rpm: 64,
        voltage: 12.3,
        current: 1.90
    },

    {
        heartRate: 121,
        rpm: 68,
        voltage: 12.4,
        current: 2.20
    },

    {
        heartRate: 126,
        rpm: 72,
        voltage: 12.5,
        current: 2.50
    },

    {
        heartRate: 132,
        rpm: 76,
        voltage: 12.6,
        current: 2.80
    },

    {
        heartRate: 137,
        rpm: 80,
        voltage: 12.7,
        current: 3.00
    },

    {
        heartRate: 142,
        rpm: 76,
        voltage: 12.5,
        current: 2.70
    },

    {
        heartRate: 146,
        rpm: 72,
        voltage: 12.4,
        current: 2.40
    },

    {
        heartRate: 140,
        rpm: 68,
        voltage: 12.3,
        current: 2.10
    },

    {
        heartRate: 134,
        rpm: 64,
        voltage: 12.2,
        current: 1.80
    }
];


/* =========================================================
   LOCAL PLAYER DATA
========================================================= */

let totalXP =
    Number(
        localStorage.getItem("kynovaXP")
    ) || 0;


let streak =
    Number(
        localStorage.getItem("kynovaStreak")
    ) || 0;


/* =========================================================
   START
========================================================= */

startBtn.addEventListener(
    "click",
    startWorkout
);


function startWorkout() {

    if (workoutRunning) {
        return;
    }


    workoutRunning = true;

    elapsedSeconds = 0;

    energyWh = 0;

    powerSamples = [];

    sensorIndex = 0;

    sessionXP = 0;


    startBtn.disabled = true;

    stopBtn.disabled = false;


    sessionStatus.textContent =
        "RIDE ACTIVE";

    riderStatus.textContent =
        "RIDING";


    updateSensor();

    sensorTimer =
        setInterval(
            updateSensor,
            1000
        );


    workoutTimer =
        setInterval(
            updateWorkoutTime,
            1000
        );


    addCoachMessage(
        "Your ride has started. Maintain a comfortable cadence and generate as much useful energy as you can."
    );
}


/* =========================================================
   STOP
========================================================= */

stopBtn.addEventListener(
    "click",
    stopWorkout
);


function stopWorkout() {

    if (!workoutRunning) {
        return;
    }


    workoutRunning = false;


    clearInterval(sensorTimer);

    clearInterval(workoutTimer);


    sensorTimer = null;

    workoutTimer = null;


    startBtn.disabled = false;

    stopBtn.disabled = true;


    sessionStatus.textContent =
        "RIDE COMPLETE";

    riderStatus.textContent =
        "REST";


    /*
       Calculate XP
    */

    sessionXP =
        calculateXP();


    totalXP += sessionXP;

    streak++;


    localStorage.setItem(
        "kynovaXP",
        totalXP
    );


    localStorage.setItem(
        "kynovaStreak",
        streak
    );


    sessionXPElement.textContent =
        sessionXP;


    updatePlayer();


    unlockAchievements();


    saveWorkout();


    updateHistory();


    addCoachMessage(
        `Ride complete. You generated ${energyWh.toFixed(3)} Wh and earned ${sessionXP} XP.`
    );
}


/* =========================================================
   SENSOR UPDATE
========================================================= */

function updateSensor() {

    const base =
        sensorData[sensorIndex];


    sensorIndex++;


    if (sensorIndex >= sensorData.length) {

        sensorIndex = 0;
    }


    currentHeartRate =
        base.heartRate +
        randomInt(-2, 2);


    currentRPM =
        base.rpm +
        randomInt(-2, 2);


    const measuredVoltage =
        base.voltage +
        randomDecimal(-0.08, 0.08);


    const measuredCurrent =
        base.current +
        randomDecimal(-0.06, 0.06);


    /*
        REAL PROJECT FORMULA

        Power = Voltage × Current
    */

    currentPower =
        measuredVoltage *
        measuredCurrent;


    /*
        Energy

        W × seconds / 3600
    */

    energyWh +=
        currentPower / 3600;


    powerSamples.push(
        currentPower
    );


    /*
        Update UI
    */

    heartRate.textContent =
        Math.round(currentHeartRate);


    rpm.textContent =
        Math.round(currentRPM);


    voltage.textContent =
        measuredVoltage.toFixed(2);


    current.textContent =
        measuredCurrent.toFixed(2);


    power.textContent =
        currentPower.toFixed(1);


    energyHero.textContent =
        energyWh.toFixed(3);


    questEnergy.textContent =
        energyWh.toFixed(3);


    summaryEnergy.textContent =
        energyWh.toFixed(3);


    avgPower.textContent =
        calculateAverage(
            powerSamples
        ).toFixed(1);


    calories.textContent =
        calculateCalories();


    /*
        Bars
    */

    setBar(
        "heartBar",
        currentHeartRate,
        180
    );


    setBar(
        "rpmBar",
        currentRPM,
        100
    );


    setBar(
        "voltageBar",
        measuredVoltage,
        15
    );


    setBar(
        "currentBar",
        measuredCurrent,
        5
    );


    setBar(
        "powerBar",
        currentPower,
        100
    );


    setBar(
        "timeBar",
        elapsedSeconds,
        1800
    );


    /*
        Quest
    */

    const questProgress =
        Math.min(
            100,
            (energyWh / 5) * 100
        );


    questBar.style.width =
        questProgress + "%";


    /*
        Update local coach
    */

    localCoach();
}


/* =========================================================
   TIME
========================================================= */

function updateWorkoutTime() {

    if (!workoutRunning) {
        return;
    }


    elapsedSeconds++;


    duration.textContent =
        formatTime(
            elapsedSeconds
        );


    /*
        Small amount of XP during
        the session
    */

    sessionXP =
        Math.floor(
            elapsedSeconds / 30
        );


    sessionXPElement.textContent =
        sessionXP;
}


/* =========================================================
   LOCAL AI COACH
========================================================= */

function localCoach() {

    if (!workoutRunning) {
        return;
    }


    /*
        High heart rate
    */

    if (currentHeartRate >= 150) {

        addCoachMessageOnce(
            "Your heart rate is getting high. Reduce your intensity slightly."
        );

        return;
    }


    /*
        Low cadence
    */

    if (currentRPM < 55) {

        addCoachMessageOnce(
            "Your cadence is low. Try increasing your RPM gradually."
        );

        return;
    }


    /*
        Good range
    */

    if (
        currentHeartRate >= 110 &&
        currentHeartRate <= 145 &&
        currentRPM >= 60 &&
        currentRPM <= 80
    ) {

        addCoachMessageOnce(
            "Good rhythm. Your heart rate and cadence are in a steady range."
        );
    }
}


/* =========================================================
   CHATBOT
========================================================= */

sendChat.addEventListener(
    "click",
    sendMessage
);


chatInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            sendMessage();
        }
    }
);


function sendMessage() {

    const message =
        chatInput.value
            .trim()
            .toLowerCase();


    if (!message) {
        return;
    }


    addUserMessage(
        chatInput.value
    );


    chatInput.value = "";


    const reply =
        generateCoachReply(
            message
        );


    setTimeout(
        function() {

            addCoachMessage(
                reply
            );

        },
        350
    );
}


/*
    This is intentionally a LOCAL
    rule-based chatbot.

    No internet/API is used.
*/

function generateCoachReply(message) {


    if (
        message.includes("heart") ||
        message.includes("bpm")
    ) {

        if (currentHeartRate === 0) {

            return "Start a ride first. Then I can respond using your current heart-rate reading.";
        }

        return `Your current heart rate is approximately ${Math.round(currentHeartRate)} BPM.`;
    }


    if (
        message.includes("rpm") ||
        message.includes("cadence")
    ) {

        if (currentRPM === 0) {

            return "Start your ride first and I can monitor your cadence.";
        }

        return `Your current cadence is ${Math.round(currentRPM)} RPM.`;
    }


    if (
        message.includes("power") ||
        message.includes("watt")
    ) {

        if (currentPower === 0) {

            return "Start pedaling and I will calculate generated power from voltage × current.";
        }

        return `You are currently generating approximately ${currentPower.toFixed(1)} W.`;
    }


    if (
        message.includes("energy") ||
        message.includes("wh")
    ) {

        return `You have generated ${energyWh.toFixed(3)} Wh in this ride.`;
    }


    if (
        message.includes("level") ||
        message.includes("xp")
    ) {

        return `You are currently ${getLevelName()} with ${totalXP} total XP.`;
    }


    if (
        message.includes("calorie") ||
        message.includes("calories")
    ) {

        return `Your estimated session calories are ${calculateCalories()} kcal.`;
    }


    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("hey")
    ) {

        return "Hello, Energy Rider. Ready to generate some power?";
    }


    if (
        message.includes("tired") ||
        message.includes("stop")
    ) {

        return "Listen to your body. If you feel uncomfortable, reduce the intensity or end the ride.";
    }


    if (
        message.includes("good") ||
        message.includes("doing")
    ) {

        return "Keep your cadence steady and focus on a comfortable effort.";
    }


    return "I can help with your heart rate, RPM, power, energy, calories, XP and current ride status.";
}


/* =========================================================
   CHAT UI
========================================================= */

let lastCoachMessage = "";


function addCoachMessage(message) {

    lastCoachMessage = message;


    const element =
        document.createElement("div");


    element.className =
        "chat-message coach";


    element.innerHTML = `

        <div class="chat-avatar">
            AI
        </div>

        <div class="bubble">

            <strong>Kynova Coach</strong>

            <p>${escapeHTML(message)}</p>

        </div>

    `;


    chatWindow.appendChild(
        element
    );


    chatWindow.scrollTop =
        chatWindow.scrollHeight;
}


function addCoachMessageOnce(message) {

    if (
        lastCoachMessage === message
    ) {
        return;
    }


    addCoachMessage(message);
}


function addUserMessage(message) {

    const element =
        document.createElement("div");


    element.className =
        "chat-message user";


    element.innerHTML = `

        <div class="bubble">

            <p>${escapeHTML(message)}</p>

        </div>

    `;


    chatWindow.appendChild(
        element
    );


    chatWindow.scrollTop =
        chatWindow.scrollHeight;
}


/* =========================================================
   XP
========================================================= */

function calculateXP() {

    /*
        5 XP per minute
        + 1 XP per Wh
    */

    const durationXP =
        Math.floor(
            elapsedSeconds / 60
        ) * 5;


    const energyXP =
        Math.floor(
            energyWh
        );


    return durationXP + energyXP;
}


function updatePlayer() {

    const playerLevel =
        Math.floor(
            totalXP / 100
        ) + 1;


    const currentXP =
        totalXP % 100;


    level.textContent =
        "LEVEL " +
        playerLevel;


    levelBadge.textContent =
        "LV." +
        playerLevel;


    xpElement.textContent =
        currentXP;


    nextXP.textContent =
        "100";


    xpBar.style.width =
        currentXP + "%";


    rankName.textContent =
        getRank(playerLevel);


    streakElement.textContent =
        streak;
}


function getRank(playerLevel) {

    if (playerLevel >= 10) {
        return "ENERGY MASTER";
    }

    if (playerLevel >= 7) {
        return "POWER RIDER";
    }

    if (playerLevel >= 4) {
        return "ENERGY RUNNER";
    }

    if (playerLevel >= 2) {
        return "ROOKIE RIDER";
    }

    return "INITIATE";
}


function getLevelName() {

    const playerLevel =
        Math.floor(
            totalXP / 100
        ) + 1;


    return (
        "Level " +
        playerLevel +
        " " +
        getRank(playerLevel)
    );
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function unlockAchievements() {

    /*
        First ride
    */

    unlock(
        "achievementRide",
        true
    );


    /*
        5 Wh
    */

    unlock(
        "achievementEnergy",
        energyWh >= 5
    );


    /*
        10 minute ride
    */

    unlock(
        "achievementTime",
        elapsedSeconds >= 600
    );


    /*
        50W
    */

    unlock(
        "achievementPower",
        Math.max(...powerSamples) >= 50
    );
}


function unlock(id, condition) {

    const element =
        document.getElementById(id);


    if (condition) {

        element.classList.remove(
            "locked"
        );

        element.classList.add(
            "unlocked"
        );
    }
}


/* =========================================================
   HISTORY
========================================================= */

function saveWorkout() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "kynovaHistory"
            )
        ) || [];


    history.unshift({

        date:
            new Date()
                .toLocaleString(),

        duration:
            formatTime(
                elapsedSeconds
            ),

        energy:
            Number(
                energyWh.toFixed(3)
            ),

        power:
            Number(
                calculateAverage(
                    powerSamples
                ).toFixed(1)
            ),

        xp:
            sessionXP

    });


    localStorage.setItem(

        "kynovaHistory",

        JSON.stringify(
            history.slice(0, 20)
        )
    );
}


function updateHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "kynovaHistory"
            )
        ) || [];


    const historyBody =
        document.getElementById(
            "historyBody"
        );


    const empty =
        document.getElementById(
            "emptyHistory"
        );


    historyBody.innerHTML = "";


    if (history.length === 0) {

        empty.style.display =
            "block";

        return;
    }


    empty.style.display =
        "none";


    history.forEach(
        workout => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>${escapeHTML(workout.date)}</td>

                <td>${workout.duration}</td>

                <td>${workout.energy} Wh</td>

                <td>${workout.power} W</td>

                <td>+${workout.xp}</td>

            `;


            historyBody.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   CLEAR HISTORY
========================================================= */

document
    .getElementById("clearHistory")
    .addEventListener(
        "click",
        function() {

            if (
                !confirm(
                    "Clear locally stored ride history and XP?"
                )
            ) {
                return;
            }


            localStorage.removeItem(
                "kynovaHistory"
            );


            localStorage.removeItem(
                "kynovaXP"
            );


            localStorage.removeItem(
                "kynovaStreak"
            );


            totalXP = 0;

            streak = 0;


            updatePlayer();

            updateHistory();
        }
    );


/* =========================================================
   CALCULATIONS
========================================================= */

function calculateCalories() {

    if (elapsedSeconds <= 0) {
        return 0;
    }


    const hours =
        elapsedSeconds / 3600;


    /*
        Prototype estimate only.
    */

    return Math.round(
        currentHeartRate *
        0.012 *
        hours *
        60
    );
}


function calculateAverage(values) {

    if (
        values.length === 0
    ) {
        return 0;
    }


    const total =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    return (
        total /
        values.length
    );
}


/* =========================================================
   UTILITIES
========================================================= */

function randomInt(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


function randomDecimal(min, max) {

    return (
        Math.random() *
        (max - min)
    ) + min;
}


function setBar(
    id,
    value,
    maximum
) {

    const element =
        document.getElementById(id);


    let percentage =
        (value / maximum) *
        100;


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    element.style.width =
        percentage + "%";
}


function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")
        +
        ":"
        +
        String(remaining)
            .padStart(2, "0")
    );
}


/*
    Prevent HTML injection in
    chatbot messages.
*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent = text;


    return div.innerHTML;
}


/* =========================================================
   INITIALIZE
========================================================= */

updatePlayer();

updateHistory();

sessionStatus.textContent =
    "READY";

riderStatus.textContent =
    "READY";
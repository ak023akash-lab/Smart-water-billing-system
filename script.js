/* =========================================================
   AQUASMART - SMART WATER BILLING SYSTEM
   Prototype JavaScript
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

const state = {

    user: null,

    previousReading: 12000,

    currentReading: 14500,

    flowRate: 4.2,

    duration: 30,

    alerts: [

        {
            id: 1,
            type: "system",
            title: "Smart meter connected",
            message: "Meter AQ-20481 is online and sending data.",
            severity: "info",
            time: "5 min ago",
            resolved: false
        },

        {
            id: 2,
            type: "usage",
            title: "Usage is slightly above average",
            message: "Current usage is 4% higher than your usual pattern.",
            severity: "warning",
            time: "2 hours ago",
            resolved: false
        },

        {
            id: 3,
            type: "system",
            title: "Monthly bill generated",
            message: "Your October estimated bill has been updated.",
            severity: "success",
            time: "Yesterday",
            resolved: false
        }

    ],

    theme: "light"

};


/* =========================================================
   DEMO LOGIN
========================================================= */

const demoUsers = {

    customer: {

        email: "customer@aquasmart.com",

        password: "customer123",

        name: "Customer",

        role: "Consumer",

        avatar: "C"

    },

    admin: {

        email: "admin@aquasmart.com",

        password: "admin123",

        name: "Administrator",

        role: "Admin",

        avatar: "A"

    }

};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


function qs(selector) {

    return document.querySelector(selector);

}


function qsa(selector) {

    return document.querySelectorAll(selector);

}


/* =========================================================
   LOGIN SESSION
   IMPORTANT:
   sessionStorage is deliberately used here.

   Therefore:
   - Refresh = stays logged in
   - Closing tab/browser = session disappears
   - Opening index.html again = login required
========================================================= */

function checkLogin() {

    const savedSession =
        sessionStorage.getItem("aquasmartSession");

    if (savedSession) {

        try {

            state.user = JSON.parse(savedSession);

            showApp();

        } catch (error) {

            sessionStorage.removeItem("aquasmartSession");

            showLogin();

        }

    } else {

        showLogin();

    }

}


function showLogin() {

    $("loginPage").classList.remove("hidden");

    $("app").classList.add("hidden");

}


function showApp() {

    $("loginPage").classList.add("hidden");

    $("app").classList.remove("hidden");

    updateUserUI();

    initializeCharts();

    renderAlerts();

    updateDashboard();

}


/* =========================================================
   LOGIN
========================================================= */

function handleLogin(event) {

    event.preventDefault();

    const email =
        $("email").value.trim().toLowerCase();

    const password =
        $("password").value;

    let matchedUser = null;

    Object.values(demoUsers).forEach(user => {

        if (
            user.email === email &&
            user.password === password
        ) {

            matchedUser = user;

        }

    });


    if (!matchedUser) {

        showToast(
            "Invalid credentials. Please use the demo credentials.",
            "error"
        );

        return;

    }


    state.user = {

        name: matchedUser.name,

        role: matchedUser.role,

        avatar: matchedUser.avatar,

        email: matchedUser.email

    };


    /*
        IMPORTANT:
        We use sessionStorage, NOT localStorage.

        localStorage would keep the user logged in after
        closing and reopening the browser.

        sessionStorage is cleared when the browsing session
        ends.
    */

    sessionStorage.setItem(
        "aquasmartSession",
        JSON.stringify(state.user)
    );


    showToast(
        `Welcome to AquaSmart, ${matchedUser.name}!`,
        "success"
    );


    setTimeout(() => {

        showApp();

    }, 400);

}


function logout() {

    /*
        Remove ONLY the session.

        No login state remains after logout.
    */

    sessionStorage.removeItem("aquasmartSession");

    state.user = null;

    showLogin();

    $("loginForm").reset();

    showToast(
        "You have been logged out.",
        "success"
    );

}


/* =========================================================
   DEMO LOGIN BUTTONS
========================================================= */

function fillCustomerLogin() {

    $("email").value =
        demoUsers.customer.email;

    $("password").value =
        demoUsers.customer.password;

}


function fillAdminLogin() {

    $("email").value =
        demoUsers.admin.email;

    $("password").value =
        demoUsers.admin.password;

}


/* =========================================================
   USER UI
========================================================= */

function updateUserUI() {

    if (!state.user) return;


    $("welcomeName").textContent =
        state.user.name;

    $("sidebarUserName").textContent =
        state.user.name;

    $("sidebarUserRole").textContent =
        state.user.role;

    $("sidebarAvatar").textContent =
        state.user.avatar;

    $("headerAvatar").textContent =
        state.user.avatar;

}


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {

    state.theme = theme;

    if (theme === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }


    updateThemeIcons();

}


function updateThemeIcons() {

    const dark =
        document.body.classList.contains("dark");


    const buttons = [

        $("themeToggle"),

        $("loginThemeBtn")

    ];


    buttons.forEach(button => {

        if (!button) return;

        const icon =
            button.querySelector("i");

        if (!icon) return;

        icon.className =
            dark
                ? "ri-sun-line"
                : "ri-moon-line";

    });


    const settingsToggle =
        $("settingsThemeToggle");

    if (settingsToggle) {

        settingsToggle.classList.toggle(
            "active",
            dark
        );

    }

}


function toggleTheme() {

    const isDark =
        document.body.classList.contains("dark");

    applyTheme(
        isDark ? "light" : "dark"
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const pageInfo = {

    dashboard: {

        title: "Dashboard",

        subtitle:
            "Monitor your water usage and billing"

    },

    usage: {

        title: "Usage Analytics",

        subtitle:
            "Understand your water consumption patterns"

    },

    bills: {

        title: "Bills & Payments",

        subtitle:
            "View your water bills and payment status"

    },

    ai: {

        title: "AI Insights",

        subtitle:
            "Intelligent analysis of simulated meter data"

    },

    alerts: {

        title: "Alerts & Notifications",

        subtitle:
            "Monitor leakage, usage and meter alerts"

    },

    simulator: {

        title: "Smart Meter Simulator",

        subtitle:
            "Test smart meter readings and system responses"

    },

    saving: {

        title: "Water Saving",

        subtitle:
            "Smart recommendations to reduce consumption"

    },

    settings: {

        title: "Settings",

        subtitle:
            "Manage your prototype preferences"

    }

};


function navigateTo(page) {

    qsa(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === page
        );

    });


    qsa(".page-section").forEach(section => {

        section.classList.remove("active");

    });


    const target =
        $("page-" + page);

    if (target) {

        target.classList.add("active");

    }


    if (pageInfo[page]) {

        $("pageTitle").textContent =
            pageInfo[page].title;

        $("pageSubtitle").textContent =
            pageInfo[page].subtitle;

    }


    const sidebar =
        $("sidebar");

    sidebar.classList.remove("open");


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (page === "usage") {

        setTimeout(() => {

            initializeAnalyticsChart();

        }, 100);

    }

}


/* =========================================================
   BILL CALCULATION
========================================================= */

function calculateBill(units) {

    let waterCharge = 0;

    let remaining = units;


    /*
       Demo tariff:

       0 - 10 KL       ₹10/KL
       10 - 20 KL      ₹15/KL
       20 - 30 KL      ₹20/KL
       Above 30 KL     ₹25/KL
    */


    if (remaining > 0) {

        const slab =
            Math.min(remaining, 10);

        waterCharge +=
            slab * 10;

        remaining -= slab;

    }


    if (remaining > 0) {

        const slab =
            Math.min(remaining, 10);

        waterCharge +=
            slab * 15;

        remaining -= slab;

    }


    if (remaining > 0) {

        const slab =
            Math.min(remaining, 10);

        waterCharge +=
            slab * 20;

        remaining -= slab;

    }


    if (remaining > 0) {

        waterCharge +=
            remaining * 25;

    }


    const fixedCharge = 50;

    const subtotal =
        waterCharge + fixedCharge;

    const tax =
        subtotal * 0.05;

    const total =
        subtotal + tax;


    return {

        waterCharge,

        fixedCharge,

        tax,

        total: Math.round(total)

    };

}


/* =========================================================
   DASHBOARD UPDATE
========================================================= */

function updateDashboard() {

    const consumption =
        Math.max(
            0,
            state.currentReading -
            state.previousReading
        ) / 1000;


    const bill =
        calculateBill(consumption);


    $("currentUsage").textContent =
        consumption.toFixed(1);


    $("currentBill").textContent =
        bill.total;


    $("billPageAmount").textContent =
        bill.total;


    $("flowRateDisplay").textContent =
        state.flowRate.toFixed(1);


    $("lastReading").textContent =
        Number(
            state.currentReading
        ).toLocaleString() + " L";


    $("lastUpdated").textContent =
        "Just now";


    $("simulatedReading").textContent =
        Number(
            state.currentReading
        ).toLocaleString();


    $("simConsumption").textContent =
        consumption.toFixed(2) + " KL";


    $("simFlow").textContent =
        state.flowRate.toFixed(1) + " L/min";


    $("simBill").textContent =
        "₹" + bill.total;


    updatePredictions(consumption, bill.total);

    updateAI(consumption);

}


/* =========================================================
   AI PREDICTIONS
========================================================= */

function updatePredictions(consumption, bill) {

    /*
       Simple prototype prediction.

       In the final project this can be replaced with
       a real ML model.
    */

    const expectedUsage =
        Math.max(
            consumption,
            consumption * 1.2
        );


    const predicted =
        calculateBill(expectedUsage).total;


    $("predictedBill").textContent =
        predicted;


    $("aiPredictedBill").textContent =
        predicted;


    $("aiExpectedUsage").textContent =
        expectedUsage.toFixed(1) + " KL";


    $("aiCurrentUsage").textContent =
        consumption.toFixed(1) + " KL";


    $("predictionUsage").textContent =
        `${consumption.toFixed(1)} / 25 KL`;


    const percentage =
        Math.min(
            100,
            (consumption / 25) * 100
        );


    $("predictionProgress").style.width =
        percentage + "%";


    $("currentBill").textContent =
        bill;


    $("billPageAmount").textContent =
        bill;

}


/* =========================================================
   AI ANALYSIS
========================================================= */

function updateAI(consumption) {

    const flow =
        state.flowRate;

    const duration =
        state.duration;


    let leak = false;

    let tampering = false;

    let highUsage = false;


    /*
       Leak demo rule
    */

    if (
        flow >= 6 &&
        duration >= 45
    ) {

        leak = true;

    }


    /*
       Tampering demo rule
    */

    if (
        state.currentReading <
        state.previousReading
    ) {

        tampering = true;

    }


    /*
       High usage demo rule
    */

    if (consumption >= 20) {

        highUsage = true;

    }


    /* LEAK */

    if (leak) {

        $("leakStatus").innerHTML =
            `<i class="ri-alert-line"></i> Possible Leak`;

        $("leakStatus").className =
            "status-pill";

        $("leakStatus").style.color =
            "var(--red)";

        $("leakStatus").style.background =
            "rgba(239,68,68,0.1)";


        $("leakConfidence").textContent =
            "93%";


        $("aiLeakConfidence").textContent =
            "93%";


        $("leakDescription").textContent =
            "Continuous high flow detected. The pattern may indicate a possible leak.";


        $("aiLeakResult").innerHTML = `

            <div class="result-icon danger">

                <i class="ri-alert-line"></i>

            </div>

            <div>

                <strong>
                    Possible water leak detected
                </strong>

                <span>
                    High continuous flow pattern detected.
                </span>

            </div>

        `;


        $("aiLeakReason").textContent =
            `Flow rate is ${flow.toFixed(1)} L/min for ${duration} minutes, which is above the prototype's normal threshold.`;

    } else {

        $("leakStatus").innerHTML =
            `<i class="ri-check-line"></i> No Leak`;

        $("leakStatus").className =
            "status-pill safe";

        $("leakStatus").style = "";


        $("leakConfidence").textContent =
            "96%";


        $("aiLeakConfidence").textContent =
            "96%";


        $("leakDescription").textContent =
            "Water flow pattern is normal. No continuous abnormal usage detected.";


        $("aiLeakResult").innerHTML = `

            <div class="result-icon safe">

                <i class="ri-check-line"></i>

            </div>

            <div>

                <strong>
                    No significant leak detected
                </strong>

                <span>
                    Flow pattern is within the normal range.
                </span>

            </div>

        `;


        $("aiLeakReason").textContent =
            "Flow rate is stable and no prolonged abnormal consumption has been detected.";

    }


    /* ANOMALY */

    if (tampering) {

        $("aiAnomalyResult").innerHTML = `

            <div class="result-icon danger">

                <i class="ri-alert-line"></i>

            </div>

            <div>

                <strong>
                    Suspicious meter reading
                </strong>

                <span>
                    Reading decreased unexpectedly.
                </span>

            </div>

        `;


        $("aiAnomalyReason").textContent =
            "The current meter reading is lower than the previous reading. This may indicate a sensor error or possible tampering.";

    } else if (highUsage) {

        $("aiAnomalyResult").innerHTML = `

            <div class="result-icon danger">

                <i class="ri-alert-line"></i>

            </div>

            <div>

                <strong>
                    Unusual usage detected
                </strong>

                <span>
                    Consumption is above the normal range.
                </span>

            </div>

        `;


        $("aiAnomalyReason").textContent =
            "Current consumption has crossed the prototype's high-usage threshold.";

    } else {

        $("aiAnomalyResult").innerHTML = `

            <div class="result-icon safe">

                <i class="ri-shield-check-line"></i>

            </div>

            <div>

                <strong>
                    No suspicious activity
                </strong>

                <span>
                    Meter readings are consistent.
                </span>

            </div>

        `;


        $("aiAnomalyReason").textContent =
            "Latest reading is consistent with previous meter history.";

    }

}


/* =========================================================
   SIMULATOR
========================================================= */

function runSimulation() {

    const previous =
        Number(
            $("previousReadingInput").value
        );

    const current =
        Number(
            $("currentReadingInput").value
        );

    const flow =
        Number(
            $("flowRateInput").value
        );

    const duration =
        Number(
            $("durationInput").value
        );

    const scenario =
        $("scenarioInput").value;


    if (
        Number.isNaN(previous) ||
        Number.isNaN(current) ||
        Number.isNaN(flow) ||
        Number.isNaN(duration)
    ) {

        showToast(
            "Please enter valid meter values.",
            "error"
        );

        return;

    }


    state.previousReading =
        previous;

    state.currentReading =
        current;

    state.flowRate =
        flow;

    state.duration =
        duration;


    updateDashboard();


    const consumption =
        Math.max(
            0,
            current - previous
        ) / 1000;


    /*
       Scenario-specific alerts
    */

    if (scenario === "leak") {

        addAlert(

            "leak",

            "danger",

            "Possible water leak detected",

            `High continuous flow of ${flow.toFixed(1)} L/min detected for ${duration} minutes.`,

            false

        );


        showToast(
            "Leak scenario simulated. AI alert generated.",
            "error"
        );

    }


    else if (scenario === "high") {

        addAlert(

            "usage",

            "warning",

            "High water usage detected",

            `Current simulated consumption is ${consumption.toFixed(1)} KL.`,

            false

        );


        showToast(
            "High usage scenario simulated.",
            "warning"
        );

    }


    else if (scenario === "tampering") {

        addAlert(

            "anomaly",

            "danger",

            "Suspicious meter reading",

            "The simulated meter reading shows an abnormal pattern.",

            false

        );


        showToast(
            "Meter anomaly scenario simulated.",
            "error"
        );

    }


    else {

        addAlert(

            "system",

            "success",

            "Normal meter reading received",

            `Reading ${current.toLocaleString()} L processed successfully.`,

            false

        );


        showToast(
            "Normal meter reading processed.",
            "success"
        );

    }


    updateAI(consumption);

}


/* =========================================================
   SCENARIO BUTTONS
========================================================= */

function applyScenario(scenario) {

    $("scenarioInput").value =
        scenario;


    qsa(".scenario-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.scenario === scenario
        );

    });


    if (scenario === "normal") {

        $("previousReadingInput").value =
            12000;

        $("currentReadingInput").value =
            14500;

        $("flowRateInput").value =
            4.2;

        $("durationInput").value =
            30;

    }


    if (scenario === "leak") {

        $("previousReadingInput").value =
            12000;

        $("currentReadingInput").value =
            15150;

        $("flowRateInput").value =
            8.8;

        $("durationInput").value =
            90;

    }


    if (scenario === "high") {

        $("previousReadingInput").value =
            12000;

        $("currentReadingInput").value =
            34500;

        $("flowRateInput").value =
            7.1;

        $("durationInput").value =
            75;

    }


    if (scenario === "tampering") {

        $("previousReadingInput").value =
            14500;

        $("currentReadingInput").value =
            13700;

        $("flowRateInput").value =
            2.2;

        $("durationInput").value =
            20;

    }

}


function resetSimulation() {

    $("previousReadingInput").value =
        12000;

    $("currentReadingInput").value =
        14500;

    $("flowRateInput").value =
        4.2;

    $("durationInput").value =
        30;

    $("scenarioInput").value =
        "normal";


    qsa(".scenario-btn").forEach(button => {

        button.classList.remove("active");

    });


    state.previousReading =
        12000;

    state.currentReading =
        14500;

    state.flowRate =
        4.2;

    state.duration =
        30;


    updateDashboard();

    showToast(
        "Simulation has been reset.",
        "success"
    );

}


/* =========================================================
   ALERTS
========================================================= */

function addAlert(
    type,
    severity,
    title,
    message,
    resolved = false
) {

    const alert = {

        id:
            Date.now(),

        type,

        title,

        message,

        severity,

        time: "Just now",

        resolved

    };


    state.alerts.unshift(alert);


    /*
       Keep prototype data manageable.
    */

    if (state.alerts.length > 20) {

        state.alerts =
            state.alerts.slice(0, 20);

    }


    renderAlerts();

}


function getAlertIcon(severity) {

    if (severity === "danger") {

        return "ri-alert-line";

    }

    if (severity === "warning") {

        return "ri-error-warning-line";

    }

    if (severity === "success") {

        return "ri-check-line";

    }

    return "ri-information-line";

}


function renderAlerts() {

    const activeAlerts =
        state.alerts.filter(
            alert => !alert.resolved
        );


    $("sidebarAlertCount").textContent =
        activeAlerts.length;


    if (activeAlerts.length === 0) {

        $("notificationDot").style.display =
            "none";

    } else {

        $("notificationDot").style.display =
            "block";

    }


    /* Dashboard alerts */

    const dashboardContainer =
        $("dashboardAlerts");

    if (dashboardContainer) {

        dashboardContainer.innerHTML =
            activeAlerts
                .slice(0, 4)
                .map(alert => createAlertHTML(alert, false))
                .join("");

    }


    /* Full alerts */

    const fullContainer =
        $("fullAlertList");

    if (fullContainer) {

        fullContainer.innerHTML =
            activeAlerts
                .map(alert => createAlertHTML(alert, true))
                .join("");

    }

}


function createAlertHTML(alert, full) {

    return `

        <div
            class="alert-item"
            data-alert-type="${alert.type}"
        >

            <div class="alert-icon ${alert.severity}">

                <i class="${getAlertIcon(alert.severity)}"></i>

            </div>

            <div class="alert-content">

                <strong>
                    ${alert.title}
                </strong>

                <span>
                    ${alert.message}
                </span>

            </div>

            <span class="alert-time">
                ${alert.time}
            </span>

            ${
                full
                ?
                `
                <button
                    class="alert-resolve"
                    onclick="resolveAlert(${alert.id})"
                >
                    Resolve
                </button>
                `
                :
                ""
            }

        </div>

    `;

}


function resolveAlert(id) {

    const alert =
        state.alerts.find(
            item => item.id === id
        );


    if (alert) {

        alert.resolved = true;

    }


    renderAlerts();


    showToast(
        "Alert marked as resolved.",
        "success"
    );

}


function clearResolvedAlerts() {

    state.alerts =
        state.alerts.filter(
            alert => !alert.resolved
        );


    renderAlerts();

    showToast(
        "Resolved alerts cleared.",
        "success"
    );

}


/* =========================================================
   ALERT FILTERS
========================================================= */

function filterAlerts(filter) {

    const items =
        qsa("#fullAlertList .alert-item");


    items.forEach(item => {

        if (filter === "all") {

            item.style.display = "flex";

            return;

        }


        const type =
            item.dataset.alertType;


        if (filter === type) {

            item.style.display = "flex";

        } else {

            item.style.display = "none";

        }

    });

}


/* =========================================================
   WATER SAVING
========================================================= */

function updateSavingSimulator() {

    const percentage =
        Number(
            $("savingSlider").value
        );


    $("savingPercentDisplay").textContent =
        percentage + "%";


    const currentBill =
        calculateBill(
            Math.max(
                0,
                state.currentReading -
                state.previousReading
            ) / 1000
        ).total;


    const newBill =
        Math.round(
            currentBill *
            (1 - percentage / 100)
        );


    const saving =
        Math.max(
            0,
            currentBill - newBill
        );


    $("whatCurrentBill").textContent =
        currentBill;


    $("whatNewBill").textContent =
        newBill;


    $("whatSaving").textContent =
        saving;

}


/* =========================================================
   CHARTS
========================================================= */

let usageChart = null;

let analyticsChart = null;


function initializeCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    initializeUsageChart();

    initializeAnalyticsChart();

}


function initializeUsageChart() {

    const canvas =
        $("usageChart");

    if (!canvas) return;


    if (usageChart) {

        usageChart.destroy();

    }


    usageChart =
        new Chart(

            canvas.getContext("2d"),

            {

                type: "line",

                data: {

                    labels: [
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct"
                    ],

                    datasets: [

                        {

                            label:
                                "Consumption (KL)",

                            data: [
                                18.2,
                                22.1,
                                19.4,
                                17.2,
                                16.8,
                                18.4
                            ],

                            borderColor:
                                "#2563eb",

                            backgroundColor:
                                "rgba(37,99,235,0.08)",

                            fill: true,

                            tension: 0.4,

                            borderWidth: 3,

                            pointRadius: 4,

                            pointBackgroundColor:
                                "#06b6d4"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    "rgba(148,163,184,0.12)"

                            },

                            ticks: {

                                font: {
                                    size: 9
                                }

                            }

                        },

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                font: {
                                    size: 9
                                }

                            }

                        }

                    }

                }

            }

        );

}


function initializeAnalyticsChart() {

    const canvas =
        $("analyticsChart");

    if (!canvas) return;


    if (analyticsChart) {

        analyticsChart.destroy();

    }


    analyticsChart =
        new Chart(

            canvas.getContext("2d"),

            {

                type: "bar",

                data: {

                    labels: [
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct"
                    ],

                    datasets: [

                        {

                            label:
                                "Usage (KL)",

                            data: [
                                18.2,
                                22.1,
                                19.4,
                                17.2,
                                16.8,
                                18.4
                            ],

                            backgroundColor:
                                [
                                    "#60a5fa",
                                    "#7c3aed",
                                    "#06b6d4",
                                    "#10b981",
                                    "#38bdf8",
                                    "#2563eb"
                                ],

                            borderRadius: 7,

                            borderSkipped: false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            grid: {

                                color:
                                    "rgba(148,163,184,0.12)"

                            },

                            ticks: {

                                font: {
                                    size: 9
                                }

                            }

                        },

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                font: {
                                    size: 9
                                }

                            }

                        }

                    }

                }

            }

        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        $("toastContainer");


    const toast =
        document.createElement("div");


    toast.className =
        "toast";


    let icon =
        "ri-information-line";


    if (type === "success") {

        icon =
            "ri-checkbox-circle-line";

    }

    if (type === "error") {

        icon =
            "ri-error-warning-line";

    }

    if (type === "warning") {

        icon =
            "ri-alert-line";

    }


    toast.innerHTML = `

        <i class="${icon}"></i>

        <span>
            ${message}
        </span>

    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(30px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}


/* =========================================================
   BILL BUTTON
========================================================= */

function calculateCurrentBill() {

    const consumption =
        Math.max(
            0,
            state.currentReading -
            state.previousReading
        ) / 1000;


    const bill =
        calculateBill(consumption);


    $("currentBill").textContent =
        bill.total;


    $("billPageAmount").textContent =
        bill.total;


    showToast(
        `Current estimated bill: ₹${bill.total}`,
        "success"
    );

}


/* =========================================================
   DOWNLOAD DEMO BILL
========================================================= */

function downloadDemoBill() {

    const consumption =
        Math.max(
            0,
            state.currentReading -
            state.previousReading
        ) / 1000;


    const bill =
        calculateBill(consumption);


    const text = `

AQUASMART
SMART WATER BILLING SYSTEM
--------------------------------

Meter Number: AQ-20481

Previous Reading:
${state.previousReading} L

Current Reading:
${state.currentReading} L

Consumption:
${consumption.toFixed(2)} KL

Water Charge:
₹${bill.waterCharge.toFixed(2)}

Fixed Charge:
₹${bill.fixedCharge.toFixed(2)}

Tax:
₹${bill.tax.toFixed(2)}

TOTAL:
₹${bill.total}

--------------------------------
Prototype / Simulated Data

`;


    const blob =
        new Blob(
            [text],
            { type: "text/plain" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "AquaSmart-Bill.txt";


    link.click();


    URL.revokeObjectURL(url);


    showToast(
        "Demo bill downloaded.",
        "success"
    );

}


/* =========================================================
   RESET ALL DATA
========================================================= */

function resetAllData() {

    state.previousReading = 12000;

    state.currentReading = 14500;

    state.flowRate = 4.2;

    state.duration = 30;


    state.alerts = [

        {
            id: Date.now(),

            type: "system",

            title: "Prototype data reset",

            message:
                "Smart meter data has been restored to demo values.",

            severity: "success",

            time: "Just now",

            resolved: false

        }

    ];


    resetSimulation();

    renderAlerts();

    showToast(
        "Prototype data has been reset.",
        "success"
    );

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* Login */

        $("loginForm")
            .addEventListener(
                "submit",
                handleLogin
            );


        $("logoutBtn")
            .addEventListener(
                "click",
                logout
            );


        /* Password */

        $("passwordToggle")
            .addEventListener(
                "click",
                () => {

                    const input =
                        $("password");

                    const icon =
                        $("passwordToggle")
                            .querySelector("i");


                    if (
                        input.type === "password"
                    ) {

                        input.type =
                            "text";

                        icon.className =
                            "ri-eye-off-line";

                    } else {

                        input.type =
                            "password";

                        icon.className =
                            "ri-eye-line";

                    }

                }
            );


        /* Theme */

        $("themeToggle")
            .addEventListener(
                "click",
                toggleTheme
            );


        $("loginThemeBtn")
            .addEventListener(
                "click",
                toggleTheme
            );


        $("settingsThemeToggle")
            .addEventListener(
                "click",
                toggleTheme
            );


        /* Mobile */

        $("mobileMenu")
            .addEventListener(
                "click",
                () => {

                    $("sidebar")
                        .classList.toggle("open");

                }
            );


        /* Navigation */

        qsa("[data-page]")
            .forEach(element => {

                element.addEventListener(
                    "click",
                    () => {

                        const page =
                            element.dataset.page;

                        navigateTo(page);

                    }
                );

            });


        /* Simulation */

        $("runSimulationBtn")
            .addEventListener(
                "click",
                runSimulation
            );


        $("resetSimulationBtn")
            .addEventListener(
                "click",
                resetSimulation
            );


        qsa(".scenario-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        applyScenario(
                            button.dataset.scenario
                        );

                    }
                );

            });


        $("scenarioInput")
            .addEventListener(
                "change",
                event => {

                    applyScenario(
                        event.target.value
                    );

                }
            );


        /* Alerts */

        $("clearAlertsBtn")
            .addEventListener(
                "click",
                clearResolvedAlerts
            );


        qsa(".filter-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        qsa(".filter-btn")
                            .forEach(btn =>
                                btn.classList.remove(
                                    "active"
                                )
                            );


                        button.classList.add(
                            "active"
                        );


                        filterAlerts(
                            button.dataset.filter
                        );

                    }
                );

            });


        /* Bills */

        $("calculateBillBtn")
            .addEventListener(
                "click",
                calculateCurrentBill
            );


        $("downloadBillBtn")
            .addEventListener(
                "click",
                downloadDemoBill
            );


        /* Water saving */

        $("savingSlider")
            .addEventListener(
                "input",
                updateSavingSimulator
            );


        /* Settings */

        $("notificationToggle")
            .addEventListener(
                "click",
                function () {

                    this.classList.toggle(
                        "active"
                    );


                    const enabled =
                        this.classList.contains(
                            "active"
                        );


                    showToast(

                        enabled
                            ? "Notifications enabled."
                            : "Notifications disabled.",

                        "success"

                    );

                }
            );


        $("resetAllDataBtn")
            .addEventListener(
                "click",
                resetAllData
            );


        /* Notification button */

        $("notificationBtn")
            .addEventListener(
                "click",
                () => {

                    navigateTo("alerts");

                }
            );


        /* Initial theme */

        applyTheme("light");


        /*
           IMPORTANT:
           Do NOT load login state from localStorage.

           We only check sessionStorage here.
        */

        checkLogin();


        updateSavingSimulator();

    }
);
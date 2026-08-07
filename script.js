let allManagedUsers = [];
let managedUsersCurrentRole = ""; 
function switchSection(tabId, menuId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => {
    tab.classList.remove("active-tab");
    tab.style.setProperty("display", "none", "important");

    tab.style.setProperty("position", "relative", "important");
    tab.style.setProperty("top", "auto", "important");
    tab.style.setProperty("left", "auto", "important");
    tab.style.setProperty("right", "auto", "important");
    tab.style.setProperty("transform", "none", "important");
    tab.style.setProperty("margin", "0", "important");
    tab.style.setProperty("width", "100%", "important");
    tab.style.setProperty("max-width", "100%", "important");
    tab.style.setProperty("box-sizing", "border-box", "important");
});

    const menuItems = document.querySelectorAll(".sidebar li");

    menuItems.forEach((item) => {
        item.classList.remove("active");
    });

    const selectedTab = document.getElementById(tabId);
    const selectedMenu = document.getElementById(menuId);

    if (!selectedTab) {
        console.error("Tab not found:", tabId);
        return;
    }

    selectedTab.classList.add("active-tab");
    selectedTab.style.setProperty("display", "block", "important");

    if (selectedMenu) {
        selectedMenu.classList.add("active");
    }

    window.scrollTo(0, 0);
}

function applyRoleTheme(role, accountType = "") {
    const directRole = String(role || "")
        .trim()
        .toLowerCase();

    if (directRole === "owner") {
        document.body.classList.remove(
            "theme-super-admin",
            "theme-admin",
            "theme-user",
            "theme-individual"
        );

        document.body.classList.add("theme-owner");
        document.body.dataset.role = "owner";
        return;
    }
    const body = document.body;

    const normalizedRole = String(role || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", "-");

    const normalizedAccountType = String(accountType || "")
        .trim()
        .toLowerCase();

    body.classList.remove(
        "theme-owner",
        "theme-super-admin",
        "theme-admin",
        "theme-user",
        "theme-individual"
    );

   if (normalizedRole === "owner") {
    body.classList.remove(
        "theme-super-admin",
        "theme-admin",
        "theme-user",
        "theme-individual"
    );

    body.classList.add("theme-owner");
    body.dataset.role = "owner";
    return;
}

    if (normalizedAccountType === "individual") {
        body.classList.add("theme-individual");
        return;
    }

    if (normalizedRole === "super-admin") {
        body.classList.add("theme-super-admin");
    } else if (normalizedRole === "admin") {
        body.classList.add("theme-admin");
    } else if (normalizedRole === "user") {
    body.classList.add("theme-user");
}
}

function applyRoleVisibility(role, accountType) {
    const normalizedRole = String(role || "user")
        .toLowerCase()
        .replaceAll("-", "_");

    const userManagementMenu =
        document.getElementById("menu-users") ||
        document.getElementById("menu-user-management");

    const usersTab = document.getElementById("users-tab");

    const accountManagementCard =
        document.getElementById("accountManagementCard");
        const isIndividual = String(accountType || "").toLowerCase() === "individual";
    const profileSection = document.querySelector(".profile-section");

if (profileSection) {
    profileSection.style.setProperty(
        "display",
        "block",
        "important"
    );
}
  const canManageAccounts =
    normalizedRole === "owner" ||
    normalizedRole === "admin" ||
    normalizedRole === "super_admin";
    
    /* User Management sidebar tab */
    if (userManagementMenu) {
        userManagementMenu.style.display =
            canManageAccounts ? "block" : "none";
    }

    /* User Management actual page */
    if (usersTab && !canManageAccounts) {
        usersTab.classList.remove("active-tab");
        usersTab.style.display = "none";
    }

    /* Settings → Account Management */
    if (accountManagementCard) {
        accountManagementCard.dataset.roleAllowed =
            canManageAccounts ? "true" : "false";

      accountManagementCard.style.setProperty(
    "display",
    canManageAccounts ? "block" : "none",
    "important"
);
    }

}
const toggleSwitch = document.getElementById("theme-toggle");

if (toggleSwitch) {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark";

    document.body.classList.toggle("dark-mode", isDarkMode);
    toggleSwitch.checked = isDarkMode;

    toggleSwitch.addEventListener("change", function () {
        const darkModeEnabled = this.checked;

        document.body.classList.toggle(
            "dark-mode",
            darkModeEnabled
        );

        localStorage.setItem(
            "theme",
            darkModeEnabled ? "dark" : "light"
        );
    });
}
const colorPicker = document.getElementById("theme-color-picker");
const opacitySlider = document.getElementById("theme-opacity");
const opacityValue = document.getElementById("theme-opacity-value");
const applyThemeBtn = document.getElementById("save-theme-color");
const resetThemeBtn = document.getElementById("reset-theme-color");

function hexToRgb(hex) {
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0,2),16);
    const g = parseInt(hex.substring(2,4),16);
    const b = parseInt(hex.substring(4,6),16);

    return {r,g,b};
}

function getContrastColor(r, g, b) {
    // Theme brightness calculate करता है
    const luminance =
        (0.299 * r) +
        (0.587 * g) +
        (0.114 * b);

    return luminance > 165 ? "#111827" : "#ffffff";
}

function previewTheme() {
    if (!colorPicker || !opacitySlider || !opacityValue) return;

    const rgb = hexToRgb(colorPicker.value);
    const alpha = Number(opacitySlider.value) / 100;
    const textColor = getContrastColor(rgb.r, rgb.g, rgb.b);

    opacityValue.textContent = `${opacitySlider.value}%`;

    document.documentElement.style.setProperty(
        "--theme-rgb",
        `${rgb.r}, ${rgb.g}, ${rgb.b}`
    );

    document.documentElement.style.setProperty(
        "--theme-alpha",
        alpha
    );

    document.documentElement.style.setProperty(
        "--primary-color",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
    );

    document.documentElement.style.setProperty(
        "--theme-text-color",
        textColor
    );

    document.documentElement.style.setProperty(
        "--theme-muted-text",
        textColor === "#ffffff"
            ? "rgba(255, 255, 255, 0.76)"
            : "rgba(17, 24, 39, 0.72)"
    );

    document.documentElement.style.setProperty(
        "--glass-background",
        textColor === "#ffffff"
            ? "rgba(15, 23, 42, 0.24)"
            : "rgba(255, 255, 255, 0.23)"
    );

    document.documentElement.style.setProperty(
        "--glass-background-hover",
        textColor === "#ffffff"
            ? "rgba(255, 255, 255, 0.14)"
            : "rgba(255, 255, 255, 0.42)"
    );

    document.documentElement.style.setProperty(
        "--glass-border",
        textColor === "#ffffff"
            ? "rgba(255, 255, 255, 0.22)"
            : "rgba(255, 255, 255, 0.58)"
    );
}


colorPicker.addEventListener("input", previewTheme);

opacitySlider.addEventListener("input", previewTheme);

applyThemeBtn.addEventListener("click", () => {
    localStorage.setItem("themeColor", colorPicker.value);
    localStorage.setItem("themeOpacity", opacitySlider.value);
    localStorage.setItem("customThemeEnabled", "true");

    document.documentElement.classList.add("custom-theme-active");

    previewTheme();
});


// resetThemeBtn.addEventListener("click", () => {
//     // Remove saved custom theme
//     localStorage.removeItem("themeColor");
//     localStorage.removeItem("themeOpacity");
//     localStorage.removeItem("customThemeEnabled");

//     // Reset picker UI
//     colorPicker.value = "#2563eb";
//     opacitySlider.value = 100;
//     opacityValue.textContent = "100%";

//     // Remove all custom inline theme variables
//     document.documentElement.style.removeProperty("--theme-rgb");
//     document.documentElement.style.removeProperty("--theme-alpha");
//     document.documentElement.style.removeProperty("--primary-color");
//     document.documentElement.style.removeProperty("--theme-text-color");
//     document.documentElement.style.removeProperty("--theme-muted-text");
//     document.documentElement.style.removeProperty("--glass-background");
//     document.documentElement.style.removeProperty("--glass-background-hover");
//     document.documentElement.style.removeProperty("--glass-border");

//     // Turn off custom theme class
//     document.documentElement.classList.remove("custom-theme-active");
// });


// const savedColor = localStorage.getItem("themeColor");

// const savedOpacity = localStorage.getItem("themeOpacity");

// if(savedColor){

//     colorPicker.value=savedColor;

// }

// if(savedOpacity){

//     opacitySlider.value=savedOpacity;

// }
// const customThemeEnabled =
//     localStorage.getItem("customThemeEnabled") === "true";

// if (customThemeEnabled) {
//     document.documentElement.classList.add("custom-theme-active");
//     previewTheme();
// } else {
//     document.documentElement.classList.remove("custom-theme-active");
// }


        // ================= Pomodoro Timer =================
let time = 30*60;
let timer;
let running = false;
let currentSessionMinites = 30;

function updateTimer() {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    document.getElementById("timer").innerHTML =
        String(min).padStart(2, "0") + ":" +
        String(sec).padStart(2, "0");
}

function startTimer() {
    // Stopwatch चल रहा हो तो पहले stop करो
    if (swInterval) {
        stopStopwatch();
    }

    if (running) return;

    running = true;

    timer = setInterval(() => {
        if (time > 0) {
            time--;
            updateTimer();
        } else {
            clearInterval(timer);
            timer = null;
            running = false;

            pomodoroCount++;
            completedMinutes += currentSessionMinutes;

            updateGoal();
            saveStudySession(currentSessionMinutes, "timer");
            updateStreak();
            saveDailyStudy(currentSessionMinutes);
            updateAnalysis();

            alert("🎉 Pomodoro Completed! Great Job!");

            time = currentSessionMinutes * 60;
            updateTimer();
        }
    }, 1000);
}


function pauseTimer() {
    clearInterval(timer);
    running = false;
}

function resetTimer() {
    clearInterval(timer);
    running = false;
   time = currentSessionMinutes * 60;
    updateTimer();
}

function setTimer(){

    let minutes = Number(document.getElementById("timerInput").value);

    currentSessionMinutes = minutes;

    time = minutes * 60;

    updateTimer();
}

updateTimer();


// ================= Stopwatch =================
let swTime = 0;
let swInterval;

function updateStopwatch() {
    let hrs = Math.floor(swTime / 3600);
    let mins = Math.floor((swTime % 3600) / 60);
    let secs = swTime % 60;

    document.getElementById("stopwatch").innerHTML =
        String(hrs).padStart(2, "0") + ":" +
        String(mins).padStart(2, "0") + ":" +
        String(secs).padStart(2, "0");
}

function startStopwatch() {
    // Pomodoro चल रहा हो तो पहले pause करो
    if (running) {
        pauseTimer();
    }

    if (swInterval) return;

    swInterval = setInterval(() => {
        swTime++;
        updateStopwatch();
    }, 1000);
}

function stopStopwatch() {
    if (!swInterval) return;

    clearInterval(swInterval);
    swInterval = null;

    if (swTime > 0) {
        const stopwatchMinutes = swTime / 60;

        completedMinutes += stopwatchMinutes;

        saveStudySession(stopwatchMinutes, "stopwatch");
        updateGoal();
        updateAnalysis();
    }
}
function resetStopwatch() {
    stopStopwatch();
    swTime = 0;
    updateStopwatch();
}

updateStopwatch();
// ========== Goal Tracker ==========

let goalHours = Number(localStorage.getItem("goalHours")) || 6;

let goalMinutes = goalHours * 60;



// 6 Hours = 360 Minutes
    let completedMinutes = Number(localStorage.getItem("completedMinutes")) || 0;
let pomodoroCount = 0;

function updateGoal() {

    let percent = (completedMinutes / goalMinutes) * 100;

    if (percent > 100) percent = 100;

    let hrs = Math.floor(completedMinutes / 60);
    let mins = completedMinutes % 60;
    document.getElementById("goal-hours").innerHTML =
    "Completed : " + hrs + "h " + mins + "m / " + goalHours + "h";

    document.getElementById("goal-percent").innerHTML =
        Math.round(percent) + "% Completed";

    document.getElementById("goal-progress").style.width =
        percent + "%";
        localStorage.setItem("completedMinutes", completedMinutes);
        updateAnalysis();
}
async function updateAnalysis() {
    const userId = await getCurrentUserId();

    if (!userId) {
        console.error("Could not identify current user for analysis");
        return;
    }

    const sessionsKey = `studySessions_${userId}`;

    const sessions = JSON.parse(
        localStorage.getItem(sessionsKey) || "[]"
    );
    const validSessions = sessions.filter((session) => {
        const minutes = Number(session.minutes);
        const date = new Date(session.date);

        return minutes > 0 && !Number.isNaN(date.getTime());
    });

    function getLocalDateKey(dateValue) {
        const date = new Date(dateValue);

        return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0")
        );
    }

    function formatStudyTime(minutesValue) {
        const totalSeconds = Math.max(
            0,
            Math.round(Number(minutesValue || 0) * 60)
        );

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        if (minutes > 0) {
            return seconds > 0
                ? `${minutes}m ${seconds}s`
                : `${minutes}m`;
        }

        return `${seconds}s`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = getLocalDateKey(today);

    const todaySessions = validSessions.filter((session) => {
        return getLocalDateKey(session.date) === todayKey;
    });

    const todayMinutes = todaySessions.reduce((total, session) => {
        return total + Number(session.minutes);
    }, 0);

    /*
     * Progress Report के existing goal logic को
     * आज के study time के साथ synchronized रखता है।
     */
    completedMinutes = todayMinutes;

    const todayStudyText = formatStudyTime(todayMinutes);

    const totalStudyElement =
        document.getElementById("total-study");

    if (totalStudyElement) {
        totalStudyElement.textContent = todayStudyText;
    }

    const focusedTimeMetric =
        document.getElementById("focusedTimeMetric");

    if (focusedTimeMetric) {
        focusedTimeMetric.textContent = todayStudyText;
    }

    const studyTimeStatus =
        document.getElementById("studyTimeStatus");

    if (studyTimeStatus) {
        studyTimeStatus.textContent =
            todayMinutes > 0
                ? `${todaySessions.length} session${
                      todaySessions.length === 1 ? "" : "s"
                  } recorded today`
                : "Pomodoro + Stopwatch";
    }

    /*
     * Focus Sessions
     */
    const sessionCount = todaySessions.length;

    const analysisSessions =
        document.getElementById("analysisSessions");

    const sessionMetric =
        document.getElementById("sessionMetric");

    if (analysisSessions) {
        analysisSessions.textContent = sessionCount;
    }

    if (sessionMetric) {
        sessionMetric.textContent = sessionCount;
    }

    /*
     * Productivity Score
     */
    const safeGoalMinutes =
        Number(goalMinutes) > 0
            ? Number(goalMinutes)
            : 60;

    let productivity = Math.round(
        (todayMinutes / safeGoalMinutes) * 100
    );

    productivity = Math.min(
        Math.max(productivity, 0),
        100
    );

    const productivityElement =
        document.getElementById("productivity");

    const productivityGaugeValue =
        document.getElementById("productivityGaugeValue");

    const goalProgressMetric =
        document.getElementById("goalProgressMetric");

    if (productivityElement) {
        productivityElement.textContent = `${productivity}%`;
    }

    if (productivityGaugeValue) {
        productivityGaugeValue.textContent = `${productivity}%`;
    }

    if (goalProgressMetric) {
        goalProgressMetric.textContent = `${productivity}%`;
    }

    const productivityStatus =
        document.getElementById("productivityStatus");

    const productivityGaugeLabel =
        document.getElementById("productivityGaugeLabel");

    let productivityMessage = "No activity recorded yet";

    if (productivity >= 100) {
        productivityMessage = "Daily goal completed";
    } else if (productivity >= 75) {
        productivityMessage = "Excellent progress";
    } else if (productivity >= 50) {
        productivityMessage = "Good momentum";
    } else if (productivity > 0) {
        productivityMessage = "Keep building momentum";
    }

    if (productivityStatus) {
        productivityStatus.textContent = productivityMessage;
    }

    if (productivityGaugeLabel) {
        productivityGaugeLabel.textContent =
            productivityMessage;
    }

    const productivityRing =
        document.getElementById("productivityRing");

    if (productivityRing) {
        const circumference = 590.62;

        productivityRing.style.strokeDashoffset =
            circumference -
            (circumference * productivity) / 100;
    }

    /*
     * Study Streak
     */
    const studiedDateKeys = [
        ...new Set(
            validSessions.map((session) =>
                getLocalDateKey(session.date)
            )
        )
    ].sort().reverse();

    let streak = 0;

    const expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const studiedDateKey of studiedDateKeys) {
        const expectedKey = getLocalDateKey(expectedDate);

        if (studiedDateKey === expectedKey) {
            streak++;

            expectedDate.setDate(
                expectedDate.getDate() - 1
            );
        } else {
            break;
        }
    }

    const streakText =
        `${streak} ${streak === 1 ? "Day" : "Days"}`;

    const streakElement =
        document.getElementById("streak");

    const currentStreakValue =
        document.getElementById("currentStreakValue");

    if (streakElement) {
        streakElement.textContent = streakText;
    }

    if (currentStreakValue) {
        currentStreakValue.textContent = streakText;
    }

    const streakStatus =
        document.getElementById("streakStatus");

    const streakMessage =
        document.getElementById("streakMessage");

    let streakMessageText =
        "Study today to begin your streak";

    if (streak > 0) {
        streakMessageText =
            streak === 1
                ? "Great start — return tomorrow to continue."
                : `Strong consistency — ${streak} study days in a row.`;
    }

    if (streakStatus) {
        streakStatus.textContent = streakMessageText;
    }

    if (streakMessage) {
        streakMessage.textContent = streakMessageText;
    }

    /*
     * Weekly Report: Monday to Sunday
     */
    const dayNames = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];

    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

    const monday = new Date(today);

    const currentDay = today.getDay();

    const mondayOffset =
        currentDay === 0
            ? -6
            : 1 - currentDay;

    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    validSessions.forEach((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        const differenceInDays = Math.floor(
            (sessionDate - monday) /
            (1000 * 60 * 60 * 24)
        );

        if (
            differenceInDays >= 0 &&
            differenceInDays < 7
        ) {
            weeklyMinutes[differenceInDays] +=
                Number(session.minutes);
        }
    });

    const weeklyChart =
        document.getElementById("weeklyChart");

    if (weeklyChart) {
        const maxMinutes = Math.max(...weeklyMinutes, 1);

        weeklyChart.innerHTML = weeklyMinutes
            .map((minutes, index) => {
                const height =
                    minutes > 0
                        ? Math.max(
                              (minutes / maxMinutes) * 100,
                              8
                          )
                        : 2;

                return `
                    <div class="weekly-bar-item">
                        <div class="weekly-minutes">
                            ${formatStudyTime(minutes)}
                        </div>

                        <div class="weekly-bar-track">
                            <div
                                class="weekly-bar-fill"
                                style="height: ${height}%"
                            ></div>
                        </div>

                        <div class="weekly-day">
                            ${dayNames[index]}
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    /*
     * Weekly Summary
     */
    const weeklyTotalMinutes = weeklyMinutes.reduce(
        (total, minutes) => total + minutes,
        0
    );

    const activeStudyDays =
        weeklyMinutes.filter((minutes) => minutes > 0).length;

    const averageMinutes =
        activeStudyDays > 0
            ? weeklyTotalMinutes / activeStudyDays
            : 0;

    const bestDayMinutes = Math.max(...weeklyMinutes);

    const bestDayIndex =
        bestDayMinutes > 0
            ? weeklyMinutes.indexOf(bestDayMinutes)
            : -1;

    const weeklyTotal =
        document.getElementById("weeklyTotal");

    const dailyAverage =
        document.getElementById("dailyAverage");

    const bestStudyDay =
        document.getElementById("bestStudyDay");

    if (weeklyTotal) {
        weeklyTotal.textContent =
            formatStudyTime(weeklyTotalMinutes);
    }
if (dailyAverage) {
    dailyAverage.textContent =
        formatStudyTime(averageMinutes);
}

if (bestStudyDay) {
    bestStudyDay.textContent =
        bestDayIndex >= 0
            ? dayNames[bestDayIndex]
            : "--";
}
    if (dailyAverage) {
        dailyAverage.textContent =
            formatStudyTime(averageMinutes);
    }

    if (bestStudyDay) {
        bestStudyDay.textContent =
            bestDayIndex >= 0
                ? dayNames[bestDayIndex]
                : "—";
    }

    /*
     * Weekly Streak Indicators
     */
    document
        .querySelectorAll(".streak-day")
        .forEach((element, index) => {
            element.classList.toggle(
                "completed",
                weeklyMinutes[index] > 0
            );

            element.classList.toggle(
                "active",
                index === differenceFromMonday(today, monday)
            );
        });

    function differenceFromMonday(date, mondayDate) {
        return Math.floor(
            (date - mondayDate) /
            (1000 * 60 * 60 * 24)
        );
    }
}

    if(productivity > 100){
        productivity = 100;
    }

    document.getElementById("productivity").innerHTML =
        productivity + "%";

// Study Streak from actual Timer + Stopwatch sessions

async function saveGoal() {
    const userId = await getCurrentUserId();

    if (!userId) {
        alert("Could not identify current account.");
        return;
    }

    const input = document.getElementById("goalInput");
    const newGoalHours = Number(input?.value);

    if (
        !Number.isFinite(newGoalHours) ||
        newGoalHours <= 0
    ) {
        alert("Please enter a valid daily goal.");
        return;
    }

    goalHours = newGoalHours;
    goalMinutes = goalHours * 60;

    localStorage.setItem(
        `goalHours_${userId}`,
        String(goalHours)
    );

    updateGoal();
    await updateAnalysis();
}

document.getElementById("goalInput").value = goalHours;

updateGoal();
updateAnalysis();
const logoutBtn = document.getElementById("logoutBtn");


if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        window.location.href = "/logout";
    });
}
function saveDisplayName() {

    const name = document.getElementById("displayName").value.trim();

    if (name === "") {
        alert("Please enter a display name.");
        return;
    }

    localStorage.setItem("displayName", name);

    document.getElementById("welcomeName").textContent = name;

  
}



 // Load saved name when page opens

window.addEventListener("load", () => {
    const savedName = null;

    if (savedName) {
        document.getElementById("welcomeName").innerHTML = savedName;
        document.getElementById("displayName").value = savedName;
    }
});
const profileImageInput = document.getElementById("profileImageInput");
const profileImagePreview = document.getElementById("profileImagePreview");

if (profileImageInput) {
    profileImageInput.addEventListener("change", function () {

        const file = this.files[0];

   localStorage.setItem(
    "profileImage_" + localStorage.getItem("userEmail"),
    e.target.result
);
 reader.onload = function (e) {
    profileImagePreview.src = e.target.result;
    profileImagePreview.style.display = "block";

    localStorage.setItem(
        "profileImage_" + localStorage.getItem("userEmail"),
        e.target.result
    );
};

reader.readAsDataURL(file);
});
}

// Load saved image
window.addEventListener("load", function () {

    // const savedImage = localStorage.getItem("profileImage");
const savedImage = localStorage.getItem("profileImage_" + localStorage.getItem("userEmail"));

    if (savedImage) {
        profileImagePreview.src = savedImage;
        profileImagePreview.style.display = "block";
    }
else {
    profileImagePreview.src = "";
    profileImagePreview.style.display = "none";
}
});
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordModal = document.getElementById("passwordModal");
const closePasswordBtn = document.getElementById("closePasswordBtn");

changePasswordBtn.addEventListener("click", () => {
    passwordModal.style.display = "flex";
});

// 
if (closePasswordBtn) {
    closePasswordBtn.addEventListener("click", () => {
        passwordModal.style.display = "none";
    });
}
// Modal ke bahar click karne par bhi close ho
window.addEventListener("click", (e) => {
    if (e.target === passwordModal) {
        passwordModal.style.display = "none";
    }
});
const savePasswordBtn = document.getElementById("savePasswordBtn");
if (savePasswordBtn) {
savePasswordBtn.addEventListener("click", async () => {

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    const response = await fetch("/change-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
        })
    });

    const data = await response.json();

    alert(data.message);

    if (data.success) {
        passwordModal.style.display = "none";

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
    }

});
}
document.getElementById("changePasswordBtn").addEventListener("click", function () {
    document.getElementById("passwordSection").style.display = "block";
});

async function changePassword() {
    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    try {
        const response = await fetch("/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {
            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        }
    } catch (error) {
        alert("Server connection failed.");
    }
}
function saveStudentProfile() {
    const enrollmentNumber =
        document.getElementById("enrollmentNumber").value;

    const branch =
        document.getElementById("branch").value;

    const semester =
        document.getElementById("semester").value;

    const mobileNumber =
        document.getElementById("mobileNumber").value;

    const studentEmail =
        document.getElementById("studentEmail").value;

    if (
        enrollmentNumber === "" ||
        branch === "" ||
        semester === "" ||
        mobileNumber === "" ||
        studentEmail === ""
    ) {
        alert("Please fill all profile fields.");
        return;
    }

    localStorage.setItem("enrollmentNumber", enrollmentNumber);
    localStorage.setItem("branch", branch);
    localStorage.setItem("semester", semester);
    localStorage.setItem("mobileNumber", mobileNumber);
    localStorage.setItem("studentEmail", studentEmail);
    
    alert("Student profile saved successfully!");
    loadDashboardProfile();
}
window.addEventListener("load", function () {

    document.getElementById("enrollmentNumber").value =
        localStorage.getItem("enrollmentNumber") || "";

    document.getElementById("branch").value =
        localStorage.getItem("branch") || "";

    document.getElementById("semester").value =
        localStorage.getItem("semester") || "";

    document.getElementById("mobileNumber").value =
        localStorage.getItem("mobileNumber") || "";

    document.getElementById("studentEmail").value =
        localStorage.getItem("studentEmail") || "";

});
function searchNotice() {

    const input = document.getElementById("noticeSearch").value.toLowerCase();

    const notices = document.querySelectorAll(".notice-item");

    notices.forEach((notice) => {

        if (notice.innerText.toLowerCase().includes(input)) {
            notice.style.display = "block";
        } else {
            notice.style.display = "none";
        }

    });

}
let attendanceData = [];

// async function addAttendance(){

//     const subject = document.getElementById("subjectName").value;
//     const total = Number(document.getElementById("totalClasses").value);
//     const attended = Number(document.getElementById("attendedClasses").value);

//    if (
//     subject === "" ||
//     total <= 0 ||
//     attended < 0 ||
//     attended > total
// ) {
//     alert("Please enter correct details. Attended classes cannot be more than total classes.");
//     return;
// }
//         alert("Please fill correct details");
//         return;
//     }
async function addAttendance() {
    const studentEmail = document
        .getElementById("studentEmail")
        .value
        .trim();

    const subject = document
        .getElementById("subjectName")
        .value
        .trim();

    const total = Number(
        document.getElementById("totalClasses").value
    );

    const attended = Number(
        document.getElementById("attendedClasses").value
    );

    if (!studentEmail) {
        alert("Please select a student.");
        return;
    }

    if (!subject) {
        alert("Please enter subject name.");
        return;
    }

    if (
        !Number.isFinite(total) ||
        !Number.isFinite(attended) ||
        total <= 0 ||
        attended < 0 ||
        attended > total
    ) {
        alert(
            "Please enter valid attendance. Attended classes cannot be more than total classes."
        );
        return;
    }

    try {
        const response = await fetch("/api/attendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student_email: studentEmail,
                subject: subject,
                total_classes: total,
                attended_classes: attended
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Unable to save attendance.");
            return;
        }

        alert("Attendance saved successfully.");

        document.getElementById("subjectName").value = "";
        document.getElementById("totalClasses").value = "";
        document.getElementById("attendedClasses").value = "";

        if (typeof loadAttendance === "function") {
            await loadAttendance();
        }
    } catch (error) {
        console.error("Attendance API error:", error);
        alert("API Error: " + error.message);
    }
}


async function loadAttendance() {
    try {
        const response = await fetch("/api/attendance");
        const data = await response.json();
        alert("Loaded records: " + data.attendance.length);

        if (!data.success) return;

        const table = document.getElementById("attendanceTable");
        table.innerHTML = "";

        data.attendance.forEach(item => {
            const percentage = Math.round(
                (item.attended_classes / item.total_classes) * 100
            );

            table.innerHTML += `
                <tr>
                    <td>${item.subject}</td>
                    <td>${item.total_classes}</td>
                    <td>${item.attended_classes}</td>
                    <td>${percentage}%</td>
                    <td>
<button type="button" class="attendance-delete-btn" onclick="deleteAttendance(${item.id})">Delete</button>                    </td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error("Attendance load error:", error);
    }
}
async function deleteAttendance(id) {
    try {
     const response = await fetch(`http://localhost:3001/api/attendance/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Failed to delete attendance.");
            return;
        }

        // Reload attendance from database
        loadAttendance();

    } catch (error) {
        console.error("Delete attendance error:", error);
        alert("Something went wrong while deleting.");
    }
}

function saveTimetable() {

    let timetable = document.querySelector("#timetable-tab table").innerHTML;

    localStorage.setItem("timetableData", timetable);

    alert("Timetable Saved Successfully!");

}
async function updateStreak() {
    try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error("Could not load current user for streak");
            return;
        }

        const userId =
            result.userId ||
            result.id ||
            result.user?.id;

        if (!userId) return;

        const streakKey = `studyStreak_${userId}`;
        const lastDateKey = `lastStudyDate_${userId}`;

        const today = new Date().toDateString();

        const lastStudyDate =
            localStorage.getItem(lastDateKey);

        let streak =
            Number(localStorage.getItem(streakKey)) || 0;

        if (lastStudyDate !== today) {
            streak++;

            localStorage.setItem(
                streakKey,
                String(streak)
            );

            localStorage.setItem(
                lastDateKey,
                today
            );
        }

        const streakElement =
            document.getElementById("streak");

        if (streakElement) {
            streakElement.textContent =
                `${streak} Days`;
        }
    } catch (error) {
        console.error("Streak update error:", error);
    }
}
async function saveDailyStudy(minutes) {
    try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error("Could not load current user for study history");
            return;
        }

        const userId =
            result.userId ||
            result.id ||
            result.user?.id;

        if (!userId) return;

        const today = new Date().toDateString();
        const historyKey = `studyHistory_${userId}`;

        const studyHistory = JSON.parse(
            localStorage.getItem(historyKey) || "{}"
        );

        studyHistory[today] =
            Number(studyHistory[today] || 0) + Number(minutes || 0);

        localStorage.setItem(
            historyKey,
            JSON.stringify(studyHistory)
        );
    } catch (error) {
        console.error("Daily study save error:", error);
    }
}

function updateWeeklyChart(){

    let history = getStudyHistory();

    let chart = document.getElementById("weeklyChart");

    chart.innerHTML = "";

    for(let date in history){

        let minutes = history[date];

        let height = minutes * 5;

        chart.innerHTML += `
            <div>
                <div class="study-bar" style="height:${height}px"></div>
                <span>${date.substring(0,3)}</span>
            </div>
        `;
    }

}
//updateWeeklyChart();


async function getCurrentUserId() {
    try {
        const response = await fetch("/api/me");
        const result = await response.json();

        if (!response.ok || !result.success) {
            return null;
        }

        return (
            result.userId ||
            result.id ||
            result.user?.id ||
            null
        );
    } catch (error) {
        console.error("Current user fetch error:", error);
        return null;
    }
}

async function getStudyHistory() {
    const userId = await getCurrentUserId();

    if (!userId) {
        return {};
    }

    const historyKey = `studyHistory_${userId}`;

    try {
        return JSON.parse(
            localStorage.getItem(historyKey) || "{}"
        );
    } catch (error) {
        console.error("Study history parse error:", error);
        return {};
    }
}

async function updateWeeklyChart() {
    const chart = document.getElementById("weeklyChart");

    if (!chart) {
        console.log("Weekly chart not found");
        return;
    }

    const history = await getStudyHistory();

    chart.innerHTML = "";

    const lastSevenDays = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        lastSevenDays.push(date);
    }

    lastSevenDays.forEach((date) => {
        const dateKey = date.toDateString();
        const minutes = Number(history[dateKey] || 0);

        const safeHeight = Math.min(
            Math.max(minutes * 5, 4),
            220
        );

        chart.innerHTML += `
            <div>
                <div
                    class="study-bar"
                    style="height:${safeHeight}px"
                    title="${minutes} minutes"
                ></div>

                <span>
                    ${date.toLocaleDateString("en-US", {
                        weekday: "short"
                    })}
                </span>
            </div>
        `;
    });
}
async function loadDashboardProfile() {
    try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error(
                "Could not load dashboard profile:",
                data.message || "Unknown error"
            );
            return;
        }

       const user = data.user || data.account || data;
       
       const dashboardProfileImage =
    document.getElementById("dashboardProfileImage");

if (dashboardProfileImage) {
  dashboardProfileImage.src =
    user.profile_image || "/uploads/default-profile.png";
}
        document.body.classList.remove(
    "theme-owner",
    "theme-super-admin",
    "theme-admin",
    "theme-user",
    "theme-individual"
);

if (String(user.role || "").trim().toLowerCase() === "owner") {
    document.body.classList.add("theme-owner");
}
        applyRoleTheme(
            user.role,
            user.account_type || user.accountType
        );
document.body.classList.toggle(
    "dark-mode",
    localStorage.getItem("theme") === "dark"
);
        applyRoleVisibility(
            user.role,
            user.account_type || user.accountType
        );

        const setDashboardText = (id, label, value) => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent =
                    `${label}: ${value || "Not Set"}`;
            }
        };

        setDashboardText(
            "dashboardName",
            "Name",
            user.name
        );

        setDashboardText(
            "dashboardBranch",
            "Branch",
            user.branch
        );

        setDashboardText(
            "dashboardSemester",
            "Semester",
            user.semester
        );

        setDashboardText(
            "dashboardEnrollment",
            "Enrollment",
            user.enrollment
        );

        setDashboardText(
            "dashboardEmail",
            "Email",
            user.email
        );

        setDashboardText(
            "dashboardMobile",
            "Mobile",
            user.mobile
        );

        setDashboardText(
            "dashboardProfession",
            "Profession",
            user.profession
        );
    } catch (error) {
        console.error(
            "Dashboard profile loading error:",
            error
        );
    }
}

loadDashboardProfile();

function displayTasks(){

    let list = document.getElementById("taskList");

    list.innerHTML = "";

    if(dailyTasks.length === 0){

        list.innerHTML =
        "<li>No dailyTasks added yet</li>";

        updateTaskProgress();

        return;
    }


   dailyTasks.forEach((task,index)=>{


        list.innerHTML += `

        <li class="${dailyTasks.completed ? "completed":""}"
        onclick="completeTask(${index})">

            ${dailyTasks.name}

        </li>

        `;


    });


    updateTaskProgress();

}



function completeTask(index){

    dailyTasks[index].completed =
    !dailyTasks[index].completed;


    localStorage.setItem(
        "dailyTasks",
        JSON.stringify(dailyTasks)
    );


    // displayTasks();

}



function updateTaskProgress(){

    let total = dailyTasks.length;

    let completed =
    dailyTasks.filter(task=>task.completed).length;


    let percent = 0;


    if(total > 0){

        percent =
        Math.round((completed/total)*100);

    }


    document.getElementById("taskProgress")
    .innerHTML = percent + "%";


    document.getElementById("taskProgressBar")
    .style.width = percent + "%";

}



// displayTasks();
let focusTasks = JSON.parse(localStorage.getItem("focusTasks")) || [];

function saveFocusTasks() {
    localStorage.setItem("focusTasks", JSON.stringify(focusTasks));
}

function renderFocusTasks() {
    const list = document.getElementById("todayFocusList");

    if (!list) return;

    list.innerHTML = "";

    focusTasks.forEach((task, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="focus-task-left">
                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleFocusTask(${index})"
                >

                <span class="${task.completed ? "completed-task" : ""}">
                    ${task.text}
                </span>
            </div>

            <div class="focus-actions">
                <button onclick="editFocusTask(${index})">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button onclick="deleteFocusTask(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(li);
    });
}

function addFocusTask() {
    const input = document.getElementById("focusTaskInput");
    const taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    focusTasks.push({
        text: taskText,
        completed: false
    });

    input.value = "";

    saveFocusTasks();
    renderFocusTasks();
}

function toggleFocusTask(index) {
    focusTasks[index].completed = !focusTasks[index].completed;

    saveFocusTasks();
    renderFocusTasks();
}

function deleteFocusTask(index) {
    focusTasks.splice(index, 1);

    saveFocusTasks();
    renderFocusTasks();
}

function editFocusTask(index) {
    const updatedTask = prompt(
        "Edit task:",
        focusTasks[index].text
    );

    if (updatedTask === null) return;

    const newText = updatedTask.trim();

    if (newText === "") {
        alert("Task cannot be empty.");
        return;
    }

    focusTasks[index].text = newText;

    saveFocusTasks();
    renderFocusTasks();
}
document.addEventListener("DOMContentLoaded", function () {
    renderFocusTasks();

    const input = document.getElementById("focusTaskInput");

    if (input) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                addFocusTask();
            }
        });
    }
});
// document.addEventListener("DOMContentLoaded", function () {
//     loadAttendance();
// });
document.addEventListener("DOMContentLoaded", function () {

    loadAttendance();
});


document.addEventListener("DOMContentLoaded", function () {
//   setupAttendanceRole();  
});
let myPermissions = null;
let myRole = null;

async function loadMyPermissions() {
    try {
        const response = await fetch("/api/my-permissions");
        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Could not load my permissions:", data.message);
            return;
        }

        myPermissions = data.permissions;
        myRole = data.role;
if (myRole === "owner") {
    myPermissions = {
        timetable_view: 1,
        timetable_manage: 1,
        attendance_view: 1,
        attendance_manage: 1,
        notices_view: 1,
        notices_manage: 1,
        users_manage: 1,
        profile_edit: 1
    };
}

        console.log("MY ROLE:", myRole);
        console.log("MY PERMISSIONS:", myPermissions);

    } catch (error) {
        console.error("Permission loading error:", error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await loadMyPermissions();
});
async function uploadProfilePhoto() {
   const fileInput = document.getElementById("profileImageInput");

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("Please select a photo first.");
        return;
    }

    const formData = new FormData();
    formData.append("profile_image", fileInput.files[0]);

    try {
        const response = await fetch("/api/profile/photo", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Could not update profile photo.");
            return;
        }
const profileImage =
    document.getElementById("profileImagePreview");
    

        if (profileImage) {
            profileImage.src =
                data.profile_image + "?t=" + Date.now();
        }

        alert("Profile photo updated successfully.");
    } catch (error) {
        console.error("Profile photo upload error:", error);
        alert("Could not upload profile photo.");
    }
}

// ================================
// ACCOUNT MANAGEMENT
// Owner/Admin user management
// ================================

async function loadManagedUsers() {
    const managerCard =
        document.getElementById("accountManagementCard");

    const usersList =
        document.getElementById("managedUsersBody");

    if (!managerCard || !usersList) return;

    try {
        // Current logged-in account
        const meResponse = await fetch("/api/me");
        const meData = await meResponse.json();

        if (!meResponse.ok || !meData.success) {
            managerCard.style.display = "none";
            return;
        }

        const currentRole = String(
            meData.role || meData.user?.role || ""
        )
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        const accountType = String(
            meData.accountType ||
            meData.account_type ||
            meData.user?.accountType ||
            ""
        )
            .trim()
            .toLowerCase();

        const isIndividual =
            accountType === "individual";

        const userManagementMenu =
            document.getElementById("menu-users");

        const roleBadge =
            document.getElementById("roleBadge");

        if (roleBadge) {
            roleBadge.textContent =
                currentRole
                    .replaceAll("_", " ")
                    .toUpperCase();
        }

        // Individual accounts में management hide
     if (isIndividual && currentRole !== "owner") {
    if (userManagementMenu) {
        userManagementMenu.style.display = "none";
    }

    managerCard.style.display = "none";
    return;
}

        // User role के लिए management hide
        if (
            !["owner", "super_admin", "admin"].includes(
                currentRole
            )
        ) {
            managerCard.style.display = "none";
            return;
        }

        managerCard.style.display = "block";

        // Role dropdown restrictions
        const roleSelect =
            document.getElementById("newUserRole");

        if (roleSelect) {
            if (currentRole === "owner") {
                roleSelect.innerHTML = `
                    <option value="user">
                        User / Student
                    </option>
                    <option value="admin">
                        Administrator
                    </option>
                    <option value="super_admin">
                        Super Admin
                    </option>
                `;
            } else if (currentRole === "super_admin") {
                roleSelect.innerHTML = `
                    <option value="user">
                        User / Student
                    </option>
                    <option value="admin">
                        Administrator
                    </option>
                `;
            } else if (currentRole === "admin") {
                roleSelect.innerHTML = `
                    <option value="user">
                        User / Student
                    </option>
                `;
            }

            if (typeof toggleStudentFields === "function") {
                toggleStudentFields();
            }
        }

        // Users load
        const response = await fetch("/api/users");
        const data = await response.json();

        if (!response.ok || !data.success) {
            usersList.innerHTML = `
                <tr>
                    <td colspan="5">
                        ${data.message || "Could not load users"}
                    </td>
                </tr>
            `;
            return;
        }

        const users = Array.isArray(data.users)
            ? data.users
            : [];
        allManagedUsers = users;
managedUsersCurrentRole = currentRole;

        if (users.length === 0) {
            usersList.innerHTML = `
                <tr>
                    <td colspan="5">
                        No users found.
                    </td>
                </tr>
            `;
            return;
        }

        usersList.innerHTML = "";

        const visibleUsers = users.slice(0, 5);

        visibleUsers.forEach((user) => {
            const userRole = String(user.role || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

            const isRestricted =
                currentRole === "admin" &&
                userRole === "super_admin";

            const row = document.createElement("tr");

            row.className = "managed-user-row";

            row.innerHTML = `
                <td>${user.name || "No Name"}</td>
                <td>${user.email || "-"}</td>
                <td>${user.role || "user"}</td>
                <td>${user.status || "pending"}</td>

                <td>
                    ${
                        isRestricted
                            ? `
                                <span class="restricted-text">
                                    Restricted
                                </span>
                            `
                            : `
                                <button
                                    type="button"
                                    class="manage-account-btn"
                                    onclick="openUserManager(${user.id})"
                                >
                                    Manage Account
                                </button>
                            `
                    }
                </td>
            `;

            usersList.appendChild(row);
        });
    } catch (error) {
        console.error(
            "Load managed users error:",
            error
        );

        usersList.innerHTML = `
            <tr>
                <td colspan="5">
                    Could not load users.
                </td>
            </tr>
        `;
    }
}

const showAllManagedUsersBtn = document.getElementById("showAllManagedUsersBtn");

if (showAllManagedUsersBtn) {
 showAllManagedUsersBtn.addEventListener("click", async () => {
    const usersList = document.getElementById("managedUsersBody");

    usersList.innerHTML = "";

    registeredUsers.forEach(user => {
      usersList.innerHTML += `
        <tr>
          <td>${user.name || "-"}</td>
          <td>${user.email || "-"}</td>
          <td>${user.role || "-"}</td>
    <td>
    ${
        currentLoggedInRole === "admin" &&
        String(user.role || "").trim().toLowerCase() === "super_admin"
            ? `<span>Restricted</span>`
            : `
                <button
                    type="button"
                    class="primary-btn"
                    onclick="openUserManager(${user.id})"
                >
                    Manage
                </button>
            `
    }
</td>

        </tr>
      `;
    });

    showAllManagedUsersBtn.style.display = "none";
  });
}
async function changeManagedUserPassword(userId = managedUserId) {
    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
        alert("Please select a valid user first.");
        return;
    }

    const newPassword = prompt(
        "Enter new password (minimum 6 characters):"
    );

    if (!newPassword) return;

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        const response = await fetch(
            `/api/users/${numericUserId}/password`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: newPassword
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Could not change password.");
            return;
        }

        alert(data.message || "Password changed successfully.");
    } catch (error) {
        console.error("Managed password change error:", error);
        alert("Could not change password.");
    }
}

async function deleteManagedUser(userId) {

    const confirmed = confirm(
        "Are you sure you want to remove this account?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message || "Done");

        if (response.ok && data.success) {
            loadManagedUsers();
        }

    } catch (error) {

        console.error(error);
        alert("Could not remove account.");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    loadManagedUsers();
});
let selectedPermissionUserId = null;
async function openPermissions(userId, userName) {
    selectedPermissionUserId = userId;

    const modal = document.getElementById("permissionsModal");
    const title = document.getElementById("permissionsTitle");

    if (!modal) return;
  document.body.appendChild(modal);

modal.setAttribute(
    "style",
    `
    display:flex !important;
    position:fixed !important;
    inset:0 !important;
    width:100vw !important;
    height:100vh !important;
    align-items:center !important;
    justify-content:center !important;
    background:rgba(0,0,0,0.75) !important;
    z-index:2147483647 !important;
    padding:30px !important;
    box-sizing:border-box !important;
    `
);

const box = modal.querySelector(".modal-content");

if (box) {
    box.setAttribute(
        "style",
        `
        display:block !important;
        position:relative !important;
        width:750px !important;
        max-width:90vw !important;
        max-height:85vh !important;
        overflow:auto !important;
        padding:35px !important;
        background:#17233b !important;
        color:white !important;
        border-radius:16px !important;
        box-shadow:0 20px 60px rgba(0,0,0,.6) !important;
        `
    );
}


    try {
        const response = await fetch(`/api/users/${userId}/permissions`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Could not load permissions.");
            return;
        }

        const p = data.permissions;

        document.getElementById("permTimetableView").checked = !!p.timetable_view;
        document.getElementById("permTimetableManage").checked = !!p.timetable_manage;

        document.getElementById("permAttendanceView").checked = !!p.attendance_view;
        document.getElementById("permAttendanceManage").checked = !!p.attendance_manage;

        document.getElementById("permNoticesView").checked = !!p.notices_view;
        document.getElementById("permNoticesManage").checked = !!p.notices_manage;

        document.getElementById("permUsersManage").checked = !!p.users_manage;
        document.getElementById("permProfileEdit").checked = !!p.profile_edit;

        title.textContent = `Manage Permissions - ${userName || "User"}`;

        modal.style.setProperty("display", "flex", "important");

    } catch (error) {
        console.error("Load permissions error:", error);
        alert("Could not load permissions.");
    }
}
function openCurrentManagedUserPermissions() {
    if (!managedUserId) {
        alert("No user selected.");
        return;
    }

    selectedPermissionUserId = managedUserId;

    const modal = document.getElementById("permissionsModal");

    if (!modal) {
        alert("Permissions modal not found.");
        return;
    }

    modal.style.display = "flex";
}

function closePermissionsModal() {
    const modal = document.getElementById("permissionsModal");

    if (modal) {
        modal.style.display = "none";
    }

    selectedPermissionUserId = null;
}
async function savePermissions() {
    selectedPermissionUserId = managedUserId;

    if (!selectedPermissionUserId) {
        alert("No user selected.");
        return;
    }

    const permissions = {
        timetable_view: document.getElementById("permTimetableView").checked,
        timetable_manage: document.getElementById("permTimetableManage").checked,

        attendance_view: document.getElementById("permAttendanceView").checked,
        attendance_manage: document.getElementById("permAttendanceManage").checked,

        notices_view: document.getElementById("permNoticesView").checked,
        notices_manage: document.getElementById("permNoticesManage").checked,

        users_manage: document.getElementById("permUsersManage").checked,
        profile_edit: document.getElementById("permProfileEdit").checked
    };

    try {
        const response = await fetch(
            `/api/users/${selectedPermissionUserId}/permissions`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(permissions)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Could not save permissions.");
            return;
        }

        alert("Permissions saved successfully.");
        closePermissionsModal();

    } catch (error) {
        console.error("Save permissions error:", error);
        alert("Could not save permissions.");
    }
}
async function approveManagedUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/approve`, {
            method: "PATCH"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to approve user.");
            return;
        }

        alert("User approved successfully.");

        if (typeof loadManagedUsers === "function") {
            loadManagedUsers();
        } else {
            location.reload();
        }

    } catch (error) {
        console.error("Approve user error:", error);
        alert("Something went wrong while approving user.");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const settingsTab = document.getElementById("settings-tab");
    const accountManagementCard =
        document.getElementById("accountManagementCard");

    if (settingsTab && accountManagementCard) {
        settingsTab.appendChild(accountManagementCard);
    }
});
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector("i");

    if (!input || !icon) return;

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    icon.classList.toggle("fa-eye", !isHidden);
    icon.classList.toggle("fa-eye-slash", isHidden);

    button.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
    );
}
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    sidebar.addEventListener(
        "wheel",
        function (event) {
            if (window.innerWidth <= 1024) {
                event.preventDefault();

                sidebar.scrollLeft +=
                    event.deltaY !== 0
                        ? event.deltaY
                        : event.deltaX;
            }
        },
        { passive: false }
    );
});
document.addEventListener("DOMContentLoaded", function () {
    const bellButton = document.getElementById("notificationBellBtn");
  
    const notificationBoard = document.getElementById("notificationBoard");
    const closeButton = document.getElementById("notificationCloseBtn");
  console.log(bellButton, notificationBoard, closeButton);
    if (!bellButton || !notificationBoard || !closeButton) return;
    bellButton.onclick = function () {
    notificationBoard.classList.toggle("active");
    document.body.classList.toggle("notification-open");
};
bellButton.addEventListener("click", function () {
    notificationBoard.classList.add("active");
    document.body.classList.add("notification-open");

    loadNotifications();
});
    closeButton.addEventListener("click", function () {
        notificationBoard.classList.remove("active");
        document.body.classList.remove("notification-open");
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("notificationSearch");
    const notificationItems =
        document.querySelectorAll(".notification-item");

    if (!searchInput || notificationItems.length === 0) return;

    searchInput.addEventListener("input", function () {
        const query = searchInput.value
            .toLowerCase()
            .trim();

        notificationItems.forEach((item) => {
            const searchableText =
                item.textContent.toLowerCase();

            item.style.display =
                searchableText.includes(query)
                    ? ""
                    : "none";
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons =
        document.querySelectorAll(".notification-filter");

    const notificationItems =
        document.querySelectorAll(".notification-item");

    if (!filterButtons.length || !notificationItems.length) return;

    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            filterButtons.forEach((btn) =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            const selectedFilter =
                button.textContent.toLowerCase().trim();

            notificationItems.forEach((item) => {
                const category =
                    item.dataset.category?.toLowerCase() || "";

                const isUnread =
                    item.classList.contains("unread");

                let shouldShow = false;

                if (selectedFilter === "all") {
                    shouldShow = true;
                } else if (selectedFilter === "unread") {
                    shouldShow = isUnread;
                } else if (selectedFilter === "requests") {
                    shouldShow = category === "request";
                } else if (selectedFilter === "system") {
                    shouldShow = category === "system";
                } else if (selectedFilter === "security") {
                    shouldShow = category === "security";
                }

                item.style.display = shouldShow ? "" : "none";
            });
        });
    });
});
 let allNotifications = [];
let activeNotificationFilter = "all";
let notificationSearchText = "";

function escapeNotificationHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatNotificationTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeNotificationHTML(value);
    }

    return date.toLocaleString();
}

function getVisibleNotifications() {
    const searchText = notificationSearchText.trim().toLowerCase();

    return allNotifications.filter((notification) => {
        const category = String(
            notification.category || "system"
        ).toLowerCase();

        const isUnread =
            Number(notification.is_read) === 0 ||
            notification.is_read === false;

        const matchesFilter =
            activeNotificationFilter === "all" ||
            (
                activeNotificationFilter === "unread" &&
                isUnread
            ) ||
            category === activeNotificationFilter;

        const searchableText = [
            notification.title,
            notification.message,
            notification.category,
            notification.priority
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            !searchText ||
            searchableText.includes(searchText);

        return matchesFilter && matchesSearch;
    });
}

function updateNotificationBadge() {
    const badge =
        document.getElementById("notificationBadge");

    if (!badge) return;

    const unreadCount = allNotifications.filter(
        (notification) =>
            Number(notification.is_read) === 0 ||
            notification.is_read === false
    ).length;

    badge.textContent =
        unreadCount > 99 ? "99+" : String(unreadCount);

    badge.style.display =
        unreadCount > 0 ? "flex" : "none";
}

function renderNotifications() {
    const notificationList =
        document.getElementById("notificationList");

    if (!notificationList) return;

    const visibleNotifications =
        getVisibleNotifications();

    notificationList.innerHTML = "";

    if (visibleNotifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fa-regular fa-bell"></i>
                <h3>No matching notifications</h3>
                <p>Try changing the search or selected filter.</p>
            </div>
        `;

        return;
    }

    visibleNotifications.forEach((notification) => {
        const item = document.createElement("div");

        const notificationId =
            Number(notification.id);

        const isUnread =
            Number(notification.is_read) === 0 ||
            notification.is_read === false;

        const category =
            String(
                notification.category || "system"
            ).toLowerCase();

        item.className =
            `notification-item ${isUnread ? "unread" : "read"}`;

        item.dataset.id =
            String(notificationId);

        item.dataset.category =
            category;

        item.dataset.read =
            isUnread ? "false" : "true";

        item.innerHTML = `
            <div class="notification-icon">
                <i class="fa-solid fa-bell"></i>
            </div>

            <div class="notification-content">
                <div class="notification-top-row">
                    <h3>
                        ${escapeNotificationHTML(
                            notification.title ||
                            "Notification"
                        )}
                    </h3>

                    <span class="notification-priority">
                        ${escapeNotificationHTML(
                            notification.priority ||
                            "info"
                        )}
                    </span>
                </div>

                <p>
                    ${escapeNotificationHTML(
                        notification.message || ""
                    )}
                </p>

                <div class="notification-meta">
                    <span>
                        <i class="fa-regular fa-clock"></i>
                        ${formatNotificationTime(
                            notification.created_at
                        )}
                    </span>

                    <span class="notification-read-status">
                        ${isUnread ? "Unseen" : "Seen"}
                    </span>
                </div>

                <button
                    type="button"
                    class="notification-delete-btn"
                    title="Delete notification"
                    aria-label="Delete notification"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        const deleteButton =
            item.querySelector(
                ".notification-delete-btn"
            );

        deleteButton?.addEventListener(
            "click",
            async (event) => {
                event.stopPropagation();

                if (
                    typeof deleteNotification ===
                    "function"
                ) {
                    await deleteNotification(
                        notificationId
                    );
                }
            }
        );

        item.addEventListener("click", async () => {
            if (
                typeof toggleNotificationRead ===
                "function"
            ) {
                await toggleNotificationRead(
                    notificationId,
                    isUnread
                );
            }
        });

        notificationList.appendChild(item);
    });
}

function bindNotificationControls() {
    const searchInput =
        document.getElementById("notificationSearch");

    if (
        searchInput &&
        searchInput.dataset.bound !== "true"
    ) {
        searchInput.dataset.bound = "true";

        searchInput.addEventListener(
            "input",
            (event) => {
                notificationSearchText =
                    event.target.value || "";

                renderNotifications();
            }
        );
    }

    const filterButtons =
        document.querySelectorAll(
            "[data-notification-filter], .notification-filter"
        );

    filterButtons.forEach((button) => {
        if (button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            const filter =
                button.dataset.notificationFilter ||
                button.dataset.filter ||
                button.textContent
                    .trim()
                    .toLowerCase();

            activeNotificationFilter =
                filter === "requests"
                    ? "request"
                    : filter;

            filterButtons.forEach((filterButton) => {
                filterButton.classList.remove("active");
            });

            button.classList.add("active");

            renderNotifications();
        });
    });

    const markAllButton =
        document.getElementById(
            "markAllNotificationsBtn"
        ) ||
        document.getElementById("markAllReadBtn") ||
        document.getElementById("markAllBtn");

    if (
        markAllButton &&
        markAllButton.dataset.bound !== "true"
    ) {
        markAllButton.dataset.bound = "true";

        markAllButton.addEventListener(
            "click",
            async () => {
                if (
                    typeof markAllNotificationsRead ===
                    "function"
                ) {
                    await markAllNotificationsRead();
                }
            }
        );
    }
}

async function loadNotifications() {
    const notificationList =
        document.getElementById("notificationList");

    if (!notificationList) return;

    notificationList.innerHTML = `
        <div class="notification-empty">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <h3>Loading notifications</h3>
            <p>Please wait...</p>
        </div>
    `;

    try {
        const response =
            await fetch("/api/notifications");

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Failed to load notifications"
            );
        }

        allNotifications =
            Array.isArray(data.notifications)
                ? data.notifications
                : [];

        updateNotificationBadge();
        bindNotificationControls();
        renderNotifications();

    } catch (error) {
        console.error(
            "Load notifications error:",
            error
        );

        allNotifications = [];
        updateNotificationBadge();

        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load notifications</h3>
                <p>
                    ${escapeNotificationHTML(
                        error.message ||
                        "Please refresh and try again."
                    )}
                </p>
            </div>
        `;
    }
}

async function deleteNotification(notificationId) {
    const shouldDelete = confirm("Delete this notification?");

    if (!shouldDelete) {
        return;
    }

    try {
        const response = await fetch(
            `/api/notifications/${notificationId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert(data.message || "Failed to delete notification.");
            return;
        }

        await loadNotifications();
    } catch (error) {
        console.error("Delete notification error:", error);
        alert("Something went wrong while deleting notification.");
    }
}
async function loadSavedGoal() {
    const userId = await getCurrentUserId();

    if (!userId) {
        return;
    }

    const savedGoal = Number(
        localStorage.getItem(`goalHours_${userId}`)
    );

    goalHours =
        Number.isFinite(savedGoal) && savedGoal > 0
            ? savedGoal
            : 1;

    goalMinutes = goalHours * 60;

    const goalInput =
        document.getElementById("goalInput");

    if (goalInput) {
        goalInput.value = goalHours;
    }

    updateGoal();
    await updateAnalysis();
}
document.addEventListener("DOMContentLoaded", () => {
    loadSavedGoal();
});

document.addEventListener("DOMContentLoaded", function () {
    loadNotifications();
});
document.addEventListener("click", async function (event) {
    const notificationItem = event.target.closest(".notification-item");

    if (!notificationItem) return;

    const notificationId = notificationItem.dataset.id;

    if (!notificationId) return;

    try {
        const response = await fetch(
            `/api/notifications/${notificationId}/read`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Failed to mark notification as read"
            );
        }

        notificationItem.classList.remove("unread");

        loadNotifications();

    } catch (error) {
        console.error("Read notification error:", error);
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const markAllReadBtn = document.getElementById("markAllReadBtn");

    if (!markAllReadBtn) return;

    markAllReadBtn.addEventListener("click", async function () {
        try {
            markAllReadBtn.disabled = true;

            const response = await fetch("/api/notifications/read-all", {
                method: "PATCH"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to mark all as read"
                );
            }

            await loadNotifications();

        } catch (error) {
            console.error("Mark all as read error:", error);
        } finally {
            markAllReadBtn.disabled = false;
        }
    });
});
async function saveStudySession(minutes, type) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            console.error("Could not identify current user");
            return;
        }

        const sessionsKey = `studySessions_${userId}`;

        const sessions = JSON.parse(
            localStorage.getItem(sessionsKey) || "[]"
        );

        sessions.push({
            minutes: Number(minutes) || 0,
            type: String(type || "study"),
            date: new Date().toISOString()
        });

        localStorage.setItem(
            sessionsKey,
            JSON.stringify(sessions)
        );

        console.log("Study session saved:", {
            userId,
            minutes,
            type
        });
    } catch (error) {
        console.error("Study session save error:", error);
    }
}

document.body.classList.add("theme-owner");
async function loadAboutSection() {
    try {
        const response = await fetch("/api/about");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not load About details.");
        }

        console.log("About data:", data.about);
        const about = data.about;

document.getElementById("aboutFounderName").textContent =
    about.display_name || "Aditya Chourasia";

document.getElementById("aboutFounderRole").textContent =
    about.role || "Owner • Developer";

const bio = document.getElementById("aboutFounderBio");
if (bio) {
    bio.textContent = about.bio || "";
}

document.getElementById("aboutFounderImage").src =
    about.profile_image || "/uploads/about/owner-profile.jpg";
    console.log("Image:", about.profile_image);

const img = document.getElementById("aboutFounderImage");
console.log(img);

img.src = about.profile_image || "/uploads/about/owner-profile.jpg";

    } catch (error) {
        console.error("Load About section error:", error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadAboutSection();
});
async function loadAttendanceStudents() {
    const studentSelect =
        document.getElementById("studentEmail");

    if (!studentSelect) return;

    studentSelect.innerHTML =
        `<option value="">Loading students...</option>`;

    try {
        const response = await fetch("/api/attendance/students");
        const result = await response.json();

        if (!response.ok || !result.success) {
            studentSelect.innerHTML =
                `<option value="">Unable to load students</option>`;
            return;
        }

        const users =
            result.users ||
            result.accounts ||
            result.data ||
            [];

        const students = users.filter((user) => {
            return String(user.role || "")
                .trim()
                .toLowerCase() === "user";
        });

        studentSelect.innerHTML =
            `<option value="">Select Student</option>`;

        students.forEach((student) => {
            const option = document.createElement("option");

            option.value = student.email;

            option.textContent =
                `${student.name || "Unnamed User"} — ${student.email}`;

            studentSelect.appendChild(option);
        });

        if (students.length === 0) {
            studentSelect.innerHTML =
                `<option value="">No users found</option>`;
        }
    } catch (error) {
        console.error("Student dropdown error:", error);

        studentSelect.innerHTML =
            `<option value="">Unable to load students</option>`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadAttendanceStudents();
});

async function updateRoleBadge() {
    const roleBadge = document.getElementById("roleBadge");

    if (!roleBadge) return;

    try {
        const response = await fetch("/api/me");
        const data = await response.json();

        if (!response.ok || !data.success || !data.role) {
            roleBadge.textContent = "UNKNOWN";
            return;
        }

        roleBadge.textContent = String(data.role)
            .replaceAll("_", " ")
            .toUpperCase();
    } catch (error) {
        console.error("Role badge update error:", error);
        roleBadge.textContent = "OFFLINE";
    }
}
document.addEventListener("DOMContentLoaded", updateRoleBadge);

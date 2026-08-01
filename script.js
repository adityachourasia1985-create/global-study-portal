
        
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
    const body = document.body;

    body.classList.remove(
        "theme-owner",
        "theme-super-admin",
        "theme-admin",
        "theme-user",
        "theme-individual"
    );

    if (accountType === "individual") {
        body.classList.add("theme-individual");
        return;
    }

    const normalizedRole = String(role || "user")
        .toLowerCase()
        .replaceAll("_", "-");

    const allowedThemes = [
        "owner",
        "super-admin",
        "admin",
        "user"
    ];

    const selectedTheme = allowedThemes.includes(normalizedRole)
        ? normalizedRole
        : "user";

    body.classList.add(`theme-${selectedTheme}`);
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
            canManageAccounts ? "" : "none";
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

// Dark Mode Logic
// Dark Mode Logic
const toggleSwitch = document.getElementById("theme-toggle");
const settingsToggle = document.getElementById("settings-theme-toggle");

function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";
    const isDark = selectedTheme === "dark";

    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);

    localStorage.setItem("theme", selectedTheme);

    if (toggleSwitch) {
        toggleSwitch.checked = isDark;
    }

    if (settingsToggle) {
        settingsToggle.checked = isDark;
    }
}

function handleThemeChange(event) {
    applyTheme(event.target.checked ? "dark" : "light");
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

if (toggleSwitch) {
    toggleSwitch.addEventListener("change", handleThemeChange);
}

if (settingsToggle) {
    settingsToggle.addEventListener("change", handleThemeChange);
}
/* ==========================
   CUSTOM THEME
========================== */

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
;
    if (running) return;

    running = true;


    timer = setInterval(() => {

        if (time > 0) {

            time--;
            updateTimer();

        } else {

            clearInterval(timer);
            running = false;

            pomodoroCount++;
            completedMinutes += currentSessionMinutes;
            updateGoal();
            saveStudySession(currentSessionMinutes, "timer");

            updateStreak();
            saveDailyStudy(currentSessionMinutes);
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
function updateAnalysis() {
    // -----------------------------------------
    // Load all Timer + Stopwatch study sessions
    // -----------------------------------------
    const sessions =
        JSON.parse(localStorage.getItem("studySessions")) || [];

    const validSessions = sessions.filter(session => {
        const minutes = Number(session.minutes);
        const date = new Date(session.date);

        return minutes > 0 && !Number.isNaN(date.getTime());
    });

    // -----------------------------------------
    // Helper: Local date key YYYY-MM-DD
    // -----------------------------------------
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

    // -----------------------------------------
    // Total Study Time
    // -----------------------------------------
    const totalMinutes = validSessions.reduce((total, session) => {
        return total + Number(session.minutes);
    }, 0);

    // Keep old progress variable synchronized
    completedMinutes = totalMinutes;

    const totalSeconds = Math.round(totalMinutes * 60);

    const totalHours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.floor(
        (totalSeconds % 3600) / 60
    );
    const remainingSeconds = totalSeconds % 60;

    let totalStudyText = "0s";

    if (totalHours > 0) {
        totalStudyText =
            `${totalHours}h ${remainingMinutes}m`;
    } else if (remainingMinutes > 0) {
        totalStudyText =
            `${remainingMinutes}m ${remainingSeconds}s`;
    } else {
        totalStudyText = `${remainingSeconds}s`;
    }

    const totalStudyElement =
        document.getElementById("total-study");

    if (totalStudyElement) {
        totalStudyElement.textContent = totalStudyText;
    }

    // -----------------------------------------
    // Today's Study Time
    // -----------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = getLocalDateKey(today);

    const todayMinutes = validSessions.reduce(
        (total, session) => {
            if (getLocalDateKey(session.date) === todayKey) {
                return total + Number(session.minutes);
            }

            return total;
        },
        0
    );

    // -----------------------------------------
    // Productivity Score
    // Today's study / Daily goal
    // -----------------------------------------
    const safeGoalMinutes =
        Number(goalMinutes) > 0 ? Number(goalMinutes) : 60;

    let productivity = Math.round(
        (todayMinutes / safeGoalMinutes) * 100
    );

    productivity = Math.min(
        Math.max(productivity, 0),
        100
    );

    const productivityElement =
        document.getElementById("productivity");

    if (productivityElement) {
        productivityElement.textContent =
            `${productivity}%`;
    }

    // -----------------------------------------
    // Study Streak
    // -----------------------------------------
    const studiedDateKeys = [
        ...new Set(
            validSessions.map(session =>
                getLocalDateKey(session.date)
            )
        )
    ].sort().reverse();

    let streak = 0;

    const expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);

    for (const studiedDateKey of studiedDateKeys) {
        const expectedKey =
            getLocalDateKey(expectedDate);

        if (studiedDateKey === expectedKey) {
            streak++;
            expectedDate.setDate(
                expectedDate.getDate() - 1
            );
        } else {
            break;
        }
    }

    const streakElement =
        document.getElementById("streak");

    if (streakElement) {
        streakElement.textContent =
            `${streak} ${streak === 1 ? "Day" : "Days"}`;
    }

    // -----------------------------------------
    // Weekly Study Report: Monday to Sunday
    // -----------------------------------------
    const weeklyChart =
        document.getElementById("weeklyChart");

    if (weeklyChart) {
        const dayNames = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

        const weeklyMinutes = [
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];

        const monday = new Date(today);

        const currentDay = today.getDay();

        const mondayOffset =
            currentDay === 0
                ? -6
                : 1 - currentDay;

        monday.setDate(
            today.getDate() + mondayOffset
        );

        monday.setHours(0, 0, 0, 0);

        validSessions.forEach(session => {
            const sessionDate =
                new Date(session.date);

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

        const maxMinutes = Math.max(
            ...weeklyMinutes,
            1
        );

        weeklyChart.innerHTML = weeklyMinutes
            .map((minutes, index) => {
                const height =
                    minutes > 0
                        ? Math.max(
                              (minutes / maxMinutes) * 100,
                              8
                          )
                        : 2;

                const totalDaySeconds =
                    Math.round(minutes * 60);

                let timeLabel = "0s";

                if (totalDaySeconds >= 3600) {
                    const hours = Math.floor(
                        totalDaySeconds / 3600
                    );

                    const mins = Math.floor(
                        (totalDaySeconds % 3600) / 60
                    );

                    timeLabel = `${hours}h ${mins}m`;
                } else if (totalDaySeconds >= 60) {
                    const mins = Math.floor(
                        totalDaySeconds / 60
                    );

                    const secs =
                        totalDaySeconds % 60;

                    timeLabel =
                        secs > 0
                            ? `${mins}m ${secs}s`
                            : `${mins}m`;
                } else {
                    timeLabel =
                        `${totalDaySeconds}s`;
                }

                return `
                    <div class="weekly-bar-item">
                        <div class="weekly-minutes">
                            ${timeLabel}
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
}

let hrs = Math.floor(completedMinutes / 60);
    // let mins = completedMinutes % 60;
    let mins = Math.floor(completedMinutes % 60);

    // Total Study Time
    document.getElementById("total-study").innerHTML =
        hrs + "h " + mins + "m";


    // Productivity Score
    let productivity = Math.round(
        (completedMinutes / goalMinutes) * 100
    );

    if(productivity > 100){
        productivity = 100;
    }

    document.getElementById("productivity").innerHTML =
        productivity + "%";

// Study Streak from actual Timer + Stopwatch sessions
const studySessions =
    JSON.parse(localStorage.getItem("studySessions")) || [];

const studiedDates = [
    ...new Set(
        studySessions
            .filter(session => Number(session.minutes) > 0)
            .map(session => {
                const date = new Date(session.date);

                return (
                    date.getFullYear() +
                    "-" +
                    String(date.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(date.getDate()).padStart(2, "0")
                );
            })
    )
].sort().reverse();

let streak = 0;
const checkDate = new Date();
checkDate.setHours(0, 0, 0, 0);

for (const studiedDate of studiedDates) {
    const expectedDate =
        checkDate.getFullYear() +
        "-" +
        String(checkDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(checkDate.getDate()).padStart(2, "0");

    if (studiedDate === expectedDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    } else {
        break;
    }
}

const streakElement = document.getElementById("streak");

if (streakElement) {
    streakElement.innerHTML =
        streak + (streak === 1 ? " Day" : " Days");
}

function saveGoal() {

    goalHours = Number(document.getElementById("goalInput").value);

    goalMinutes = goalHours * 60;

    localStorage.setItem("goalHours", goalHours);

    updateGoal();
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
    const subject = document.getElementById("subjectName").value.trim();
    const total = Number(document.getElementById("totalClasses").value);
    const attended = Number(document.getElementById("attendedClasses").value);

  if (subject === "" || total <= 0 || attended < 0 || attended > total) {
      alert("Attended classes cannot be more than total classes.");
        return;
    }

 
    const percentage = Math.round((attended / total) * 100);
try {
    const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            student_email: "user@polyportal.com",
            subject: subject,
            total_classes: total,
            attended_classes: attended
        })
    });

    const data = await response.json();
    alert(JSON.stringify(data));

    if (!data.success) {
        alert(data.message);
        return;
    }
} catch (error) {
    alert("API Error: " + error.message);
    return;
}

    const table = document.getElementById("attendanceTable");


    table.innerHTML += `
        <tr>
            <td>${subject}</td>
            <td>${total}</td>
            <td>${attended}</td>
            <td>${percentage}%</td>
            <td>
                <button onclick="this.parentElement.parentElement.remove()">
                    Delete
                </button>
            </td>
        </tr>
    `;


    document.getElementById("subjectName").value = "";
    document.getElementById("totalClasses").value = "";
    document.getElementById("attendedClasses").value = "";
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




function updateStreak(){

    let today = new Date().toDateString();

    let lastStudyDate = localStorage.getItem("lastStudyDate");

    let streak = Number(localStorage.getItem("studyStreak")) || 0;


    if(lastStudyDate !== today){

        streak++;

        localStorage.setItem("studyStreak", streak);
        localStorage.setItem("lastStudyDate", today);

    }


    document.getElementById("streak").innerHTML =
        streak + " Days";

}

function saveDailyStudy(minutes){

    let today = new Date().toDateString();

    let studyHistory = JSON.parse(
        localStorage.getItem("studyHistory")
    ) || {};

    if(studyHistory[today]){
        studyHistory[today] += minutes;
    }
    else{
        studyHistory[today] = minutes;
    }


    localStorage.setItem(
        "studyHistory",
        JSON.stringify(studyHistory)
    );

}function saveDailyStudy(minutes){

    let today = new Date().toDateString();

    let studyHistory = JSON.parse(
        localStorage.getItem("studyHistory")
    ) || {};

    if(studyHistory[today]){

        studyHistory[today] += minutes;

    } else {

        studyHistory[today] = minutes;

    }


    localStorage.setItem(
        "studyHistory",
        JSON.stringify(studyHistory)
    );
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


function getStudyHistory(){

    let studyHistory = JSON.parse(
        localStorage.getItem("studyHistory")
    ) || {};

    console.log(studyHistory);

    return studyHistory;
}
function updateWeeklyChart(){

    const chart = document.getElementById("weeklyChart");

    if(!chart){
        console.log("Weekly chart not found");
        return;
    }

    let history = JSON.parse(localStorage.getItem("studyHistory")) || {};

    chart.innerHTML = "";

    for(let date in history){

        let minutes = history[date];

        chart.innerHTML += `
        <div>
            <div class="study-bar" style="height:${minutes*5}px"></div>
            <span>${date.substring(0,3)}</span>
        </div>
        `;
    }
}
async function loadDashboardProfile() {
const response = await fetch("/api/me");
const data = await response.json();

if (!data.success) {
    return;
}

applyRoleTheme(
    data.user?.role || data.role,
    data.user?.account_type || data.account_type
);
applyRoleVisibility(
    data.user?.role || data.role,
    data.user?.accountType || data.accountType
);
document.getElementById("dashboardBranch").textContent =
    "Branch: " + (data.branch || "Not Set");

document.getElementById("dashboardSemester").textContent =
    "Semester: " + (data.semester || "Not Set");

document.getElementById("dashboardEnrollment").textContent =
    "Enrollment: " + (data.enrollment || "Not Set");
document.getElementById("dashboardEmail").textContent =
    "Email: " + (data.email || "Not Set");
}

//     const name = localStorage.getItem("displayName") || "Aditya sir";

//     const branch = localStorage.getItem("branch") || "Not Set";

//     const semester = localStorage.getItem("semester") || "Not Set";

//     const enrollment = localStorage.getItem("enrollmentNumber") || "Not Set";

//     const email = localStorage.getItem("studentEmail") || "Not Set";

//     // const image = localStorage.getItem("profileImage");
// const image = localStorage.getItem("profileImage_" + localStorage.getItem("userEmail"));


    
loadDashboardProfile();

// let focusTasks = JSON.parse(localStorage.getItem("focusTasks")) || [];



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

// ================================
// ACCOUNT MANAGEMENT
// Owner/Admin user management
// ================================

async function loadManagedUsers() {
    const managerCard = document.getElementById("accountManagementCard");
    const usersList = document.getElementById("managedUsersBody");

    // Agar HTML elements abhi page par nahi hain to quietly stop
    if (!managerCard || !usersList) return;

    try {
        // Current logged-in user ki role check karo
        const meResponse = await fetch("/api/me");
        const meData = await meResponse.json();

        if (!meResponse.ok || !meData.success) {
            managerCard.style.display = "none";
            return;
        }

        const currentRole = meData.role;
    const isIndividual = String(accountType || "").toLowerCase() === "individual";

const userManagementMenu =
    document.getElementById("menu-users");

const accountManagementCard =
    document.getElementById("accountManagementCard");

if (isIndividual) {
    if (userManagementMenu) {
        userManagementMenu.style.display = "none";
    }

    if (accountManagementCard) {
        accountManagementCard.style.display = "none";
    }
}

        const roleBadge = document.getElementById("roleBadge");

if (roleBadge) {
    roleBadge.textContent = currentRole
        .replace("_", " ")
        .toUpperCase();
}
        console.log("Current Role:", currentRole);
            console.log(meData);
   const roleSelect = document.getElementById("newUserRole");

if (roleSelect) {
    roleSelect.innerHTML = "";

    if (currentRole === "owner") {
        roleSelect.innerHTML = `
            <option value="user">User / Student</option>
            <option value="admin">Administrator</option>
            <option value="super_admin">Super Admin</option>
        `;
    } else if (currentRole === "super_admin") {
        roleSelect.innerHTML = `
            <option value="user">User / Student</option>
            <option value="admin">Administrator</option>
        `;
    } else if (currentRole === "admin") {
        roleSelect.innerHTML = `
            <option value="user">User / Student</option>
        `;
    }

    toggleStudentFields();
}

        // Sirf owner/admin ko management panel dikhe
if (
    currentRole !== "owner" &&
    currentRole !== "super_admin" &&
    currentRole !== "admin"
) {
    managerCard.style.display = "none";
    return;
}

        managerCard.style.display = "block";

        // Users load karo
        const response = await fetch("/api/users");
        const data = await response.json();

        if (!response.ok || !data.success) {
            usersList.innerHTML = `<p>${data.message || "Could not load users"}</p>`;
            return;
        }

        usersList.innerHTML = "";

        if (!data.users || data.users.length === 0) {
            usersList.innerHTML = "<p>No users found.</p>";
            return;
        }

     const visibleUsers = data.users.slice(0, 5);

visibleUsers.forEach(user => {

            const row = document.createElement("tr");
            row.className = "managed-user-row";
row.innerHTML = `
    <td>${user.name || "No Name"}</td>
    <td>${user.email || ""}</td>
    <td>${user.role || "user"}</td>
    <td>${user.status || "pending"}</td>
    <td>
        <button
            type="button"
            class="manage-account-btn"
            onclick="openUserManager(${user.id})">
            Manage Account
        </button>
    </td>
`;

            usersList.appendChild(row);
        });

    } catch (error) {
        console.error("Load managed users error:", error);
    }
}
const showAllManagedUsersBtn = document.getElementById("showAllManagedUsersBtn");

if (showAllManagedUsersBtn) {
  showAllManagedUsersBtn.addEventListener("click", () => {
    const usersList = document.getElementById("managedUsersBody");

    usersList.innerHTML = "";

    registeredUsers.forEach(user => {
      usersList.innerHTML += `
        <tr>
          <td>${user.name || "-"}</td>
          <td>${user.email || "-"}</td>
          <td>${user.role || "-"}</td>
          <td>
            <button
              type="button"
              class="primary-btn"
              onclick="openUserManager(${user.id})"
            >
              Manage
            </button>
          </td>
        </tr>
      `;
    });

    showAllManagedUsersBtn.style.display = "none";
  });
}

async function changeManagedUserPassword(userId) {

    const newPassword = prompt("Enter new password (minimum 6 characters):");

    if (!newPassword) return;

    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {

        const response = await fetch(`/api/users/${userId}/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: newPassword
            })
        });

        const data = await response.json();

        alert(data.message || "Done");

    } catch (error) {

        console.error(error);
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

    if (!bellButton || !notificationBoard || !closeButton) return;
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
function saveStudySession(minutes, type) {
    const sessions = JSON.parse(localStorage.getItem("studySessions")) || [];

    sessions.push({
        minutes: Number(minutes) || 0,
        type: type,
        date: new Date().toISOString()
    });

    localStorage.setItem("studySessions", JSON.stringify(sessions));

    console.log("Study session saved:", {
        minutes,
        type
    });
}
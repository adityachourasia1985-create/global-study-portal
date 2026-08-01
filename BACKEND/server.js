const OpenAI = require("openai");

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    : null;
console.log("SERVER FILE IS RUNNING");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(__dirname + "/polyportal.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});
db.run(
    "ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '{}'",
    (error) => {
        if (error && !error.message.includes("duplicate column name")) {
            console.error("Add permissions column error:", error);
        } else {
            console.log("Permissions column ready");
        }
    }
);
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT


        
        )
    `);
db.run(
    `ALTER TABLE users ADD COLUMN gender TEXT`,
    (err) => {
        if (
            err &&
            !String(err.message).includes("duplicate column name")
        ) {
            console.error("Add gender column error:", err);
        }
    }
);

db.run(`ALTER TABLE users ADD COLUMN mobile TEXT`, () => {});
db.run("ALTER TABLE users ADD COLUMN date_of_birth TEXT", () => {});
db.run(`ALTER TABLE users ADD COLUMN enrollment TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN branch TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN semester INTEGER`, () => {});
db.run(`ALTER TABLE users ADD COLUMN admission_year INTEGER`, () => {});
db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'`, () => {});
db.run(`ALTER TABLE users ADD COLUMN profession TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN branch_code TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN group_id TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN organization_code TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'`, () => {});
db.run("ALTER TABLE attendance ADD COLUMN organization_code TEXT", () => {});
db.run("ALTER TABLE attendance ADD COLUMN branch_code TEXT", () => {});
db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        organization_code TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS organization_branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_code TEXT NOT NULL,
        branch_code TEXT NOT NULL,
        branch_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_code, branch_code)
    )
`);
db.run(`
CREATE TABLE IF NOT EXISTS study_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    study_date TEXT,
    study_hours REAL DEFAULT 0,
    pomodoro_sessions INTEGER DEFAULT 0,
    productivity INTEGER DEFAULT 0,
    organization_code TEXT,
    branch_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
db.run(`
CREATE TABLE IF NOT EXISTS progress_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    progress_date TEXT,
    total_study_time REAL DEFAULT 0,
    pomodoro_sessions INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    productivity INTEGER DEFAULT 0,
    organization_code TEXT,
    branch_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

db.run(`
CREATE TABLE IF NOT EXISTS group_join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    organization_code TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    UNIQUE(user_id, organization_code, branch_code)
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,
    group_code TEXT UNIQUE NOT NULL,
    organization_code TEXT,
    branch_code TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
);
`);
db.run(`
CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'approved',
    UNIQUE(group_id, user_id),
    FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

    db.run(`
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
db.run("ALTER TABLE notices ADD COLUMN organization_code TEXT", () => {});
db.run("ALTER TABLE notices ADD COLUMN branch_code TEXT", () => {});
db.run("ALTER TABLE timetable ADD COLUMN organization_code TEXT", () => {});
db.run("ALTER TABLE timetable ADD COLUMN branch_code TEXT", () => {});

    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_email TEXT,
            subject TEXT,
            total_classes INTEGER,
            attended_classes INTEGER
        )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        time TEXT NOT NULL,
        subject TEXT NOT NULL,
        faculty TEXT,
        room TEXT,
        type TEXT DEFAULT 'Theory'
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS user_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        timetable_view INTEGER DEFAULT 1,
        timetable_manage INTEGER DEFAULT 0,
        attendance_view INTEGER DEFAULT 1,
        attendance_manage INTEGER DEFAULT 0,
        notices_view INTEGER DEFAULT 1,
        notices_manage INTEGER DEFAULT 0,
        users_manage INTEGER DEFAULT 0,
        profile_edit INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);
db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        title TEXT NOT NULL,
        message TEXT NOT NULL,

        category TEXT DEFAULT 'system',
        priority TEXT DEFAULT 'info',

        actor_user_id INTEGER,
        target_user_id INTEGER,

        organization_code TEXT,
        branch_code TEXT,

        recipient_role TEXT,
        recipient_user_id INTEGER,

        action_url TEXT,

        is_read INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

    console.log("Database tables ready");
});
db.run(`
    CREATE TABLE IF NOT EXISTS about_content (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        heading TEXT NOT NULL,
        description TEXT NOT NULL,
        purpose TEXT NOT NULL,
        features TEXT NOT NULL,
        founder_name TEXT NOT NULL,
        founder_description TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT 'Version 1.0',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.run(`
    INSERT OR IGNORE INTO about_content (
        id,
        heading,
        description,
        purpose,
        features,
        founder_name,
        founder_description,
        version
    )
    VALUES (
        1,
        'Smarter College Management, Simplified',
        'A unified digital platform designed to help students, administrators and institutions manage academics, attendance, progress, notices and daily productivity.',
        'To provide a simple, responsive and reliable platform that improves communication, academic tracking and institutional management.',
        'Attendance, timetable, progress reports, study analysis, notice management, role-based accounts and organization management in one secure portal.',
        'Aditya Chourasia',
        'Designed and developed with the goal of building a professional and accessible digital ecosystem for educational institutions.',
        'Version 1.0'
    )
`);

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "polyportal123",
        resave: false,
        saveUninitialized: false
    })
);
app.use(express.static(__dirname));
function createNotification({
    title,
    message,
    category = "system",
    priority = "info",
    actorUserId = null,
    targetUserId = null,
    organizationCode = null,
    branchCode = null,
    recipientRole = null,
    recipientUserId = null,
    actionUrl = null
}) {
    const sql = `
        INSERT INTO notifications (
            title,
            message,
            category,
            priority,
            actor_user_id,
            target_user_id,
            organization_code,
            branch_code,
            recipient_role,
            recipient_user_id,
            action_url,
            is_read
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const params = [
        title,
        message,
        category,
        priority,
        actorUserId,
        targetUserId,
        organizationCode,
        branchCode,
        recipientRole,
        recipientUserId,
        actionUrl
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Create notification error:", err);
            return;
        }

        console.log("Notification created:", this.lastID);
    });
}
function notifyUsers({
    title,
    message,
    category = "system",
    priority = "info",
    actorUserId = null,
    targetUserId = null,
    organizationCode = null,
    branchCode = null,
    recipientRoles = [],
    recipientUserIds = [],
    actionUrl = null
}) {
    const roles = Array.isArray(recipientRoles) ? recipientRoles : [];
    const userIds = Array.isArray(recipientUserIds) ? recipientUserIds : [];

    const conditions = [];
    const params = [];

    if (roles.length > 0) {
        conditions.push(
            `role IN (${roles.map(() => "?").join(", ")})`
        );
        params.push(...roles);
    }

    if (userIds.length > 0) {
        conditions.push(
            `id IN (${userIds.map(() => "?").join(", ")})`
        );
        params.push(...userIds);
    }

    if (conditions.length === 0) {
        console.error("notifyUsers: No recipients provided.");
        return;
    }

    const sql = `
        SELECT DISTINCT id, role
        FROM users
        WHERE ${conditions.join(" OR ")}
    `;

    db.all(sql, params, (err, recipients) => {
        if (err) {
            console.error("notifyUsers recipient error:", err);
            return;
        }

        recipients.forEach((recipient) => {
            createNotification({
                title,
                message,
                category,
                priority,
                actorUserId,
                targetUserId,
                organizationCode,
                branchCode,
                recipientRole: recipient.role,
                recipientUserId: recipient.id,
                actionUrl
            });
        });
    });
}

app.get("/api/notifications", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const userId = req.session.userId;
    const role = String(req.session.role || "user").toLowerCase();

    let sql = `
        SELECT *
        FROM notifications
        WHERE recipient_user_id = ?
    `;

    const params = [userId];
    sql += ` ORDER BY created_at DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("Fetch notifications error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to load notifications"
            });
        }

        res.json({
            success: true,
            notifications: rows
        });
    });
});
app.post("/api/notifications/test", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const recipientUserId = req.session.userId;

    const sql = `
        INSERT INTO notifications (
            title,
            message,
            category,
            priority,
            actor_user_id,
            recipient_user_id,
            organization_code,
            branch_code,
            is_read
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const params = [
        "Test Notification",
        "This is a real notification loaded from the database.",
        "system",
        "info",
        req.session.userId,
        recipientUserId,
        null,
        null
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Create test notification error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to create test notification"
            });
        }

        res.json({
            success: true,
            notificationId: this.lastID
        });
    });
});
app.get("/api/notices", (req, res) => {
    const scope = getScope(req);
    console.log("NOTICE GET SCOPE:", req.session.role, scope);
    let sql;
    let params = [];

    if (scope.isOwner) {
        // Owner -> all notices
        sql = `
            SELECT * FROM notices
            ORDER BY created_at DESC
        `;
    } else if (req.session.role === "super_admin") {
        // Super Admin -> entire organization
        sql = `
            SELECT * FROM notices
            WHERE organization_code = ?
            ORDER BY created_at DESC
        `;
        params = [scope.organizationCode];
    } else {
        // Admin/User -> organization + branch
        sql = `
            SELECT * FROM notices
            WHERE organization_code = ?
            AND branch_code = ?
            ORDER BY created_at DESC
        `;
        params = [
            scope.organizationCode,
            scope.branchCode
        ];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            notices: rows
        });
    });
});
app.patch("/api/notifications/read-all", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const userId = req.session.userId;
    const role = String(req.session.role || "user").toLowerCase();

    let sql = `
        UPDATE notifications
        SET is_read = 1
        WHERE recipient_user_id = ?
    `;

    let params = [userId];
    db.run(sql, params, function (err) {
        if (err) {
            console.error("Mark all notifications read error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to mark all notifications as read"
            });
        }

        res.json({
            success: true,
            updated: this.changes
        });
    });
});
app.patch("/api/notifications/:id/read", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }
});
app.delete("/api/notifications/:id", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const notificationId = Number(req.params.id);
    const userId = Number(req.session.userId);

    if (!notificationId) {
        return res.status(400).json({
            success: false,
            message: "Invalid notification ID"
        });
    }

    db.run(
        `
        DELETE FROM notifications
        WHERE id = ?
        AND recipient_user_id = ?
        `,
        [notificationId, userId],
        function (err) {
            if (err) {
                console.error("Delete notification error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete notification"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found"
                });
            }

            return res.json({
                success: true,
                message: "Notification deleted successfully"
            });
        }
    );
});

    // const notificationId = req.params.id;
    // const userId = req.session.userId;
    // const role = String(req.session.role || "user").toLowerCase();

    // let params = [notificationId, userId];

    // if (role === "owner") {
    //     sql = `
    //         UPDATE notifications
    //         SET is_read = 1
    //         WHERE id = ?
    //     `;

    //     params = [notificationId];
    // }

    // db.run(sql, params, function (err) {
    //     if (err) {
    //         console.error("Mark notification read error:", err);

    //         return res.status(500).json({
    //             success: false,
    //             message: "Failed to mark notification as read"
    //         });
    //     }

    //     res.json({
    //         success: true
    //     });
    // });


app.post("/api/notices", (req, res) => {
    const { title, message } = req.body;
    const scope = getScope(req);
    console.log("NOTICE POST SCOPE:", req.session.role, scope);
    if (!title || !message) {
        return res.status(400).json({
            success: false,
            message: "Title and message are required"
        });
    }

    db.run(
        `INSERT INTO notices (
            title,
            message,
            organization_code,
            branch_code
        )
        VALUES (?, ?, ?, ?)`,
        [
            title,
            message,
            scope.organizationCode,
            scope.branchCode
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Notice added successfully",
                id: this.lastID
            });
        }
    );
});
app.get("/api/progress", (req, res) => {
    const scope = getScope(req);

    const sql = scope.isOwner
        ? `SELECT * FROM progress_report ORDER BY created_at DESC`
        : `SELECT * FROM progress_report
           WHERE organization_code = ?
           AND branch_code = ?
           ORDER BY created_at DESC`;

    db.all(
        sql,
        scope.isOwner ? [] : [scope.organizationCode, scope.branchCode],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true, data: rows });
        }
    );
});
app.post("/api/progress", (req, res) => {
    const {
        progress_date,
        total_study_time,
        pomodoro_sessions,
        completed_tasks,
        productivity
    } = req.body;

    db.run(
        `INSERT INTO progress_report
        (
            user_id,
            progress_date,
            total_study_time,
            pomodoro_sessions,
            completed_tasks,
            productivity,
            organization_code,
            branch_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            req.session.userId,
            progress_date,
            Number(total_study_time || 0),
            Number(pomodoro_sessions || 0),
            Number(completed_tasks || 0),
            Number(productivity || 0),
            req.session.organizationCode,
            req.session.branchCode
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });
        }
    );
});


app.get("/api/study-analysis", (req, res) => {
    const scope = getScope(req);

    const sql = scope.isOwner
        ? `SELECT * FROM study_analysis ORDER BY created_at DESC`
        : `SELECT * FROM study_analysis
           WHERE organization_code = ?
           AND branch_code = ?
           ORDER BY created_at DESC`;

    db.all(
        sql,
        scope.isOwner
            ? []
            : [scope.organizationCode, scope.branchCode],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }

            res.json({ success: true, data: rows });
        }
    );
});
app.post("/api/study-analysis", (req, res) => {
    const { study_date, study_hours, pomodoro_sessions, productivity } = req.body;

    db.run(
        `INSERT INTO study_analysis
        (user_id, study_date, study_hours, pomodoro_sessions, productivity, organization_code, branch_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            req.session.userId,
            study_date,
            Number(study_hours || 0),
            Number(pomodoro_sessions || 0),
            Number(productivity || 0),
            req.session.organizationCode,
            req.session.branchCode
        ],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });
        }
    );
});
app.get("/api/about", (req, res) => {
    db.get(
        "SELECT * FROM about_content WHERE id = 1",
        [],
        (err, row) => {
            if (err) {
                console.error("Load about content error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not load About content."
                });
            }

            return res.json({
                success: true,
                about: row
            });
        }
    );
});
app.put("/api/about", (req, res) => {
    if (!req.session || req.session.role !== "owner") {
        return res.status(403).json({
            success: false,
            message: "Only the Owner can edit About content."
        });
    }

    const {
        heading,
        description,
        purpose,
        features,
        founder_name,
        founder_description,
        version
    } = req.body;

    if (
        !heading?.trim() ||
        !description?.trim() ||
        !purpose?.trim() ||
        !features?.trim() ||
        !founder_name?.trim() ||
        !founder_description?.trim() ||
        !version?.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "All About fields are required."
        });
    }

    db.run(
        `
        UPDATE about_content
        SET
            heading = ?,
            description = ?,
            purpose = ?,
            features = ?,
            founder_name = ?,
            founder_description = ?,
            version = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        `,
        [
            heading.trim(),
            description.trim(),
            purpose.trim(),
            features.trim(),
            founder_name.trim(),
            founder_description.trim(),
            version.trim()
        ],
        function (err) {
            if (err) {
                console.error("Update about content error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not update About content."
                });
            }

            return res.json({
                success: true,
                message: "About content updated successfully."
            });
        }
    );
});
function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        if (!roles.includes(req.session.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied by either super admin or owner"
            });
        }

        next();
    };
}
function getScope(req) {
    const role = req.session.role;

    // Owner can see everything
    if (role === "owner") {
        return {
            isOwner: true,
            organizationCode: null,
            branchCode: null
        };
    }

    // Super Admin can see entire assigned organization
    if (role === "super_admin") {
        return {
            isOwner: false,
            organizationCode: req.session.organizationCode,
            branchCode: null
        };
    }

    // Admin/User stay inside assigned organization + branch
    return {
        isOwner: false,
        organizationCode: req.session.organizationCode,
        branchCode: req.session.branchCode
    };
}

// app.post("/api/users", allowRoles("owner", "admin"), (req, res) => {
  app.post(
  "/api/users",
  allowRoles("owner", "super_admin", "admin"),
  (req, res) => { 

console.log("POST /api/users HIT");
console.log("SESSION =", req.session.role);
console.log("BODY ROLE =", req.body.role);
    const name = String(req.body.name || "").trim();
const email = String(req.body.email || "").trim().toLowerCase();
const password = String(req.body.password || "").trim();
const role = String(req.body.role || "").trim().toLowerCase();

const mobile = String(req.body.mobile || "").trim();
const enrollment = String(req.body.enrollment || "").trim();
const branch = String(req.body.branch || "").trim();
const semester = req.body.semester ? Number(req.body.semester) : null;
const admissionYear = req.body.admission_year
    ? Number(req.body.admission_year)
    : null;
const organizationCode = String(req.body.organization_code || "").trim();

    if (!name || !email || !password || !role) {
       console.log("SESSION ROLE =",
         req.session.role);
        console.log("REQUEST ROLE =", role);
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    // Owner admin aur user dono bana sakta hai.
    console.log("SESSION =", req.session.role, "ROLE =", role);
// Role creation rules
if (req.session.role === "admin" && role !== "user") {
    return res.status(403).json({
        success: false,
        message: "Admin can only create user accounts."
    });
}

if (
    req.session.role === "super_admin" &&
    !["admin", "user"].includes(role)
) {
    return res.status(403).json({
        success: false,
        message: "Super Admin can only create Admin and User accounts."
    });
}

if (
    req.session.role === "owner" &&
    !["super_admin", "admin", "user"].includes(role)
) {
    return res.status(400).json({
        success: false,
        message: "Invalid role selected."
    });
}


if (
    req.session.role === "owner" &&
    !["super_admin", "admin", "user"].includes(role)
) {
        return res.status(400).json({
            success: false,
            message: "Owner can only create admin or user accounts"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    db.run(
      `INSERT INTO users (
    name,
    email,
    password,
    role,
    mobile,
    enrollment,
    branch,
    semester,
    admission_year,
    organization_code,
    branch_code

)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
[
    name,
    email,
    password,
    role,
    mobile || null,
    enrollment || null,
    branch || null,
    semester,
    admissionYear,
    organizationCode || req.session.organizationCode || null,
    req.session.branchCode
],

        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        success: false,
                        message: "This email is already registered"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: `${role} account created successfully`,
                userId: this.lastID
            });
        }
    );
});
// Get all registered users - Owner/Admin only
app.get(
    "/api/users",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {

        const scope = getScope(req);

        const fields = `
            id,
            name,
            email,
            role,
            mobile,
            enrollment,
            branch,
            semester,
            admission_year,
            organization_code,
            branch_code
        `;

        // OWNER → all users
        if (scope.isOwner) {
            return db.all(
                `SELECT ${fields}
                 FROM users
                 ORDER BY id DESC`,
                [],
                (err, users) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    return res.json({ success: true, users });
                }
            );
        }

        // SUPER ADMIN → only assigned organization
        console.log("SUPER ADMIN ORG =", scope.organizationCode);
        if (req.session.role === "super_admin") {
            return db.all(
                `SELECT ${fields}
                 FROM users
                 WHERE organization_code = ?
                 ORDER BY id DESC`,
                [scope.organizationCode],
                (err, users) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    return res.json({ success: true, users });
                }
            );
        }

        // ADMIN → assigned organization + branch
        db.all(
            `SELECT ${fields}
             FROM users
             WHERE organization_code = ?
             AND branch_code = ?
             ORDER BY id DESC`,
            [scope.organizationCode, scope.branchCode],
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                return res.json({ success: true, users });
            }
        );
    }
);
app.patch(
    "/api/users/:id/role",
    allowRoles("owner", "super_admin"),
    (req, res) => {
        const userId = Number(req.params.id);
        const newRole = String(req.body.role || "")
            .trim()
            .toLowerCase();

        const allowedRoles = ["user", "admin", "super_admin"];

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (!allowedRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        db.get(
            "SELECT id, name, role, organization_code FROM users WHERE id = ?",
            [userId],
            (findError, account) => {
                if (findError) {
                    console.error("Role user lookup error:", findError);

                    return res.status(500).json({
                        success: false,
                        message: "Could not find user"
                    });
                }

                if (!account) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }

                if (account.role === "owner") {
                    return res.status(403).json({
                        success: false,
                        message: "Owner role cannot be changed"
                    });
                }

                if (
                    req.session.role === "super_admin" &&
                    newRole === "super_admin"
                ) {
                    return res.status(403).json({
                        success: false,
                        message: "Only Owner can create a Super Admin"
                    });
                }

                db.run(
                    "UPDATE users SET role = ? WHERE id = ?",
                    [newRole, userId],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "Role update database error:",
                                updateError
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Could not update user role"
                            });
                        }

                        if (this.changes === 0) {
                            return res.status(404).json({
                                success: false,
                                message: "User not found"
                            });
                        }

                        console.log("USER ROLE UPDATED:", {
                            userId,
                            oldRole: account.role,
                            newRole
                        });

                        return res.json({
                            success: true,
                            role: newRole,
                            message: `User role changed from ${account.role} to ${newRole}`
                        });
                    }
                );
            }
        );
    }
);
// Delete / Remove user account - Owner only
app.delete("/api/users/:id", allowRoles("owner","super_admin"), (req, res) => {
    const userId = Number(req.params.id);

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }
db.get(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (findErr, account) => {

        if (findErr) {
            return res.status(500).json({
                success: false,
                message: findErr.message
            });
        }
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (account.role === "owner") {
            return res.status(403).json({
                success: false,
                message: "Owner account cannot be deleted"
            });
        }

const currentRole = req.session.role;

let deleteQuery;
let deleteParams;

if (currentRole === "owner") {
    deleteQuery = "DELETE FROM users WHERE id = ?";
    deleteParams = [userId];
} else if (currentRole === "super_admin") {
    deleteQuery = `
        DELETE FROM users
        WHERE id = ?
        AND organization_code = ?
    `;
    deleteParams = [
        userId,
        req.session.organizationCode
    ];
} else {
    deleteQuery = `
        DELETE FROM users
        WHERE id = ?
        AND organization_code = ?
        AND branch_code = ?
    `;
    deleteParams = [
        userId,
        req.session.organizationCode,
        req.session.branchCode
    ];
}

db.run(deleteQuery, deleteParams, function (err) {
    if (err) {
        console.error("Delete user error:", err);

        return res.status(500).json({
            success: false,
            message: "Could not remove account."
        });
    }

    if (this.changes === 0) {
        return res.status(404).json({
            success: false,
            message: "Account was not deleted. User not found or access denied."
        });
    }

    notifyUsers({
        title: "User Account Removed",
        message: `${account.name || account.email} account removed.`,
        category: "security",
        priority: "important",
        actorUserId: req.session.userId || null,
        targetUserId: userId,
        recipientUserIds: [Number(req.session.userId)],
        actionUrl: "/dashboard"
    });

    return res.json({
        success: true,
        message: "Account removed successfully."
    });
});

    }
);


});
// Change managed user's password - Owner/Admin
app.patch(
    "/api/users/:id/password",
    allowRoles("owner","admin","super_admin"),
    (req, res) => {
        const userId = Number(req.params.id);
        const newPassword = String(req.body.password || "").trim();

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        db.get(
            "SELECT role FROM users WHERE id = ?",
            [userId],
            (findErr, targetUser) => {
                if (findErr) {
                    return res.status(500).json({
                        success: false,
                        message: findErr.message
                    });
                }

                if (!targetUser) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }

                // Admin can change password only for normal users.
                // Owner can change password for admin and normal users.
                if (
                    req.session.role === "admin" &&
                    targetUser.role !== "user"
                ) {
                    return res.status(403).json({
                        success: false,
                        message: "Admin can manage only normal users"
                    });
                }

                db.run(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [newPassword, userId],
                    function (err) {
                        if (err) {
                            console.error("Password update error:", err);

                            return res.status(500).json({
                                success: false,
                                message: "Could not change password"
                            });
                        }

                        res.json({
                            success: true,
                            message: "Password changed successfully"
                        });
                    }
                );
            }
        );
    }
);

// Edit managed user's profile - Owner/Admin
app.patch(
    "/api/users/:id/profile",
    allowRoles("owner", "admin","super_admin"),
    (req, res) => {

        const userId = Number(req.params.id);

        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const mobile = String(req.body.mobile || "").trim();
        const enrollment = String(req.body.enrollment || "").trim();
        const branch = String(req.body.branch || "").trim();

        const semester = req.body.semester
            ? Number(req.body.semester)
            : null;

        const admissionYear = req.body.admission_year
            ? Number(req.body.admission_year)
            : null;

        if (!userId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        db.run(
            `UPDATE users
             SET name = ?,
                 email = ?,
                 mobile = ?,
                 enrollment = ?,
                 branch = ?,
                 semester = ?,
                 admission_year = ?
             WHERE id = ?`,
            [
                name,
                email,
                mobile || null,
                enrollment || null,
                branch || null,
                semester,
                admissionYear,
                userId
            ],
            function (err) {

                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(409).json({
                            success: false,
                            message: "This email is already registered"
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }

                res.json({
                    success: true,
                    message: "User profile updated successfully"
                });
            }
        );
    }
);

db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    ["Aditya", "aditya@polyportal.com", "admin123", "owner"]
);

const PORT = 3001;
// "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"
// mongoose.connect("mongodb://127.0.0.1:27017/polyportal")
//     .then(() => {
//         console.log("MongoDB Connected Successfully");
//     })
//     .catch((error) => {
//         console.log("MongoDB Connection Error:", error);
//     });
// Project ka main folder
const FRONTEND_FOLDER = path.resolve(__dirname, "..");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



let user = {
    email: "adityachourasia1985@gmail.com",
    password: "aditya1985"
};

// Login page
app.get("/", (req, res) => {
    res.sendFile("login.html", {
        root: path.join(__dirname, "..")
    });
});
// CSS aur JavaScript
app.get("/style.css", (req, res) => {
    res.sendFile("style.css", {
        root: path.join(__dirname, "..")
    });
});

app.get("/script.js", (req, res) => {
    res.sendFile("script.js", {
        root: path.join(__dirname, "..")
    });
});
app.get("/register", (req, res) => {
    console.log(req.body)
    res.sendFile("register.html", {
        root: __dirname
    });
});
function generateOrganizationCode(organizationName) {
    const words = String(organizationName || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    let prefix = words
        .map(word => word[0])
        .join("")
        .slice(0, 5);

    if (prefix.length < 2) {
        prefix = words.join("").slice(0, 5);
    }

    const randomNumber = Math.floor(100 + Math.random() * 900);

    return `${prefix || "ORG"}-${randomNumber}`;
}
function generateUniqueOrganizationCode(organizationName, callback) {
    function checkCode() {
        const code = generateOrganizationCode(organizationName);

        db.get(
            "SELECT id FROM organizations WHERE organization_code = ?",
            [code],
            (error, row) => {
                if (error) {
                    return callback(error);
                }

                if (row) {
                    return checkCode();
                }

                callback(null, code);
            }
        );
    }

    checkCode();
}

app.post("/register", async (req, res) => {
    console.log("REGISTER BODY:",req.body)
    const {
        name,
        email,
        password,
        mobile,
        dateOfBirth,
        profession,
        accountType,
        organizatonAction,
        organizationName,
        enrollment,
        branch,
        semester,
        admissionYear,
        branchCode,
        organizationCode
    } = req.body;

    if (!name || !email || !password || !profession || !accountType) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields."
        });
    }

    if (
    accountType === "organization" &&
    req.body.organizationAction === "join" &&
    (!organizationCode || !branchCode)
) {
    return res.status(400).json({
        success: false,
        message: "Organization Code and Branch Code are required."
    });
}

if (
    accountType === "organization" &&
    req.body.organizationAction === "create" &&
    !organizationName
) {
    return res.status(400).json({
        success: false,
        message: "Organization Name is required."
    });
}
const isIndividual = accountType === "individual";
const isNewOrganization = accountType === "organization";

let finalOrganizationCode = organizationCode?.trim() || null;

if (isNewOrganization) {
    try {
        finalOrganizationCode = await new Promise((resolve, reject) => {
            generateUniqueOrganizationCode(
                organizationName,
                (error, code) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(code);
                    }
                }
            );
        });
    } catch (error) {
        console.error("Organization code generation error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not generate organization code."
        });
    }
}
const newRole = isNewOrganization
    ? "super_admin"
    : isIndividual
        ? "admin"
        : "user";

const newStatus =
    isNewOrganization || isIndividual
        ? "approved"
        : "pending";
        
        const gender = req.body.gender || null;
    db.run(
        `INSERT INTO users (
            name,
            email,
            password,
            role,
            mobile,
            date_of_birth,
            gender,
            enrollment,
            branch,
            semester,
            admission_year,
            profession,
            branch_code,
            organization_code,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name.trim(),
            email.trim().toLowerCase(),
            password,
          accountType === "individual" ? "admin" : "user",

            mobile?.trim() || null,
            dateOfBirth || null,
            gender || null,
            accountType === "organization"
                ? enrollment?.trim() || null
                : null,
            branch?.trim() || null,

            semester || null,
            accountType === "organization"
                ? admissionYear || null
                : null,
            profession,
            accountType === "organization"
                ? branchCode?.trim() || null
                : null,
            finalOrganizationCode,
                accountType === "individual" ? "approved" : "pending",
                

        ],
        function (err) {
            if (err) {
                if (
                    err.message &&
                    err.message.includes("UNIQUE")
                ) {
                    return res.status(409).json({
                        success: false,
                        message: "This email is already registered."
                    });
                }

                console.error("Registration error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Registration failed."
                });
            }

   if (accountType === "organization" && organizationName?.trim()) {
    db.run(
        `INSERT OR IGNORE INTO organizations (name, organization_code)
         VALUES (?, ?)`,
        [organizationName.trim(), finalOrganizationCode]
    );
    if (branchCode) {
    db.run(
        `INSERT OR IGNORE INTO organization_branches
         (organization_code, branch_code, branch_name)
         VALUES (?, ?, ?)`,
        [
            finalOrganizationCode,
            branchCode.trim(),
            branch?.trim() || branchCode.trim()
        ]
    );
}
}
const newUserId = this.lastID;
notifyUsers({
    title: "New Registration Request",
    message: `${name} submitted an organization registration request.`,
    category: "request",
    priority: "important",
    actorUserId: this.lastID,
    targetUserId: this.lastID,
    organizationCode: finalOrganizationCode || null,
    branchCode: branchCode?.trim() || null,
    recipientRoles: ["owner", "super_admin", "superadmin"],
    actionUrl: "/dashboard"
});

            return res.json({
    success: true,
    message: `Organization created successfully. Your organization code is ${finalOrganizationCode}. Please save this code.`,
    organizationCode: finalOrganizationCode || organizationCode || null
});

        }
    );
});
app.post("/api/groups/join", (req, res) => {
    const {
        name,
        email,
        password,
        mobile,
        dateOfBirth,
        profession,
        enrollment,
        branch,
        semester,
        admissionYear,
        branchCode,
        organizationCode
    } = req.body;

    const cleanOrganizationCode = String(organizationCode || "")
        .trim()
        .toUpperCase();

    const cleanBranchCode = String(branchCode || "")
        .trim()
        .toUpperCase();

    if (
        !name?.trim() ||
        !email?.trim() ||
        !password ||
        !cleanOrganizationCode ||
        !cleanBranchCode
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required details."
        });
    }

    db.get(
        `SELECT id
         FROM organizations
         WHERE organization_code = ?`,
        [cleanOrganizationCode],
        (organizationError, organization) => {
            if (organizationError) {
                console.error("Organization lookup error:", organizationError);

                return res.status(500).json({
                    success: false,
                    message: "Could not verify organization code."
                });
            }

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid organization code."
                });
            }

            db.run(

                `INSERT INTO users (
                    name,
                    email,
                    password,
                    role,
                    mobile,
                    date_of_birth,
                    gender,
                    enrollment,
                    branch,
                    semester,
                    admission_year,
                    profession,
                    branch_code,
                    organization_code,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name.trim(),
                    email.trim().toLowerCase(),
                    password,
                    "user",
                    mobile?.trim() || null,
                    dateOfBirth || null,
                    enrollment?.trim() || null,
                    branch?.trim() || null,
                    semester || null,
                    admissionYear || null,
                    profession?.trim() || "Student",
                    cleanBranchCode,
                    cleanOrganizationCode,
                    "pending"
                ],
                function (userError) {
                    if (userError) {
                        console.error("Join user creation error:", userError);

                        if (
                            String(userError.message)
                                .toLowerCase()
                                .includes("unique")
                        ) {
                            return res.status(409).json({
                                success: false,
                                message: "This email is already registered."
                            });
                        }

                        return res.status(500).json({
                            success: false,
                            message: "Could not create join request."
                        });
                    }

                    const newUserId = this.lastID;

                    db.run(
                        `INSERT INTO group_join_requests (
                            user_id,
                            organization_code,
                            branch_code
                        )
                        VALUES (?, ?, ?)`,
                        [
                            newUserId,
                            cleanOrganizationCode,
                            cleanBranchCode
                        ],
                        function (requestError) {
                            if (requestError) {
                                console.error(
                                    "Join request insert error:",
                                    requestError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Could not submit join request."
                                });
                            }

                            notifyUsers({
                                title: "New Join Request",
                                message: `${name.trim()} wants to join ${cleanOrganizationCode}.`,
                                category: "request",
                                priority: "important",
                                actorUserId: newUserId,
                                targetUserId: newUserId,
                                organizationCode: cleanOrganizationCode,
                                branchCode: cleanBranchCode,
                                recipientRoles: ["owner", "super_admin"],
                                actionUrl: "/dashboard"
                            });

                            return res.json({
                                success: true,
                                message:
                                    "Join request submitted successfully. Wait for approval."
                            });
                        }
                    );
                }
            );
        }
    );
});

app.patch("/api/users/:id/approve", allowRoles("owner", "admin","super_admin"), (req, res) => {
    const userId = req.params.id;
    db.get(
    `SELECT organization_code, branch_code, status
     FROM users
     WHERE id = ?`,
    [userId],
    (err, user) => {
        if (err || !user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        console.log(
            "Approving user group:",
            user.organization_code,
            user.branch_code
        );
        if (user.organization_code) {
    db.run(
        `INSERT OR IGNORE INTO organizations
         (name, organization_code)
         VALUES (?, ?)`,
        [user.organization_code, user.organization_code]
    );

    if (user.branch_code) {
        db.run(
            `INSERT OR IGNORE INTO organization_branches
             (organization_code, branch_code, branch_name)
             VALUES (?, ?, ?)`,
            [
                user.organization_code,
                user.branch_code,
                user.branch_code
            ]
        );
    }
}

    }
);
    db.run(
  `UPDATE users
 SET status = 'approved',
     group_id = CASE
         WHEN organization_code IS NOT NULL
              AND branch_code IS NOT NULL
         THEN organization_code || '_' || branch_code
         ELSE NULL
     END
 WHERE id = ?`
        [userId],
        function (err) {
            if (err) {
                console.error("Approve user error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to approve user."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }
notifyUsers({
    title: "Registration Approved",
    message: "Your registration request has been approved.",
    category: "system",
    priority: "important",
    actorUserId: req.session.userId || null,
    targetUserId: Number(userId),
    recipientUserIds: [Number(userId)],
    actionUrl: "/dashboard"
});

            return res.json({
                success: true,
                message: "User approved successfully."
            });
        }
    );
});
app.patch("/api/groups/requests/:id/approve", allowRoles("owner","super_admin","admin"), (req, res) => {

    const requestId = req.params.id;

    db.get(
        `SELECT * FROM group_join_requests WHERE id = ? AND status = 'pending'`,
        [requestId],
        (err, request) => {

            if (err || !request) {
                return res.status(404).json({
                    success: false,
                    message: "Request not found."
                });
            }

            db.run(
                `UPDATE users
                 SET group_id = ?
                 WHERE id = ?`,
                [
                    request.organization_code + "_" + request.branch_code,
                    request.user_id
                ],
                function (err) {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    db.run(
                        `UPDATE group_join_requests
                         SET status='approved'
                         WHERE id=?`,
                        [requestId]
                    );

                    res.json({
                        success: true,
                        message: "User added to group successfully."
                    });
                }
            );

        }
    );
});

// Login check
app.post("/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    db.get(
        "SELECT * FROM users WHERE LOWER(email) = ?",
        [email],
        (err, account) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!account || String(account.password).trim() !== password) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
if (account.status === "pending") {
    return res.status(403).json({
        success: false,
        message: "Your account is waiting for Owner approval."
    });
}

if (account.status === "rejected") {
    return res.status(403).json({
        success: false,
        message: "Your account registration was rejected."
    });
}
            console.log("LOGIN ROLE:", account.role);
            req.session.isLoggedIn = true;
            req.session.email = email;
            req.session.userId = account.id;
            req.session.role = account.role;
            req.session.organizationCode = account.organization_code;
req.session.branchCode = account.branch_code;
            return res.json({
                success: true,
                message: "Login successful",
                role: account.role,
                name: account.name
            });
        }
    );
});

app.get("/api/groups/requests", allowRoles("owner", "admin"), (req, res) => {

    db.all(`
        SELECT
            r.id,
            r.user_id,
            u.name,
            u.email,
            r.organization_code,
            r.branch_code,
            r.status,
            r.requested_at
        FROM group_join_requests r
        JOIN users u ON u.id = r.user_id
        WHERE r.status = 'pending'
        ORDER BY r.requested_at DESC
    `, (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(rows);
    });

});

app.get("/api/me", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    db.get(
        `SELECT
            id,
            name,
            email,
            role,
         organization_code,
            profession,
            mobile,
            enrollment,
            branch,
            semester,
            admission_year
         FROM users
         WHERE email = ?`,
        [req.session.email],
        (err, account) => {
                console.log(err,account)
                console.log("SESSION USER ID:",req.session.userId)
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                userId: account.id,
                name: account.name,
                email: account.email,
                role: account.role,
                accountType: account.organization_code ? "organization" : "individual",
                profession: account.profession,
                mobile: account.mobile,
                enrollment: account.enrollment,
                branch: account.branch,
                semester: account.semester,
                admission_year: account.admission_year
            });
        }
    );
});// Get permissions of CURRENT logged-in user
app.get("/api/my-permissions", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }
const scope = getScope(req);
    // Owner always has full access
   if (
    req.session.role === "owner" ||
    req.session.role === "super_admin"
) {
        return res.json({
            success: true,
            role: "owner",
            permissions: {
                timetable_view: 1,
                timetable_manage: 1,
                attendance_view: 1,
                attendance_manage: 1,
                notices_view: 1,
                notices_manage: 1,
                users_manage: 1,
                profile_edit: 1
            }
        });
    }

    db.get(
        `SELECT up.*
FROM user_permissions up
JOIN users u ON up.user_id = u.id
WHERE up.user_id = ?
AND (
    ? = 'owner'
    OR (
        u.organization_code = ?
        AND u.branch_code = ?
    )
)`,
      [
    req.session.userId,
    scope.role,
    scope.organizationCode,
    scope.branchCode
],
        (err, permissions) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            // No permission record = basic view permissions only
            if (!permissions) {
                permissions = {
                    user_id: req.session.userId,
                    timetable_view: 1,
                    timetable_manage: 0,
                    attendance_view: 1,
                    attendance_manage: 0,
                    notices_view: 1,
                    notices_manage: 0,
                    users_manage: 0,
                    profile_edit: 1
                };
            }

            return res.json({
                success: true,
                role: req.session.role,
                permissions: permissions
            });
        }
    );
});

app.get("/api/users/:id/permissions", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const userId = req.params.id;

    db.get(
        `
        SELECT *
        FROM user_permissions
        WHERE user_id = ?
        `,
        [userId],
        (err, permissions) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            // Agar record abhi bana nahi hai to default permissions return karo
            if (!permissions) {
                return res.json({
                    success: true,
                    permissions: {
                        user_id: Number(userId),
                        timetable_view: 1,
                        timetable_manage: 0,
                        attendance_view: 1,
                        attendance_manage: 0,
                        notices_view: 1,
                        notices_manage: 0,
                        users_manage: 0,
                        profile_edit: 1
                    }
                });
            }

            res.json({
                success: true,
                permissions
            });
        }
    );
});
app.put("/api/users/:id/permissions", allowRoles("owner"), (req, res) => {
    const userId = Number(req.params.id);
    const permissions = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID"
        });
    }

    if (!permissions || typeof permissions !== "object") {
        return res.status(400).json({
            success: false,
            message: "Invalid permissions data"
        });
    }

    db.run(
        "UPDATE users SET permissions = ? WHERE id = ?",
        [JSON.stringify(permissions), userId],
        function (error) {
            if (error) {
                console.error("Save permissions error:", error);

                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.json({
                success: true,
                message: "Permissions saved successfully"
            });
        }
    );
});

db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    ["Aditya", "aditya@polyportal.com", "Aditya1985", "owner"]
);
db.run(
    `UPDATE users
     SET name = ?, password = ?, role = ?
     WHERE email = ?`,
    ["Aditya", "admin123", "owner", "aditya@polyportal.com"]
);

db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    ["Portal Admin", "admin@polyportal.com", "admin123", "admin"]
);

db.run(
    `INSERT OR IGNORE INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    ["Demo User", "user@polyportal.com", "user123", "user"]
);
app.get("/api/owner", allowRoles("owner"), (req, res) => {
    res.json({
        success: true,
        message: "Owner access granted"
    });
});

app.get("/api/admin", allowRoles("owner", "admin"), (req, res) => {
    res.json({
        success: true,
        message: "Admin access granted"
    });
});

app.get("/api/user", allowRoles("owner", "admin", "user"), (req, res) => {
    res.json({
        success: true,
        message: "User access granted"
    });
});
// Attendance load

app.get("/api/attendance", (req, res) => {
    const scope = getScope(req);
    const sql = scope.isOwner
    ? `SELECT * FROM attendance ORDER BY id DESC`
    : `SELECT * FROM attendance
       WHERE organization_code = ?
       AND branch_code = ?
       ORDER BY id DESC`;
    db.all(
    sql,
    scope.isOwner
        ? []
        : [scope.organizationCode, scope.branchCode],

        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                attendance: rows
            });
        }
    );
});

// Delete attendance record
app.delete("/api/attendance/:id", (req, res) => {
    const id = req.params.id;

    db.run(
        "DELETE FROM attendance WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                console.error("Attendance delete error:", err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Attendance record not found"
                });
            }

            res.json({
                success: true,
                message: "Attendance deleted successfully"
            });
        }
    );
});

// Attendance add - only Owner/Admin
app.post("/api/attendance",
    allowRoles("owner","super_admin", "admin"),
    (req, res) => {
        const {
            student_email,
            subject,
            total_classes,
            attended_classes
        } = req.body;

        if (!student_email || !subject) {
            return res.status(400).json({
                success: false,
                message: "Student email and subject are required"
            });
        }

        db.run(
            `INSERT INTO attendance
(student_email, subject, total_classes, attended_classes, organization_code, branch_code)
VALUES (?, ?, ?, ?, ?, ?)`,
          [
    student_email,
    subject,
    Number(total_classes),
    Number(attended_classes),
    req.session.organizationCode,
    req.session.branchCode
],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                res.json({
                    success: true,
                    message: "Attendance saved successfully",
                    id: this.lastID
                });
            }
        );
    }
);
app.post(
    "/api/attendance",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
    const {
        student_email,
        subject,
        total_classes,
        attended_classes
    } = req.body;

    if (!student_email || !subject || total_classes == null || attended_classes == null) {
        return res.status(400).json({
            success: false,
            message: "All attendance fields are required"
        });
    }

    db.run(
        `INSERT INTO attendance
        (student_email, subject, total_classes, attended_classes)
        VALUES (?, ?, ?, ?)`,
        [student_email, subject, total_classes, attended_classes],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Attendance saved successfully",
                id: this.lastID
            });
        }
    );
});

app.post("/change-password", (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (currentPassword !== user.password) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect."
        });
    }

    user.password = newPassword;

    return res.json({
        success: true,
        message: "Password changed successfully."
    });
});


// Protected dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/");
    }

    res.sendFile("index.html", {
        root: path.join(__dirname, "..")
    });
});
// Change password
app.post("/change-password", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (currentPassword !== user.password) {
        return res.status(401).json({
            success: false,
            message: "Current password is incorrect"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters"
        });
    }

    user.password = newPassword;

    return res.json({
        success: true,
        message: "Password changed successfully"
    });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});
// Get complete timetable
app.get("/api/timetable", (req, res) => {
const scope = getScope(req);
    db.all(
   scope.isOwner
? `SELECT * FROM timetable ORDER BY id ASC`
: `SELECT * FROM timetable
   WHERE organization_code = ?
   AND branch_code = ?
   ORDER BY id ASC`,
      scope.isOwner
? []
: [req.session.organizationCode, req.session.branchCode],
        (err, rows) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load timetable"
                });
            }

            res.json({
                success: true,
                timetable: rows
            });
        }
    );

});
// Add timetable lecture - Owner/Admin only
app.post(
    "/api/timetable",
    allowRoles("owner","super_admin","admin"),
    (req, res) => {

        const day = String(req.body.day || "").trim();
        const time = String(req.body.time || "").trim();
        const subject = String(req.body.subject || "").trim();
        const faculty = String(req.body.faculty || "").trim();
        const room = String(req.body.room || "").trim();
        const type = String(req.body.type || "Theory").trim();

        if (!day || !time || !subject) {
            return res.status(400).json({
                success: false,
                message: "Day, time and subject are required"
            });
        }

        db.run(
            `INSERT INTO timetable
(day, time, subject, faculty, room, type, organization_code, branch_code)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                day,
                time,
                subject,
                faculty || null,
                room || null,
                type,
                 req.session.organizationCode,
                 req.session.branchCode
            ],
            function (err) {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                res.json({
                    success: true,
                    message: "Lecture added successfully",
                    id: this.lastID
                });
            }
        );
    }
);
// Delete timetable lecture - Owner/Admin only
app.delete(
    "/api/timetable/:id",
    allowRoles("owner", "admin","super_admin"),
    (req, res) => {
        const id = req.params.id;

        db.run(
            "DELETE FROM timetable WHERE id = ?",
            [id],
            function (err) {
                if (err) {
                    console.error("Delete timetable error:", err);

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Lecture not found"
                    });
                }

                res.json({
                    success: true,
                    message: "Lecture deleted successfully"
                });
            }
        );
    }
);
app.post(
    "/api/groups/create",
    allowRoles("owner", "user", "admin", "super_admin"),
    (req, res) => {
        const userId = req.session.userId;

        let {
            groupName,
            groupCode,
            organizationCode,
            branchCode
        } = req.body;

        groupName = String(groupName || "").trim();
        groupCode = String(groupCode || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "-");

        organizationCode = String(organizationCode || "").trim().toUpperCase();
        branchCode = String(branchCode || "").trim().toUpperCase();

        if (!groupName || !groupCode) {
            return res.status(400).json({
                success: false,
                message: "Group name and group code are required."
            });
        }

        if (!/^[A-Z0-9-]{4,30}$/.test(groupCode)) {
            return res.status(400).json({
                success: false,
                message:
                    "Group code must be 4–30 characters and contain only letters, numbers, or hyphens."
            });
        }

        db.get(
            `SELECT id, group_id FROM users WHERE id = ?`,
            [userId],
            (userError, user) => {
                if (userError) {
                    return res.status(500).json({
                        success: false,
                        message: "Could not verify user."
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User account not found."
                    });
                }

                if (user.group_id) {
                    return res.status(400).json({
                        success: false,
                        message: "You are already connected to a group."
                    });
                }

                db.run(
                    `INSERT INTO groups
                    (
                        group_name,
                        group_code,
                        organization_code,
                        branch_code,
                        created_by,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, 'active')`,
                    [
                        groupName,
                        groupCode,
                        organizationCode || null,
                        branchCode || null,
                        userId
                    ],
                    function (groupError) {
                        if (groupError) {
                            if (
                                groupError.message &&
                                groupError.message.includes("UNIQUE")
                            ) {
                                return res.status(409).json({
                                    success: false,
                                    message: "This group code is already in use."
                                });
                            }

                            return res.status(500).json({
                                success: false,
                                message: "Could not create group."
                            });
                        }

                        const newGroupId = String(this.lastID);

                        db.run(
                            `UPDATE users
                             SET role = 'super_admin',
                                 group_id = ?,
                                 organization_code = COALESCE(NULLIF(?, ''), organization_code),
                                 branch_code = COALESCE(NULLIF(?, ''), branch_code)
                             WHERE id = ?`,
                            [
                                newGroupId,
                                organizationCode,
                                branchCode,
                                userId
                            ],
                            function (updateError) {
                                if (updateError) {
                                    db.run(
                                        `DELETE FROM groups WHERE id = ?`,
                                        [newGroupId]
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Group was not completed. No changes were saved."
                                    });
                                }

                                req.session.role = "super_admin";

                                return res.status(201).json({
                                    success: true,
                                    message:
                                        "Group created. You are now its Super Admin.",
                                    group: {
                                        id: newGroupId,
                                        name: groupName,
                                        code: groupCode
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);
app.put("/api/notices/:id", (req, res) => {
    const { title, message } = req.body;

    db.run(
        `UPDATE notices
         SET title = ?, message = ?
         WHERE id = ?`,
        [title, message, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete("/api/notices/:id", (req, res) => {
    db.run(
        `DELETE FROM notices WHERE id = ?`,
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});
app.get("/api/debug-notices", (req, res) => {
    db.all(
        `SELECT id, title, message, organization_code, branch_code
         FROM notices
         ORDER BY id DESC
         LIMIT 10`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                notices: rows
            });
        }
    );
});



app.get("/api/debug-user/:email", (req, res) => {
    db.get(
        `SELECT name, email, status, organization_code, branch_code, group_id
         FROM users
         WHERE email = ?`,
        [req.params.email],
        (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            return res.json(user || {});
        }
    );
});
app.get("/api/debug-notices", (req, res) => {
    db.all(
        `SELECT id, title, message, organization_code, branch_code
         FROM notices
         ORDER BY id DESC
         LIMIT 10`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                notices: rows
            });
        }
    );
});
app.post("/api/ai/chat", async (req, res) => {
    try {
        const message = String(req.body.message || "").trim();

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "system",
                    content:
                        "You are the AI assistant inside Global Portal. Help students, teachers and administrators with studies, attendance, timetable, notices and portal guidance. Keep answers clear, useful and concise."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({
            success: true,
            reply: response.output_text
        });
    } catch (error) {
        console.error("AI chat error:", error);

        res.status(500).json({
            success: false,
            message: "AI service is unavailable right now."
        });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

server.on("close", () => {
    console.log("!!! SERVER WAS CLOSED !!!");
});

server.on("error", (err) => {
    console.error("!!! SERVER ERROR !!!", err);
});

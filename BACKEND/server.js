const multer = require("multer");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const OpenAI = require("openai");
const { Resend } = require("resend");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const resend = new Resend(process.env.RESEND_API_KEY);
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    : null;
console.log("SERVER FILE IS RUNNING");
const sqlite3 = require("sqlite3").verbose();
// ===== ONE-TIME PRODUCTION DATABASE MIGRATION =====
if (process.env.RAILWAY_ENVIRONMENT) {
    const currentDb = "/data/polyportal.db";
    const incomingDb = "/data/polyportal-next.db";
    const backupDb = "/data/polyportal-backup.db";

    if (fs.existsSync(incomingDb)) {
        console.log("New production database detected.");

        try {
            if (fs.existsSync(currentDb)) {
                fs.copyFileSync(currentDb, backupDb);
                console.log("Old production DB backed up.");
            }

            fs.renameSync(incomingDb, currentDb);
            console.log("Real users database activated successfully.");
        } catch (error) {
            console.error("Database migration failed:", error);
        }
    }
}
const dbPath =
    process.env.DB_PATH ||
    path.join(__dirname, "polyportal.db");
    console.log("DATABASE PATH:", dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});
const bcrypt = require("bcryptjs");
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
            email TEXT,
            password TEXT,
            role TEXT


        
        )
    `);


 db.run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER DEFAULT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
db.run(`ALTER TABLE users ADD COLUMN profile_image TEXT`, () => {});
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
db.all(
    "SELECT id, name, organization_code FROM organizations",
    [],
    (err, rows) => {
        if (err) {
            console.error("ORGANIZATIONS CHECK ERROR:", err);
            return;
        }

        console.log("ORGANIZATIONS TABLE:", rows);
    }
);
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
db.run(
    `ALTER TABLE users ADD COLUMN account_type TEXT`,
    (err) => {
        if (
            err &&
            !String(err.message).includes("duplicate column name")
        ) {
            console.error(
                "Add account_type column error:",
                err
            );
        }
    }
);
db.run(`
    UPDATE users
    SET account_type =
        CASE
            WHEN organization_code IS NOT NULL
                 AND TRIM(organization_code) != ''
            THEN 'organization'
            ELSE 'individual'
        END
    WHERE account_type IS NULL
       OR TRIM(account_type) = ''
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
    db.all(`PRAGMA table_info(notices)`, (err, columns) => {
    if (err) {
        console.error("Notice table check error:", err);
        return;
    }

    const existingColumns = columns.map(col => col.name);

    const migrations = [
        {
            name: "organization_code",
            sql: `ALTER TABLE notices ADD COLUMN organization_code TEXT`
        },
        {
            name: "branch_code",
            sql: `ALTER TABLE notices ADD COLUMN branch_code TEXT`
        },
        {
            name: "created_by",
            sql: `ALTER TABLE notices ADD COLUMN created_by INTEGER`
        },
        {
            name: "is_global",
            sql: `ALTER TABLE notices ADD COLUMN is_global INTEGER DEFAULT 0`
        }
    ];

    migrations.forEach(migration => {
        if (!existingColumns.includes(migration.name)) {
            db.run(migration.sql, error => {
                if (error) {
                    console.error(
                        `Notice migration failed: ${migration.name}`,
                        error
                    );
                } else {
                    console.log(
                        `Notice column added: ${migration.name}`
                    );
                }
            });
        }
    });
});
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
// ==========================================
// FEEDBACK & SUGGESTIONS TABLE
// ==========================================

db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        category TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,

        rating INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',

        status TEXT DEFAULT 'submitted',

        owner_response TEXT,

        organization_code TEXT,
        branch_code TEXT,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
    )
`, (err) => {
    if (err) {
        console.error(
            "Feedback table creation error:",
            err
        );
        return;
    }

    console.log("Feedback table ready");
});
db.run(`ALTER TABLE notifications ADD COLUMN recipient_email TEXT`, () => {});
db.run(`ALTER TABLE notifications ADD COLUMN actor_email TEXT`, () => {});
db.run(`ALTER TABLE notifications ADD COLUMN module TEXT`, () => {});
db.run(`ALTER TABLE notifications ADD COLUMN event_key TEXT`, () => {});

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
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS about_settings (
            id INTEGER PRIMARY KEY CHECK(id = 1),

            platform_title TEXT DEFAULT 'Global Study Portal',
            platform_description TEXT,

            founder_name TEXT DEFAULT 'Aditya Chourasia',
            founder_role TEXT DEFAULT 'Owner, Founder & Developer',
            founder_bio TEXT,

            founder_email TEXT DEFAULT 'adityachaurasia1985@gmail.com',
            founder_whatsapp TEXT DEFAULT '+919243645322',
            founder_instagram TEXT,
            founder_linkedin TEXT,

            founder_skills TEXT,
            founder_image TEXT DEFAULT '/uploads/about/owner-profile.jpg',

            cofounder_enabled INTEGER DEFAULT 0,
            cofounder_name TEXT,
            cofounder_role TEXT,
            cofounder_bio TEXT,
            cofounder_image TEXT
        )
    `, (createError) => {
        if (createError) {
            console.error("about_settings table error:", createError);
            return;
        }

        db.run(
            `INSERT OR IGNORE INTO about_settings (id)
             VALUES (1)`,
            (insertError) => {
                if (insertError) {
                    console.error(
                        "about_settings default row error:",
                        insertError
                    );
                } else {
                    console.log("About settings ready");
                }
            }
        );
    });
});
const aboutExtraColumns = [
    ["version", "TEXT DEFAULT 'Version 1.0'"],
    ["overview_heading", "TEXT"],
    ["overview_description", "TEXT"],
    ["capabilities_heading", "TEXT"],
    ["capabilities_json", "TEXT"],
    ["founder_journey", "TEXT"],
    ["founder_vision", "TEXT"],
    ["journey_heading", "TEXT"],
    ["journey_json", "TEXT"],
    ["contact_heading", "TEXT"],
    ["contact_description", "TEXT"],

    ["personal_family_heading", "TEXT"],
    ["personal_name", "TEXT"],
    ["personal_role", "TEXT"],
    ["personal_description", "TEXT"],

    ["father_name", "TEXT"],
    ["father_role", "TEXT"],
    ["father_description", "TEXT"],

    ["mother_name", "TEXT"],
    ["mother_role", "TEXT"],
    ["mother_description", "TEXT"],

    ["family_note", "TEXT"]
];


db.all(
    `PRAGMA table_info(about_settings)`,
    [],
    (error, columns) => {
        if (error) {
            console.error(
                "About settings schema check error:",
                error
            );
            return;
        }

        const existingColumns =
            new Set(columns.map(column => column.name));

        aboutExtraColumns.forEach(
            ([columnName, definition]) => {

                if (existingColumns.has(columnName)) {
                    return;
                }

                db.run(
                    `ALTER TABLE about_settings
                     ADD COLUMN ${columnName} ${definition}`,
                    (alterError) => {
                        if (alterError) {
                            console.error(
                                `Could not add ${columnName}:`,
                                alterError
                            );
                        } else {
                            console.log(
                                `About column added: ${columnName}`
                            );
                        }
                    }
                );
            }
        );
    }
);
const express = require("express");
const session = require("express-session");
const gmailOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

gmailOAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({
    version: "v1",
    auth: gmailOAuth2Client
});
const app = express();
const databaseUpload = multer({
    dest: "/data/"
});

app.post(
    "/internal/database-migration",
    databaseUpload.single("database"),
    (req, res) => {

        const migrationKey = String(
            req.headers["x-migration-key"] || ""
        );

        if (
            !process.env.MIGRATION_KEY ||
            migrationKey !== process.env.MIGRATION_KEY
        ) {
            if (req.file?.path) {
                fs.unlink(req.file.path, () => {});
            }

            return res.status(403).json({
                success: false,
                message: "Migration access denied"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Database file required"
            });
        }

        const uploadedPath = req.file.path;
        const targetPath = "/data/polyportal-next.db";

        const testDb = new sqlite3.Database(
            uploadedPath,
            sqlite3.OPEN_READONLY,
            (error) => {
                if (error) {
                    fs.unlink(uploadedPath, () => {});

                    return res.status(400).json({
                        success: false,
                        message: "Invalid SQLite database"
                    });
                }

                testDb.get(
                    "SELECT COUNT(*) AS count FROM users",
                    [],
                    (checkError, result) => {

                        testDb.close();

                        if (
                            checkError ||
                            !result ||
                            Number(result.count) < 1
                        ) {
                            fs.unlink(uploadedPath, () => {});

                            return res.status(400).json({
                                success: false,
                                message:
                                    "Database does not contain valid users"
                            });
                        }

                        try {
                            if (fs.existsSync(targetPath)) {
                                fs.unlinkSync(targetPath);
                            }

                            fs.renameSync(
                                uploadedPath,
                                targetPath
                            );

                            return res.json({
                                success: true,
                                users: Number(result.count),
                                message:
                                    "Database uploaded. Restart deployment once."
                            });

                        } catch (moveError) {
                            console.error(
                                "Database upload move error:",
                                moveError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Could not prepare production database"
                            });
                        }
                    }
                );
            }
        );
    }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "polyportal123",
        resave: false,
        saveUninitialized: false
    })
);
app.get(["/index.html", "/dashboard"], (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect("/login.html");
    }

return res.sendFile("index.html", { root: __dirname });
});
const dashboardPath = path.join(__dirname, "index.html");
console.log("Dashboard path:", dashboardPath);
app.get("/", (req, res) => {
    return res.sendFile("login.html", { root: __dirname });
});
app.get("/api/debug/users", (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== "owner") {
        return res.status(403).json({
            success: false,
            message: "Owner only."
        });
    }

    db.all(
        `SELECT id, name, email, role
         FROM users
         ORDER BY id DESC`,
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
                users: rows
            });
        }
    );
});
app.get("/api/debug/database-files", (req, res) => {
    if (!req.session.isLoggedIn || req.session.role !== "owner") {
        return res.status(403).json({
            success: false,
            message: "Owner only."
        });
    }

    const fs = require("fs");

    fs.readdir("/data", (err, files) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            files
        });
    });
});
app.get("/about", (req, res) => {
    return res.sendFile("index.html", {
        root: __dirname
    });
});
app.get(["/dashboard", "/index.html"], (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.sendFile(path.join(__dirname, "login.html"));
    }

    return res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/api/feedback", (req, res) => {
    if (
        !req.session ||
        !req.session.isLoggedIn ||
        !req.session.userId
    ) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = Number(req.session.userId);

    const category = String(req.body.category || "").trim();
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const priority = String(req.body.priority || "medium").trim();
    const rating = Number(req.body.rating || 0);

    if (!category || !title || !message) {
        return res.status(400).json({
            success: false,
            message: "Category, title and message are required."
        });
    }

    if (title.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Title is too long."
        });
    }

    if (message.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Feedback message is too long."
        });
    }

    const safePriority = ["low", "medium", "high"].includes(priority)
        ? priority
        : "medium";

    const safeRating =
        Number.isInteger(rating) &&
        rating >= 0 &&
        rating <= 5
            ? rating
            : 0;

    db.run(
        `INSERT INTO feedback
        (
            user_id,
            category,
            title,
            message,
            rating,
            priority,
            status,
            organization_code,
            branch_code
        )
        VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
        [
            userId,
            category,
            title,
            message,
            safeRating,
            safePriority,
            req.session.organizationCode || null,
            req.session.branchCode || null
        ],
        function (err) {
            if (err) {
                console.error("Feedback submit error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not submit feedback."
                });
            }

            notifyUsers({
                title: "New Feedback Received",
                message: `${title}`,
                category: "feedback",
                priority: safePriority,

                actorUserId: userId,
                targetUserId: userId,

                organizationCode:
                    req.session.organizationCode || null,
                branchCode:
                    req.session.branchCode || null,

                recipientRoles: ["owner"],

                module: "feedback",
                actionUrl: "/dashboard",
                eventKey: `feedback_${this.lastID}`
            });

            return res.json({
                success: true,
                feedbackId: this.lastID,
                message: "Feedback submitted successfully."
            });
        }
    );
});
app.get("/api/feedback", (req, res) => {
    if (
        !req.session ||
        !req.session.isLoggedIn ||
        !req.session.userId
    ) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    db.all(
        `SELECT
            id,
            category,
            title,
            message,
            rating,
            priority,
            status,
            owner_response,
            created_at,
            updated_at
         FROM feedback
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [req.session.userId],
        (err, rows) => {
            if (err) {
                console.error("Feedback load error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Could not load feedback."
                });
            }

            return res.json({
                success: true,
                feedback: rows || []
            });
        }
    );
});
app.get(
    "/api/feedback/all",
    allowRoles("owner"),
    (req, res) => {

        db.all(
            `SELECT
                f.*,
                u.name AS user_name,
                u.email AS user_email
             FROM feedback f
             LEFT JOIN users u
                ON u.id = f.user_id
             ORDER BY f.created_at DESC`,
            [],
            (err, rows) => {
                if (err) {
                    console.error(
                        "Owner feedback load error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not load feedback."
                    });
                }

                return res.json({
                    success: true,
                    feedback: rows || []
                });
            }
        );
    }
);
app.patch(
    "/api/feedback/:id",
    allowRoles("owner"),
    (req, res) => {
        const feedbackId = Number(req.params.id);

        const status = String(
            req.body.status || ""
        ).trim().toLowerCase();

        const ownerResponse = String(
            req.body.owner_response || ""
        ).trim();

        const allowedStatuses = [
            "submitted",
            "review",
            "planned",
            "progress",
            "resolved",
            "rejected"
        ];

        if (
            !Number.isInteger(feedbackId) ||
            feedbackId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid feedback ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid feedback status."
            });
        }

        db.run(
            `UPDATE feedback
             SET
                status = ?,
                owner_response = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                status,
                ownerResponse || null,
                feedbackId
            ],
            function (err) {
                if (err) {
                    console.error(
                        "Feedback update error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not update feedback."
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Feedback not found."
                    });
                }

                return res.json({
                    success: true,
                    message:
                        "Feedback updated successfully."
                });
            }
        );
    }
);

    app.use(
        express.static(__dirname, {
            index: false
        })
    );


if (process.env.RAILWAY_ENVIRONMENT) {
    app.use(
        "/uploads/profiles",
        express.static("/data/uploads/profiles")
    );
} else {
    app.use(
        "/uploads/profiles",
        express.static(
            path.join(
                __dirname,
                "public",
                "uploads",
                "profiles"
            )
        )
    );
}

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "public", "uploads")
    )
);
    function createNotification({
        title,
        message,
        category = "system",
        priority = "info",

        actorUserId = null,
        actorEmail = null,

        targetUserId = null,

        recipientRole = null,
        recipientUserId = null,
        recipientEmail = null,

        organizationCode = null,
        branchCode = null,

        module = null,
        actionUrl = null,
        eventKey = null
    }) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            INSERT INTO notifications (
                title,
                message,
                category,
                priority,

                actor_user_id,
                actor_email,

                target_user_id,

                recipient_role,
                recipient_user_id,
                recipient_email,

                organization_code,
                branch_code,

                module,
                action_url,
                event_key
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title,
                message,
                category,
                priority,

                actorUserId,
                actorEmail,

                targetUserId,

                recipientRole,
                recipientUserId,
                recipientEmail,

                organizationCode,
                branchCode,

                module,
                actionUrl,
                eventKey
            ],
            function (error) {
                if (error) {
                    console.error("Notification creation error:", error);
                    reject(error);
                    return;
                }

                resolve({
                    id: this.lastID
                });
            }
        );
    });
}
// ===== Password Reset Helper =====
function generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashResetToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function getResetTokenExpiry() {
    return Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes
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

    module = null,
    actionUrl = null,
    eventKey = null
}) {
    const roles = Array.isArray(recipientRoles)
        ? recipientRoles.map(r => String(r).toLowerCase())
        : [];

    const userIds = Array.isArray(recipientUserIds)
        ? recipientUserIds.map(Number)
        : [];

    if (roles.length === 0 && userIds.length === 0) {
        console.error("notifyUsers: No recipients provided.");
        return;
    }

    const conditions = [];
    const params = [];

    if (roles.length > 0) {
        conditions.push(
            `LOWER(role) IN (${roles.map(() => "?").join(", ")})`
        );
        params.push(...roles);
    }

    if (userIds.length > 0) {
        conditions.push(
            `id IN (${userIds.map(() => "?").join(", ")})`
        );
        params.push(...userIds);
    }

    db.all(
        `
        SELECT
            id,
            email,
            role,
            organization_code,
            branch_code
        FROM users
        WHERE ${conditions.join(" OR ")}
        `,
        params,
        (err, users) => {
            if (err) {
                console.error("notifyUsers recipient error:", err);
                return;
            }

            const cleanOrg = String(organizationCode || "")
                .trim()
                .toLowerCase();

            const cleanBranch = String(branchCode || "")
                .trim()
                .toLowerCase();

            users.forEach(user => {
                const userRole = String(user.role || "")
                    .trim()
                    .toLowerCase();

                const userOrg = String(user.organization_code || "")
                    .trim()
                    .toLowerCase();

                const userBranch = String(user.branch_code || "")
                    .trim()
                    .toLowerCase();

                const isDirectRecipient =
                    userIds.includes(Number(user.id));

                /*
                    DIRECT recipient:
                    always allowed.
                */
                if (!isDirectRecipient) {

                    /*
                        OWNER:
                        global audit visibility.
                    */
                    if (userRole !== "owner") {

                        /*
                            Organization restriction
                        */
                        if (cleanOrg && userOrg !== cleanOrg) {
                            return;
                        }

                        /*
                            Branch restriction:
                            Super Admin sees entire organization.
                            Admin/User stay inside branch.
                        */
                        if (
                            cleanBranch &&
                            userRole !== "super_admin" &&
                            userBranch !== cleanBranch
                        ) {
                            return;
                        }
                    }
                }

                createNotification({
                    title,
                    message,
                    category,
                    priority,

                    actorUserId,
                    targetUserId,

                    recipientRole: user.role,
                    recipientUserId: user.id,
                    recipientEmail: user.email,

                    organizationCode:
                        organizationCode || user.organization_code || null,

                    branchCode:
                        branchCode || null,

                    module,
                    actionUrl,
                    eventKey
                }).catch(error => {
                    console.error(
                        "notifyUsers notification creation error:",
                        error
                    );
                });
            });
        }
    );
}
const profileUploadDir =
    process.env.RAILWAY_ENVIRONMENT
        ? "/data/uploads/profiles"
        : path.join(
            __dirname,
            "public",
            "uploads",
            "profiles"
        );
if (!fs.existsSync(profileUploadDir)) {
    fs.mkdirSync(profileUploadDir, {
        recursive: true
    });
}
if (!fs.existsSync(profileUploadDir)) {
    fs.mkdirSync(profileUploadDir, {
        recursive: true
    });
}

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileUploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const fileName =
            `user-${req.session.userId}-${Date.now()}${extension}`;

        cb(null, fileName);
    }
});

const uploadProfileImage = multer({
    storage: profileStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed"
                )
            );
        }

        cb(null, true);
    }
});
app.post(
    "/api/about/founder-photo",
    uploadProfileImage.single("founder_image"),
    (req, res) => {
        if (
            !req.session ||
            !req.session.isLoggedIn ||
            req.session.role !== "owner"
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the Owner can update Founder photo."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const imagePath =
            `/uploads/profiles/${req.file.filename}`;

        db.run(
            `
            UPDATE about_settings
            SET founder_image = ?
            WHERE id = 1
            `,
            [imagePath],
            function (error) {
                if (error) {
                    console.error(
                        "Founder image update error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Could not save Founder photo."
                    });
                }

                return res.json({
                    success: true,
                    founder_image: imagePath,
                    message: "Founder photo updated successfully."
                });
            }
        );
    }
);
app.get("/api/notifications", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    const userId = Number(req.session.userId);

    db.get(
        `
        SELECT
            id,
            email,
            role,
            organization_code,
            branch_code
        FROM users
        WHERE id = ?
        `,
        [userId],
        (userErr, user) => {
            if (userErr) {
                console.error(
                    "Notification user lookup error:",
                    userErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to identify user"
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const role = String(user.role || "user")
                .trim()
                .toLowerCase();

            const email = String(user.email || "")
                .trim()
                .toLowerCase();

            let sql = "";
            let params = [];

            // OWNER → complete portal audit feed
            if (role === "owner") {
                sql = `
                    SELECT *
                    FROM notifications
                    ORDER BY datetime(created_at) DESC, id DESC
                `;

                params = [];
            }

            // EVERYONE ELSE → only notifications
            // explicitly assigned to their account
            else {
                sql = `
                    SELECT *
                    FROM notifications
                    WHERE
                        recipient_user_id = ?
                        OR LOWER(
                            TRIM(
                                COALESCE(recipient_email, '')
                            )
                        ) = ?
                    ORDER BY datetime(created_at) DESC, id DESC
                `;

                params = [
                    userId,
                    email
                ];
            }

            db.all(
                sql,
                params,
                (err, rows) => {
                    if (err) {
                        console.error(
                            "Fetch notifications error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to load notifications"
                        });
                    }

                    const notifications =
                        Array.isArray(rows)
                            ? rows
                            : [];

                    const unreadCount =
                        notifications.filter(
                            notification =>
                                Number(
                                    notification.is_read
                                ) === 0
                        ).length;

                    return res.json({
                        success: true,
                        unreadCount,
                        notifications
                    });
                }
            );
        }
    );
});

app.post("/api/notifications/test", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    try {
        const result = await createNotification({
            title: "Test Notification",
            message: "Notification system is working successfully.",
            category: "system",
            priority: "info",

            actorUserId: req.session.userId,
            actorEmail: req.session.email,

            targetUserId: req.session.userId,

            recipientUserId: req.session.userId,
            recipientEmail: req.session.email,

            recipientRole: req.session.role,

            module: "notifications"
        });

        return res.json({
            success: true,
            notificationId: result.id
        });
    } catch (error) {
        console.error("Create test notification error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
});

app.get("/api/notices", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const scope = getScope(req);

    console.log(
        "NOTICE GET SCOPE:",
        req.session.role,
        scope
    );

    let sql = "";
    let params = [];

    if (scope.isOwner) {
        // Owner can see all notices
        sql = `
            SELECT *
            FROM notices
            ORDER BY created_at DESC
        `;
    } else if (req.session.role === "super_admin") {
        // Super Admin can see all notices from own organization
       sql = `
    SELECT *
    FROM notices
    WHERE organization_code = ?
       OR is_global = 1
    ORDER BY created_at DESC
`;

        params = [
            scope.organizationCode
        ];
    } else {
        // Admin/User can see:
        // 1. notices for their own branch
        // 2. organization-wide notices created without a branch
      sql = `
    SELECT *
    FROM notices
    WHERE is_global = 1
       OR (
            organization_code = ?
            AND (
                branch_code = ?
                OR branch_code IS NULL
                OR TRIM(branch_code) = ''
            )
       )
    ORDER BY created_at DESC
`;

        params = [
            scope.organizationCode,
            scope.branchCode
        ];
    }

    db.all(sql, params, (error, notices) => {
        if (error) {
            console.error(
                "Load notices error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Could not load notices."
            });
        }

        return res.json({
            success: true,
            notices
        });
    });
});
app.post("/api/notices", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const scope = getScope(req);

    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const isGlobal = req.body.isGlobal === true || req.body.isGlobal === "true";
    console.log("GLOBAL NOTICE DEBUG:", req.session.role, req.body.isGlobal, isGlobal);
    if (!title || !message) {
        return res.status(400).json({
            success: false,
            message: "Title and notice message are required."
        });
    }

    // Only Owner can create GLOBAL notices
    if (isGlobal && !scope.isOwner) {
        return res.status(403).json({
            success: false,
            message: "Only Owner can create global notices."
        });
    }

    const organizationCode = isGlobal
        ? null
        : scope.organizationCode;

    const branchCode = isGlobal
        ? null
        : scope.branchCode;

    const sql = `
        INSERT INTO notices (
            title,
            message,
            organization_code,
            branch_code,
            created_by,
            is_global
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        title,
        message,
        organizationCode,
        branchCode,
        req.session.userId,
        isGlobal ? 1 : 0
    ];

    db.run(sql, params, function (error) {
        if (error) {
            console.error("Create notice error:", error);

            return res.status(500).json({
                success: false,
                message: "Could not create notice."
            });
        }

        return res.status(201).json({
            success: true,
            message: isGlobal
                ? "Global notice published successfully."
                : "Notice published successfully.",
            noticeId: this.lastID
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

    const notificationId = Number(req.params.id);
    const userId = Number(req.session.userId);

    db.run(
        `UPDATE notifications
         SET is_read = 1
         WHERE id = ?
         AND recipient_user_id = ?`,
        [notificationId, userId],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to mark notification as read"
                });
            }

            return res.json({
                success: true,
                updated: this.changes
            });
        }
    );
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
app.get("/api/about", (req, res) => {
    db.get(
        `SELECT * FROM about_settings WHERE id = 1`,
        [],
        (error, aboutData) => {
            if (error) {
                console.error("Load About error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Could not load About details."
                });
            }

            return res.json({
                success: true,
                about: aboutData || {}
            });
        }
    );
});
app.put("/api/about", (req, res) => {
    if (
        !req.session ||
        !req.session.isLoggedIn ||
        req.session.role !== "owner"
    ) {
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
        version,

        overview_heading,
        capabilities_heading,
        founder_role,
        founder_journey,
        founder_vision,
        journey_heading,
        journey,
        contact_heading,
        contact_description,
        personal_family_heading,
personal_name,
personal_role,
personal_description,

father_name,
father_role,
father_description,

mother_name,
mother_role,
mother_description,

family_note,
        cofounder_enabled,
        cofounder_name,
        cofounder_role,
        cofounder_bio,
        cofounder_image
    } = req.body;

    db.run(
        `
        UPDATE about_settings
        SET
            platform_title = ?,
            platform_description = ?,
            version = ?,

            overview_heading = ?,
            overview_description = ?,

            capabilities_heading = ?,
            capabilities_json = ?,

            founder_name = ?,
            founder_role = ?,
            founder_bio = ?,
            founder_journey = ?,
            founder_vision = ?,

            journey_heading = ?,
            journey_json = ?,

            contact_heading = ?,
            contact_description = ?,
            personal_family_heading = ?,
personal_name = ?,
personal_role = ?,
personal_description = ?,

father_name = ?,
father_role = ?,
father_description = ?,

mother_name = ?,
mother_role = ?,
mother_description = ?,

family_note = ?,    
            cofounder_enabled = ?,
            cofounder_name = ?,
            cofounder_role = ?,
            cofounder_bio = ?,
            cofounder_image = ?

        WHERE id = 1
        `,
        [
            heading || "Global Study Portal",
            description || "",
            version || "Version 1.0",

            overview_heading || "",
            purpose || "",

            capabilities_heading || "",
            features || "[]",

            founder_name || "Aditya Chourasia",
            founder_role || "Founder & Full-Stack Developer",
            founder_description || "",
            founder_journey || "",
            founder_vision || "",

            journey_heading || "",
            journey || "[]",

            contact_heading || "",
            contact_description || "",
            personal_family_heading || "",
personal_name || "",
personal_role || "",
personal_description || "",

father_name || "",
father_role || "",
father_description || "",

mother_name || "",
mother_role || "",
mother_description || "",

family_note || "",
            cofounder_enabled ? 1 : 0,
            cofounder_name || "",
            cofounder_role || "",
            cofounder_bio || "",
            cofounder_image || ""
        ],
        function (error) {
            if (error) {
                console.error(
                    "Update About error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Could not update About content."
                });
            }

            notifyUsers({
                title: "About Section Updated",
                message: "Portal About information was updated.",
                category: "system",
                priority: "info",

                actorUserId: req.session.userId,
                recipientRoles: ["owner"],
                actionUrl: "/dashboard"
            });

            return res.json({
                success: true,
                message: "About content updated successfully."
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


app.post(
    "/api/notices",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
        const title = String(req.body.title || "").trim();
        const message = String(req.body.message || "").trim();
        const scope = getScope(req);

        console.log(
            "NOTICE POST SCOPE:",
            req.session.role,
            scope
        );

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required."
            });
        }

        let organizationCode = null;
        let branchCode = null;

        if (scope.isOwner) {
            organizationCode =
                req.body.organizationCode?.trim() || null;

            branchCode =
                req.body.branchCode?.trim() || null;
        } else if (req.session.role === "super_admin") {
            // Super Admin notice is organization-wide
            organizationCode = scope.organizationCode;
            branchCode = null;
        } else if (req.session.role === "admin") {
            // Admin notice is branch-specific
            organizationCode = scope.organizationCode;
            branchCode = scope.branchCode;
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
                organizationCode,
                branchCode
            ],
            function (error) {
                if (error) {
                    console.error(
                        "Create notice error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Could not add notice."
                    });
                }
notifyUsers({
    title: "New Notice",
    message: `${title}: ${message}`,
    category: "notice",
    priority: "important",

    actorUserId: req.session.userId,

    organizationCode,
    branchCode,

    recipientRoles: ["owner", "super_admin", "admin", "user"],
    actionUrl: "/dashboard"
});

                return res.json({
                    success: true,
                    message: "Notice added successfully.",
                    id: this.lastID
                });
            }
        );
    }
);

// =====================================================
// PROGRESS REPORT - STRICT PER USER ISOLATION
// =====================================================

app.get("/api/progress", (req, res) => {
    if (
        !req.session ||
        !req.session.isLoggedIn ||
        !req.session.userId
    ) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = Number(req.session.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({
            success: false,
            message: "Invalid session."
        });
    }

    db.all(
        `SELECT *
         FROM progress_report
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error(
                    "Progress fetch error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Could not load progress."
                });
            }

            return res.json({
                success: true,
                data: rows || []
            });
        }
    );
});


app.post("/api/progress", (req, res) => {
    if (
        !req.session ||
        !req.session.isLoggedIn ||
        !req.session.userId
    ) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = Number(req.session.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({
            success: false,
            message: "Invalid session."
        });
    }

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
            userId,
            progress_date || null,
            Number(total_study_time || 0),
            Number(pomodoro_sessions || 0),
            Number(completed_tasks || 0),
            Number(productivity || 0),
            req.session.organizationCode || null,
            req.session.branchCode || null
        ],
        function (err) {
            if (err) {
                console.error(
                    "Progress save error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Could not save progress."
                });
            }

            notifyUsers({
                title: "Progress Updated",
                message:
                    "Your study progress report was updated.",
                category: "progress",
                priority: "info",

                actorUserId: userId,
                targetUserId: userId,

                organizationCode:
                    req.session.organizationCode || null,
                branchCode:
                    req.session.branchCode || null,

                recipientUserIds: [userId],
                recipientRoles: ["owner"],

                module: "progress",
                actionUrl: "/dashboard",
                eventKey:
                    `progress_${userId}_${this.lastID}`
            });

            return res.json({
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
//         "SELECT * FROM about_content WHERE id = 1",
//         [],
//         (err, row) => {
//             if (err) {
//                 console.error("Load about content error:", err);

//                 return res.status(500).json({
//                     success: false,
//                     message: "Could not load About content."
//                 });
//             }

//             return res.json({
//                 success: true,
//                 about: row
//             });
//         }
//     );
// });
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
app.post(
    "/api/users",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const password = String(req.body.password || "").trim();
        const role = String(req.body.role || "")
            .trim()
            .toLowerCase();

        const mobile = String(req.body.mobile || "").trim();
        const enrollment = String(req.body.enrollment || "").trim();
        const branch = String(req.body.branch || "").trim();

        const semester =
            req.body.semester !== undefined &&
            req.body.semester !== null &&
            req.body.semester !== ""
                ? Number(req.body.semester)
                : null;

        const admissionYear =
            req.body.admission_year !== undefined &&
            req.body.admission_year !== null &&
            req.body.admission_year !== ""
                ? Number(req.body.admission_year)
                : null;

        const requestedOrganizationCode = String(
            req.body.organization_code || ""
        ).trim();

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const allowedRoles = [
            "owner",
            "super_admin",
            "admin",
            "user"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role selected"
            });
        }

        db.get(
            `SELECT
                id,
                name,
                email,
                role,
                organization_code,
                branch,
                branch_code
             FROM users
             WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
            [req.session.email],
            (currentUserErr, currentUser) => {
                if (currentUserErr) {
                    console.error(
                        "Create user current account fetch error:",
                        currentUserErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to verify current account"
                    });
                }

                if (!currentUser) {
                    return res.status(404).json({
                        success: false,
                        message: "Logged-in account not found"
                    });
                }

                const currentRole = String(
                    currentUser.role || ""
                )
                    .trim()
                    .toLowerCase();

                if (
                    currentRole === "admin" &&
                    role !== "user"
                ) {
                    return res.status(403).json({
                        success: false,
                        message: "Admin can only create User accounts"
                    });
                }

                if (
                    currentRole === "super_admin" &&
                    !["admin", "user"].includes(role)
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "Super Admin can only create Admin and User accounts"
                    });
                }

                if (
                    currentRole === "owner" &&
                    !["super_admin", "admin", "user"].includes(role)
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "Owner can only create Super Admin, Admin and User accounts"
                    });
                }

                let finalOrganizationCode = "";
                let finalBranch = branch;
                let finalBranchCode = branch;

                if (currentRole === "owner") {
                    finalOrganizationCode =
                        requestedOrganizationCode;

                    if (!finalOrganizationCode) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Organization code is required when Owner creates an account"
                        });
                    }
                } else {
                    finalOrganizationCode = String(
                        currentUser.organization_code || ""
                    ).trim();

                    if (!finalOrganizationCode) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Your account does not have an organization code"
                        });
                    }
                }

                if (currentRole === "admin") {
                    finalBranch = String(
                        currentUser.branch ||
                        currentUser.branch_code ||
                        ""
                    ).trim();

                    finalBranchCode = String(
                        currentUser.branch_code ||
                        currentUser.branch ||
                        ""
                    ).trim();

                    if (!finalBranchCode) {
                        return res.status(400).json({
                            success: false,
                            message:
                                "Your Admin account does not have a branch"
                        });
                    }
                }

                if (
                    currentRole === "super_admin" &&
                    !finalBranchCode
                ) {
                    finalBranchCode = finalBranch;
                }

                if (
                    currentRole === "owner" &&
                    !finalBranchCode
                ) {
                    finalBranchCode = finalBranch;
                }

                db.get(
                    `SELECT id
                     FROM users
                     WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
                    [email],
                    (existingUserErr, existingUser) => {
                        if (existingUserErr) {
                            console.error(
                                "Existing user check error:",
                                existingUserErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to verify email availability"
                            });
                        }

                        if (existingUser) {
                            return res.status(409).json({
                                success: false,
                                message:
                                    "This email is already registered"
                            });
                        }

                        let hashedPassword;

                        try {
                            hashedPassword =
                                bcrypt.hashSync(password, 10);
                        } catch (hashErr) {
                            console.error(
                                "Password hashing error:",
                                hashErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to secure the password"
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
                                hashedPassword,
                                role,
                                mobile || null,
                                enrollment || null,
                                finalBranch || null,
                                semester,
                                admissionYear,
                                finalOrganizationCode,
                                finalBranchCode || null
                            ],
                            function (insertErr) {
                                if (insertErr) {
                                    console.error(
                                        "Create user insert error:",
                                        insertErr
                                    );

                                    if (
                                        String(insertErr.message)
                                            .toLowerCase()
                                            .includes("unique")
                                    ) {
                                        return res.status(409).json({
                                            success: false,
                                            message:
                                                "This email is already registered"
                                        });
                                    }

                                    return res.status(500).json({
                                        success: false,
                                        message: insertErr.message
                                    });
                                }
                                createNotification({
    title: "New User Created",
    message: `${name} (${email}) was created as ${role}.`,
    category: "user_management",
    priority: "info",

    actorUserId: req.session.userId,
    actorEmail: req.session.email,

    targetUserId: this.lastID,

    recipientUserId: this.lastID,
    recipientEmail: email,
    recipientRole: role,

    organizationCode: finalOrganizationCode,
    branchCode: finalBranchCode || null,

    module: "user_management",
    actionUrl: "/dashboard",
    eventKey: `user_created_${this.lastID}`
}).catch(err => {
    console.error("User creation notification error:", err);
});

                                return res.json({
                                    success: true,
                                    message: `${role} account created successfully`,
                                    userId: this.lastID,
                                    organization_code:
                                        finalOrganizationCode,
                                    branch: finalBranch || null,
                                    branch_code:
                                        finalBranchCode || null
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);

// Get all registered users - Owner/Admin only
app.get(
    "/api/users",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
        const scope = getScope(req);

        const fields = `
            u.id,
            u.name,
            u.email,
            u.role,
            u.mobile,
            u.enrollment,
            u.branch,
            u.semester,
            u.admission_year,
            u.organization_code,
            u.branch_code,
            o.name AS organization_name
        `;

        // OWNER → all users
        if (scope.isOwner) {
            return db.all(
                `
                SELECT ${fields}
                FROM users u
                LEFT JOIN organizations o
                    ON u.organization_code = o.organization_code
                ORDER BY u.id DESC
                `,
                [],
                (err, users) => {
                    if (err) {
                        console.error("Owner users fetch error:", err);

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    return res.json({
                        success: true,
                        users
                    });
                }
            );
        }

        // SUPER ADMIN → only assigned organization
        if (req.session.role === "super_admin") {
            return db.all(
                `
                SELECT ${fields}
                FROM users u
                LEFT JOIN organizations o
                    ON u.organization_code = o.organization_code
                WHERE u.organization_code = ?
                ORDER BY u.id DESC
                `,
                [scope.organizationCode],
                (err, users) => {
                    if (err) {
                        console.error("Super Admin users fetch error:", err);

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    return res.json({
                        success: true,
                        users
                    });
                }
            );
        }

        // ADMIN → own organization + own branch users
        return db.all(
            `
            SELECT ${fields}
            FROM users u
            LEFT JOIN organizations o
                ON u.organization_code = o.organization_code
            WHERE u.organization_code = ?
            AND (
                u.role = 'super_admin'
                OR (
                    u.role = 'user'
                    AND u.branch_code = ?
                )
            )
            ORDER BY u.id DESC
            `,
            [
                scope.organizationCode,
                scope.branchCode
            ],
            (err, users) => {
                if (err) {
                    console.error("Admin users fetch error:", err);

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                return res.json({
                    success: true,
                    users
                });
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
    account.organization_code !== req.session.organizationCode
) {
    return res.status(403).json({
        success: false,
        message: "You can only manage users from your own organization."
    });
}       
if (
    req.session.role === "super_admin" &&
    account.role === "super_admin"
) {
    return res.status(403).json({
        success: false,
        message: "Super Admin cannot modify another Super Admin."
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
createNotification({
    title: "Role Changed",
    message: `${account.name}'s role changed from ${account.role} to ${newRole}.`,
    category: "user_management",
    priority: "important",

    actorUserId: req.session.userId,
    actorEmail: req.session.email,

    targetUserId: userId,
    recipientUserId: userId,
    recipientRole: newRole,

    organizationCode: account.organization_code,

    module: "user_management",
    actionUrl: "/dashboard",
    eventKey: `role_changed_${userId}_${Date.now()}`
}).catch(err => {
    console.error("Role change notification error:", err);
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
        if (
    req.session.role === "super_admin" &&
    account.role === "super_admin"
) {
    return res.status(403).json({
        success: false,
        message: "Super Admin cannot remove another Super Admin."
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
                const hashedPassword = bcrypt.hashSync(newPassword, 10);
                db.run(
                    "UPDATE users SET password = ? WHERE id = ?",
                    [hashedPassword, userId],
                    function (err) {
                        if (err) {
                            console.error("Password update error:", err);

                            return res.status(500).json({
                                success: false,
                                message: "Could not change password"
                            });
                        }
                        notifyUsers({
    title: "Password Changed",
    message: "Your account password was changed by an authorized administrator.",
    category: "security",
    priority: "important",

    actorUserId: req.session.userId,
    targetUserId: userId,

    recipientUserIds: [userId],

    module: "security",
    actionUrl: "/dashboard",
    eventKey: `password_changed_${userId}_${Date.now()}`
});

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
notifyUsers({
    title: "Profile Updated",
    message: "Your profile details were updated by an authorized administrator.",
    category: "profile",
    priority: "info",

    actorUserId: req.session.userId,
    targetUserId: userId,

    recipientUserIds: [userId],

    module: "user_management",
    actionUrl: "/dashboard",
    eventKey: `profile_updated_${userId}_${Date.now()}`
});

                res.json({
                    success: true,
                    message: "User profile updated successfully"
                });
            }
        );
    }
);

const PORT = process.env.PORT || 3001;
const FRONTEND_FOLDER = path.resolve(__dirname, "..");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const OWNER_EMAIL =
    process.env.OWNER_EMAIL || "adityachourasia1985@gmail.com";

const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

if (!OWNER_PASSWORD) {
    console.error("OWNER_PASSWORD environment variable is missing");
} else {
    const ownerPasswordHash = bcrypt.hashSync(OWNER_PASSWORD, 10);

    db.run(
        `INSERT INTO users (
            name,
            email,
            password,
            role
        )
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            password = excluded.password,
            role = 'owner'`,
        [
            "Aditya",
            OWNER_EMAIL,
            ownerPasswordHash,
            "owner"
        ],
        (error) => {
            if (error) {
                console.error("Owner account setup error:", error);
            } else {
                console.log("Owner account ready");
            }
        }
    );
}


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
        organizationAction,
        organizationName,
        enrollment,
        branch,
        semester,
        admissionYear,
        branchCode,
        organizationCode
    } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

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
const normalizedOrganizationAction = String(
    req.body.organizationAction || ""
).trim().toLowerCase();

const isIndividual =
    accountType === "individual";
const isNewOrganization =
    accountType === "organization" &&
    organizationAction === "create";

const isJoiningOrganization =
    accountType === "organization" &&
    organizationAction === "join";

let finalOrganizationCode =
    organizationCode?.trim() || null;

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
        const normalizedEmail =
    email.trim().toLowerCase();

const normalizedAccountType =
    accountType === "organization"
        ? "organization"
        : "individual";
        const existingSameTypeAccount = await new Promise(
    (resolve, reject) => {
        db.get(
            `SELECT id
             FROM users
             WHERE LOWER(TRIM(email)) = ?
             AND LOWER(TRIM(account_type)) = ?
             LIMIT 1`,
            [
                normalizedEmail,
                normalizedAccountType
            ],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
    }
);
if (existingSameTypeAccount) {
    return res.status(409).json({
        success: false,
        message:
            normalizedAccountType === "individual"
                ? "An Individual account already exists with this email. You may still create one Organization account."
                : "An Organization account already exists with this email. You may still create one Individual account."
    });
}
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
            status,
           account_type   
        )
        VALUES (? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name.trim(),
            email.trim().toLowerCase(),
            hashedPassword,
          newRole,

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
                newStatus,
                

        ],
        function (err) {
            if (err) {
                if (
                    err.message &&
                    err.message.includes("UNIQUE")
                ) {
                    return res.status(409).json({
                        success: false,
                        message: "This email is already registered. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password."
                    });
                }

                console.error("Registration error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Registration failed."
                });
            }

 if (isNewOrganization && organizationName?.trim()) {
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
if (isJoiningOrganization) {
notifyUsers({
    title: "New Registration Request",
    message: `${name} submitted an organization registration request.`,
    category: "request",
    priority: "important",
    actorUserId: newUserId,
targetUserId: newUserId,
    organizationCode: finalOrganizationCode || null,
    branchCode: branchCode?.trim() || null,
    recipientRoles: ["owner", "super_admin", "superadmin"],
    actionUrl: "/dashboard"
});
}if (isNewOrganization) {
    notifyUsers({
    title: "Organization Created",
    message: `${name} created a new organization successfully.`,
    category: "organization",
    priority: "important",

    actorUserId: newUserId,
    targetUserId: newUserId,

    organizationCode: finalOrganizationCode,

    recipientUserIds: [newUserId],
    recipientRoles: ["owner"],

    module: "organization",
    actionUrl: "/dashboard",
    eventKey: `organization_created_${newUserId}`
});

    return res.json({
        success: true,
        message:
            `Organization created successfully. ` +
            `Your organization code is ${finalOrganizationCode}. ` +
            `You can login now.`,
        organizationCode: finalOrganizationCode
    });
}

if (isJoiningOrganization) {
    return res.json({
        success: true,
        message:
            "Registration submitted successfully. " +
            "Your account is waiting for Super Admin approval.",
        organizationCode: finalOrganizationCode
    });
}

return res.json({
    success: true,
    message: "Individual account created successfully. You can login now.",
    organizationCode: null
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
        gender,
        profession,
        enrollment,
        branch,
        semester,
        admissionYear,
        branchCode,
        organizationCode
    } = req.body;

    const cleanName = String(name || "").trim();

    const cleanEmail = String(email || "")
        .trim()
        .toLowerCase();

    const cleanPassword = String(password || "");

    const cleanOrganizationCode = String(
        organizationCode || ""
    )
        .trim()
        .toUpperCase();

    // Branch Code खाली हो तो Branch को fallback बनाओ
    const cleanBranchCode = String(
        branchCode || branch || ""
    )
        .trim()
        .toUpperCase();

    const cleanBranch = String(branch || "").trim();

    if (
        !cleanName ||
        !cleanEmail ||
        !cleanPassword ||
        !cleanOrganizationCode ||
        !cleanBranchCode
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Name, email, password, organization code and branch are required."
        });
    }

    if (cleanPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters."
        });
    }

   db.get(
    `SELECT id, organization_code
     FROM users
     WHERE UPPER(TRIM(organization_code)) = UPPER(TRIM(?))
     AND LOWER(TRIM(role)) IN ('super_admin', 'owner')
     LIMIT 1`,
    [cleanOrganizationCode],

        (organizationError, organization) => {
            if (organizationError) {
                console.error(
                    "Organization lookup error:",
                    organizationError
                );

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

          db.get(
    `SELECT id, organization_code
     FROM users
     WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
     LIMIT 1`,
    [cleanEmail],
    (emailError, existingUser) => {
        if (emailError) {
            console.error(
                "Join email check error:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message: "Could not verify email."
            });
        }

        if (existingUser) {
    return res.status(409).json({
        success: false,
        code: "EMAIL_ALREADY_REGISTERED",
        email: cleanEmail,
        message:
            `${cleanEmail} is already registered. ` +
            `Please login with this account or use Forgot Password to reset access.`
    });
}

                    let hashedPassword;

                    try {
                        hashedPassword = bcrypt.hashSync(
                            cleanPassword,
                            10
                        );
                    } catch (hashError) {
                        console.error(
                            "Join password hash error:",
                            hashError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Could not secure password."
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
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            cleanName,
                            cleanEmail,
                            hashedPassword,
                            "user",
                            String(mobile || "").trim() || null,
                            dateOfBirth || null,
                            String(gender || "").trim() || null,
                            String(enrollment || "").trim() || null,
                            cleanBranch || cleanBranchCode,
                            semester ? Number(semester) : null,
                            admissionYear
                                ? Number(admissionYear)
                                : null,
                            String(profession || "").trim() ||
                                "Student",
                            cleanBranchCode,
                            cleanOrganizationCode,
                            "pending"
                        ],
                        function (userError) {
                            if (userError) {
                                console.error(
                                    "Join user creation error:",
                                    userError
                                );

                                if (
                                    String(userError.message)
                                        .toLowerCase()
                                        .includes("unique")
                                ) {
                                    return res.status(409).json({
                                        success: false,
                                        message:
                                            "This email is already registered. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password. Please login with this account or use Forgot Password to reset your password."
                                    });
                                }

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Could not create join request."
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

                                        // आधा बना user हटाओ
                                        db.run(
                                            `DELETE FROM users
                                             WHERE id = ?`,
                                            [newUserId]
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Could not submit join request."
                                        });
                                    }

                                    notifyUsers({
                                        title: "New Join Request",
                                        message:
                                            `${cleanName} wants to join ${cleanOrganizationCode}.`,
                                        category: "request",
                                        priority: "important",
                                        actorUserId: newUserId,
                                        targetUserId: newUserId,
                                        organizationCode:
                                            cleanOrganizationCode,
                                        branchCode: cleanBranchCode,
                                        recipientRoles: [
                                            "owner",
                                            "super_admin"
                                        ],
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
notifyUsers({
    title: "Account Approved",
    message: "Your account has been approved successfully.",
    category: "account",
    priority: "important",

    actorUserId: req.session.userId,
    targetUserId: userId,

    recipientUserIds: [userId],

    module: "user_management",
    actionUrl: "/dashboard",
    eventKey: `user_approved_${userId}_${Date.now()}`
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
console.log("LOGIN CHECK:", {
    email: email,
    passwordReceived: !!password,
    passwordLength: password.length
});

db.all(
    "SELECT id, name, email, role, status FROM users LIMIT 20",
    (e, rows) => {
        console.log("RAILWAY USERS SAMPLE:", e || rows);
    }
);

db.get(
        
        "SELECT * FROM users WHERE LOWER(email) = ?",
        [email],
        (err, account) => {
            console.log(account)
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

                if (
    !account ||
    !account.password ||
    !bcrypt.compareSync(
    password,
    account.password
)
) {
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
            req.session.organizationCode =
    account.organization_code || "OWNER";
req.session.branchCode = account.branch_code;
       notifyUsers({
    title: "Account Login",
    message: `${account.name || account.email} logged into the portal.`,
    category: "security",
    priority: "info",

    actorUserId: account.id,
    targetUserId: account.id,

    organizationCode: account.organization_code,
    branchCode: account.branch_code,

    recipientUserIds: [account.id],
    recipientRoles: ["owner"],

    module: "authentication",
    actionUrl: "/dashboard",
    eventKey: `login_${account.id}_${Date.now()}`
});

return res.json({
                success: true,
                message: "Login successful",
                role: account.role,
                name: account.name
            });
        }
    );
});
app.post("/forgot-password", (req, res) => {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    const genericResponse = {
        success: true,
        message:
            "If an account exists for this email, reset instructions have been sent."
    };

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Please enter your registered email."
        });
    }

    db.get(
        `
        SELECT id, email
        FROM users
        WHERE LOWER(email) = ?
        `,
        [email],
        (findError, user) => {
            if (findError) {
                console.error(
                    "Forgot password lookup error:",
                    findError
                );

                return res.status(500).json({
                    success: false,
                    message: "Could not process reset request."
                });
            }

            // Registered email exists or not, do not reveal it
            if (!user) {
                return res.json(genericResponse);
            }

            const resetToken = generateResetToken();
            const tokenHash = hashResetToken(resetToken);
            const expiresAt = getResetTokenExpiry();
            const currentTime = Math.floor(Date.now() / 1000);

            db.run(
                `
                UPDATE password_reset_tokens
                SET used_at = ?
                WHERE user_id = ?
                  AND used_at IS NULL
                `,
                [currentTime, user.id],
                (invalidateError) => {
                    if (invalidateError) {
                        console.error(
                            "Old token invalidation error:",
                            invalidateError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Could not process reset request."
                        });
                    }

                    db.run(
                        `
                        INSERT INTO password_reset_tokens (
                            user_id,
                            token_hash,
                            expires_at
                        )
                        VALUES (?, ?, ?)
                        `,
                        [user.id, tokenHash, expiresAt],
                        (insertError) => {
                            if (insertError) {
                                console.error(
                                    "Reset token creation error:",
                                    insertError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Could not create reset request."
                                });
                            }

                            const baseUrl =
                                process.env.APP_BASE_URL ||
                                `${req.protocol}://${req.get("host")}`;

                            const resetLink =
                                `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
                                 console.log("FORGOT PASSWORD EMAIL DEBUG:", {
    to: user.email,
    from: process.env.EMAIL_USER,
    baseUrl,
    hasEmailPass: !!process.env.EMAIL_PASS
});

 (async () => {
    try {
        const emailContent = [
            `From: Global Study Portal <${process.env.GMAIL_SENDER}>`,
            `To: ${user.email}`,
            `Subject: Reset Your Global Study Portal Password`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            `
                <h2>Password Reset Request</h2>

                <p>Hello,</p>

                <p>
                    We received a request to reset your
                    Global Study Portal password.
                </p>

                <p>
                    <a href="${resetLink}">
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in 15 minutes.
                </p>

                <p>
                    If you did not request this,
                    you can ignore this email.
                </p>
            `
        ].join("\r\n");

        const encodedMessage = Buffer
            .from(emailContent)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log(
            "Password reset email sent successfully to:",
            user.email
        );

     notifyUsers({
    title: "Password Reset Requested",
    message:
        "A password reset was requested for your account.",
    category: "security",
    priority: "important",

    actorUserId: user.id,
    targetUserId: user.id,

    recipientUserIds: [user.id],
    recipientRoles: ["owner"],

    module: "authentication",
    actionUrl: "/login.html",
    eventKey:
        `password_reset_requested_${user.id}_${Date.now()}`
});

        return res.json(genericResponse);

    } catch (mailError) {
        console.error(
            "Gmail API password reset error:",
            mailError
        );

        return res.status(500).json({
            success: false,
            message:
                "Reset request was created, but email could not be sent."
        });
    }
})();


                        }
                    );
                }
            );
        }
    );
});

app.get("/reset-password", (req, res) => {
    res.sendFile("reset-password.html", {
        root: __dirname
    });
});
app.post("/reset-password", (req, res) => {
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "").trim();

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Token and password are required."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters."
        });
    }

    const tokenHash = hashResetToken(token);
    console.log("Received Hash:", tokenHash);
    const currentTime = Math.floor(Date.now() / 1000);

    db.get(
        `SELECT *
         FROM password_reset_tokens
         WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > ?`,
        [tokenHash, currentTime],
        (err, resetRow) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to verify token."
                });
            }

            if (!resetRow) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired reset token."
                });
            }

            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            db.run(
                `UPDATE users
                 SET password = ?
                 WHERE id = ?`,
                [hashedPassword, resetRow.user_id],
                function (err) {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Could not update password."
                        });
                    }

                    db.run(
                        `UPDATE password_reset_tokens
                         SET used_at = ?
                         WHERE id = ?`,
                        [currentTime, resetRow.id]
                    );
notifyUsers({
    title: "Password Reset Successful",
    message: "Your account password was reset successfully.",
    category: "security",
    priority: "important",

    actorUserId: resetRow.user_id,
    targetUserId: resetRow.user_id,

    recipientUserIds: [resetRow.user_id],
    recipientRoles: ["owner"],

    module: "authentication",
    actionUrl: "/login.html",
    eventKey:
        `password_reset_${resetRow.user_id}_${Date.now()}`
});


                    return res.json({
                        success: true,
                        message: "Password reset successfully."
                    });
                }
            );
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
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Not logged in"
        });
    }

    db.get(
        `SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.organization_code,
            o.name AS organization_name,
            u.profession,
            u.mobile,
            u.enrollment,
            u.branch,
            u.semester,
            u.admission_year,
            u.profile_image
         FROM users u
         LEFT JOIN organizations o
            ON u.organization_code = o.organization_code
         WHERE u.email = ?`,
        [req.session.email],
        (err, account) => {
            if (err) {
                console.error("/api/me error:", err);

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

            const accountType = account.organization_code
                ? "organization"
                : "individual";

            return res.json({
                success: true,

                userId: account.id,
                id: account.id,
                name: account.name,
                email: account.email,
                role: account.role,

                accountType,
                account_type: accountType,

                organization_code: account.organization_code,
                organization_name: account.organization_name,

                profession: account.profession,
                mobile: account.mobile,
                enrollment: account.enrollment,
                branch: account.branch,
                semester: account.semester,
                admission_year: account.admission_year,

                user: {
                    ...account,
                    accountType,
                    account_type: accountType
                }
            });
        }
    );
});

app.post(
    "/api/profile/photo",
    uploadProfileImage.single("profile_image"),
    (req, res) => {
        if (!req.session?.email) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a profile photo"
            });
        }

        const imagePath = `/uploads/profiles/${req.file.filename}`;

        db.run(
            `UPDATE users
             SET profile_image = ?
             WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
            [imagePath, req.session.email],
            function (err) {
                if (err) {
                    console.error("Profile photo update error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Could not update profile photo"
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Logged-in user not found"
                    });
                }

                return res.json({
                    success: true,
                    message: "Profile photo updated successfully",
                    profile_image: imagePath
                });
            }
        );
    }
);

;// Get permissions of CURRENT logged-in user
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

app.get(
    "/api/users/:id/permissions",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
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
    }
);
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
            notifyUsers({
    title: "Permissions Updated",
    message: "Your account permissions were updated by the Owner.",
    category: "security",
    priority: "important",

    actorUserId: req.session.userId,
    targetUserId: userId,

    recipientUserIds: [userId],
    recipientRoles: ["owner"],

    module: "user_management",
    actionUrl: "/dashboard",
    eventKey: `permissions_updated_${userId}_${Date.now()}`
});

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
notifyUsers({
    title: "Attendance Deleted",
    message: "An attendance record was deleted.",
    category: "attendance",
    priority: "info",

    actorUserId: req.session.userId,

    organizationCode: req.session.organizationCode,
    branchCode: req.session.branchCode,

    recipientRoles: ["owner", "super_admin", "admin", "user"],

    module: "attendance",
    actionUrl: "/dashboard",
    eventKey: `attendance_deleted_${Date.now()}`
});

            res.json({
                success: true,
                message: "Attendance deleted successfully"
            });
        }
    );
});
// ================================
// GET ATTENDANCE
// ================================
app.get("/api/attendance", (req, res) => {
    if (!req.session?.email) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    db.get(
        `SELECT
            id,
            role,
            email,
            organization_code,
            branch,
            branch_code
         FROM users
         WHERE LOWER(email) = LOWER(?)`,
        [req.session.email],
        (userErr, currentUser) => {
            if (userErr) {
                console.error("Attendance user fetch error:", userErr);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load user details"
                });
            }

            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: "Logged-in user not found"
                });
            }

            const role = String(currentUser.role || "")
                .trim()
                .toLowerCase();

            const organizationCode = String(
                currentUser.organization_code || ""
            ).trim();

            const branchCode = String(
                currentUser.branch_code ||
                currentUser.branch ||
                ""
            ).trim();

            let sql = "";
            let params = [];

            if (role === "owner") {
                // Owner can see all attendance records
                sql = `
                    SELECT *
                    FROM attendance
                    ORDER BY id DESC
                `;
            } else if (role === "super_admin") {
                // Super Admin can see only its organization
                sql = `
                    SELECT *
                    FROM attendance
                    WHERE LOWER(TRIM(organization_code)) = LOWER(TRIM(?))
                    ORDER BY id DESC
                `;

                params = [organizationCode];
            } else if (role === "admin") {
                // Admin can see only its organization and branch
                sql = `
                    SELECT *
                    FROM attendance
                    WHERE LOWER(TRIM(organization_code)) = LOWER(TRIM(?))
                    AND LOWER(TRIM(branch_code)) = LOWER(TRIM(?))
                    ORDER BY id DESC
                `;

                params = [organizationCode, branchCode];
            } else {
                // Normal user sees only their own attendance
                sql = `
                    SELECT *
                    FROM attendance
                    WHERE LOWER(TRIM(student_email)) = LOWER(TRIM(?))
                    ORDER BY id DESC
                `;

                params = [currentUser.email];
            }

            db.all(sql, params, (attendanceErr, rows) => {
                if (attendanceErr) {
                    console.error(
                        "Attendance fetch error:",
                        attendanceErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to load attendance"
                    });
                }

                return res.json({
                    success: true,
                    attendance: rows || []
                });
            });
        }
    );
});
app.get("/api/attendance/students", (req, res) => {
    if (!req.session?.email) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    db.get(
        `SELECT
            role,
            organization_code,
            branch,
            branch_code
         FROM users
         WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
        [req.session.email],
        (currentUserError, currentUser) => {
            if (currentUserError) {
                console.error(
                    "Attendance students current user error:",
                    currentUserError
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load current account"
                });
            }

            if (!currentUser) {
                return res.status(404).json({
                    success: false,
                    message: "Logged-in account not found"
                });
            }

            const role = String(currentUser.role || "")
                .trim()
                .toLowerCase();

            const organizationCode = String(
                currentUser.organization_code || ""
            ).trim();

            const branchCode = String(
                currentUser.branch_code ||
                currentUser.branch ||
                ""
            ).trim();

            let sql = "";
            let params = [];

            if (role === "owner") {
                sql = `
                    SELECT id, name, email, role, branch
                    FROM users
                    WHERE LOWER(TRIM(role)) = 'user'
                    ORDER BY name ASC
                `;
           } else if (role === "super_admin") {
    sql = `
        SELECT id, name, email, role, branch, organization_code
        FROM users
        WHERE LOWER(TRIM(role)) = 'user'
        ORDER BY name ASC
    `;

    params = [];
            } else if (role === "admin") {
                sql = `
                    SELECT id, name, email, role, branch
                    FROM users
                    WHERE LOWER(TRIM(role)) = 'user'
                    AND LOWER(TRIM(organization_code)) =
                        LOWER(TRIM(?))
                    AND LOWER(
                        TRIM(COALESCE(branch_code, branch, ''))
                    ) = LOWER(TRIM(?))
                    ORDER BY name ASC
                `;

                params = [
                    organizationCode,
                    branchCode
                ];
            } else {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            db.all(sql, params, (studentsError, students) => {
                if (studentsError) {
                    console.error(
                        "Attendance students fetch error:",
                        studentsError
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to load students"
                    });
                }

                return res.json({
                    success: true,
                    users: students || []
                });
            });
        }
    );
});


// ================================
// ADD ATTENDANCE
// ================================
app.post(
    "/api/attendance",
    allowRoles("owner", "super_admin", "admin"),
    (req, res) => {
        const studentEmail = String(
            req.body.student_email || ""
        ).trim();

        const subject = String(
            req.body.subject || ""
        ).trim();

        const totalClasses = Number(req.body.total_classes);
        const attendedClasses = Number(req.body.attended_classes);

        if (
            !studentEmail ||
            !subject ||
            !Number.isFinite(totalClasses) ||
            !Number.isFinite(attendedClasses)
        ) {
            return res.status(400).json({
                success: false,
                message: "All attendance fields are required"
            });
        }

        if (
            totalClasses < 0 ||
            attendedClasses < 0 ||
            attendedClasses > totalClasses
        ) {
            return res.status(400).json({
                success: false,
                message: "Attendance values are invalid"
            });
        }

        // First load logged-in account
        db.get(
            `SELECT
                role,
                email,
                organization_code,
                branch,
                branch_code
             FROM users
             WHERE LOWER(email) = LOWER(?)`,
            [req.session.email],
            (currentUserErr, currentUser) => {
                if (currentUserErr) {
                    console.error(
                        "Current user fetch error:",
                        currentUserErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to verify current user"
                    });
                }

                if (!currentUser) {
                    return res.status(404).json({
                        success: false,
                        message: "Logged-in user not found"
                    });
                }

                // Now load the student whose attendance is being added
                db.get(
                    `SELECT
                        id,
                        email,
                        role,
                        organization_code,
                        branch,
                        branch_code
                     FROM users
                     WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))`,
                    [studentEmail],
                    (studentErr, student) => {
                        if (studentErr) {
                            console.error(
                                "Attendance student fetch error:",
                                studentErr
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to verify student"
                            });
                        }

                        if (!student) {
                            return res.status(404).json({
                                success: false,
                                message:
                                    "No user account found with this email"
                            });
                        }

                        const currentRole = String(
                            currentUser.role || ""
                        )
                            .trim()
                            .toLowerCase();

                        const currentOrganization = String(
                            currentUser.organization_code || ""
                        ).trim();

                        const currentBranch = String(
                            currentUser.branch_code ||
                            currentUser.branch ||
                            ""
                        ).trim();

                        const studentOrganization = String(
                            student.organization_code || ""
                        ).trim();

                        const studentBranch = String(
                            student.branch_code ||
                            student.branch ||
                            ""
                        ).trim();

                        // Super Admin can add attendance only
                        // inside its own organization
                        if (
                            currentRole === "super_admin" &&
                            currentOrganization.toLowerCase() !==
                                studentOrganization.toLowerCase()
                        ) {
                            return res.status(403).json({
                                success: false,
                                message:
                                    "You cannot manage another organization's attendance"
                            });
                        }

                        // Admin can add attendance only
                        // inside its own organization and branch
                        if (
                            currentRole === "admin" &&
                            (
                                currentOrganization.toLowerCase() !==
                                    studentOrganization.toLowerCase() ||
                                currentBranch.toLowerCase() !==
                                    studentBranch.toLowerCase()
                            )
                        ) {
                            return res.status(403).json({
                                success: false,
                                message:
                                    "You can manage attendance only for your own branch"
                            });
                        }

                        db.run(
                            `INSERT INTO attendance
                            (
                                student_email,
                                subject,
                                total_classes,
                                attended_classes,
                                organization_code,
                                branch_code
                            )
                            VALUES (?, ?, ?, ?, ?, ?)`,
                            [
                                student.email.trim(),
                                subject,
                                totalClasses,
                                attendedClasses,
                                studentOrganization,
                                studentBranch
                            ],
                            function (insertErr) {
                                if (insertErr) {
                                    console.error(
                                        "Attendance insert error:",
                                        insertErr
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Unable to save attendance"
                                    });
                                }
                                notifyUsers({
    title: "Attendance Updated",
    message: `${subject} attendance was updated for ${student.email}.`,
    category: "attendance",
    priority: "info",

    actorUserId: req.session.userId,
    targetUserId: student.id,

    organizationCode: student.organization_code,
    branchCode: student.branch_code,

    recipientUserIds: [student.id],
    actionUrl: "/dashboard"
});

                                return res.json({
                                    success: true,
                                    message:
                                        "Attendance saved successfully",
                                    id: this.lastID
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);


// Protected dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
        return res.redirect("/login.html");
    }

    return res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});
app.get("/index.html", (req, res) => {
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
        return res.redirect("/login.html");
    }

    return res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});
// Change password
;

// Logout
app.get("/logout", (req, res) => {
    const userId = req.session.userId;
    const organizationCode = req.session.organizationCode;
    const branchCode = req.session.branchCode;

    if (userId) {
        notifyUsers({
            title: "Account Logout",
            message: "Account logged out of the portal.",
            category: "security",
            priority: "info",

            actorUserId: userId,
            targetUserId: userId,

            organizationCode,
            branchCode,

            recipientUserIds: [userId],
            recipientRoles: ["owner"],

            module: "authentication",
            actionUrl: "/dashboard",
            eventKey: `logout_${userId}_${Date.now()}`
        });
    }

    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.post(
    "/api/timetable",
    allowRoles("owner", "super_admin", "admin"),
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
                message: "Day, time and subject are required."
            });
        }

        const scope = getScope(req);

        let organizationCode = null;
        let branchCode = null;

        if (scope.isOwner) {
            organizationCode =
                String(req.body.organizationCode || "").trim() || null;

            branchCode =
                String(req.body.branchCode || "").trim() || null;
        } else if (req.session.role === "super_admin") {
            organizationCode = scope.organizationCode;
            branchCode = null;
        } else if (req.session.role === "admin") {
            organizationCode = scope.organizationCode;
            branchCode = scope.branchCode;
        }

        db.run(
            `INSERT INTO timetable (
                day,
                time,
                subject,
                faculty,
                room,
                type,
                organization_code,
                branch_code
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                day,
                time,
                subject,
                faculty || null,
                room || null,
                type,
                organizationCode,
                branchCode
            ],
            function (error) {
                if (error) {
                    console.error("Timetable insert error:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Could not add lecture."
                    });
                }

                return res.json({
                    success: true,
                    message: "Lecture added successfully.",
                    id: this.lastID
                });
            }
        );
    }
);
app.get("/api/timetable", (req, res) => {
    if (!req.session.isLoggedIn || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    db.get(
        `SELECT id, role, organization_code, branch_code
         FROM users
         WHERE id = ?`,
        [req.session.userId],
        (userError, user) => {
            if (userError) {
                console.error("Timetable user lookup error:", userError);

                return res.status(500).json({
                    success: false,
                    message: "Could not load user scope."
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Logged-in user not found."
                });
            }

            let sql = "";
            let params = [];

            if (user.role === "owner") {
                sql = `
                    SELECT *
                    FROM timetable
                    ORDER BY id ASC
                `;
            } else if (user.role === "super_admin") {
                sql = `
                    SELECT *
                    FROM timetable
                    WHERE organization_code = ?
                    ORDER BY id ASC
                `;

                params = [user.organization_code];
            } else {
                sql = `
                    SELECT *
                    FROM timetable
                    WHERE organization_code = ?
                    AND (
                        branch_code = ?
                        OR branch_code IS NULL
                        OR TRIM(branch_code) = ''
                    )
                    ORDER BY id ASC
                `;

                params = [
                    user.organization_code,
                    user.branch_code
                ];
            }

            db.all(sql, params, (error, rows) => {
                if (error) {
                    console.error("Timetable fetch error:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Could not load timetable."
                    });
                }

                console.log("TIMETABLE GET:", {
                    userId: user.id,
                    role: user.role,
                    organizationCode: user.organization_code,
                    branchCode: user.branch_code,
                    records: rows.length
                });

                return res.json({
                    success: true,
                    timetable: rows
                });
            });
        }
    );
});
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
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const { title, message } = req.body;
    const noticeId = req.params.id;
    const scope = getScope(req);

    db.get(
        `SELECT * FROM notices WHERE id = ?`,
        [noticeId],
        (findErr, notice) => {
            if (findErr) {
                return res.status(500).json({
                    success: false,
                    message: "Could not verify notice."
                });
            }

            if (!notice) {
                return res.status(404).json({
                    success: false,
                    message: "Notice not found."
                });
            }

            // Global notice can ONLY be edited by Owner
            if (Number(notice.is_global) === 1 && !scope.isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Only Owner can edit a global notice."
                });
            }

            // Non-owner cannot edit another organization's notice
            if (
                !scope.isOwner &&
                notice.organization_code !== scope.organizationCode
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot edit this notice."
                });
            }

            db.run(
                `UPDATE notices
                 SET title = ?, message = ?
                 WHERE id = ?`,
                [title, message, noticeId],
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: err.message
                        });
                    }

                    notifyUsers({
                        title: "Notice Updated",
                        message: `Notice "${title}" was updated.`,
                        category: "notice",
                        priority: "info",

                        actorUserId: req.session.userId,

                        recipientRoles: [
                            "owner",
                            "super_admin",
                            "admin",
                            "user"
                        ],

                        actionUrl: "/dashboard"
                    });

                    return res.json({
                        success: true
                    });
                }
            );
        }
    );
});
app.delete("/api/notices/:id", (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const noticeId = req.params.id;
    const scope = getScope(req);

    db.get(
        `SELECT title, organization_code, branch_code, is_global
         FROM notices
         WHERE id = ?`,
        [noticeId],
        (findErr, notice) => {
            if (findErr) {
                return res.status(500).json({
                    success: false,
                    message: findErr.message
                });
            }

            if (!notice) {
                return res.status(404).json({
                    success: false,
                    message: "Notice not found"
                });
            }

            // Global notice can ONLY be deleted by Owner
            if (Number(notice.is_global) === 1 && !scope.isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Only Owner can delete a global notice."
                });
            }

            // Non-owner cannot delete another organization's notice
            if (
                !scope.isOwner &&
                notice.organization_code !== scope.organizationCode
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot delete this notice."
                });
            }

            db.run(
                `DELETE FROM notices WHERE id = ?`,
                [noticeId],
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    notifyUsers({
                        title: "Notice Deleted",
                        message: `Notice "${notice.title}" was deleted.`,
                        category: "notice",
                        priority: "info",

                        actorUserId: req.session.userId,

                        organizationCode: notice.organization_code,
                        branchCode: notice.branch_code,

                        recipientRoles: [
                            "owner",
                            "super_admin",
                            "admin",
                            "user"
                        ],

                        module: "notice_board",
                        actionUrl: "/dashboard"
                    });

                    return res.json({
                        success: true
                    });
                }
            );
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

app.post("/change-password", (req, res) => {
    if (!req.session.isLoggedIn || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters."
        });
    }

    db.get(
        `SELECT id, password FROM users WHERE id = ?`,
        [req.session.userId],
        async (error, user) => {
            if (error) {
                console.error("Change password lookup error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            try {
                const passwordMatches = await bcrypt.compare(
                    currentPassword,
                    user.password
                );

                if (!passwordMatches) {
                    return res.status(401).json({
                        success: false,
                        message: "Current password is incorrect."
                    });
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);

                db.run(
                    `UPDATE users SET password = ? WHERE id = ?`,
                    [hashedPassword, req.session.userId],
                    function (updateError) {
                        if (updateError) {
                            console.error(
                                "Change password update error:",
                                updateError
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to change password."
                            });
                        }
                        notifyUsers({
    title: "Password Changed",
    message: "Your account password was changed successfully.",
    category: "security",
    priority: "important",

    actorUserId: req.session.userId,
    targetUserId: req.session.userId,

    recipientUserIds: [req.session.userId],

    module: "security",
    actionUrl: "/dashboard",
    eventKey: `self_password_changed_${req.session.userId}_${Date.now()}`
});

                        return res.json({
                            success: true,
                            message: "Password changed successfully."
                        });
                    }
                );
            } catch (passwordError) {
                console.error("Password processing error:", passwordError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to process password."
                });
            }
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
app.get("/index.html", (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.redirect("/login.html");
    }

    return res.sendFile(path.join(__dirname, "index.html"));
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

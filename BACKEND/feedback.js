// ==============================================
// FEEDBACK & SUGGESTIONS - FRONTEND INTERACTIONS
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    const feedbackMessage =
        document.getElementById("feedbackMessage");

    const feedbackCharacterCount =
        document.getElementById("feedbackCharacterCount");

    const feedbackStars =
        document.querySelectorAll(
            "#feedbackStars button"
        );

    const feedbackRating =
        document.getElementById("feedbackRating");

    const feedbackForm =
        document.getElementById("feedbackForm");

    const feedbackFormMessage =
        document.getElementById("feedbackFormMessage");

    const feedbackOwnerPanel =
        document.getElementById("feedbackOwnerPanel");


    // ================= CHARACTER COUNTER =================

    if (
        feedbackMessage &&
        feedbackCharacterCount
    ) {
        const updateCharacterCount = () => {
            const length =
                feedbackMessage.value.length;

            feedbackCharacterCount.textContent =
                `${length} / 1000`;
        };

        feedbackMessage.addEventListener(
            "input",
            updateCharacterCount
        );

        updateCharacterCount();
    }


    // ================= STAR RATING =================

    function paintStars(selectedRating) {
        feedbackStars.forEach((button) => {
            const rating =
                Number(button.dataset.rating);

            const icon =
                button.querySelector("i");

            if (!icon) return;

            if (rating <= selectedRating) {
                icon.className =
                    "fa-solid fa-star";
            } else {
                icon.className =
                    "fa-regular fa-star";
            }
        });
    }

    feedbackStars.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const rating =
                    Number(button.dataset.rating);

                if (feedbackRating) {
                    feedbackRating.value =
                        String(rating);
                }

                paintStars(rating);
            }
        );
    });


    // ================= OWNER PANEL =================

    try {
        const response =
            await fetch("/api/me");

        const data =
            await response.json();

        const role =
            String(
                data.role ||
                data.user?.role ||
                ""
            )
            .trim()
            .toLowerCase();

        if (
            feedbackOwnerPanel &&
            role === "owner"
        ) {
            feedbackOwnerPanel.style.display =
                "block";
        }

    } catch (error) {
        console.error(
            "Feedback role check error:",
            error
        );
    }
// ================= PERMANENT FEEDBACK SUBMIT =================

if (feedbackForm) {
    feedbackForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const category =
                document.getElementById(
                    "feedbackCategory"
                )?.value;

            const priority =
                document.getElementById(
                    "feedbackPriority"
                )?.value;

            const title =
                document.getElementById(
                    "feedbackTitle"
                )?.value.trim();

            const message =
                feedbackMessage?.value.trim();

            const rating =
                Number(
                    feedbackRating?.value || 0
                );

            if (
                !category ||
                !title ||
                !message
            ) {
                feedbackFormMessage.textContent =
                    "Please complete all required fields.";

                feedbackFormMessage.style.color =
                    "#fda4af";

                return;
            }

            const submitButton =
                document.getElementById(
                    "feedbackSubmitBtn"
                );

            submitButton.disabled = true;

            try {
                const response =
                    await fetch("/api/feedback", {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            category,
                            priority,
                            title,
                            message,
                            rating
                        })
                    });

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Could not submit feedback."
                    );
                }

                feedbackFormMessage.textContent =
                    `Feedback submitted successfully. ID #${data.feedbackId}`;

                feedbackFormMessage.style.color =
                    "#86efac";

                feedbackForm.reset();

                if (feedbackRating) {
                    feedbackRating.value = "0";
                }

                paintStars(0);
                await loadMyFeedback();
                if (feedbackCharacterCount) {
                    feedbackCharacterCount.textContent =
                        "0 / 1000";
                }

            } catch (error) {
                console.error(
                    "Feedback submit error:",
                    error
                );

                feedbackFormMessage.textContent =
                    error.message ||
                    "Something went wrong.";

                feedbackFormMessage.style.color =
                    "#fda4af";

            } finally {
                submitButton.disabled = false;
            }
        }
    );
}  
await loadMyFeedback();
await loadOwnerFeedback();

});

async function loadMyFeedback() {
    const list =
        document.getElementById("myFeedbackList");

    if (!list) return;

    try {
        const response =
            await fetch("/api/feedback");

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Could not load feedback."
            );
        }

        const items =
            data.feedback || [];

        const submittedCount =
            document.getElementById(
                "feedbackSubmittedCount"
            );

        const reviewCount =
            document.getElementById(
                "feedbackReviewCount"
            );

        const resolvedCount =
            document.getElementById(
                "feedbackResolvedCount"
            );

        if (submittedCount) {
            submittedCount.textContent =
                items.length;
        }

        if (reviewCount) {
            reviewCount.textContent =
                items.filter(
                    item =>
                        item.status === "review"
                ).length;
        }

        if (resolvedCount) {
            resolvedCount.textContent =
                items.filter(
                    item =>
                        item.status === "resolved"
                ).length;
        }

        if (items.length === 0) {
            list.innerHTML = `
                <div class="feedback-empty-state">
                    <div>
                        <i class="fa-regular fa-message"></i>
                    </div>

                    <h4>No feedback yet</h4>

                    <p>
                        Your submitted feedback
                        will appear here.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML =
            items.map(item => `
                <article class="feedback-item-card">

                    <div>
                        <span class="feedback-item-category">
                            ${item.category}
                        </span>

                        <h4>
                            ${item.title}
                        </h4>

                        <p>
                            ${item.message}
                        </p>
                    </div>

                    <div class="feedback-item-meta">
                        <span class="feedback-status">
                            ${item.status}
                        </span>

                        <small>
                            ${new Date(
                                item.created_at
                            ).toLocaleString()}
                        </small>
                    </div>

                    ${
                        item.owner_response
                            ? `
                            <div class="feedback-owner-response">
                                <strong>
                                    Owner Response
                                </strong>

                                <p>
                                    ${item.owner_response}
                                </p>
                            </div>
                            `
                            : ""
                    }

                </article>
            `).join("");

    } catch (error) {
        console.error(
            "Feedback history error:",
            error
        );
    }
}
async function loadOwnerFeedback() {
    const ownerPanel =
        document.getElementById("feedbackOwnerPanel");

    const ownerList =
        document.getElementById("feedbackOwnerList");

    if (!ownerPanel || !ownerList) return;

    try {
        const response =
            await fetch("/api/feedback/all");

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            // Normal users ke liye 403 expected hai.
            return;
        }

        ownerPanel.style.display = "block";

        const items =
            data.feedback || [];

        if (items.length === 0) {
            ownerList.innerHTML = `
                <div class="feedback-empty-state">
                    <div>
                        <i class="fa-solid fa-inbox"></i>
                    </div>

                    <h4>No feedback received</h4>

                    <p>
                        User feedback will appear here.
                    </p>
                </div>
            `;

            return;
        }

        ownerList.innerHTML =
            items.map(item => `
                <article
                    class="feedback-owner-item"
                    data-feedback-id="${item.id}"
                >
                    <div class="feedback-owner-item-top">
                        <div>
                            <span class="feedback-item-category">
                                ${item.category || "other"}
                            </span>

                            <h4>
                                ${item.title || "Untitled feedback"}
                            </h4>

                            <small>
                                ${item.user_name || "Unknown User"}
                                •
                                ${item.user_email || ""}
                            </small>
                        </div>

                    <div class="feedback-owner-card-meta">

    <div class="feedback-owner-rating">
        <i class="fa-solid fa-star"></i>

        <strong>
            ${Number(item.rating || 0)}
        </strong>

        <span>/ 5</span>
    </div>

    <span class="feedback-status">
        ${item.status || "submitted"}
    </span>

</div>git status

                    </div>

                    <p class="feedback-owner-message">
                        ${item.message || ""}
                    </p>

                    <div class="feedback-owner-edit-grid">

                        <div class="feedback-field">
                            <label>
                                Status
                            </label>

                            <select
                                id="feedbackStatus_${item.id}"
                            >
                                <option
                                    value="submitted"
                                    ${item.status === "submitted" ? "selected" : ""}
                                >
                                    Submitted
                                </option>

                                <option
                                    value="review"
                                    ${item.status === "review" ? "selected" : ""}
                                >
                                    Under Review
                                </option>

                                <option
                                    value="planned"
                                    ${item.status === "planned" ? "selected" : ""}
                                >
                                    Planned
                                </option>

                                <option
                                    value="progress"
                                    ${item.status === "progress" ? "selected" : ""}
                                >
                                    In Progress
                                </option>

                                <option
                                    value="resolved"
                                    ${item.status === "resolved" ? "selected" : ""}
                                >
                                    Resolved
                                </option>

                                <option
                                    value="rejected"
                                    ${item.status === "rejected" ? "selected" : ""}
                                >
                                    Not Planned
                                </option>
                            </select>
                        </div>

                        <div class="feedback-field">
                            <label>
                                Owner Response
                            </label>

                            <textarea
                                id="feedbackReply_${item.id}"
                                rows="3"
                                maxlength="1000"
                                placeholder="Write a response..."
                            >${item.owner_response || ""}</textarea>
                        </div>

                    </div>

                   <button
    type="button"
    class="feedback-submit-btn feedback-owner-save-btn"
    data-feedback-id="${item.id}"
>
                        <i class="fa-solid fa-check"></i>
                        Save Update
                    </button>

                </article>
            `).join("");
    ownerList
    .querySelectorAll(".feedback-owner-save-btn")
    .forEach((button) => {
        button.addEventListener("click", async () => {
            const feedbackId =
                Number(button.dataset.feedbackId);

            if (!feedbackId) return;

            button.disabled = true;
            button.textContent = "Saving...";

            await updateOwnerFeedback(feedbackId);

            button.disabled = false;
        });
    });

    } catch (error) {
        console.error(
            "Owner feedback load error:",
            error
        );
    }
}


async function updateOwnerFeedback(feedbackId) {
    const status =
        document.getElementById(
            `feedbackStatus_${feedbackId}`
        )?.value;

    const ownerResponse =
        document.getElementById(
            `feedbackReply_${feedbackId}`
        )?.value.trim();

    try {
        const response =
            await fetch(
                `/api/feedback/${feedbackId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        status,
                        owner_response:
                            ownerResponse
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Could not update feedback."
            );
        }

        await loadOwnerFeedback();
        await loadMyFeedback();
        

    } catch (error) {
        console.error(
            "Owner feedback update error:",
            error
        );

        alert(
            error.message ||
            "Could not update feedback."
        );
    }
}
window.updateOwnerFeedback = updateOwnerFeedback;
document.addEventListener("click", async (event) => {
    const button = event.target.closest(
        ".feedback-owner-save-btn"
    );

    if (!button) return;

    const feedbackId =
        Number(button.dataset.feedbackId);

    if (!feedbackId) {
        console.error("Invalid feedback ID");
        return;
    }

    button.disabled = true;

    const oldText = button.innerHTML;

    button.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        await updateOwnerFeedback(feedbackId);
    } finally {
        button.disabled = false;
        button.innerHTML = oldText;
    }
});
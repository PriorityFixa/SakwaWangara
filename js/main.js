/* =========================================================
   SAKWA WANGARA — MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        const isOpen = navLinks.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });

    navLinks.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   TRAINING ENQUIRY FORM
========================================================= */

const enquiryForm =
    document.getElementById("trainingEnquiryForm");

const formStatus =
    document.getElementById("formStatus");


/* =========================================================
   CLOUDFLARE WORKER
========================================================= */

const TRAINING_API =
    "https://sakwa-training-enquiries.priorityfixa.workers.dev";


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (enquiryForm) {

    enquiryForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* Clear previous status */

        if (formStatus) {

            formStatus.textContent = "";
            formStatus.className = "form-status";

        }


        /* Submit button */

        const submitButton =
            enquiryForm.querySelector(
                'button[type="submit"]'
            );


        const originalButtonText =
            submitButton
                ? submitButton.textContent
                : "Submit Training Enquiry";


        if (submitButton) {

            submitButton.disabled = true;
            submitButton.textContent = "Sending Enquiry...";

        }


        /* Collect form data */

        const formData =
            new FormData(enquiryForm);


        const enquiry = {

            name:
                (formData.get("name") || "").trim(),

            organisation:
                (formData.get("organisation") || "").trim(),

            email:
                (formData.get("email") || "").trim(),

            phone:
                (formData.get("phone") || "").trim(),

            trainingProgramme:
                formData.get("trainingProgramme") || "",

            participants:
                formData.get("participants") || "",

            preferredDate:
                formData.get("preferredDate") || "",

            message:
                (formData.get("message") || "").trim()

        };


        console.log(
            "Training enquiry:",
            enquiry
        );


        try {

            /* Send enquiry to Cloudflare Worker */

            const response = await fetch(
                TRAINING_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(enquiry)
                }
            );


            /* Read Worker response */

            let result = null;

            try {

                result = await response.json();

            } catch (jsonError) {

                result = null;

            }


            console.log(
                "Worker response:",
                result
            );


            /* Successful submission */

            if (
                response.ok &&
                result &&
                result.success === true
            ) {

                if (formStatus) {

                    formStatus.className =
                        "form-status success";

                    formStatus.textContent =
                        "Thank you. Your training enquiry has been submitted successfully. Sakwa will be in touch shortly.";

                }


                /* Only clear after successful submission */

                enquiryForm.reset();

            }


            /* Worker returned an error */

            else {

                let errorMessage =
                    "We could not submit your enquiry. Please try again.";

                if (
                    result &&
                    result.message
                ) {

                    errorMessage =
                        result.message;

                }


                if (formStatus) {

                    formStatus.className =
                        "form-status error";

                    formStatus.textContent =
                        errorMessage;

                }

            }


        }


        /* Connection / network error */

        catch (error) {

            console.error(
                "Training enquiry error:",
                error
            );


            if (formStatus) {

                formStatus.className =
                    "form-status error";

                formStatus.textContent =
                    "Unable to connect to the enquiry service. Your information has NOT been cleared. Please try again.";

            }

        }


        /* Restore button */

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;

        }

    });

}

/* =========================================================
SAKWA WANGARA — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

```
/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");


if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            navLinks.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}



/* =====================================================
   TRAINING ENQUIRY FORM
===================================================== */

const enquiryForm =
    document.getElementById("trainingEnquiryForm");

const formStatus =
    document.getElementById("formStatus");


if (enquiryForm) {

    enquiryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* =============================================
               BUTTON
            ============================================= */

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

                submitButton.textContent =
                    "Sending Enquiry...";

            }


            /* =============================================
               STATUS
            ============================================= */

            if (formStatus) {

                formStatus.textContent =
                    "Sending your training enquiry...";

                formStatus.className =
                    "form-status visible";

            }


            /* =============================================
               COLLECT FORM DATA
            ============================================= */

            const formData =
                new FormData(enquiryForm);


            const data = {

                name:
                    formData.get("name"),

                organisation:
                    formData.get("organisation"),

                email:
                    formData.get("email"),

                phone:
                    formData.get("phone"),

                trainingProgramme:
                    formData.get("trainingProgramme"),

                participants:
                    formData.get("participants"),

                preferredDate:
                    formData.get("preferredDate"),

                message:
                    formData.get("message")

            };


            /* =============================================
               CLOUDFLARE WORKER
            ============================================= */

            const WORKER_URL =
                "https://sakwa-training-enquiries.priorityfixa.workers.dev";


            try {

                const response =
                    await fetch(
                        WORKER_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                /* =========================================
                   SUCCESS
                ========================================= */

                if (
                    response.ok &&
                    result.success
                ) {

                    if (formStatus) {

                        formStatus.textContent =
                            "Thank you. Your training enquiry has been received. Sakwa's team will get back to you shortly.";

                        formStatus.className =
                            "form-status visible success";

                    }


                    enquiryForm.reset();


                } else {

                    throw new Error(
                        result.message ||
                        "Unable to submit enquiry."
                    );

                }


            } catch (error) {

                console.error(
                    "Training enquiry error:",
                    error
                );


                if (formStatus) {

                    formStatus.textContent =
                        "We were unable to submit your enquiry. Please try again or contact Sakwa directly.";

                    formStatus.className =
                        "form-status visible error";

                }

            }


            /* =============================================
               RESTORE BUTTON
            ============================================= */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    originalButtonText;

            }

        }
    );

}
```

});

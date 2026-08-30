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


    /* Close mobile menu after clicking a link */

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

    enquiryForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        /* ---------------------------------------------
           FORM DATA
        --------------------------------------------- */

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


        /* ---------------------------------------------
           TEMPORARY MESSAGE
           
           The Cloudflare Worker URL will be added
           in the next step.
        --------------------------------------------- */

        if (formStatus) {

            formStatus.textContent =
                "Your enquiry is being prepared...";

            formStatus.className =
                "form-status visible";

        }


        /*
         * DO NOT ADD THE CLOUDFLARE URL YET.
         *
         * We will connect the form to the Worker
         * after the Worker has been created.
         */


        console.log(
            "Training enquiry:",
            data
        );

    });

}
```

});

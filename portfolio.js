// --- Global Variables for Typing Animation State ---
// These need to be accessible by typeDeleteCycle and initializeTypingAnimation
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typingSpeed = 70; // milliseconds per character
const deletingSpeed = 40; // milliseconds per character
const pauseTime = 1500; // milliseconds to pause at end of typing / start of deleting

const phrases = [
    "B.TECH 2024 Graduate",
    "A Passionate Front-End Developer",
    "Having Good Knowledge in UI/UX Design",
    "Building responsive and intuitive websites."
];

// Define your gradients for each phrase (Light Mode)
const phraseGradients = [
    'linear-gradient(to right, #007bff, #8a2be2)',    // Blue to Purple
    'linear-gradient(to right, #28a745, #1e90ff)',    // Green to Dodger Blue
    'linear-gradient(to right, #ffc107, #ff4500)',    // Yellow to OrangeRed
    'linear-gradient(to right, #dc3545, #ff1493)'     // Red to DeepPink
];

// Define your gradients for each phrase (Dark Mode)
const phraseGradientsDarkMode = [
    'linear-gradient(to right, #66b3ff, #c792ea)',    // Lighter Blue to Lighter Purple
    'linear-gradient(to right, #98fb98, #6495ed)',    // Pale Green to Cornflower Blue
    'linear-gradient(to right, #ffd700, #ff8c00)',    // Gold to DarkOrange
    'linear-gradient(to right, #ff6347, #ff69b4)'     // Tomato to HotPink
];


// --- Helper Functions (defined globally so they can be called from different initializers) ---

function applyPhraseGradient() {
    const dynamicTypingTextElement = document.getElementById('dynamic-typing-text');
    if (!dynamicTypingTextElement) return;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const gradients = isDarkMode ? phraseGradientsDarkMode : phraseGradients;

    dynamicTypingTextElement.style.background = gradients[phraseIndex];
    dynamicTypingTextElement.style.backgroundSize = '200% 100%';
    dynamicTypingTextElement.style.backgroundPosition = '0% 0';
}

function typeDeleteCycle() {
    const dynamicTypingTextElement = document.getElementById('dynamic-typing-text');
    const cursorElement = document.querySelector('.cursor'); // Cursor still uses a class

    if (!dynamicTypingTextElement || !cursorElement) {
        // Elements not found, likely a timing issue or HTML problem.
        // Prevent further recursion.
        console.error("Typing animation elements not found. Stopping cycle.");
        return;
    }

    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
        if (charIndex === 0) {
            applyPhraseGradient(); // Apply gradient at the start of a new phrase
            dynamicTypingTextElement.style.color = ''; // Ensure text is not transparent (from wipe-effect)
        }
        dynamicTypingTextElement.textContent = currentPhrase.substring(0, charIndex);
        charIndex++;

        if (charIndex > currentPhrase.length) {
            // Done typing, pause then start deleting
            setTimeout(() => {
                isDeleting = true;
                charIndex = currentPhrase.length;

                dynamicTypingTextElement.classList.add('wipe-effect');
                dynamicTypingTextElement.style.color = 'transparent'; // Make text transparent for wipe-out

                typeDeleteCycle();
            }, pauseTime);
        } else {
            setTimeout(typeDeleteCycle, typingSpeed);
        }
    } else { // Deleting phase
        dynamicTypingTextElement.textContent = currentPhrase.substring(0, charIndex);
        charIndex--;

        if (charIndex < 0) {
            // Done deleting, move to next phrase after a pause
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length; // Cycle through phrases
            charIndex = 0; // Reset charIndex for the new phrase

            // Clean up styles for the next typing cycle to ensure gradient appears correctly
            dynamicTypingTextElement.classList.remove('wipe-effect');
            dynamicTypingTextElement.style.color = ''; // Reset color
            dynamicTypingTextElement.style.background = ''; // Clear inline background styles
            dynamicTypingTextElement.style.backgroundSize = '';
            dynamicTypingTextElement.style.backgroundPosition = '';
            void dynamicTypingTextElement.offsetWidth; // Force reflow to clear animation state (important!)

            setTimeout(() => {
                typeDeleteCycle();
            }, pauseTime);
        } else {
            setTimeout(typeDeleteCycle, deletingSpeed);
        }
    }
}


// --- Initialization Functions ---

function initializeThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const body = document.body;

    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline-block';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            if (sunIcon) sunIcon.style.display = 'inline-block';
            if (moonIcon) moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'light');
        }
        applyPhraseGradient(); // Update text gradient immediately on theme change
    }

    // Check for saved theme in localStorage or system preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    // Apply initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDarkMode = body.classList.contains('dark-mode');
            setTheme(!isCurrentlyDarkMode);
        });
    } else {
        console.warn("Theme toggle button not found.");
    }
}

function initializeTypingAnimation() {
    const dynamicTypingTextElement = document.getElementById('dynamic-typing-text');
    const cursorElement = document.querySelector('.cursor');

    if (dynamicTypingTextElement && cursorElement) {
        // Reset animation state variables for a fresh start
        phraseIndex = 0;
        charIndex = 0;
        isDeleting = false;

        // Clear any existing text and force re-render before starting new animation
        dynamicTypingTextElement.textContent = '';
        dynamicTypingTextElement.classList.remove('wipe-effect'); // Remove any lingering wipe class
        dynamicTypingTextElement.style.color = ''; // Reset color
        dynamicTypingTextElement.style.background = ''; // Clear inline background
        dynamicTypingTextElement.style.backgroundSize = '';
        dynamicTypingTextElement.style.backgroundPosition = '';
        void dynamicTypingTextElement.offsetWidth; // Force reflow

        applyPhraseGradient(); // Apply the initial gradient for the first phrase
        typeDeleteCycle(); // Start the animation cycle
    } else {
        console.error("Typing animation elements not found. Cannot start animation.");
    }
}


// --- Main Event Listener for Page Load/Restore ---
// Use 'pageshow' for robust initialization, especially with browser bfcache.
window.addEventListener('pageshow', (event) => {
    console.log('pageshow event fired. Persisted:', event.persisted);

    // Always initialize theme toggle to ensure correct icon state and background
    initializeThemeToggle();

    initializeTypingAnimation();
});






document.addEventListener("DOMContentLoaded", function() {
  emailjs.init("Ht9prl7SyLvJ6oNyW");
   



    const form = document.getElementById("contact-form");
    const statusMessage = document.getElementById("status-message");
    const spinner = document.getElementById("loadingSpinner");
    const sendBtn = document.getElementById("sendBtn");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        // Show spinner & disable button
        spinner.classList.remove("d-none");
        sendBtn.disabled = true;

        // Send the form via EmailJS
        emailjs.sendForm("service_rnnotqp", "template_qr6qd9d", this)
            .then(() => {
                statusMessage.innerText = "✅ Message sent successfully!";
                statusMessage.classList.add("text-success");
                statusMessage.classList.remove("text-danger");
                form.reset();
            }, (error) => {
                statusMessage.innerText = "❌ Failed to send message. Please try again.";
                statusMessage.classList.add("text-danger");
                statusMessage.classList.remove("text-success");
                console.error("EmailJS error:", error);
            })
            .finally(() => {
                spinner.classList.add("d-none");
                sendBtn.disabled = false;
            });
    });
});

function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}
const asciiArtElement = document.getElementById('ascii-art');
const sectionTextElement = document.querySelector('.section__text');
const sectionTextP1 = document.querySelector('.section__text__p1');
const titleElement = document.querySelector('.title');
const sectionTextP2 = document.querySelector('.section__text__p2');

// Hide section__text initially
sectionTextElement.style.visibility = 'hidden';
sectionTextP1.style.visibility = 'hidden';
titleElement.style.visibility = 'hidden';
sectionTextP2.style.visibility = 'hidden';

function typeEffect(content, element, delay = 100, callback = null) {
    const lines = content.split('\n'); // Split content into lines
    let index = 0;

    const interval = setInterval(() => {
        if (index < lines.length) {
            element.textContent += lines[index] + '\n'; // Add the current line with a newline
            index++;
        } else {
            clearInterval(interval); // Stop once all lines are displayed
            if (callback) callback(); // Call the next animation
        }
    }, delay);
}

function applyTypingAnimation(element, text, duration, hideCursorAfter = false) {
    element.innerHTML = `<span>${text}</span>`;
    const span = element.querySelector('span');

    const contentLength = text.length;
    span.style.animation = `
        typing ${duration}s steps(${contentLength}, end),
        cursor 0.8s step-end infinite alternate
    `;

    // Ensure wrapping happens by removing max-width after typing ends
    span.addEventListener('animationend', () => {
        span.style.maxWidth = 'none'; // Remove max-width to allow wrapping
        span.style.whiteSpace = 'normal'; // Allow text to wrap
        span.style.borderRight = 'none'; // Remove cursor effect
    });

    // Optional: Hide cursor if specified
    if (hideCursorAfter) {
        span.addEventListener('animationend', () => {
            span.classList.add('cursor-hidden');
        });
    }
}

function triggerTypingEffect() {
    // Ensure the parent container is visible
    sectionTextElement.style.visibility = 'visible';

    // Trigger typing animation for section__text__p1
    sectionTextP1.style.visibility = 'visible';
    applyTypingAnimation(sectionTextP1, "Hello there,", 2, true);

    // Delay and trigger animation for title
    setTimeout(() => {
        titleElement.style.visibility = 'visible';
        applyTypingAnimation(titleElement, "I'm Anushcka", 2, true);

        // Delay and trigger animation for section__text__p2
        setTimeout(() => {
            sectionTextP2.style.visibility = 'visible';
            applyTypingAnimation(sectionTextP2, "A Computer Science and Digital Arts & Media Design Student", 3, false);

            // Finally, reveal the button container
            setTimeout(() => {
                const btnContainer = document.querySelector('.btn-container');
                btnContainer.style.visibility = 'visible';
                btnContainer.style.opacity = '1';
            }, 2000);
        }, 2000);
    }, 2000);
}

function triggerAboutTypingEffect() {
    const aboutTypingElement = document.querySelector('#about-typing .about-line');
    const content = aboutTypingElement.textContent.trim(); // Get the full text content
    aboutTypingElement.textContent = ''; // Clear the existing content

    const cursor = document.createElement('span'); // Create a cursor element
    cursor.classList.add('cursor'); // Add a class to style it
    aboutTypingElement.appendChild(cursor);

    let charIndex = 0;

    // Typing effect logic for the about section
    function typeCharacter() {
        if (charIndex < content.length) {
            // Append the next character before the cursor
            const textNode = document.createTextNode(content[charIndex]);
            aboutTypingElement.insertBefore(textNode, cursor);

            charIndex++;
            setTimeout(typeCharacter, 50); // Adjust typing speed here
        } else {
            cursor.classList.add('cursor-hidden'); // Hide the cursor when typing is complete
        }
    }

    typeCharacter(); // Start the typing animation
}


// Intersection Observer for the About Section
function observeAboutSection() {
    const aboutSection = document.querySelector('#about'); // About section to observe
    const observerOptions = {
        root: null, // Use the viewport as the root
        threshold: 0.5 // Trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerAboutTypingEffect(); // Call the new typing function for the about section
                observer.unobserve(entry.target); // Stop observing after animation is triggered
            }
        });
    }, observerOptions);

    observer.observe(aboutSection);
}

// Start observing the about section when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    observeAboutSection();
});


// Fetch ASCII art from the file
fetch('ascii_art_refined.txt')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load ASCII art file');
        }
        return response.text();
    })
    .then(data => {
        asciiArtElement.textContent = ''; // Clear any existing content
        typeEffect(data, asciiArtElement, 80, triggerTypingEffect); // Trigger animations after ASCII art
    })
    .catch(error => {
        console.error('Error loading ASCII art:', error);
    });



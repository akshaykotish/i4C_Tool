// Function to add custom styles to the document
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* General box styling */
    .box {
        background-color: #f0f4f8; /* Light silver-blue background */
        border: 1px solid #ccc;
        border-radius: 8px;
        position: absolute;
        cursor: grab;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: box-shadow 0.3s ease, transform 0.3s ease;
    }

    /* Highlighted box styling */
    .box.highlighted {
        box-shadow: 0 0 20px rgba(0, 123, 255, 0.7); /* Blue glow */
        transform: scale(1.05); /* Slightly enlarge */
        z-index: 100;
    }

    /* Search box styling */
    .search-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        width: 300px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .search-input {
        padding: 12px 20px 12px 40px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 25px;
        outline: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        width: 100%;
        background-color: #fff;
        background-image: url('data:image/svg+xml;utf8,<svg fill="%23777" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.742 10.344l4.242 4.243-1.397 1.397-4.243-4.242a6.5 6.5 0 1 1 1.398-1.398zm-5.242.656a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg>');
        background-repeat: no-repeat;
        background-position: 10px center;
        background-size: 20px;
    }

    .search-input:focus {
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0,123,255,0.5);
    }

    /* Suggestion box styling */
    .suggestion-box {
        position: absolute;
        top: 60px;
        right: 0;
        z-index: 1001;
        background-color: #fff;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-height: 200px;
        overflow-y: auto;
        width: 100%;
    }

    .suggestion-item {
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        font-size: 16px;
        color: #333;
    }

    .suggestion-item:hover {
        background-color: #f0f4f8; /* Light hover effect */
    }

    /* Line styling */
    path {
        transition: stroke 0.3s ease;
    }

    /* Scrollbar styling for suggestion box */
    .suggestion-box::-webkit-scrollbar {
        width: 6px;
    }
    .suggestion-box::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 3px;
    }
    `;
    document.head.appendChild(style);
}


// Function to create and add the enhanced search box
// Function to create and add the enhanced search box
function createSearchBox() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by Node ID...';
    searchInput.className = 'search-input';

    // Container for autocomplete suggestions
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'suggestion-box';
    suggestionBox.style.display = 'none';

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(suggestionBox);
    document.body.appendChild(searchContainer);

    // Debounced version of searchNode
    const debouncedSearch = debounce(function(query) {
        searchNode(query);
        updateSuggestions(query);
    }, 300);

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        debouncedSearch(query);
    });

    // Function to update autocomplete suggestions
    function updateSuggestions(query) {
        // Clear existing suggestions
        suggestionBox.innerHTML = '';
        if (!query) {
            suggestionBox.style.display = 'none';
            return;
        }

        const matchingIds = [];
        for (let id of boxMap.keys()) {
            if (id.toLowerCase().includes(query.toLowerCase())) {
                matchingIds.push(id);
            }
        }

        if (matchingIds.length > 0) {
            matchingIds.forEach(id => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = id;
                suggestionItem.addEventListener('click', function() {
                    searchInput.value = id;
                    searchNode(id);
                    suggestionBox.style.display = 'none';
                });
                suggestionBox.appendChild(suggestionItem);
            });
            suggestionBox.style.display = 'block';
        } else {
            suggestionBox.style.display = 'none';
        }
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchContainer.contains(event.target)) {
            suggestionBox.style.display = 'none';
        }
    });
}

// Function to highlight the box
function highlightBox(box) {
    removeHighlights(); // Remove existing highlights
    box.classList.add('highlighted');
}

// Function to remove highlights from all boxes
function removeHighlights() {
    boxMap.forEach(box => {
        box.classList.remove('highlighted');
    });
}



// Updated searchNode function to work with live typing
function searchNode(query) {
    if (!query) {
        return;
    }

    const box = boxMap.get(query);

    if (box) {
        // Optionally adjust the scale (zoom level)
        scale = 1; // Set to desired zoom level

        // Get the box's position relative to the container
        const boxOffsetLeft = box.offsetLeft;
        const boxOffsetTop = box.offsetTop;

        // Calculate the center position of the box within the container
        const boxCenterX = boxOffsetLeft + box.offsetWidth / 2;
        const boxCenterY = boxOffsetTop + box.offsetHeight / 2;

        // Calculate the desired center of the viewport (e.g., center of the window)
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        // Calculate the new panX and panY needed to center the box
        panX = viewportCenterX - boxCenterX * scale;
        panY = viewportCenterY - boxCenterY * scale;

        // Apply transformations
        applyTransformations();

        // Optionally, highlight the box
        highlightBox(box);

    } else {
        // If node not found, do not alert during live typing
        // Optionally, you can clear any previous highlights
        removeHighlights();
    }
}

// Function to highlight the box
function highlightBox(box) {
    removeHighlights(); // Remove existing highlights
    box.style.outline = '2px solid blue';
}

// Function to remove highlights from all boxes
function removeHighlights() {
    boxMap.forEach(box => {
        box.style.outline = 'none';
    });
}


// Call the function to create the search box
createSearchBox();


// Utility function to debounce other functions
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// Call the function to add custom styles
addCustomStyles();
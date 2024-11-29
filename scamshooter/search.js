// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Batman Search Module
const BatmanSearch = {
    searchInput: null,
    suggestionsBox: null,
    container: null,

    init() {
        this.createStyles();
        this.createSearchUI();
        this.bindEvents();
    },

    createStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .bat-search-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                width: 350px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .bat-search-input {
                width: 100%;
                padding: 15px 45px 15px 45px;
                background: rgba(30, 30, 30, 0.9);
                border: 1px solid #444;
                border-radius: 8px;
                color: #fff;
                font-size: 16px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .bat-search-input:focus {
                border-color: #74ee15;
                box-shadow: 0 0 15px rgba(116, 238, 21, 0.3);
                outline: none;
            }

            .bat-search-icon {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                pointer-events: none;
                opacity: 0.7;
            }

            .bat-suggestions {
                margin-top: 5px;
                background: rgba(30, 30, 30, 0.95);
                border: 1px solid #444;
                border-radius: 8px;
                max-height: 300px;
                overflow-y: auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: none;
            }

            .bat-suggestion-item {
                padding: 12px 15px;
                color: #fff;
                cursor: pointer;
                border-bottom: 1px solid #444;
                transition: all 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .bat-suggestion-item:hover {
                background: rgba(116, 238, 21, 0.1);
                color: #74ee15;
            }

            .bat-path-highlight {
                animation: pathGlow 2s infinite;
                position: relative;
            }

            .bat-path-highlight::after {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border: 2px solid #74ee15;
                border-radius: 14px;
                animation: borderPulse 2s infinite;
                pointer-events: none;
            }

            .bat-path-connection {
                animation: connectionPulse 2s infinite;
                filter: drop-shadow(0 0 8px rgba(116, 238, 21, 0.6));
            }

            @keyframes pathGlow {
                0% { box-shadow: 0 0 10px rgba(116, 238, 21, 0.4); }
                50% { box-shadow: 0 0 20px rgba(116, 238, 21, 0.6); }
                100% { box-shadow: 0 0 10px rgba(116, 238, 21, 0.4); }
            }

            @keyframes borderPulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }

            @keyframes connectionPulse {
                0% { stroke-width: 2; }
                50% { stroke-width: 4; }
                100% { stroke-width: 2; }
            }

            .bat-suggestion-meta {
                font-size: 12px;
                color: #888;
            }

            .bat-no-results {
                padding: 15px;
                text-align: center;
                color: #888;
                font-style: italic;
            }

            .bat-match {
                color: #74ee15;
                font-weight: bold;
            }
        `;
        document.head.appendChild(styles);
    },

    createSearchUI() {
        this.container = document.createElement('div');
        this.container.className = 'bat-search-container';

        const searchWrapper = document.createElement('div');
        searchWrapper.style.position = 'relative';

        const searchIcon = document.createElement('div');
        searchIcon.className = 'bat-search-icon';
        searchIcon.innerHTML = `<svg fill="#74ee15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
        </svg>`;

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search nodes by ID, type, or amount...';
        this.searchInput.className = 'bat-search-input';

        this.suggestionsBox = document.createElement('div');
        this.suggestionsBox.className = 'bat-suggestions';

        searchWrapper.appendChild(searchIcon);
        searchWrapper.appendChild(this.searchInput);
        this.container.appendChild(searchWrapper);
        this.container.appendChild(this.suggestionsBox);
        document.body.appendChild(this.container);
    },

    bindEvents() {
        // Create a debounced search handler bound to this context
        const debouncedSearch = debounce((query) => {
            this.handleSearch(query);
        }, 300);

        // Bind events with proper context
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });

        this.suggestionsBox.addEventListener('click', (e) => {
            const item = e.target.closest('.bat-suggestion-item');
            if (item) {
                const boxId = item.dataset.boxId;
                const box = boxMap.get(boxId);
                if (box) {
                    this.selectNode(box);
                    this.suggestionsBox.style.display = 'none';
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.suggestionsBox.style.display = 'none';
            }
        });
    },

    handleSearch(query) {
        if (!query) {
            this.suggestionsBox.style.display = 'none';
            this.clearHighlights();
            return;
        }

        const results = this.smartSearch(query);
        this.updateSuggestions(results, query);

        if (results.length > 0) {
            this.selectNode(results[0].box);
        }
    },

    smartSearch(query) {
        query = query.toLowerCase();
        const results = [];

        boxMap.forEach((box, id) => {
            const score = this.getSearchScore(box, id, query);
            if (score > 0) {
                results.push({ box, id, score });
            }
        });

        return results.sort((a, b) => b.score - a.score);
    },

    getSearchScore(box, id, query) {
        let score = 0;
        
        if (id.toLowerCase().includes(query)) {
            score += 10;
            if (id.toLowerCase() === query) score += 5;
        }

        const type = box.getAttribute('data-type');
        if (type && type.toLowerCase().includes(query)) {
            score += 8;
        }

        const amount = box.querySelector('.box-amount');
        if (amount && amount.textContent.toLowerCase().includes(query)) {
            score += 6;
        }

        return score;
    },

    selectNode(box) {
        this.clearHighlights();
        this.highlightPath(box);
        this.centerOnBox(box);
    },

    highlightPath(box) {
        const path = findPathToRoot(box);
        
        path.forEach((boxInPath, index) => {
            setTimeout(() => {
                boxInPath.classList.add('bat-path-highlight');
                
                if (index < path.length - 1) {
                    const nextBox = path[index + 1];
                    const connection = connections.find(conn => 
                        (conn.box1 === boxInPath && conn.box2 === nextBox) ||
                        (conn.box2 === boxInPath && conn.box1 === nextBox)
                    );

                    if (connection) {
                        connection.path.classList.add('bat-path-connection');
                        connection.path.setAttribute('stroke', '#74ee15');
                    }
                }

                // Ensure path is visible
                let currentBox = boxInPath;
                while (currentBox) {
                    const parent = findParentBox(currentBox);
                    if (parent && parent.subBoxesVisible === false) {
                        showSubBoxes(parent);
                    }
                    currentBox = parent;
                }
            }, index * 200);
        });

        window.currentHighlightedPath = { boxes: path };
    },

    clearHighlights() {
        if (window.currentHighlightedPath) {
            window.currentHighlightedPath.boxes.forEach(box => {
                box.classList.remove('bat-path-highlight');
            });
            
            connections.forEach(conn => {
                conn.path.classList.remove('bat-path-connection');
                conn.path.setAttribute('stroke', conn.color || 'black');
            });

            window.currentHighlightedPath = null;
        }
    },

    centerOnBox(box) {
        const boxRect = box.getBoundingClientRect();
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        scale = Math.min(1.5, Math.max(0.5, scale));
        panX = viewportCenterX - (boxRect.left + boxRect.width / 2);
        panY = viewportCenterY - (boxRect.top + boxRect.height / 2);

        container.style.transition = 'transform 0.5s ease-out';
        applyTransformations();
        setTimeout(() => {
            container.style.transition = '';
        }, 500);
    },

    updateSuggestions(results, query) {
        this.suggestionsBox.innerHTML = '';
        
        if (results.length === 0) {
            this.suggestionsBox.innerHTML = '<div class="bat-no-results">No matching nodes found</div>';
            this.suggestionsBox.style.display = 'block';
            return;
        }

        results.slice(0, 5).forEach(({ box, id }) => {
            const item = document.createElement('div');
            item.className = 'bat-suggestion-item';
            item.dataset.boxId = id;
            
            const type = box.getAttribute('data-type') || 'Unknown';
            const amount = box.querySelector('.box-amount')?.textContent || '';
            
            // Highlight matching text
            const highlightedId = id.replace(new RegExp(query, 'gi'), 
                match => `<span class="bat-match">${match}</span>`);
            
            item.innerHTML = `
                <div>
                    <div>${highlightedId}</div>
                    <div class="bat-suggestion-meta">${type} ${amount}</div>
                </div>
            `;
            
            this.suggestionsBox.appendChild(item);
        });

        this.suggestionsBox.style.display = 'block';
    }
};

// Update the BatmanSearch module's methods

BatmanSearch.bindEvents = function() {
    // Existing debounced search handler
    const debouncedSearch = debounce((query) => {
        // Clear existing highlights before starting a new search
        this.clearHighlights();
        this.handleSearch(query);
    }, 300);

    this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        debouncedSearch(query);
    });

    // Click handler for suggestions
    this.suggestionsBox.addEventListener('click', (e) => {
        const item = e.target.closest('.bat-suggestion-item');
        if (item) {
            const boxId = item.dataset.boxId;
            const box = boxMap.get(boxId);
            if (box) {
                this.clearHighlights(); // Clear existing highlights
                this.selectNode(box);
                this.suggestionsBox.style.display = 'none';
            }
        }
    });

    // Enhanced document click handler to clear highlights
    document.addEventListener('click', (e) => {
        // Check if click is outside the search container and highlighted elements
        if (!this.container.contains(e.target) && 
            !e.target.closest('.bat-path-highlight') &&
            !e.target.closest('path')) {
            this.clearHighlights();
            this.suggestionsBox.style.display = 'none';
        }
    });
};

BatmanSearch.clearHighlights = function() {
    if (window.currentHighlightedPath) {
        // Clear box highlights with fade out effect
        window.currentHighlightedPath.boxes.forEach(box => {
            box.style.transition = 'all 0.3s ease';
            box.classList.remove('bat-path-highlight');
        });
        
        // Clear connection highlights with fade out
        connections.forEach(conn => {
            conn.path.style.transition = 'all 0.3s ease';
            conn.path.classList.remove('bat-path-connection');
            conn.path.setAttribute('stroke', conn.color || 'black');
            conn.path.setAttribute('stroke-width', '2');
        });

        // Remove any highlight-related elements
        const labels = document.querySelectorAll('.bat-path-label');
        labels.forEach(label => {
            if (label.parentNode) {
                label.parentNode.removeChild(label);
            }
        });

        // Reset the tracking variable
        window.currentHighlightedPath = null;

        // Reset transitions after cleanup
        setTimeout(() => {
            window.currentHighlightedPath?.boxes?.forEach(box => {
                box.style.transition = '';
            });
            connections.forEach(conn => {
                conn.path.style.transition = '';
            });
        }, 300);
    }
};

// Add connection update management to BatmanSearch
BatmanSearch.updateConnectionPositions = function() {
    // Update all visible connections
    connections.forEach(connection => {
        if (connection.path.style.display !== 'none') {
            createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
        }
    });
};

// Enhance the centerOnBox method to handle connections
BatmanSearch.centerOnBox = function(box) {
    const boxRect = box.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    scale = Math.min(1.5, Math.max(0.5, scale));
    panX = viewportCenterX - (boxRect.left + boxRect.width / 2);
    panY = viewportCenterY - (boxRect.top + boxRect.height / 2);

    container.style.transition = 'transform 0.5s ease-out';
    
    // Update transformations and connections
    const updatePositions = () => {
        applyTransformations();
        this.updateConnectionPositions();
    };

    // Initial update
    updatePositions();

    // Update during transition
    const transitionDuration = 500;
    const updateInterval = 50;
    let elapsed = 0;
    
    const intervalId = setInterval(() => {
        elapsed += updateInterval;
        updatePositions();
        
        if (elapsed >= transitionDuration) {
            clearInterval(intervalId);
            container.style.transition = '';
        }
    }, updateInterval);
};

// Enhance the makeDraggable function to update connections during drag
function makeDraggable(box, connections) {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    box.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const boxRect = box.getBoundingClientRect();
        offsetX = (startX - boxRect.left);
        offsetY = (startY - boxRect.top);
        box.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const newLeft = (mouseX - offsetX - panX) / scale;
            const newTop = (mouseY - offsetY - panY) / scale;

            box.style.left = `${newLeft}px`;
            box.style.top = `${newTop}px`;

            // Update all visible connections
            BatmanSearch.updateConnectionPositions();
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            box.style.cursor = 'grab';
            
            // Final connection update after drag ends
            BatmanSearch.updateConnectionPositions();
        }
    });
}

// Update the applyTransformations function
function applyTransformations() {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    BatmanSearch.updateConnectionPositions();
}

BatmanSearch.clearHighlights = function() {
    if (window.currentHighlightedPath) {
        // Clear box highlights with fade out effect
        window.currentHighlightedPath.boxes.forEach(box => {
            box.style.transition = 'all 0.3s ease';
            box.classList.remove('bat-path-highlight');
        });
        
        // Clear connection highlights with fade out and reset color
        connections.forEach(conn => {
            conn.path.style.transition = 'all 0.3s ease';
            conn.path.classList.remove('bat-path-connection');
            
            // Reset to original color or black if no original color exists
            const originalColor = conn.color || 'black';
            conn.path.setAttribute('stroke', originalColor);
            conn.path.setAttribute('stroke-width', '2');
            
            // Remove any filters or special effects
            conn.path.style.filter = 'none';
        });

        // Remove any highlight-related elements
        const labels = document.querySelectorAll('.bat-path-label');
        labels.forEach(label => {
            if (label.parentNode) {
                label.parentNode.removeChild(label);
            }
        });

        // Reset the tracking variable
        window.currentHighlightedPath = null;

        // Reset transitions after cleanup
        setTimeout(() => {
            window.currentHighlightedPath?.boxes?.forEach(box => {
                box.style.transition = '';
            });
            connections.forEach(conn => {
                conn.path.style.transition = '';
            });
        }, 300);
    }
};

// Initialize the search module
BatmanSearch.init();
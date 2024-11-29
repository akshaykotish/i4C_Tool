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

            .bat-search-icon svg{
                width: 20px;
                height: 20px;
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
                box.classList.remove('bat-target-highlight');
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
            box.classList.remove("bat-target-highlight");
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

// Enhance BatmanSearch with tree navigation capabilities
BatmanSearch.findBoxPath = function(targetAccountNumber) {
    const path = [];
    let found = false;
    
    // Helper function to recursively search through the box hierarchy
    const searchBoxes = (currentBox) => {
        if (found) return;
        
        // Check if this is the target box
        if (currentBox.id === targetAccountNumber) {
            path.push(currentBox);
            found = true;
            return;
        }

        // Get transactions from this box
        const subTransactions = transactions.filter(tx => 
            tx.from_account_number === currentBox.id
        );

        // Check each transaction
        for (const tx of subTransactions) {
            const toAccountNumber = tx.to_bank_details.account_number;
            if (found) break;

            // If this path leads to our target, explore it
            if (this.isConnectedToTarget(toAccountNumber, targetAccountNumber)) {
                path.push(currentBox);
                
                // Simulate clicking the next button if needed
                if (!currentBox.subBoxesVisible) {
                    ShowSubTransactions(currentBox);
                }

                // Get or wait for the box to be created
                const nextBox = boxMap.get(toAccountNumber);
                if (nextBox) {
                    searchBoxes(nextBox);
                }
                
                if (!found) path.pop();
            }
        }
    };

    // Start search from each root box
    const rootBoxes = Array.from(boxMap.values()).filter(box => box.level === 0);
    for (const rootBox of rootBoxes) {
        if (found) break;
        searchBoxes(rootBox);
    }

    return path;
};

BatmanSearch.isConnectedToTarget = function(fromAccount, targetAccount) {
    let currentAccount = fromAccount;
    const visited = new Set();

    while (currentAccount) {
        if (currentAccount === targetAccount) return true;
        if (visited.has(currentAccount)) return false;
        visited.add(currentAccount);

        // Find next transaction from this account
        const nextTx = transactions.find(tx => 
            tx.from_account_number === currentAccount &&
            !visited.has(tx.to_bank_details.account_number)
        );

        currentAccount = nextTx ? nextTx.to_bank_details.account_number : null;
    }

    return false;
};

BatmanSearch.selectNode = function(accountNumber) {
    // Find the path to the target account
    const path = this.findBoxPath(accountNumber);
    
    if (path.length > 0) {
        // Clear existing highlights
        this.clearHighlights();
        
        // Highlight the path
        this.highlightPath(path[path.length - 1]);
        
        // Center on the target box
        this.centerOnBox(path[path.length - 1]);
    }
};

// Update the smart search method to search through transactions
BatmanSearch.smartSearch = function(query) {
    query = query.toLowerCase();
    const results = [];
    const seenAccounts = new Set();

    // Search through transactions
    transactions.forEach(tx => {
        // Search in from account
        if (this.matchAccount(tx.from_account_number, query)) {
            if (!seenAccounts.has(tx.from_account_number)) {
                results.push({
                    accountNumber: tx.from_account_number,
                    type: 'Source Account',
                    amount: tx.transaction_amount,
                    score: this.calculateMatchScore(tx.from_account_number, query)
                });
                seenAccounts.add(tx.from_account_number);
            }
        }

        // Search in to account
        const toAccount = tx.to_bank_details?.account_number;
        if (this.matchAccount(toAccount, query)) {
            if (!seenAccounts.has(toAccount)) {
                results.push({
                    accountNumber: toAccount,
                    type: 'Destination Account',
                    amount: tx.transaction_amount,
                    score: this.calculateMatchScore(toAccount, query)
                });
                seenAccounts.add(toAccount);
            }
        }
    });

    return results.sort((a, b) => b.score - a.score);
};

// Helper method to match account numbers
BatmanSearch.matchAccount = function(account, query) {
    return account && account.toLowerCase().includes(query);
};

// Calculate match score based on how well the account matches the query
BatmanSearch.calculateMatchScore = function(account, query) {
    if (!account) return 0;
    account = account.toLowerCase();
    
    if (account === query) return 10;  // Exact match
    if (account.startsWith(query)) return 8;  // Prefix match
    if (account.includes(query)) return 5;  // Partial match
    return 0;
};

// Update the handle search method
BatmanSearch.handleSearch = function(query) {
    if (!query) {
        this.suggestionsBox.style.display = 'none';
        this.clearHighlights();
        return;
    }

    const results = this.smartSearch(query);
    this.updateSuggestions(results);

    if (results.length > 0) {
        const accountNumber = results[0].accountNumber;
        // Find box if it exists
        const box = boxMap.get(accountNumber);
        if (box) {
            this.selectNode(box);
        } else {
            // If box doesn't exist, find and traverse the path
            this.findAndTraversePath(accountNumber);
        }
    }
};

BatmanSearch.findPathToRoot = function (clickedBox) {
    const path = [];
    let currentBox = clickedBox;
    
    // First, add the clicked box
    path.push(currentBox);
    
    // Find path to root
    while (currentBox) {
        // Find parent connection
        const parentConnection = connections.find(conn => conn.box2 === currentBox);
        if (parentConnection) {
            currentBox = parentConnection.box1;
            path.push(currentBox);
        } else {
            // Check if current box is a root (victim) box
            if (currentBox.level === 0) {
                break;
            }
            currentBox = null;
        }
    }
    
    return path;
};

// Add enhanced path highlighting to BatmanSearch
BatmanSearch.highlightSearchPath = function(targetBox) {
    const path = this.findPathToRoot(targetBox);
    
    // Clear any existing highlights first
    this.clearHighlights();

    // Highlight each box and connection in sequence
    path.forEach((box, index) => {
        setTimeout(() => {
            // Add highlight to box with glow effect
            box.classList.add('bat-path-highlight');
            
            // If not the last box, highlight connection to next box
            if (index < path.length - 1) {
                const nextBox = path[index + 1];
                const connection = connections.find(conn => 
                    (conn.box1 === box && conn.box2 === nextBox) ||
                    (conn.box2 === box && conn.box1 === nextBox)
                );

                if (connection) {
                    connection.path.classList.add('bat-path-connection');
                    connection.path.setAttribute('stroke', '#74ee15');
                    connection.path.setAttribute('stroke-width', '3');
                }
            }

            // Special highlight for target box
            if (box === targetBox) {
                box.classList.add('bat-target-highlight');
            }

            // Add step indicator
            const stepLabel = document.createElement('div');
            stepLabel.className = 'bat-step-label';
            stepLabel.textContent = `Step ${path.length - index}`;
            box.appendChild(stepLabel);
        }, index * 200); // Staggered animation timing
    });

    // Store highlighted elements for cleanup
    window.currentHighlightedPath = {
        boxes: path,
        targetBox: targetBox
    };
};

// Update the styles to include special target highlighting
const targetStyles = document.createElement('style');
targetStyles.textContent = `
    .bat-target-highlight {
        animation: targetPulse 2s infinite;
        border: 3px solid #74ee15;
        box-shadow: 0 0 25px rgba(116, 238, 21, 0.8);
    }

    .bat-step-label {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(30, 30, 30, 0.9);
        color: #74ee15;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
    }

    @keyframes targetPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(targetStyles);

// Update the findAndTraversePath method to include highlighting
BatmanSearch.findAndTraversePath = async function(targetAccount) {
    const transactionPath = this.findTransactionPathToAccount(targetAccount);
    if (!transactionPath.length) {
        return;
    }

    let currentBox = boxMap.get(transactionPath[0]);
    if (!currentBox) {
        return;
    }

    // Traverse and reveal the path
    for (let i = 0; i < transactionPath.length - 1; i++) {
        const currentAccount = transactionPath[i];
        const nextAccount = transactionPath[i + 1];
        
        await this.revealNextLevel(currentBox, nextAccount);
        currentBox = boxMap.get(nextAccount);
        
        if (!currentBox) break;
    }

    // After path is revealed, highlight it
    const targetBox = boxMap.get(targetAccount);
    if (targetBox) {
        this.highlightSearchPath(targetBox);
        this.centerOnBox(targetBox);
    }
};


// Helper method to find the complete transaction path
BatmanSearch.findTransactionPathToAccount = function(targetAccount) {
    const path = [];
    const visited = new Set();

    const findPathDFS = (currentAccount) => {
        if (visited.has(currentAccount)) return false;
        visited.add(currentAccount);
        path.push(currentAccount);

        if (currentAccount === targetAccount) return true;

        // Find all transactions from this account
        const nextTransactions = transactions.filter(tx => 
            tx.from_account_number === currentAccount
        );

        // Try each possible path
        for (const tx of nextTransactions) {
            const nextAccount = tx.to_bank_details.account_number;
            if (!visited.has(nextAccount) && findPathDFS(nextAccount)) {
                return true;
            }
        }

        path.pop();
        return false;
    };

    // Start from root accounts (victims)
    const rootAccounts = Array.from(boxMap.values())
        .filter(box => box.level === 0)
        .map(box => box.id);

    for (const rootAccount of rootAccounts) {
        if (findPathDFS(rootAccount)) {
            return path;
        }
    }

    return [];
};

// Helper method to reveal the next level of boxes
BatmanSearch.revealNextLevel = function(currentBox, targetAccount) {
    return new Promise((resolve) => {
        // If boxes are already visible, resolve immediately
        if (currentBox.subBoxesVisible) {
            resolve();
            return;
        }

        // Create a mutation observer to watch for new boxes
        const observer = new MutationObserver((mutations) => {
            const targetBoxCreated = Array.from(boxMap.values())
                .some(box => box.id === targetAccount);
            
            if (targetBoxCreated) {
                observer.disconnect();
                setTimeout(resolve, 500); // Wait for animation to complete
            }
        });

        // Start observing the container for changes
        observer.observe(container, {
            childList: true,
            subtree: true
        });

        // Simulate click on the next button
        const nextBtn = currentBox.querySelector('.nextbtn');
        if (nextBtn) {
            nextBtn.click();
            
            // Set a timeout to prevent infinite waiting
            setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 3000);
        } else {
            observer.disconnect();
            resolve();
        }
    });
};

// Update the suggestion click handler
BatmanSearch.updateSuggestions = function(results) {
    this.suggestionsBox.innerHTML = '';
    
    if (results.length === 0) {
        this.suggestionsBox.innerHTML = '<div class="bat-no-results">No matching accounts found</div>';
        this.suggestionsBox.style.display = 'block';
        return;
    }

    results.forEach(({ accountNumber, type, amount }) => {
        const item = document.createElement('div');
        item.className = 'bat-suggestion-item';
        item.dataset.accountNumber = accountNumber;
        
        // Get total transaction amount for this account
        const totalAmount = this.calculateTotalAmount(accountNumber);
        
        item.innerHTML = `
            <div>
                <div class="bat-account-number">${accountNumber}</div>
                <div class="bat-suggestion-meta">
                    ${type} • ${formatIndianCurrency(totalAmount)}
                </div>
            </div>
        `;
        
        item.addEventListener('click', async () => {
            this.searchInput.value = accountNumber;
            this.suggestionsBox.style.display = 'none';
            
            // Clear any existing highlights
            this.clearHighlights();
            
            // Find and reveal the complete path
            await this.findAndTraversePath(accountNumber);
        });
        
        this.suggestionsBox.appendChild(item);
    });

    this.suggestionsBox.style.display = 'block';
};

// Helper method to calculate total transaction amount for an account
BatmanSearch.calculateTotalAmount = function(accountNumber) {
    return transactions
        .filter(tx => tx.to_bank_details.account_number === accountNumber)
        .reduce((sum, tx) => {
            const amount = Number(tx.transaction_amount.replace(/[₹,]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
};



// Initialize the search module
BatmanSearch.init();
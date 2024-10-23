var organizedData = {};  // Object to store organized data by state and city
var ishover = true;      // Variable to control hover behavior

// Function to handle hover events
function OnHover(e) {
    if (ishover) {  // Check if hover is enabled
        var title = e.getAttribute("title");  // Get the title attribute from the hovered element
        console.log(title);  // Log the title for debugging
        document.getElementById("statename").innerText = title;  // Update the statename element with the title
        processStates(title);  // Call the processStates function with the title (state name)
    }
}

// Function to handle click events
function OnClick(e) {
    var title = e.getAttribute("title");  // Get the title attribute from the clicked element
    processStates(title);  // Process the selected state
    ishover = false;  // Disable hover behavior after clicking
    setInterval(() => {
        ishover = true;  // Re-enable hover behavior after 3 seconds
    }, 3000);
}

// Function to separate data by state and city
function separateDataByStateAndCity(data) {
    const separatedData = {};  // Initialize an empty object to hold separated data

    data.forEach(item => {
        const state = item.victim.state;  // Extract state from the data
        const city = item.victim.city;  // Extract city from the data
        const caseStatus = item.case_status;  // Extract case status (solved/unsolved)

        // Initialize state and city if not already present in separatedData
        if (!separatedData[state]) {
            separatedData[state] = {};
        }
        if (!separatedData[state][city]) {
            separatedData[state][city] = {
                cases: [],       // Array to hold case data
                totalCases: 0,   // Counter for total cases
                solvedCases: 0,  // Counter for solved cases
                unsolvedCases: 0 // Counter for unsolved cases
            };
        }

        // Push the case to the appropriate state and city
        separatedData[state][city].cases.push(item);

        // Increment the total number of cases
        separatedData[state][city].totalCases++;

        // Increment either solved or unsolved case count based on the status
        if (caseStatus === "solved") {
            separatedData[state][city].solvedCases++;
        } else {
            separatedData[state][city].unsolvedCases++;
        }
    });

    return separatedData;  // Return the separated data object
}

// Function to load data from JSON
function LoadData() {
    fetch('leveldata.json')  // Fetch data from the JSON file
        .then(response => response.json())  // Convert the response to JSON
        .then(data => {
            console.log(data.length);  // Log the number of records

            organizedData = separateDataByStateAndCity(data);  // Organize the data by state and city
            console.log(organizedData);  // Log the organized data

            // Example: Display the data in an HTML element
            const output = document.getElementById('output');
        })
        .catch(error => {
            console.error('Error loading the JSON file:', error);  // Log an error if data loading fails
        });
}

LoadData();  // Call the LoadData function to load the data

// Function to process data for a selected state
function processStates(state) {
    const stateData = organizedData[state];  // Retrieve data for the selected state

    if (stateData != undefined) {  // If data for the state exists
        const cities = Object.keys(stateData).map(cityName => {
            const cityData = stateData[cityName];

            return {
                name: cityName,              // City name
                registered: cityData.totalCases,  // Total number of registered cases
                solved: cityData.solvedCases,  // Number of solved cases
                unsolved: cityData.unsolvedCases,  // Number of unsolved cases
                today: 0  // Placeholder for today's cases (assume it needs separate calculation)
            };
        });

        console.log(cities);  // Log the processed city data for debugging
        displayCities(cities, stateData);  // Call the displayCities function to show the data
    } else {
        displayCities([]);  // If no data for the state, pass an empty array
    }
}

// Function to display cities and their case data
function displayCities(cities, stateData) {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = '';  // Clear existing content

    // Variables to calculate totals
    let totalRegistered = 0;
    let totalSolved = 0;
    let totalUnsolved = 0;
    let totalToday = 0;

    cities.forEach(city => {
        // Add to the totals
        totalRegistered += city.registered;
        totalSolved += city.solved;
        totalUnsolved += city.unsolved;
        totalToday += city.today;

        // Create row and cells for city data
        const row = document.createElement('tr');
        row.className = 'row';

        const cityName = document.createElement('td');
        cityName.textContent = city.name;

        const registered = document.createElement('td');
        registered.className = 'case-registered';
        registered.textContent = city.registered;

        const solved = document.createElement('td');
        solved.className = 'case-solved';
        solved.textContent = city.solved;

        const unsolved = document.createElement('td');
        unsolved.className = 'case-unsolved';
        unsolved.textContent = city.unsolved;

        const today = document.createElement('td');
        today.className = 'case-today';
        today.textContent = city.today;

        const arrow = document.createElement('td');
        arrow.id = "showDivButton";
        arrow.className = 'arrow';
        arrow.innerHTML = '&#8594;';  // Right arrow symbol
        arrow.onclick = function() {
            const fullScreenDiv = document.getElementById('fullScreenDiv');
            fullScreenDiv.classList.remove('hidden');
            fullScreenDiv.style.display = 'flex';  // Make the div visible
            setTimeout(() => {
                fullScreenDiv.classList.add('show');  // Show div with transition effect
            }, 10);  // Add slight delay for smooth transition
            ShowCasesOnScreen(stateData[city.name]);  // Show case data for the selected city
        };

        // Append cells to row
        row.appendChild(cityName);
        row.appendChild(registered);
        row.appendChild(solved);
        row.appendChild(unsolved);
        row.appendChild(today);
        row.appendChild(arrow);

        // Append row to the city list
        cityList.appendChild(row);
    });

    // Update total labels for registered, solved, unsolved, and today's cases
    document.getElementById('totalRegisteredLabel').textContent = totalRegistered;
    document.getElementById('totalSolvedLabel').textContent = totalSolved;
    document.getElementById('totalUnsolvedLabel').textContent = totalUnsolved;
    document.getElementById('totalTodayLabel').textContent = totalToday;
}

// Event listener to close the full-screen div
document.getElementById('closeDivButton').addEventListener('click', function() {
    const fullScreenDiv = document.getElementById('fullScreenDiv');
    fullScreenDiv.classList.remove('show');  // Trigger slide-out and fade-out effect
    setTimeout(() => {
        fullScreenDiv.style.display = 'none';  // Hide the div after the animation completes
        fullScreenDiv.classList.add('hidden');
    }, 500);  // 0.5s transition duration
});

// Utility function to convert number into words in the Indian numbering system
function numberToWords(num) {
    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
        'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const numToWords = (n) => {
        if (n < 20) return a[n];  // Return number in words if less than 20
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : '');  // Handle tens
        if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 == 0 ? '' : ' and ' + numToWords(n % 100));  // Handle hundreds
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 != 0 ? ' ' + numToWords(n % 1000) : '');  // Handle thousands
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 != 0 ? ' ' + numToWords(n % 100000) : '');  // Handle lakhs
        return numToWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 != 0 ? ' ' + numToWords(n % 10000000) : '');  // Handle crores
    };

    return numToWords(Math.floor(num));  // Return the number in words
}

// Utility function to format numbers into lakhs and crores with commas
function formatToIndianNumberingSystem(num) {
    const absNum = Math.abs(num);
    if (absNum >= 10000000) {
        return (num / 10000000).toFixed(2) + ' Cr';  // Format to crores
    } else if (absNum >= 100000) {
        return (num / 100000).toFixed(2) + ' Lakh';  // Format to lakhs
    } else {
        return num.toLocaleString('en-IN');  // Format to thousands with commas
    }
}

// Variable to store the original data array (populate with real data)
let originalDataArray = [];

// Variable to track if search is ongoing
let searching = false;

// Function to filter cases based on search input
function handleSearch() {
    if (searching === false) {
        console.log("F");  // Log for debugging
        searching = true;  // Set searching to true
    } else {
        console.log("T");
        return;  // Return if search is already in progress
    }

    setTimeout(() => {
        console.log("FF");

        const searchInput = document.getElementById('search-bar').value.toLowerCase();  // Get the search input

        // Filter data based on search input (match name, city, state, phone, etc.)
        const filteredData = originalDataArray.filter(item =>
            item.victim.name.toLowerCase().includes(searchInput) ||
            item.victim.city.toLowerCase().includes(searchInput) ||
            item.victim.state.toLowerCase().includes(searchInput) ||
            item.victim.phone.includes(searchInput) ||
            item.victim.bank_account.name.toLowerCase().includes(searchInput) ||
            item.victim.bank_account.account_number.toLowerCase().includes(searchInput) ||
            item.victim.email.toLowerCase().includes(searchInput)
        );

        document.getElementById('grid-container').innerHTML = '';  // Clear existing cards
        console.log(filteredData.length);  // Log the number of filtered items
        console.log(originalDataArray);  // Log the original data array

        createCards(filteredData.length ? filteredData : originalDataArray);  // Re-create the cards
        searching = false;  // Reset searching to false
    }, 2000);  // Delay of 2 seconds for the search function
}

// Function to create cards dynamically based on data array
function createCards(dataArray) {
    const gridContainer = document.getElementById('grid-container');  // Reference to the grid container

    dataArray.forEach((item) => {
        // Sum up the total transaction amounts
        const totalTransactionAmount = item.transaction_details.reduce((sum, transaction) => sum + transaction.transaction_amount, 0);

        // Format the total transaction amount in lakhs and crores
        const formattedAmount = formatToIndianNumberingSystem(totalTransactionAmount);

        // Convert amount to words (in Indian numbering system: lakhs and crores)
        const amountInWords = numberToWords(totalTransactionAmount) + ' rupees';

        // Determine case status color (solved/unsolved)
        const caseStatusClass = item.case_status === 'solved' ? 'solved' : 'unsolved';

        // Add bank logo based on the bank name (example bank logos)
        const bankLogos = {
            "Axis Bank": "https://upload.wikimedia.org/wikipedia/commons/9/94/Axis_Bank_Logo.svg",
            "ICICI Bank": "https://upload.wikimedia.org/wikipedia/commons/0/09/ICICI_Bank_Logo.svg",
        };
        const bankLogo = bankLogos[item.victim.bank_account.name] || '';

        // Create the card element
        const card = document.createElement('div');
        card.classList.add('card');

        // Populate the card with case and victim information
        card.innerHTML = `
            <div class="case-status ${caseStatusClass}"></div>
            <h3>${item.victim.name}</h3>
            <p><strong>Phone:</strong> ${item.victim.phone}</p>
            <p><strong>Email:</strong> ${item.victim.email}</p>
            <p><strong>City:</strong> ${item.victim.city}, ${item.victim.state}</p>

            <div class="bank-info">
                ${bankLogo ? `<img src="${bankLogo}" alt="${item.victim.bank_account.name} logo" class="bank-logo" />` : ''}
                <p><strong>Bank:</strong> ${item.victim.bank_account.name}</p>
                <p><strong>Account Number:</strong> ${item.victim.bank_account.account_number}</p>
            </div>

            <div class="card-details">
                <div>
                    <span>${formattedAmount}</span>
                    <small>Total Transaction</small>
                </div>
                <div>
                    <span class="amount-text">${amountInWords}</span>
                    <small>(in words)</small>
                </div>
            </div>
            
            <div class="police-station">
                <p><strong>Police Station:</strong> ${item.police_station.station_name}, ${item.police_station.city}</p>
            </div>

            <div class="card-footer">
                <p><strong>Case Status:</strong> ${item.case_status}</p>
                <button class="button">View Details</button>
            </div>
        `;

        // Add event listener to open modal with details
        card.querySelector('.button').addEventListener('click', () => openModal(item));

        // Append the card to the grid container
        gridContainer.appendChild(card);
    });
}

// Bank logos (add more as needed)
const bankLogos = {
    "Axis Bank": "https://upload.wikimedia.org/wikipedia/commons/9/94/Axis_Bank_Logo.svg",
    "ICICI Bank": "https://upload.wikimedia.org/wikipedia/commons/0/09/ICICI_Bank_Logo.svg",
};

// Transaction status icons (example icons)
const statusIcons = {
    "credit": "💸",
    "debit": "📤",
    "withdrawn": "🏧",
    "hold": "⏳",
    "lien": "🔒",
    "other": "🔄"
};

// Variable to hold case data for graph processing
var toprocessongrpah;

// Function to open the modal with full case details
function openModal(item) {
    const modal = document.getElementById('modal');  // Reference to the modal
    const modalContent = document.getElementById('modal-details');  // Reference to the modal content area

    // Calculate the total transaction amount
    const totalTransactionAmount = item.transaction_details.reduce((sum, tx) => sum + tx.transaction_amount, 0);
    const totalAmountInWords = numberToWords(totalTransactionAmount) + ' rupees';

    toprocessongrpah = item;  // Store the case data for graph processing

    // Build the modal HTML content with victim and case details
    modalContent.innerHTML = `
        <h3>Victim Details</h3>
        <p><strong>Name:</strong> ${item.victim.name}</p>
        <p><strong>Phone:</strong> ${item.victim.phone}</p>
        <p><strong>Email:</strong> ${item.victim.email}</p>
        <p><strong>City:</strong> ${item.victim.city}, ${item.victim.state}</p>

        <h3>Bank Account</h3>
        <div class="bank-info">
            <img src="${bankLogos[item.victim.bank_account.name] || ''}" alt="${item.victim.bank_account.name} logo" class="bank-logo" />
            <p><strong>Bank:</strong> ${item.victim.bank_account.name}</p>
            <p><strong>Account Number:</strong> ${item.victim.bank_account.account_number}</p>
            <p><strong>IFSC Code:</strong> ${item.victim.bank_account.ifsc}</p>
        </div>

        <h3>Transaction Details</h3>
        <table class="transaction-table">
            <thead>
                <tr>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Amount</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${item.transaction_details.map(tx => `
                    <tr>
                        <td>${tx.from_name}<br/>(${tx.from_bank_name})<br>Acc: ${tx.from_account_number}</td>
                        <td>${tx.to_name}<br/>(${tx.to_bank_name})<br>Acc: ${tx.to_account_number}</td>
                        <td>
                            <span class="amount-in-words">${formatToIndianNumberingSystem(tx.transaction_amount)} rupees</span><br>
                            <span class="amount-in-numbers">₹${tx.transaction_amount.toFixed(2)}</span>
                        </td>
                        <td>${tx.transaction_id}</td>
                        <td>${statusIcons[tx.transaction_status.toLowerCase()] || statusIcons["other"]} ${tx.transaction_status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Total Transaction Amount</h3>
        <p><strong>Total:</strong> ₹${totalTransactionAmount.toFixed(2)} (${totalAmountInWords})</p>

        <h3>Police Station</h3>
        <p><strong>Station Name:</strong> ${item.police_station.station_name}</p>
        <p><strong>City:</strong> ${item.police_station.city}</p>
        <p><strong>Contact:</strong> ${item.police_station.contact_number}</p>

        <h3>Case Status</h3>
        <p><strong>Status:</strong> ${item.case_status}</p>

        <div class="modal-buttons">
            <button onclick="printModal()">Print</button>
            <button onclick="onClickShowOnGraph()">Show on Graph</button>
        </div>
    `;

    // Show the modal
    modal.style.display = 'flex';
}

// Function to show the case data on the graph (saves to localStorage and navigates to graph page)
function onClickShowOnGraph() {
    console.log(toprocessongrpah);  // Log the case data for debugging
    localStorage.setItem("Case1", JSON.stringify(toprocessongrpah));  // Store the case data in local storage
    window.open('graph.html', '_blank');  // Open graph.html in a new tab
}


// Close the modal when clicking outside of it or on the close button
document.getElementById('close-modal').onclick = function() {
    document.getElementById('modal').style.display = 'none';  // Hide the modal
};

// Function to print the modal content
function printModal() {
    const modalContent = document.getElementById('modal-details').innerHTML;  // Get the modal content
    const printWindow = window.open('', '', 'height=500,width=800');  // Open a new window for printing
    printWindow.document.write('<html><head><title>Print</title></head><body>');
    printWindow.document.write(modalContent);  // Write the modal content to the new window
    printWindow.document.write('</body></html>');
    printWindow.document.close();  // Close the document
    printWindow.print();  // Print the content
}

// Function to display case details on screen
function ShowCasesOnScreen(casesbyCities) {
    console.log(casesbyCities);  // Log the cases for debugging
    originalDataArray = casesbyCities.cases;  // Set the original data array to the cases from the selected city
    createCards(casesbyCities.cases);  // Create and display cards for the cases
}

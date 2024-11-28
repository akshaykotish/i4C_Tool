let scale = 1;
let panX = 0;
let panY = 0;
const zoomSensitivity = 0.01;
let isPanning = false;
let startX, startY;
let boxHierarchy = new Map(); // To track each box and its sub-boxes

// Map to hold all created boxes by their id
const boxMap = new Map();

// Create a container to hold both boxes and lines
const container = document.createElement('div');
container.style.position = 'relative';
container.style.transformOrigin = '0 0';
container.style.width = '100%';
container.style.height = '100%';
document.body.appendChild(container);

// Function to apply transformations for zoom and pan
function applyTransformations() {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;

    // After transformations, update all lines between boxes
    connections.forEach(connection => {
        createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
    });
}

// Zoom in/out function
function zoom(delta, event) {
    const zoomFactor = delta > 0 ? 1 + zoomSensitivity : 1 - zoomSensitivity;
    const newScale = scale * zoomFactor;

    // Prevent zooming out too much
    if (newScale >= 0.2 && newScale <= 3) {
        // Adjust pan to ensure zoom is centered at the cursor location
        const containerRect = container.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        // Compute pan adjustment
        panX = mouseX - ((mouseX - panX) / scale) * newScale;
        panY = mouseY - ((mouseY - panY) / scale) * newScale;

        scale = newScale;
        applyTransformations();
    }
}

// Function to handle panning the canvas
function enablePanning() {
    document.addEventListener('mousedown', function (e) {
        if (e.target === document.body || e.target.tagName === 'svg') {
            isPanning = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            document.body.style.cursor = 'grab';
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (isPanning) {
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyTransformations();
        }
    });

    document.addEventListener('mouseup', function () {
        isPanning = false;
        document.body.style.cursor = 'default';
    });
}

// Event listener for zooming using the mouse wheel
document.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoom(e.deltaY, e);
});

// Function to create and update the curved link between two boxes
function createOrUpdateCurvedLink(box1, box2, path) {
    const box1Rect = box1.getBoundingClientRect();
    const box2Rect = box2.getBoundingClientRect();

    // Calculate center points
    const box1CenterX = box1Rect.left + box1Rect.width / 2;
    const box1CenterY = box1Rect.top + box1Rect.height / 2;
    const box2CenterX = box2Rect.left + box2Rect.width / 2;
    const box2CenterY = box2Rect.top + box2Rect.height / 2;

    // Calculate control point for the curve
    const controlPointX = (box1CenterX + box2CenterX) / 2;
    const controlPointY = Math.min(box1CenterY, box2CenterY) + 300;

    //console.log(panX, panY, controlPointX, controlPointY);
    //const pathData = `M ${box1CenterX} ${box1CenterY} Q ${controlPointX - 300} ${controlPointY + 300}, ${box2CenterX} ${box2CenterY}`;
    const pathData = `M ${box1CenterX},${box1CenterY} Q ${box2CenterX},${box2CenterY - 100} ${box2CenterX - 10}, ${box2CenterY - 50} T ${box2CenterX},${box2CenterY}`;
    path.setAttribute("d", pathData);
}

// Function to create a line between two boxes
function createConnection(box1, box2, color = 'black', transactions = []) {
    const svg = document.getElementById('lineContainer');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Initial line between the two boxes
    createOrUpdateCurvedLink(box1, box2, path);

     // Enable line color change
     enableLineColorChange(path);

     // Add hover event listener
     enableTransactionHover(path, transactions);

    // Return an object that contains the boxes, the path, and its color
    return { box1, box2, path, color };
}

// Function to enable hover tooltip on connections
function enableTransactionHover(path, transactions) {
    let tooltip;

    path.addEventListener('mouseenter', function (e) {
        if (transactions.length === 0) return;

        // Create tooltip
        tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');

        // Build content
        let content = '<ul>';
        transactions.forEach(tx => {
            content += `<li>Transaction ID: ${tx.utr_id}, Amount: ${formatIndianCurrency(tx.transaction_amount)}</li>`;
        });
        content += '</ul>';

        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);

        // Position the tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
    });

    path.addEventListener('mousemove', function (e) {
        if (tooltip) {
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
        }
    });

    path.addEventListener('mouseleave', function () {
        if (tooltip) {
            document.body.removeChild(tooltip);
            tooltip = null;
        }
    });
}

// Add CSS for the tooltip
const style = document.createElement('style');
style.innerHTML = `
.tooltip {
    background-color: rgba(0, 0, 0, 0.75);
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    max-width: 300px;
    font-size: 12px;
    position: absolute;
    z-index: 1000;
}
`;
document.head.appendChild(style);

function createBox(boxData) {
    const { id, name, color, forecolor, type, top, left, width, height, info, icon } = boxData;

    // Create box element
    const box = document.createElement('div');
    box.classList.add('box');
    
    // Assign the box id and name to attributes
    box.id = id;
    box.setAttribute('data-name', name);
    
    // Apply styles
    box.style.backgroundColor = color;
    box.style.top = `${top}px`;
    box.style.left = `${left}px`;
    box.style.position = 'absolute';
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
    box.style.cursor = 'grab';
    //box.style.backgroundColor = color || '#f0f4f8'; // Default background color
    //box.style.color = forecolor || '#333'; // Default text color


    // Add the information as a data attribute
    box.setAttribute('data-info', JSON.stringify(info));

    const identificationRow = document.createElement('div');
    identificationRow.classList.add("identificationRow");

    // Create icon element
    const iconElement = document.createElement('img');
    iconElement.src = icon;
    iconElement.classList.add('box-icon');

    identificationRow.appendChild(iconElement);

    const boxinfo = document.createElement('div');
    boxinfo.classList.add("boxinfo");
    boxinfo.innerHTML = `
        <span class='type'>${type} (Level ${boxData.level || 0})</span>
        <div class='dividerline'></div>
        <span class='id'>${id}</span>
    `;

    identificationRow.appendChild(boxinfo);


    // Calculate the total amount of transactions to this box id
    const totalAmount = transactions
        .filter(tx => tx.to_bank_details.account_number === id)
        .reduce((sum, tx) => sum + Number(tx.transaction_amount.replaceAll(",", "").replace("₹", "")), 0);

        
    
    const amountinfo = document.createElement('div');
    amountinfo.classList.add("amountinfo");
    amountinfo.innerHTML = `
        <span class='id'>${formatIndianCurrency(totalAmount)}</span>
    `;

    identificationRow.appendChild(amountinfo);

    

    // Create button for showing additional information
    const btn1 = document.createElement('div');
    btn1.classList.add("nextbtn");
    btn1.style.backgroundImage = "url('assets/next.png')";
    btn1.addEventListener('click', function() {
        ShowSubTransactions(box);
    });
    btn1.innerText = '➤';
    
    identificationRow.appendChild(btn1);

    // Event listener for showing the info panel
    boxinfo.addEventListener('click', function() {
        showInfoPanel(id, name, info);
    });

    // Append all elements to the box
    box.appendChild(identificationRow);
    
    // Append the box to the container
    container.appendChild(box);  
    
    // Store the box in the map with its id
    boxMap.set(id, box);

    return box;  
}



// Function to allow line color change
function enableLineColorChange(path) {
    path.addEventListener('contextmenu', function (e) {
        e.preventDefault(); 
        const newColor = prompt("Enter a new color for the line (e.g., red, #FF0000):", path.getAttribute("stroke"));
        if (newColor) {
            path.setAttribute("stroke", newColor);

            // Update the color in the connection object
            connections.forEach(connection => {
                if (connection.path === path) {
                    connection.color = newColor;
                }
            });
        }
    });
    path.addEventListener('dblclick', function (e) {
        e.preventDefault(); 
        const newColor = prompt("Enter a new color for the line (e.g., red, #FF0000):", path.getAttribute("stroke"));
        if (newColor) {
            path.setAttribute("stroke", newColor);

            // Update the color in the connection object
            connections.forEach(connection => {
                if (connection.path === path) {
                    connection.color = newColor;
                }
            });
        }
    });
    path.addEventListener('click', function (e) {
        e.preventDefault(); 
        connections.forEach(connection => {
            connection.path.setAttribute("stroke-width", "2");
        });
        path.setAttribute("stroke-width", "4");
    });
}

// Function to make an element draggable and update all connected lines
function makeDraggable(box, connections) {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    box.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const boxRect = box.getBoundingClientRect();
        offsetX = (startX - boxRect.left);
        offsetY = (startY - boxRect.top);
        box.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const newLeft = (mouseX - offsetX - panX) / scale;
            const newTop = (mouseY - offsetY - panY) / scale;

            box.style.left = `${newLeft}px`;
            box.style.top = `${newTop}px`;

            connections.forEach(connection => {
                createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
            });
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
        box.style.cursor = 'grab';
    });
}

// // Recursive hide/show functions for sub-boxes
// function hideSubBoxes(box) {
//     // Ensure the box is in the boxMap
//     if (!boxMap.has(box)) {
//         console.warn(`Box not found in boxMap: ${box}`);
//         return;
//     }

//     const subBoxes = boxHierarchy.get(box);
//     if (subBoxes) {
//         subBoxes.forEach(subBox => {
//             // Check if the sub-box is in boxMap before proceeding
//             if (!boxMap.has(subBox.element)) {
//                 console.warn(`Sub-box not found in boxMap: ${subBox.element}`);
//                 return;
//             }

//             // Hide the sub-box and its connections
//             subBox.element.style.display = 'none';
//             if (subBox.connection1?.path) subBox.connection1.path.style.display = 'none';
//             if (subBox.connection2?.path) subBox.connection2.path.style.display = 'none';

//             // Recursive call to hide sub-boxes
//             hideSubBoxes(subBox.element);
//         });
//     }
// }


// function showSubBoxes(box) {
//     const subBoxes = boxHierarchy.get(box);
//     if (subBoxes) {
//         subBoxes.forEach(subBox => {
//             subBox.element.style.display = 'block';
//             subBox.connection1.path.style.display = 'block';
//             subBox.connection2.path.style.display = 'block';
//             showSubBoxes(subBox.element); // Recursive call to show sub-boxes
//         });
//     }
// }

// Function to add new boxes on double-click
function addNewBoxesOnClick(box) {
    box.addEventListener('dblclick', function () {
        if (boxHierarchy.has(box)) {
            const subBoxes = boxHierarchy.get(box);
            console.log(subBoxes);
            if (subBoxes && subBoxes[0].element.style.display === 'none') {
                showSubBoxes(box);
            } else {
                hideSubBoxes(box);
            }
            return;
        }

        const boxRect = box.getBoundingClientRect();
        const maxBoxes = Math.floor(Math.random() * 11); // Random number between 0 and 10
        const colors = ['purple', 'orange', 'blue', 'green', 'yellow', 'red', 'pink', 'cyan', 'magenta', 'lime'];
        const padding = 50; // Padding between boxes

        const subBoxes = [];
        for (let i = 0; i < maxBoxes; i++) {
            const randomColor = colors[i % colors.length]; // Cycle through color array
            const randomOffset = (i + 1) * (boxRect.width + padding); // Adjust position based on index

            const newBoxTop = boxRect.top + boxRect.height + 200 - panY;
            const newBoxLeft = boxRect.left - randomOffset + (i % 2 === 0 ? -120 : 120) - panX; // Alternate left-right positioning

            const newBox = createBox({
                id: `box${Math.floor(Math.random() * 1000)}`, // Unique ID for each new box
                name: `Box ${i + 1}`,
                color: randomColor,
                top: newBoxTop,
                left: newBoxLeft,
                width: 150,
                height: 100,
                info: { description: `This is box ${i + 1}`, createdBy: 'User A' }
            });

            const parentConnection = connections.find(connection => connection.box1 === box || connection.box2 === box);
            const parentColor = parentConnection ? parentConnection.color : 'black';
            const connection = createConnection(box, newBox, parentColor);

            connections.push(connection);

            // Make the new box draggable
            makeDraggable(newBox, connections.filter(c => c.box1 === newBox || c.box2 === newBox));
            
            // Make the new box draggable
            makeDraggable(box, connections.filter(c => c.box1 === box || c.box2 === box));
                        

            // Add event listener to the new box
            addNewBoxesOnClick(newBox);

            // Enable line color change for each connection
            enableLineColorChange(connection.path);

            subBoxes.push({ element: newBox, connection });
        }

        // Store the hierarchy of this box and its sub-boxes
        boxHierarchy.set(box, subBoxes);
    });
}


// Main logic
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.id = 'lineContainer';
svg.style.position = 'absolute';
svg.style.top = '0';
svg.style.left = '0';
svg.style.width = '100%';
svg.style.height = '100%';
container.appendChild(svg);  

const connections = [];

function DoConnection(boxa, boxb){
    connections.push(createConnection(boxa, boxb));

    const uniqueBoxes = new Set();
    connections.forEach(connection => {
        uniqueBoxes.add(connection.box1);
        uniqueBoxes.add(connection.box2);
    });

    uniqueBoxes.forEach(box => {
        addNewBoxesOnClick(box);
        const relatedConnections = connections.filter(c => c.box1 === box || c.box2 === box);
        makeDraggable(box, relatedConnections);  
    });

    connections.forEach(connection => enableLineColorChange(connection.path));
}

 

// box1 = createBox({
//     id: 'box1',
//     name: 'Box 1',
//     color: 'red',
//     top: 50,
//     left: 100,
//     width: 150,
//     height: 100,
//     info: { description: 'This is box 1', createdBy: 'User A' }
// });

// addNewBoxesOnClick(box1);
enablePanning();





function formatIndianCurrency(amount) {
    if (typeof amount === 'undefined') {
        return '';
    }
    else if(amount === 0)
    {
        return '';
    }
    return '₹' + amount.toLocaleString('en-IN');
}

var transactions = [];

var shownboxes = [];


// Declare the transactionLinksMap globally
let transactionLinksMap = new Map();

icons = {
    "debit": "assets/atm-card.png",
    "withdrawn": "assets/atm.png",
    "lean": "assets/calendar.png",
    "credit": "assets/cashback.png",
    "delete": "assets/delete.png",
    "hold": "assets/hold.png",
    "link": "assets/link.png",
    "men": "assets/men.png",
    "next": "assets/next.png",
    "onlineshopping": "assets/online-shopping.png",
    "note": "assets/pencil.png"
};

var boxwidth = 350;
var boxheight = 100;

level = 0;

var vcardindex = -1;

function BuildVictimsBox(victim, index) {

    if (boxMap[victim.bank_account.account_number]) {
        //console.log("Box for this victim already exists:", victim.bank_account.account_number);
        return; // Skip creating a new box
    }
    else{
        vcardindex++;
    }

    //console.log(victim);
    const spacing = 400; // Spacing between victim boxes
    const victimbox = createBox({
        id: victim.bank_account.account_number,
        name: victim.name,
        color: level == 0 ? '#FF9697' : '#FF9697',
        forecolor: '#FFFFFF',
        type: "Victim's Account",
        top: screen.height / 5,
        left: screen.width / 4 + (spacing * vcardindex),
        width: boxwidth,
        height: boxheight,
        info: {
            "phone": victim.phone,
            "email": victim.email,
            "city": victim.city,
            "state": victim.state,
            "bank name": victim.bank_account.name,
            "bank account": victim.bank_account.account_number,
            // "ifsc": victim.bank_account.ifsc,    
        },
        icon: icons["men"],
    });

    shownboxes.push(victimbox);

    victimbox.level = 0;

    // Store the victim box in the boxMap to keep track of created boxes
    boxMap[victim.bank_account.account_number] = victimbox;

    // Store the victim box in the boxMap to keep track of created boxes
    boxMap.set(victim.bank_account.account_number, victimbox);

    // Make the new box draggable
    makeDraggable(victimbox, connections.filter(c => c.box1 === victimbox || c.box2 === victimbox));


    // Add event listener to the new box
    // ShowSubTransactions(victimbox);
}

function BuildAllVictims(victims) {
    //console.log(victims);
    victims.forEach((victim, index) => {
        BuildVictimsBox(victim, index);
    });
}

function ShowSubTransactions(box) {
    //console.log(box.id);
    level++;

    // Get the parent box's level
    let parentLevel = box.level;

    // Hide sub-boxes of all other boxes at the same level
    boxMap.forEach(function(otherBox){
        if(otherBox.level == box.level && otherBox != box){
            hideSubBoxes(otherBox);
            otherBox.subBoxesVisible = false;
        }
    });

    if (boxHierarchy.has(box)) {
        //console.log(boxHierarchy);
        const subBoxes = boxHierarchy.get(box);
        //console.log(subBoxes);
        if (box.subBoxesVisible) {
            hideSubBoxes(box);
            box.subBoxesVisible = false;
        } else {
            showSubBoxes(box);
            box.subBoxesVisible = true;
        }
        return;
    }

    const boxRect = box.getBoundingClientRect();
    //const maxBoxes = 2; // Math.floor(Math.random() * 2); // Random number between 0 and 10
    const colors = ['#E3F2FD', '#FFF9C4', '#FFEBEE', '#E8F5E9', '#F3E5F5', '#FFE0B2', '#F1F8E9', '#FCE4EC', '#E1F5FE', '#FFF3E0'];
    //const padding = 50; // Padding between boxes

    const subBoxes = [];

    var i = 0;
    var count = 0;

    const marginBetweenBoxes = 200/scale; // Margin between each sub-box
    const boxWidth = 280/scale; // Width of each sub-box

    // Determine the number of children to calculate proper positioning
    let subBoxesData = transactions.filter(tx => tx.from_account_number === box.id);

    // // If no transactions, alert the user
    // if (subBoxesData.length === 0) {
    //     alert("No more transactions!");
    //     return;
    // }

    // Calculate the total width required for all sub-boxes with margins
    const totalWidth = subBoxesData.length * (boxWidth + marginBetweenBoxes) - marginBetweenBoxes;

    // Calculate the starting position for the first box, centered with respect to the parent box
    const startLeft = boxRect.left - (totalWidth / 2); // Center all sub-boxes around the parent box

    let nextTopReduction = marginBetweenBoxes; // Initial margin for top, reduced by half for each subsequent box

    subBoxesData.map((tx, index) => {
        let from_account_number = tx.from_account_number;

        if (from_account_number == box.id) {
            let to_account_number = tx.to_bank_details.account_number;

            //alert(to_account_number);
            if(to_account_number === undefined)
            {
                let Withdrawal_Date_Time = tx.Withdrawal_Date_Time;
                to_account_number = " - WithDrawn on " + Withdrawal_Date_Time;
                tx["transaction_status"] = "withdrawn";
                //alert("withdrawn");
            }

            let newBox;
            if (!boxMap.has(to_account_number)) {
                // Positioning the sub-boxes
                const newBoxTop = (boxRect.top + boxRect.height + (nextTopReduction/2) - panY) / scale;

                // Calculate the left position for each sub-box
                const newBoxLeft = (startLeft + index * (boxWidth + marginBetweenBoxes) - panX) / scale;


                const colorIndex = (box.level + 1) % colors.length;
                const color = colors[colorIndex];

                newBox = createBox({
                    id: to_account_number,
                    name: "Suspect Account",
                    color: color,
                    type: "Transaction",
                    top: newBoxTop,
                    left: newBoxLeft,
                    width: boxwidth,
                    height: boxheight,
                    icon: tx.transaction_status.includes("withdraw") ? icons["withdrawn"] :
                        tx.transaction_status.includes("lean") ? icons["lean"] :
                        tx.transaction_status.includes("hold") ? icons["hold"] :
                        tx.transaction_status.includes("shopping") ? icons["onlineshopping"] :
                        tx.transaction_status.includes("credit") ? icons["credit"] : icons["debit"],
                    info: {
                        "from_account_number": tx.from_account_number,
                        "utr_id": tx.utr_id,
                        "to_account_number": tx.to_account_number,
                        "to_bank_name": tx.to_bank_name,
                        "ifsc": tx.to_bank_details.ifsc,
                        "transaction_amount": tx.transaction_amount,
                    },
                    level: parentLevel + 1,
                });

                newBox.level = parentLevel + 1;
                count++;
                // Store the new box in boxMap
                boxMap.set(to_account_number, newBox);
            } else {
                newBox = boxMap.get(to_account_number);
                if (newBox != undefined) {
                    count++;
                }
            }

            const parentConnection = connections.find(connection => connection.box1 === box || connection.box2 === box);
            const parentColor = parentConnection ? parentConnection.color : 'black';

            
            // Get transactions between accounts
            const key = box.id + '-' + to_account_number;
            const transactionsBetweenAccounts = transactionLinksMap.get(key) || [];

            const connection = createConnection(box, newBox, parentColor, transactionsBetweenAccounts);
            connections.push(connection);

            makeDraggable(newBox, connections.filter(c => c.box1 === newBox || c.box2 === newBox));

            enableLineColorChange(connection.path);

            subBoxes.push({ element: newBox, connection });


            // Reduce the nextTopReduction by half for the next sub-box
        }
    });

    box.subBoxesVisible = true;

    // //console.log(count);
    // if (count == 0) {
    //     alert("No more transactions!");
    // }

    if (subBoxes.length === 0) {
        alert("No more transactions!");
    }

    // Store the hierarchy of this box and its sub-boxes
    boxHierarchy.set(box, subBoxes);
}

function LoadCase(casename) {
    // Retrieve the item from local storage
    const item = localStorage.getItem(casename);

    // Parse the JSON string into a JavaScript object
    return item ? JSON.parse(item) : null;
}

function LoadGraphs() {
    let case1 = LoadCase("Case1");
    if (case1 != null) {
        transactions = case1.transaction_details;
        
        // Preprocess transactions to group them by account pairs
        transactionLinksMap = groupTransactionsByAccounts(transactions);
        
        BuildAllVictims(case1.victim);
    }
}


// Function to group transactions by account pairs
function groupTransactionsByAccounts(transactions) {
    const map = new Map();

    transactions.forEach(tx => {
        const from_account_number = tx.from_account_number;
        const to_account_number = tx.to_bank_details.account_number;

        const key = from_account_number + '-' + to_account_number;

        if (map.has(key)) {
            map.get(key).push(tx);
        } else {
            map.set(key, [tx]);
        }
    });

    return map;
}

var showboxeslist = [];
var hideboxeslist = [];

function hideSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'none';
            subBox.connection.path.style.display = 'none';
            subBox.element.subBoxesVisible = false; // Update 
            
            if(!hideboxeslist.includes(subBox.element)){
                hideboxeslist.push(subBox.element);
                console.log(" is added in hideboxeslist");
                hideSubBoxes(subBox.element); // Recursive call to hide sub-boxes
            }
            
        });

        box.style.display = 'block';
        box.subBoxesVisible = true; // Update visibility
        
    }
}

function showSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'block';
            subBox.connection.path.style.display = 'block';
            subBox.element.subBoxesVisible = true; // Update visibility

            let indexofbox = hideboxeslist.indexOf(subBox.element);
            hideboxeslist.slice(indexofbox, 1);
            
            
            connections.forEach(connection => {
                createOrUpdateCurvedLink(connection.box1, connection.box2, connection.path);
            });
            
            if(showboxeslist.includes(subBox.element)){
                showboxeslist.push(subBox.element);
                showSubBoxes(subBox.element); // Recursive call to show sub-boxes
            }
        });
    }
}

LoadGraphs();



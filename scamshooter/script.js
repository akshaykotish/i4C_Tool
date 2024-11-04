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

// Add zoom in, zoom out, and drag move buttons
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'fixed';
controlsContainer.style.bottom = '20px';
controlsContainer.style.right = '20px';
controlsContainer.style.display = 'flex';
controlsContainer.style.flexDirection = 'column';
controlsContainer.style.gap = '10px';
controlsContainer.style.zIndex = '1000';
document.body.appendChild(controlsContainer);

// Zoom In button
const zoomInButton = document.createElement('button');
zoomInButton.innerText = '+';
zoomInButton.style.width = '50px';
zoomInButton.style.height = '50px';
zoomInButton.style.fontSize = '24px';
zoomInButton.style.cursor = 'pointer';
zoomInButton.style.border = 'none';
zoomInButton.style.color = 'black';
controlsContainer.appendChild(zoomInButton);
zoomInButton.addEventListener('click', function () {
    zoom(1, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
});

// Zoom Out button
const zoomOutButton = document.createElement('button');
zoomOutButton.innerText = '-';
zoomOutButton.style.width = '50px';
zoomOutButton.style.height = '50px';
zoomOutButton.style.fontSize = '24px';
zoomOutButton.style.cursor = 'pointer';
zoomOutButton.style.border = 'none';
zoomOutButton.style.color = 'black';
controlsContainer.appendChild(zoomOutButton);
zoomOutButton.addEventListener('click', function () {
    zoom(-1, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
});

// Drag Move button
const dragMoveButton = document.createElement('button');
dragMoveButton.innerText = 'Move';
dragMoveButton.style.width = '50px';
dragMoveButton.style.height = '50px';
dragMoveButton.style.fontSize = '18px';
dragMoveButton.style.cursor = 'pointer';
dragMoveButton.style.border = 'none';
dragMoveButton.style.color = 'black';
controlsContainer.appendChild(dragMoveButton);

dragMoveButton.addEventListener('mousedown', function (e) {
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    document.body.style.cursor = 'grab';
});

document.addEventListener('mouseup', function () {
    isPanning = false;
    document.body.style.cursor = 'default';
});


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
    const pathData = `M ${box1CenterX},${box1CenterY} Q ${box1CenterX},${box2CenterY} ${box1CenterX}, ${box2CenterY} T ${box2CenterX},${box2CenterY}`;
    path.setAttribute("d", pathData);
}

// Function to create a line between two boxes
function createConnection(box1, box2, color = 'black') {
    const svg = document.getElementById('lineContainer');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Initial line between the two boxes
    createOrUpdateCurvedLink(box1, box2, path);

    // Return an object that contains the boxes, the path, and its color
    return { box1, box2, path, color };
}


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
    

    console.log("id", id);
    // Add the information as a data attribute
    box.setAttribute('id', id);
    console.log(box.id);

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
        <span class='type'>${type}</span>
        <div class='dividerline'></div>
        <span class='id'>ID: ${id}</span>
        <span class='name'>${name}</span>
    `;

    identificationRow.appendChild(boxinfo);

    
    const informationRow = document.createElement('div');
    informationRow.classList.add("informationRow");

    informationRow.innerHTML =
     `
     <span class='information'>Required Information</span>
    `;

     // Create a container for the info key-value pairs
     const infoContainer = document.createElement('div');
     infoContainer.classList.add('info-container');

    // Iterate over the info object and create a paragraph for each key-value pair
    for (const [key, value] of Object.entries(info)) {
        const infoLabel = document.createElement('p');
        infoLabel.innerHTML = `<b>${key.replaceAll("_", " ").toUpperCase()}:</b> ${value}`;
        infoLabel.classList.add('box-info');
        infoContainer.appendChild(infoLabel);
    }

    informationRow.appendChild(infoContainer);
    
    // Create a div for buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    
    // Create three buttons
    const btn1 = document.createElement('div');
    btn1.style.backgroundImage = "url('assets/next.png')";
    console.log("HN", box);
    btn1.addEventListener('click', function(){
        console.log("YO", box);
        ShowSubTransactions(box);
    });
    btn1.innerText = 'Next';
    
    const btn2 = document.createElement('div');
    btn2.style.backgroundImage = "url('assets/link.png')";
    btn2.innerText = 'Find Links';
    
    const btn3 = document.createElement('div');
    btn3.style.backgroundImage = "url('assets/pencil.png')";
    btn3.innerText = 'Write Note';

    
    const btn4 = document.createElement('div');
    btn4.style.backgroundImage = "url('assets/delete.png')";
    btn4.innerText = 'Delete';
    
    // Append buttons to the button container
    buttonContainer.appendChild(btn1);
    // buttonContainer.appendChild(btn2);
    // buttonContainer.appendChild(btn3);
    // buttonContainer.appendChild(btn4);
    
    // Append all elements to the box
    box.appendChild(identificationRow);
    //box.appendChild(informationRow);
    box.appendChild(buttonContainer);
    
    // Append the box to the container
    console.log("Ready to save", box);
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

// Recursive hide/show functions for sub-boxes
function hideSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'none';
            subBox.connection1.path.style.display = 'none';
            subBox.connection2.path.style.display = 'none';
            hideSubBoxes(subBox.element); // Recursive call to hide sub-boxes
        });
    }
}

function showSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'block';
            subBox.connection1.path.style.display = 'block';
            subBox.connection2.path.style.display = 'block';
            showSubBoxes(subBox.element); // Recursive call to show sub-boxes
        });
    }
}

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



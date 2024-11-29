// Add zoom in, zoom out, drag move, and download buttons
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'fixed';
controlsContainer.style.bottom = '20px';
controlsContainer.style.left = '20px';
controlsContainer.style.display = 'flex';
controlsContainer.style.flexDirection = 'column';
controlsContainer.style.gap = '10px';
controlsContainer.style.zIndex = '1000';
document.body.appendChild(controlsContainer);

// Button styling function
function styleButton(button, iconText) {
    button.style.width = '40px';
    button.style.height = '40px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.backgroundColor = 'whitesmoke';
    button.style.color = 'black';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.borderRadius = '50%';
    button.style.transition = 'transform 0.3s';
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    button.innerText = iconText;
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Zoom In button
const zoomInButton = document.createElement('button');
styleButton(zoomInButton, '+');
controlsContainer.appendChild(zoomInButton);
zoomInButton.addEventListener('click', function () {
    zoom(1, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
});

// Zoom Out button
const zoomOutButton = document.createElement('button');
styleButton(zoomOutButton, '-');
controlsContainer.appendChild(zoomOutButton);
zoomOutButton.addEventListener('click', function () {
    zoom(-1, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
});

// Drag Move button
const dragMoveButton = document.createElement('button');
styleButton(dragMoveButton, '🔄');
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

// Download as Image button
const downloadButton = document.createElement('button');
styleButton(downloadButton, '📥');
controlsContainer.appendChild(downloadButton);

downloadButton.addEventListener('click', function () {
    convertHtmlToFullHdPng();
});

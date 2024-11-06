// New JavaScript file: animatedPanel.js
function showInfoPanel(id, name, info) {
    // Remove existing panel if present
    const existingPanel = document.querySelector('.info-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Create panel element
    const panel = document.createElement('div');
    panel.classList.add('info-panel');

    // Add panel styles
    panel.style.position = 'fixed';
    panel.style.right = '-420px';
    panel.style.top = '20px';
    panel.style.width = '400px';
    panel.style.height = 'calc(100% - 60px)';
panel.style.marginBottom = '20px';
    panel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    panel.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    panel.style.transition = 'right 0.5s ease';
    panel.style.color = 'black';
    panel.style.padding = '20px';
    panel.style.borderRadius = '20px 0 0 20px';
    panel.style.backdropFilter = 'blur(10px)';

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerText = '✖';
    closeButton.style.background = 'none';
    closeButton.style.color = 'black';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginBottom = '20px';
    closeButton.addEventListener('click', function() {
        panel.style.right = '-420px';
        setTimeout(() => panel.remove(), 500);
    });

    panel.appendChild(closeButton);

    // Add box information to panel
    const title = document.createElement('h2');
    title.innerText = `${name.toUpperCase()}`;
    title.style.color = 'black';
title.style.fontSize = '18px';
title.style.marginBottom = '10px';
    panel.appendChild(title);

    const accountId = document.createElement('p');
    accountId.innerText = `Account ID: ${id}`;
    accountId.style.marginBottom = '10px';
accountId.style.fontSize = '14px';
    accountId.style.color = 'black';
    panel.appendChild(accountId);

    const infoTable = document.createElement('table');
    infoTable.classList.add('info-table');
    infoTable.style.width = '100%';
    infoTable.style.borderCollapse = 'collapse';
infoTable.style.border = 'none';

    // Add table header
    const headerRow = document.createElement('tr');
    const keyHeader = document.createElement('th');
    keyHeader.innerText = 'Key';
    
    keyHeader.style.padding = '8px';
keyHeader.style.fontSize = '14px';
    keyHeader.style.color = 'black';
keyHeader.style.fontWeight = 'bold';
    const valueHeader = document.createElement('th');
    valueHeader.innerText = 'Value';
    
    valueHeader.style.padding = '8px';
valueHeader.style.fontSize = '14px';
    valueHeader.style.color = 'black';
valueHeader.style.fontWeight = 'bold';
    headerRow.appendChild(keyHeader);
    headerRow.appendChild(valueHeader);
    infoTable.appendChild(headerRow);

    // Add table rows for each info item
    for (const [key, value] of Object.entries(info)) {
        const row = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.innerText = key.replaceAll('_', ' ').toUpperCase();
        keyCell.style.padding = '8px';
keyCell.style.border = 'none';
keyCell.style.fontWeight = 'bold';
keyCell.style.fontSize = '12px';
        
        keyCell.style.color = 'black';
        const valueCell = document.createElement('td');
        valueCell.innerText = value;
        valueCell.style.padding = '8px';
valueCell.style.border = 'none';
valueCell.style.fontSize = '12px';
        
        valueCell.style.color = 'black';
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        infoTable.appendChild(row);
    }

    panel.appendChild(infoTable);

    // Append panel to the body
    document.body.appendChild(panel);

    // Animate panel to slide in
    setTimeout(() => {
        panel.style.right = '0';
    }, 0);
}

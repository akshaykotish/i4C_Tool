// Create top-left container
const topLeftContainer = document.createElement('div');
topLeftContainer.className = 'top-left-container';
document.body.appendChild(topLeftContainer);

// Create logo image
const logo = document.createElement('img');
logo.src = 'https://i4c.mha.gov.in/assets/images/i4cpng.png';
logo.alt = 'Logo';
logo.className = 'logo';
topLeftContainer.appendChild(logo);

// Create info button
const infoButton = document.createElement('button');
infoButton.className = 'info-button';
infoButton.id = 'infoButton';
infoButton.textContent = 'i';
topLeftContainer.appendChild(infoButton);

// Create info popup
const infoPopup = document.createElement('div');
infoPopup.className = 'info-popup';
infoPopup.id = 'infoPopup';
infoPopup.textContent = 'This is a brief about the money trail analysis tool for cyber crime investigations, created by Akshay Kotish. It visualizes the flow of funds between accounts, displaying transaction amounts and account details. The nodes represent accounts, and lines show money transfers, with color coding to differentiate account statuses. This makes analyzing suspicious money movements easier for officers.';
topLeftContainer.appendChild(infoPopup);

// Add event listener to info button
infoButton.addEventListener('click', function() {
  if (infoPopup.style.display === 'none' || infoPopup.style.display === '') {
    infoPopup.style.display = 'block';
  } else {
    infoPopup.style.display = 'none';
  }
});
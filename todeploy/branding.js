// Remove existing style tag if it exists
const existingStyle = document.querySelector('#batman-branding-style');
if (existingStyle) {
  existingStyle.remove();
}

// Add Batman-style CSS
const brandstyle = document.createElement('style');
brandstyle.id = 'batman-branding-style';
brandstyle.textContent = `
  .top-left-container {
    position: fixed;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 9999;
  }

  .top-left-container:hover {
    background: rgba(0, 0, 0, 0.9);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }

  .brand-title {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #3B82F6;
    letter-spacing: 2px;
    margin: 0;
    text-transform: uppercase;
  }

  .brand-divider {
    width: 100%;
    height: 2px;
    background: rgba(59, 130, 246, 0.5);
    margin: 4px 0;
  }

  .brand-tagline {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    color: #9CA3AF;
    margin: 0;
  }
`;
document.head.appendChild(brandstyle);

// Create and add container
const topLeftContainer = document.createElement('div');
topLeftContainer.className = 'top-left-container';

// Create brand title
const brandTitle = document.createElement('h1');
brandTitle.className = 'brand-title';
brandTitle.textContent = 'OMNITRIX';

// Create divider
const divider = document.createElement('div');
divider.className = 'brand-divider';

// Create tagline
const tagline = document.createElement('p');
tagline.className = 'brand-tagline';
tagline.textContent = 'An Akshay Kotish & Co. Product';

// Add click event to open website
topLeftContainer.addEventListener('click', () => {
  window.open('https://www.akshaykotish.com', '_blank');
});

// Append all elements
topLeftContainer.appendChild(brandTitle);
topLeftContainer.appendChild(divider);
topLeftContainer.appendChild(tagline);
document.body.appendChild(topLeftContainer);

// Remove old elements if they exist
const oldLogo = document.querySelector('.logo');
if (oldLogo) oldLogo.remove();

const oldInfoButton = document.querySelector('.info-button');
if (oldInfoButton) oldInfoButton.remove();

const oldInfoPopup = document.querySelector('.info-popup');
if (oldInfoPopup) oldInfoPopup.remove();
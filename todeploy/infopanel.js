function showInfoPanel(id, name, transactionData = [], path = []) {
    const existingPanel = document.querySelector('.info-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    const transactions = Array.isArray(transactionData) ? transactionData : [];
    
    // Get clicked account details
    const accountDetails = transactions.find(tx => 
        tx.from_account_number === id || 
        (tx.to_bank_details && tx.to_bank_details.account_number === id)
    );

    const panel = document.createElement('div');
    panel.classList.add('info-panel');

    Object.assign(panel.style, {
        position: 'fixed',
        right: '-420px',
        top: '80px',
        bottom: '80px',
        width: '400px',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        transition: 'right 0.5s ease',
        color: '#fff',
        padding: '25px',
        borderRadius: '20px 0 0 20px',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '11px',
        zIndex: '1000',
        scrollBehavior: 'smooth',
    });

    // Prevent zoom and handle scrolling
    panel.addEventListener('wheel', (e) => {
        e.stopPropagation();
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });

    // Account Details Section
    const accountSection = document.createElement('div');
    Object.assign(accountSection.style, {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
    });

    const bankDetails = accountDetails?.to_bank_details || {};
    accountSection.innerHTML = `
        <div style="color: #888; font-size: 12px; font-weight: bold; margin-bottom: 15px;">
            ACCOUNT DETAILS
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="flex: 1;">
                <div style="color: #fff; font-size: 16px; margin-bottom: 5px;">${name}</div>
                <div class="copyable" style="color: #888; font-family: monospace; font-size: 10px; padding: 2px 4px;">
                    A/C: ${id}
                </div>
                <div class="copyable" style="color: #888; font-family: monospace; font-size: 10px; padding: 2px 4px; margin-top: 4px;">
                    IFSC: ${bankDetails.ifsc || 'N/A'}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="color: #4CAF50; font-size: 12px;">Level ${path[0]?.level || 0}</div>
                <div style="color: #888; font-size: 10px;">${path.length - 1} hops</div>
                <div style="color: #888; font-size: 10px; margin-top: 4px;">
                    ${bankDetails.name || 'Unknown Bank'}
                </div>
            </div>
        </div>
    `;

    // Get all transactions for current path
    let pathTransactions = [];
    let baseLevel = path[0]?.level || 0;

    for (let i = 0; i < path.length - 1; i++) {
        const currentBox = path[i];
        const nextBox = path[i + 1];
        
        const currentTransactions = transactions.filter(tx => 
            tx && tx.from_account_number === currentBox.id && 
            tx.to_bank_details && tx.to_bank_details.account_number === nextBox.id
        ).map(tx => ({...tx, level: baseLevel + i}));
        
        pathTransactions = pathTransactions.concat(currentTransactions);
    }

    // Transaction Summary Section
    const summary = {
        totalAmount: pathTransactions.reduce((sum, tx) => 
            sum + parseFloat(tx.transaction_amount.toString().replace(/[₹,]/g, '')), 0),
        count: pathTransactions.length,
        banks: new Set(pathTransactions.map(tx => tx.to_bank_details?.name)),
        minAmount: Math.min(...pathTransactions.map(tx => 
            parseFloat(tx.transaction_amount.toString().replace(/[₹,]/g, '')))),
        maxAmount: Math.max(...pathTransactions.map(tx => 
            parseFloat(tx.transaction_amount.toString().replace(/[₹,]/g, ''))))
    };

    const summarySection = document.createElement('div');
    Object.assign(summarySection.style, {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px'
    });

    summarySection.innerHTML = `
        <div style="color: #888; font-size: 12px; font-weight: bold; margin-bottom: 15px;">
            TRANSACTION SUMMARY
        </div>
        <table style="width: 100%; font-size: 10px;">
            <tr>
                <td style="color: #888; padding: 4px 0;">Total Amount</td>
                <td style="color: #4CAF50; text-align: right; font-weight: bold;">
                    ${formatIndianCurrency(summary.totalAmount)}
                </td>
            </tr>
            <tr>
                <td style="color: #888; padding: 4px 0;">Transaction Count</td>
                <td style="text-align: right;">${summary.count}</td>
            </tr>
            <tr>
                <td style="color: #888; padding: 4px 0;">Banks Involved</td>
                <td style="text-align: right;">${summary.banks.size}</td>
            </tr>
            <tr>
                <td style="color: #888; padding: 4px 0;">Amount Range</td>
                <td style="text-align: right;">
                    ${formatIndianCurrency(summary.minAmount)} - ${formatIndianCurrency(summary.maxAmount)}
                </td>
            </tr>
        </table>
    `;

    // Transaction Details Section
    const transactionSection = document.createElement('div');
    Object.assign(transactionSection.style, {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '10px'
    });

    const transactionTable = document.createElement('table');
    Object.assign(transactionTable.style, {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 6px',
        fontSize: '10px'
    });

    transactionTable.innerHTML = `
        <thead>
            <tr style="color: #888;">
                <th style="text-align: left; padding: 8px 6px;">Level</th>
                <th style="text-align: right; padding: 8px 6px;">Amount</th>
                <th style="text-align: left; padding: 8px 6px;">From Bank Account</th>
                <th style="text-align: left; padding: 8px 6px;">To Bank/Account</th>
                <th style="text-align: left; padding: 8px 6px;">UTR</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    pathTransactions.forEach(tx => {
        const amount = parseFloat(tx.transaction_amount.toString().replace(/[₹,]/g, ''));
        const row = document.createElement('tr');
        row.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        
        row.innerHTML = `
            <td style="padding: 8px 6px; color: #4CAF50;">${tx.level}</td>
            <td class="copyable" style="text-align: right; padding: 8px 6px; color: #fff; font-weight: bold;">
                ${formatIndianCurrency(amount)}
            </td>
            <td style="padding: 8px 6px;">
                <div class="copyable" style="color: #888; font-size: 9px;">
                    A/C: ${tx.from_account_number}
                </div>
            </td>
            <td style="padding: 8px 6px;">
                <div style="color: #888; font-size: 9px; margin-bottom: 4px;">
                    To Bank: ${tx.to_bank_details?.name || 'Unknown Bank'}
                </div>
                <div class="copyable" style="color: #888; font-size: 9px;">
                    A/C: ${tx.to_bank_details?.account_number || '-'}
                </div>
                <div class="copyable" style="color: #888; font-size: 9px;">
                    IFSC: ${tx.to_bank_details?.ifsc || '-'}
                </div>
            </td>
            <td class="copyable" style="padding: 8px 6px; color: #888; font-family: monospace; font-size: 9px;">
                ${tx.utr_id || '-'}
            </td>
        `;

        // Add copy functionality
        row.querySelectorAll('.copyable').forEach(element => {
            element.onclick = () => {
                const text = element.innerText.replace(/^(A\/C: |IFSC: |₹)/, '');
                navigator.clipboard.writeText(text);
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                setTimeout(() => element.style.backgroundColor = '', 200);
            };
        });

        transactionTable.querySelector('tbody').appendChild(row);
    });

    const title = document.createElement('div');
    title.style.color = '#888';
    title.style.marginBottom = '15px';
    title.style.fontSize = '12px';
    title.style.fontWeight = 'bold';
    title.textContent = 'TRANSACTION DETAILS';

    transactionSection.appendChild(title);
    transactionSection.appendChild(transactionTable);

    // Close button
    const closeButton = document.createElement('button');
    Object.assign(closeButton.style, {
        position: 'absolute',
        right: '15px',
        top: '15px',
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        border: 'none',
        fontSize: '14px',
        cursor: 'pointer',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    closeButton.innerHTML = '✕';
    closeButton.onclick = () => {
        panel.style.right = '-420px';
        setTimeout(() => panel.remove(), 500);
    };

    // Add hover styles
    const style = document.createElement('style');
    style.textContent = `
        .info-panel::-webkit-scrollbar {
            width: 8px;
        }
        .info-panel::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
        .info-panel::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }
        .info-panel::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .copyable {
            cursor: pointer;
            transition: background-color 0.2s ease;
            border-radius: 3px;
            padding: 2px 4px;
        }
        .copyable:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(style);

    // Assemble panel
    panel.appendChild(closeButton);
    panel.appendChild(accountSection);
    panel.appendChild(summarySection);
    panel.appendChild(transactionSection);

    document.body.appendChild(panel);
    setTimeout(() => panel.style.right = '0', 0);
}



// Helper function to prevent zoom
function preventZoom(e) {
    if (e.ctrlKey || (e.touches && e.touches.length > 1)) {
        e.preventDefault();
    }
}

// Add global event listeners to prevent zoom
document.addEventListener('wheel', preventZoom, { passive: false });
document.addEventListener('touchmove', preventZoom, { passive: false });

// Helper function for copying text
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // You could add a visual feedback here if needed
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}



function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '10px';
    tooltip.style.zIndex = '10000';
    tooltip.textContent = text;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;

    setTimeout(() => tooltip.remove(), 1000);
}

function addCopyListener(element, textToCopy) {
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(textToCopy);
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        showTooltip(element, 'Copied!');
        setTimeout(() => {
            element.style.backgroundColor = 'transparent';
        }, 200);
    });
}

// Helper function to truncate text
function truncateText(text, length) {
    if (!text) return '-';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Helper function to create transaction card
function createTransactionCard(tx) {
    const card = document.createElement('div');
    card.style.backgroundColor = '#fff';
    card.style.padding = '12px';
    card.style.borderRadius = '8px';
    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    card.style.fontSize = '12px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '8px';

    const amount = document.createElement('span');
    amount.innerText = formatIndianCurrency(parseFloat(tx.transaction_amount.replace(/[₹,]/g, '')));
    amount.style.color = '#2ecc71';
    amount.style.fontWeight = 'bold';

    const date = document.createElement('span');
    date.innerText = new Date(tx.date).toLocaleDateString();
    date.style.color = '#666';

    header.appendChild(amount);
    header.appendChild(date);

    const details = document.createElement('div');
    details.innerHTML = `
        <p style="margin: 4px 0; color: #666;">From: ${tx.from_account_number}</p>
        <p style="margin: 4px 0; color: #666;">To: ${tx.to_bank_details.account_number}</p>
        ${tx.utr_id ? `<p style="margin: 4px 0; color: #666;">UTR: ${tx.utr_id}</p>` : ''}
    `;

    card.appendChild(header);
    card.appendChild(details);

    return card;
}

// Helper function to calculate total amount along the path
function calculatePathTotal(path) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const fromId = path[i].id;
        const toId = path[i + 1].id;
        const pathTransactions = transactions.filter(tx =>
            tx.from_account_number === fromId &&
            tx.to_bank_details.account_number === toId
        );
        
        pathTransactions.forEach(tx => {
            const amount = parseFloat(tx.transaction_amount.replace(/[₹,]/g, ''));
            total += amount;
        });
    }
    return total;
}

// Helper function to filter transactions relevant to the path
function filterTransactionsForPath(path) {
    const relevantTransactions = [];
    for (let i = 0; i < path.length - 1; i++) {
        const fromId = path[i].id;
        const toId = path[i + 1].id;
        const pathTransactions = transactions.filter(tx =>
            tx.from_account_number === fromId &&
            tx.to_bank_details.account_number === toId
        );
        relevantTransactions.push(...pathTransactions);
    }
    return relevantTransactions;
}
var transactions = [];


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
var boxheight = 50;

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
    const spacing = 500; // Spacing between victim boxes
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
    const boxWidth = 250/scale; // Width of each sub-box

    // Determine the number of children to calculate proper positioning
    let subBoxesData = transactions.filter(tx => tx.from_account_number === box.id);

    // Calculate the total width required for all sub-boxes with margins
    const totalWidth = subBoxesData.length * (boxWidth + marginBetweenBoxes) - marginBetweenBoxes;

    // Calculate the starting position for the first box, centered with respect to the parent box
    const startLeft = boxRect.left - (totalWidth / 2); // Center all sub-boxes around the parent box

    let nextTopReduction = marginBetweenBoxes; // Initial margin for top, reduced by half for each subsequent box

    subBoxesData.map((tx, index) => {
        let from_account_number = tx.from_account_number;

        if (from_account_number == box.id) {
            let to_account_number = tx.to_bank_details.account_number;

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
            makeDraggable(box, connections.filter(c => c.box1 === box || c.box2 === box));

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

function hideSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'none';
            subBox.connection.path.style.display = 'none';
            subBox.element.subBoxesVisible = false; // Update visibility
            hideSubBoxes(subBox.element); // Recursive call to hide sub-boxes
        });
    }
}

function showSubBoxes(box) {
    const subBoxes = boxHierarchy.get(box);
    if (subBoxes) {
        subBoxes.forEach(subBox => {
            subBox.element.style.display = 'block';
            subBox.connection.path.style.display = 'block';
            subBox.element.subBoxesVisible = true; // Update visibility
            showSubBoxes(subBox.element); // Recursive call to show sub-boxes
        });
    }
}

LoadGraphs();



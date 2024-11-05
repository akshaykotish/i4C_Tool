var transactions = [];

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

var boxwidth = 300;
var boxheight = 50;

level = 0;

var vcardindex = -1;

function BuildVictimsBox(victim, index) {

    if (boxMap[victim.bank_account.account_number]) {
        console.log("Box for this victim already exists:", victim.bank_account.account_number);
        return; // Skip creating a new box
    }
    else{
        vcardindex++;
    }

    console.log(victim);
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

    // Store the victim box in the boxMap to keep track of created boxes
    boxMap[victim.bank_account.account_number] = victimbox;

    // Make the new box draggable
    makeDraggable(victimbox, connections.filter(c => c.box1 === newBox || c.box2 === newBox));

    // Add event listener to the new box
    // ShowSubTransactions(victimbox);
}

function BuildAllVictims(victims) {
    console.log(victims);
    victims.forEach((victim, index) => {
        BuildVictimsBox(victim, index);
    });
}

function ShowSubTransactions(box) {
    console.log(box.id);
    level++;
    if (boxHierarchy.has(box)) {
        console.log(boxHierarchy);
        const subBoxes = boxHierarchy.get(box);
        console.log(subBoxes);
        if (subBoxes && subBoxes.length > 0 && subBoxes[0].element.style.display === 'none') {
            showSubBoxes(box);
        } else {
            hideSubBoxes(box);
        }
        return;
    }

    const boxRect = box.getBoundingClientRect();
    const maxBoxes = 2; // Math.floor(Math.random() * 2); // Random number between 0 and 10
    const colors = ['#E3F2FD', '#FFF9C4', '#FFEBEE', '#E8F5E9', '#F3E5F5', '#FFE0B2', '#F1F8E9', '#FCE4EC', '#E1F5FE', '#FFF3E0'];
    const padding = 50; // Padding between boxes

    const subBoxes = [];

    var i = 0;
    var count = 0;
    transactions.map((tx) => {
        let from_account_number = tx.from_account_number;
        console.log(box.id);
        if (from_account_number == box.id) {
            i = i + 1;
            let to_account_number = tx.to_bank_details.account_number;
            console.log("tx", tx.to_bank_details.account_number);

            var newBox;
            console.log(boxMap[to_account_number]);
            console.log(tx.to_name);
            if (boxMap[to_account_number] === undefined) {

                console.log("CS", to_account_number);

                const newBoxTop = (boxRect.top + boxRect.height + (boxheight) - (panY)) / scale;
                const newBoxLeft = (((boxRect.left * scale) + (boxwidth/6)) * i - (panX)) / scale; // Alternate left-right positioning

                newBox = createBox({
                    id: to_account_number, // Unique ID for each new box
                    name: "Suspect Account",
                    color: colors[level],
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
                        //"from_bank_name": tx.from_bank_name,
                        // "from_name": tx.from_name,
                        "utr_id": tx.utr_id,
                        // "transaction_id": tx.transaction_id,
                        "to_account_number": tx.to_account_number,
                        // "to_name": tx.to_name,
                        "to_bank_name": tx.to_bank_name,
                        // "account_number": tx.to_bank_details.account_number,
                        "ifsc": tx.to_bank_details.ifsc,
                        // "city": tx.to_bank_details.city,
                        "transaction_amount": tx.transaction_amount,
                        // "transaction_status": tx.transaction_status
                    }
                });
                count++;
            }
            else {
                newBox = boxMap[to_account_number];
                if (newBox != undefined) {
                    console.log("Count", newBox);
                    count++;
                }
            }


            const parentConnection = connections.find(connection => connection.box1 === box || connection.box2 === box);
            const parentColor = parentConnection ? parentConnection.color : 'black';
            const connection = createConnection(box, newBox, parentColor);

            connections.push(connection);

            // Make the new box draggable
            makeDraggable(newBox, connections.filter(c => c.box1 === newBox || c.box2 === newBox));

            // Make the new box draggable
            makeDraggable(box, connections.filter(c => c.box1 === box || c.box2 === box));


            // Add event listener to the new box
            // ShowSubTransactions(newBox);

            // Enable line color change for each connection
            enableLineColorChange(connection.path);

            subBoxes.push({ element: newBox, connection });
        }


    });


    console.log(count);
    if (count == 0) {
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
        console.log(case1);
        transactions = case1.transaction_details;
        BuildAllVictims(case1.victim);
    }
}

LoadGraphs();

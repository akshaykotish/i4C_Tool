// Function to extract table data and convert it to JSON
function extractTableToJson() {
    const tables = [
      {
        id: "ContentPlaceHolder1_dtlistbankaction_gedotherbank_0",
        key: "transaction_details",
        extractRowData: (cells) => {
          return {
            "S_No": cells[0].innerText.trim(),
            "from_account_number": cells[1].innerText.split('\n')[0].trim(),
            "transaction_id": cells[1].innerText.split('\n')[1].trim(),
            "to_bank_name": cells[2].innerText.trim(),
            "to_account_number": cells[3].innerText.trim().split("\n")[0],
            "IFSC_Code": cells[3].innerText.trim().split("\n")[1],
            "utr_id": cells[4].innerText.trim(),
            "Transaction_Date_Time": cells[5].innerText.trim(),
            "transaction_amount": cells[6].innerText.trim(),
            "Disputed_Amount": cells[7].innerText.trim(),
            "transaction_status": cells[8].innerText.trim(),
            "from0_bank_name": cells[9].innerText.trim(),
            "to_bank_details": {
                "name": cells[2].innerText.trim(),
                "account_number": cells[3].innerText.trim().split("\n")[0],
                "ifsc": cells[3].innerText.trim().split("\n")[1],
            },
            "Date_of_Action": cells[10].innerText.trim()
          };
        }
      },
      {
        id: "ContentPlaceHolder1_gv_ActiontakenStatus",
        key: "victim",
        extractRowData: (cells) => {
          return {
            "S_No": cells[0].innerText.trim(),
            "Account_No_Wallet_ID": cells[1].innerText.trim(),
            "name": document.getElementById("ContentPlaceHolder1_lblcfname").innerText,
            "phone": document.getElementById("ContentPlaceHolder1_lblmobile").innerText,
            "email": document.getElementById("ContentPlaceHolder1_lblcompemail").innerText,
            "city": document.getElementById("ContentPlaceHolder1_txtdistrict").innerText,
            "state": document.getElementById("ContentPlaceHolder1_txtstate").innerText,
            "Transaction_ID": cells[2].innerText.trim(),
            "Card_Details": cells[3].innerText.trim(),
            "Transaction_Amount": cells[4].innerText.trim(),
            "Reference_No": cells[5].innerText.trim(),
            "Transaction_Date_Time": cells[6].innerText.trim(),
            "Complaint_Date": cells[7].innerText.trim(),
            "Bank_Wallet_Merchant_Insurance": cells[8].innerText.trim(),
            "bank_account": {
                "name": cells[8].innerText.trim(),
                "account_number": cells[1].innerText.trim(),
            }
          };
        }
      }
    ];
  
    const jsonData = {
      victim: [],
      transaction_details: []
    };
  
    tables.forEach(tableInfo => {
      const table = document.getElementById(tableInfo.id);
      if (table) {
        const rows = table.getElementsByTagName("tr");
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].getElementsByTagName("td");
          if (cells.length > 0) {
            const rowData = tableInfo.extractRowData(cells);
            jsonData[tableInfo.key].push(rowData);
          }
        }
      }
    });
  
    // Convert the extracted data to JSON format
    const jsonString = JSON.stringify(jsonData, null, 2);

    localStorage.setItem("Case1", jsonString);

    console.log(jsonString);
    return jsonString;
  }
  
  // Call the function to extract the table data
  extractTableToJson();
  
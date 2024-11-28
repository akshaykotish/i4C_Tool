// Function to extract table data and convert it to JSON
function extractTableToJson() {
  const tables = [
    {
      id: "ContentPlaceHolder1_dtlistbankaction_gedotherbank_0",
      key: "transaction_details",
      extractRowData: (cells) => {
        return {
          "S_No": cells[0]?.innerText.trim() || "",
          "from_account_number": cells[1]?.innerText.split('\n')[0].trim() || "",
          "transaction_id": cells[1]?.innerText.split('\n')[1].trim() || "",
          "to_bank_name": cells[2]?.innerText.trim() || "",
          "to_account_number": cells[3]?.innerText.trim().split("\n")[0] || "",
          "IFSC_Code": cells[3]?.innerText.trim().split("\n")[1] || "",
          "utr_id": cells[4]?.innerText.trim() || "",
          "Transaction_Date_Time": cells[5]?.innerText.trim() || "",
          "transaction_amount": cells[6]?.innerText.trim() || "",
          "Disputed_Amount": cells[7]?.innerText.trim() || "",
          "transaction_status": cells[8]?.innerText.trim() || "",
          "from0_bank_name": cells[9]?.innerText.trim() || "",
          "to_bank_details": {
            "name": cells[2]?.innerText.trim() || "",
            "account_number": cells[3]?.innerText.trim().split("\n")[0] || "",
            "ifsc": cells[3]?.innerText.trim().split("\n")[1] || "",
          },
          "Date_of_Action": cells[10]?.innerText.trim() || ""
        };
      }
    },
    {
      id: "ContentPlaceHolder1_dtlistbankaction_gedotherbank_3",
      key: "transaction_details",
      extractRowData: (cells) => {
        const atmDetails = cells[6]?.innerText.trim() || "";
        const atmIdMatch = atmDetails.match(/ATM ID :-\s*(.*?)(<br>|$)/);
        const placeMatch = atmDetails.match(/Place of ATM :-\s*(.*?)(<br>|$)/);
        return {
          "S_No": cells[0]?.innerText.trim() || "",
          "from_account_number": cells[1]?.innerText.split('\n')[0].trim() || "",
          "transaction_id": cells[1]?.innerText.split('\n')[1].trim() || "",
          "to_bank_name": cells[2]?.innerText.trim() || "",
          "Withdrawal_Date_Time": cells[3]?.innerText.trim() || "",
          "transaction_amount": cells[4]?.innerText.trim() || "",
          "Reference_No_Remarks": cells[5]?.innerText.trim() || "",
          "ATM_Details": atmDetails,
          "Action_Taken_By": cells[7]?.innerText.trim() || "",
          "Date_of_Action": cells[8]?.innerText.trim() || "",
          "to_bank_details": {
            "name": cells[2]?.innerText.trim() || "",
            "ATM_ID": atmIdMatch ? atmIdMatch[1].trim() : "",
            "place": placeMatch ? placeMatch[1].trim() : "",
          }
        };
      }
    },
    {
      id: "ContentPlaceHolder1_gv_ActiontakenStatus",
      key: "victim",
      extractRowData: (cells) => {
        const getElementTextById = (id) => {
          const element = document.getElementById(id);
          return element ? element.innerText.trim() : "";
        };

        return {
          "S_No": cells[0]?.innerText.trim() || "",
          "Account_No_Wallet_ID": cells[1]?.innerText.trim() || "",
          "name": getElementTextById("ContentPlaceHolder1_lblcfname"),
          "phone": getElementTextById("ContentPlaceHolder1_lblmobile"),
          "email": getElementTextById("ContentPlaceHolder1_lblcompemail"),
          "city": getElementTextById("ContentPlaceHolder1_txtdistrict"),
          "state": getElementTextById("ContentPlaceHolder1_txtstate"),
          "Transaction_ID": cells[2]?.innerText.trim() || "",
          "Card_Details": cells[3]?.innerText.trim() || "",
          "Transaction_Amount": cells[4]?.innerText.trim() || "",
          "Reference_No": cells[5]?.innerText.trim() || "",
          "Transaction_Date_Time": cells[6]?.innerText.trim() || "",
          "Complaint_Date": cells[7]?.innerText.trim() || "",
          "Bank_Wallet_Merchant_Insurance": cells[8]?.innerText.trim() || "",
          "bank_account": {
            "name": cells[8]?.innerText.trim() || "",
            "account_number": cells[1]?.innerText.trim() || "",
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
          try {
            const rowData = tableInfo.extractRowData(cells);
            jsonData[tableInfo.key].push(rowData);
          } catch (error) {
            console.error(`Error processing row ${i} in table ${tableInfo.id}:`, error);
          }
        }
      }
    } else {
      console.warn(`Table with ID ${tableInfo.id} not found.`);
    }
  });

  // Convert the extracted data to JSON format
  const jsonString = JSON.stringify(jsonData, null, 2);

  localStorage.setItem("Case1", jsonString);

  console.log(jsonString);
  return jsonString;
}

// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", extractTableToJson);

import csv
import json
from typing import Dict, List

def convert_csv_to_json(csv_file_path: str) -> Dict:
    """
    Convert CSV file to the required JSON format.
    """
    jsonData = {
        "victim": [],
        "transaction_details": []
    }
    
    with open(csv_file_path, 'r') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            record_type = row['record_type']
            
            if record_type == 'victim':
                victim_data = {
                    "S_No": row['S_No'],
                    "Account_No_Wallet_ID": row['account_number'],
                    "name": row['name'],
                    "phone": row['phone'],
                    "email": row['email'],
                    "city": row['city'],
                    "state": row['state'],
                    "Transaction_ID": row['transaction_id'],
                    "Card_Details": row['card_details'],
                    "Transaction_Amount": row['transaction_amount'],
                    "Reference_No": row['reference_no'],
                    "Transaction_Date_Time": row['transaction_date'],
                    "Complaint_Date": row['complaint_date'],
                    "Bank_Wallet_Merchant_Insurance": row['bank_wallet_merchant'],
                    "bank_account": {
                        "name": row['bank_wallet_merchant'],
                        "account_number": row['account_number']
                    }
                }
                jsonData['victim'].append(victim_data)
                
            elif record_type == 'bank_transaction':
                bank_data = {
                    "S_No": row['S_No'],
                    "from_account_number": row['account_number'],
                    "transaction_id": row['transaction_id'],
                    "to_bank_name": row['to_bank_name'],
                    "to_account_number": row['to_account_number'],
                    "IFSC_Code": row['IFSC_Code'],
                    "utr_id": row['utr_id'],
                    "Transaction_Date_Time": row['transaction_date'],
                    "transaction_amount": row['transaction_amount'],
                    "Disputed_Amount": row['disputed_amount'],
                    "transaction_status": row['transaction_status'],
                    "from0_bank_name": row['from_bank_name'],
                    "to_bank_details": {
                        "name": row['to_bank_name'],
                        "account_number": row['to_account_number'],
                        "ifsc": row['IFSC_Code']
                    },
                    "Date_of_Action": row['date_of_action']
                }
                jsonData['transaction_details'].append(bank_data)
                
            elif record_type == 'atm_transaction':
                # Parse ATM details
                atm_details = row['atm_details']
                atm_id = ""
                atm_place = ""
                
                if atm_details:
                    atm_id_match = atm_details.split('<br>')[0].replace('ATM ID :- ', '').strip()
                    atm_place_match = atm_details.split('<br>')[1].replace('Place of ATM :- ', '').strip()
                    atm_id = atm_id_match if atm_id_match else ""
                    atm_place = atm_place_match if atm_place_match else ""
                
                atm_data = {
                    "S_No": row['S_No'],
                    "from_account_number": row['account_number'],
                    "transaction_id": row['transaction_id'],
                    "to_bank_name": row['to_bank_name'],
                    "Withdrawal_Date_Time": row['transaction_date'],
                    "transaction_amount": row['transaction_amount'],
                    "Reference_No_Remarks": row['reference_no'],
                    "ATM_Details": row['atm_details'],
                    "Action_Taken_By": row['action_taken_by'],
                    "Date_of_Action": row['date_of_action'],
                    "to_bank_details": {
                        "name": row['to_bank_name'],
                        "ATM_ID": atm_id,
                        "place": atm_place
                    }
                }
                jsonData['transaction_details'].append(atm_data)
    
    return jsonData

def save_json(data: Dict, output_file: str):
    """
    Save JSON data to a file with pretty printing.
    """
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    # Example usage
    csv_file = "sample.csv"
    json_file = "output.json"
    
    try:
        json_data = convert_csv_to_json(csv_file)
        save_json(json_data, json_file)
        print(f"Successfully converted {csv_file} to {json_file}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
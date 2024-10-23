import openai

# Set your OpenAI API key
openai.api_key = 'YOUR_API_KEY'

def ask_gpt(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # or "gpt-3.5-turbo" if you want to use GPT-3.5
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the content of the assistant's reply
        answer = response.choices[0].message['content'].strip()
        return answer

    except Exception as e:
        return f"Error: {e}"

# Example usage
user_input = "How do I connect to a MySQL database using Python?"
response = ask_gpt(user_input)
print(response)

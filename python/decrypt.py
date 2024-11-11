from Crypto.Cipher import AES
import json

def decrypt_data(encrypted_data, key, nonce):
    cipher = AES.new(key, AES.MODE_CTR, nonce=nonce)
    plaintext = cipher.decrypt(encrypted_data)
    return plaintext

# Load secret from data.json
with open('/home/nattapons5/vscode/FirstETHContract/python/download/data.json', 'r') as file:
    secret_str = json.load(file)['secret']

# Parse the JSON string inside the 'secret' field
secret = json.loads(secret_str)

print("Parsed Secret:", secret)

try:
    key = bytes.fromhex(secret['aesKey'])  # Convert hex key to bytes
    nonce = bytes.fromhex(secret['nonce'])  # Convert hex nonce to bytes
    encrypted_data = bytes.fromhex(secret['encryptedData'])  # Convert hex encrypted data to bytes
except KeyError as e:
    print(f"KeyError: {e} not found in the secret data")
    exit(1)

decrypted_data = decrypt_data(encrypted_data, key, nonce)
try:
    print("Decrypted data:", decrypted_data.decode('utf-8'))
except UnicodeDecodeError:
    print("Decrypted data could not be decoded as UTF-8")

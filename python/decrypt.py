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
    def hex_to_ascii(hex_str):
        ascii_str = ''
        for i in range(0, len(hex_str), 2):
            ascii_str += chr(int(hex_str[i:i+2], 16))
        return ascii_str

    device_id = hex_to_ascii(secret['deviceId'][2:])  # Remove '0x' prefix and convert hex to ASCII
    timestamp = hex_to_ascii(secret['timestamp'][2:])  # Remove '0x' prefix and convert hex to ASCII
    #print("Device ID:", device_id)
    #print("Timestamp:", timestamp)
    #print("-----------------")
    hash = secret['hash']

    key = bytes.fromhex(secret['eccaesKey'])  # Convert hex key to bytes
    nonce = bytes.fromhex(secret['nonce'])  # Convert hex nonce to bytes
    encrypted_data = bytes.fromhex(secret['encryptedData'])  # Convert hex encrypted data to bytes
except KeyError as e:
    print(f"KeyError: {e} not found in the secret data")
    exit(1)

decrypted_data = decrypt_data(encrypted_data, key, nonce)
try:
    print("Device ID:", device_id)
    print("Timestamp:", timestamp)
    print("Hash:", hash)
    print(decrypted_data.decode('utf-8'))
except UnicodeDecodeError:
    print("Decrypted data could not be decoded as UTF-8")

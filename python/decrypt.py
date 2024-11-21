from Crypto.Cipher import AES
import json
import os
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
# import time

def derive_shared_secret(private_key, public_key):
    shared_secret = private_key.exchange(ec.ECDH(), public_key)
    return shared_secret

def decrypt_data_with_shared_secret(shared_secret, ciphertext):
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b'ECC shared secret encryption key',
        backend=default_backend()
    ).derive(shared_secret)

    iv = b'\x00' * 16
    cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext

def decrypt_aes_keys_with_ecc_private_keys(key):
    user_key_folder = "/home/nattapons5/vscode/EncryptHash/keygen_user_logs"
    ph_key_folder = "/home/nattapons5/vscode/EncryptHash/keygen_planthouse_logs"
    enc_aes_keys_folder = "/home/nattapons5/vscode/EncryptHash/encrypted_aes_keys"
    dec_aes_keys_folder = "/home/nattapons5/vscode/EncryptHash/decrypted_aes_keys"

    if not os.path.exists(dec_aes_keys_folder):
        os.makedirs(dec_aes_keys_folder)

    private_key_file = os.path.join(user_key_folder, "user_1_private_key.pem")

    with open(private_key_file, 'rb') as f:
        private_key_data = f.read()
    private_key = serialization.load_pem_private_key(private_key_data, password=None, backend=default_backend())

    if device_id[:14] == "plant_house_10":
        public_key_file = os.path.join(ph_key_folder, f"{device_id[:14]}_public_key.pem")
        # print("Public Key: ", public_key_file)
        plant_house = device_id[:14]
    else:
        public_key_file = os.path.join(ph_key_folder, f"{device_id[:13]}_public_key.pem")
        # print("Public Key: ", public_key_file)
        plant_house = device_id[:13]

    if not os.path.exists(public_key_file):
        print(f"Public key file not found for {device_id}. Skipping encryption for this plant house.")

    with open(public_key_file, 'rb') as f:
        public_key_data = f.read()
    public_key = serialization.load_pem_public_key(public_key_data, backend=default_backend())
    shared_secret = derive_shared_secret(private_key, public_key)

    aes_key = decrypt_data_with_shared_secret(shared_secret, key)

    dec_aes_key_file = os.path.join(dec_aes_keys_folder, "".join([plant_house, "_decrypted_aes_key.log"]))
    with open(dec_aes_key_file, 'wb') as f:
        f.write(aes_key)

    print(f"\nAES key decrypted for {device_id}")

    return aes_key

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
    # print("Device ID:", device_id)
    # print("Timestamp:", timestamp)
    # print("-----------------")
    hash = secret['hash']

    key = bytes.fromhex(secret['eccaesKey'])  # Convert hex key to bytes
    nonce = bytes.fromhex(secret['nonce'])  # Convert hex nonce to bytes
    # print(key)
    
    retrieved_aes_key = decrypt_aes_keys_with_ecc_private_keys(key)
    # print(retrieved_aes_key)

    encrypted_data = bytes.fromhex(secret['encryptedData'])  # Convert hex encrypted data to bytes
except KeyError as e:
    print(f"KeyError: {e} not found in the secret data")
    exit(1)

decrypted_data = decrypt_data(encrypted_data, retrieved_aes_key, nonce)
try:
    print("Device ID:", device_id)
    print("Timestamp:", timestamp)
    print("Hash:", hash)
    print("\n")
    print(decrypted_data.decode('utf-8'))
except UnicodeDecodeError:
    print("Decrypted data could not be decoded as UTF-8")



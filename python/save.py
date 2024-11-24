import os
import requests

# example ipfs link: http://localhost:8080/ipfs/QmNNnmALiGdBgiYHPffoyDQr1L5LKQeG2cnSC39uztgq3D

CID = 'QmYddbqBYgM6LrKKQfpAhTpPzE8qaJW1CpHdkjP35kCqoZ'

def retrieve_data_from_cid(cid):
    url = f'http://localhost:8080/ipfs/{cid}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.RequestException as error:
        raise Exception(f'Failed to retrieve data: {error}')

try:
    secret = retrieve_data_from_cid(CID)
    print('Secret:', secret)
    download_path = os.path.join(os.path.dirname(__file__), 'download', 'data.json')
    os.makedirs(os.path.dirname(download_path), exist_ok=True)
    with open(download_path, 'w') as file:
        file.write(secret)
    print('Data saved to', download_path)
except Exception as error:
    print(error)
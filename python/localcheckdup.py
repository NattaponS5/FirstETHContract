
import os
import hashlib

# Duplication Check: HashSet-Based Duplication Check

# check duplication content at dataPath
data_path = os.path.join(os.path.dirname(__file__), '../../EncryptHash/hash_plant_house_logs_400')
# list files in dataPath
# for file in os.listdir(data_path):
#     print(file)

duplicate_files = {}

def find_duplicates(data_path):
    file_contents = {}
    for root, _, files in os.walk(data_path):
        for file in files:
            full_path = os.path.join(root, file)
            with open(full_path, 'rb') as f:
                content = f.read()
                if content in file_contents:
                    if content not in duplicate_files:
                        duplicate_files[content] = [file_contents[content]]
                    duplicate_files[content].append(full_path)
                else:
                    file_contents[content] = full_path
    return duplicate_files

duplicates = find_duplicates(data_path)
if duplicates:
    print("Duplicate files found:")
    for content, files in duplicates.items():
        print("Files with identical content:", content)
        for file in files:
            print(f"{os.path.basename(file)}")
else:
    print("No duplicate files found.")

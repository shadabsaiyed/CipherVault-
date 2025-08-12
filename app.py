from flask import Flask, render_template, request, jsonify
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64
import json

app = Flask(__name__)

# Generate a random AES key
def generate_key():
    return get_random_bytes(16)  # AES key size of 16 bytes (128-bit)

# Encrypt message using AES
def encrypt_message(message, key):
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(message.encode(), AES.block_size))
    iv = base64.b64encode(cipher.iv).decode('utf-8')
    ct = base64.b64encode(ct_bytes).decode('utf-8')
    return iv, ct

# Decrypt message using AES
def decrypt_message(iv, ciphertext, key):
    iv = base64.b64decode(iv)
    ciphertext = base64.b64decode(ciphertext)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt_bytes = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return pt_bytes.decode('utf-8')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encrypt', methods=['POST'])
def encrypt():
    try:
        message = request.json['message']
        key = generate_key()  # Generate key for encryption
        iv, encrypted_message = encrypt_message(message, key)
        return jsonify({'iv': iv, 'ciphertext': encrypted_message, 'key': base64.b64encode(key).decode('utf-8')})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/decrypt', methods=['POST'])
def decrypt():
    try:
        iv = request.json['iv']
        ciphertext = request.json['ciphertext']
        key = base64.b64decode(request.json['key'])
        decrypted_message = decrypt_message(iv, ciphertext, key)
        return jsonify({'message': decrypted_message})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
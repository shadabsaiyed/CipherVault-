function encryptMessage() {
    const message = document.getElementById('message').value;
    if (!message) {
        alert('Please enter a message');
        return;
    }

    fetch('/encrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            // Display the encrypted output
            document.getElementById('encrypted-output').innerHTML = `
                <strong>Encrypted Message:</strong><br>
                IV: ${data.iv}<br>
                Ciphertext: ${data.ciphertext}<br>
            `;

            // Allow user to download the key and IV as a JSON file
            const encryptionData = {
                iv: data.iv,
                ciphertext: data.ciphertext,
                key: data.key
            };

            const blob = new Blob([JSON.stringify(encryptionData)], { type: 'application/json' });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'encryption_data.json';
            downloadLink.innerHTML = 'Download Encryption Data';
            document.getElementById('encrypted-output').appendChild(downloadLink);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to decrypt the message
function decryptMessage() {
    // Allow user to upload the key and IV file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const encryptionData = JSON.parse(e.target.result);
            
            if (!encryptionData.iv || !encryptionData.ciphertext || !encryptionData.key) {
                alert('Invalid encryption data!');
                return;
            }

            fetch('/decrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    iv: encryptionData.iv,
                    ciphertext: encryptionData.ciphertext,
                    key: encryptionData.key
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    document.getElementById('decrypted-output').innerHTML = `
                        <strong>Decrypted Message:</strong><br>
                        ${data.message}
                    `;
                }
            })
            .catch(error => console.error('Error:', error));
        };

        reader.readAsText(file);
    };
    
    input.click();
}
// backend/src/scripts/testLogin.js
const testLogin = async () => {
    try {
        console.log('Attempting login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'alice@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful!');
            console.log('Token:', data.token ? 'Received' : 'Missing');
            console.log('User:', data.user.email);
        } else {
            console.error('Login Failed:');
            console.error('Status:', response.status);
            console.error('Message:', data.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();

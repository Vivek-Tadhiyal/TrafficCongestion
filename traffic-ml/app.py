from flask import Flask, jsonify

app = Flask(__name__)

# This is a "Health Check" route
@app.route('/test-connection', methods=['GET'])
def test_connection():
    print("Received a request from Node.js!") # This will show in your Python terminal
    return jsonify({
        "message": "Connection successful!",
        "status": "Python is running"
    })

if __name__ == '__main__':
    # Run on port 5000
    app.run(port=5000, debug=True)
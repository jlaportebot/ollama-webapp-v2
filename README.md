# Ollama Web App

A self-hosted, lightweight web interface for Ollama with per-IP persistent chat history. Perfect for local network deployments where multiple users can chat with AI models without authentication.

## Features

- 🚀 **Simple Setup** - Just Node.js and Ollama required
- 💬 **Persistent History** - Chat history saved per IP address
- 📊 **Real-time Stats** - Live CPU, RAM, and temperature monitoring
- 👥 **Multi-User** - Multiple users on local network
- 🔄 **Streaming Responses** - Real-time token streaming
- 🎯 **Model Selection** - Choose from available Ollama models
- 📱 **Responsive Design** - Works on desktop and mobile

## Screenshots

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+with+Chat+Interface)

## Prerequisites

- **Node.js** 18+ (for running the web server)
- **Ollama** installed and running on port 11434
- Local network access for users

## Installation

### 1. Install Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

### 2. Start Ollama

```bash
ollama serve
```

### 3. Pull a Model

```bash
# Example models
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
```

### 4. Clone and Setup Web App

```bash
# Clone the repository
git clone https://github.com/jlaportebot/ollama-webapp-v2.git
cd ollama-webapp-v2

# Install dependencies
npm install

# Start the server
npm start
```

The web app will be available at `http://localhost:3000`

## Usage

### Access from Local Network

1. Find your local IP address:
   ```bash
   # Linux/macOS
   hostname -I | awk '{print $1}'

   # Windows
   ipconfig
   ```

2. Access from other devices:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

### Features

- **Create Conversations** - Start new chats with any available model
- **View History** - All conversations are saved per IP address
- **System Stats** - Monitor CPU, RAM, and temperature in real-time
- **Model Switching** - Switch between different Ollama models

## API Endpoints

### Health Check
```http
GET /api/health
```
Returns available Ollama models and connection status.

### System Stats
```http
GET /api/stats
```
Returns CPU, RAM, temperature, and active user count.

### Conversations
```http
GET /api/conversations
POST /api/conversations
DELETE /api/conversations/:id
```
Manage chat conversations (scoped to user's IP).

### Messages
```http
GET /api/conversations/:id/messages
POST /api/conversations/:id/chat
```
Retrieve and send messages with streaming support.

## Configuration

### Port Configuration

Edit `server.js` to change the default port (3000):

```javascript
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### Ollama Host

If Ollama is running on a different host, update the hostname in `server.js`:

```javascript
// Line 173
hostname: "localhost", // Change to your Ollama host
```

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests (when available)
npm test

# Lint code (when available)
npm run lint
```

## Architecture

```
ollama-webapp-v2/
├── server.js          # Express server with SQLite database
├── public/
│   └── index.html    # Frontend interface
├── package.json      # Dependencies and scripts
└── chat.db          # SQLite database (auto-created)
```

### Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **AI**: Ollama API

## Security Considerations

⚠️ **Important Security Notes**:

- This app is designed for **trusted local networks only**
- No authentication - anyone on the network can access
- Chat history is stored per IP address
- Consider adding authentication for public deployments
- Use a reverse proxy (nginx) for production deployments
- Enable HTTPS for remote access

### Recommended Security Enhancements

1. **Add Authentication**:
   ```javascript
   // Add middleware for authentication
   app.use((req, res, next) => {
     // Check for valid session/token
     next();
   });
   ```

2. **Use Reverse Proxy**:
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```

## Troubleshooting

### Ollama Connection Failed

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Database Locked

```bash
# Stop the server
# Delete or backup chat.db
rm chat.db
# Restart server (will create new database)
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.com) - Local LLM inference
- [Express](https://expressjs.com) - Web framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database

## Support

- 📧 Email: jlaportebot@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/jlaportebot/ollama-webapp-v2/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jlaportebot/ollama-webapp-v2/discussions)

## Roadmap

- [ ] User authentication system
- [ ] Export chat history
- [ ] Dark mode toggle
- [ ] Mobile app (PWA)
- [ ] Model parameters configuration
- [ ] System prompt customization
- [ ] Multi-language support

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jlaportebot/ollama-webapp-v2&type=Date)](https://star-history.com/#jlaportebot/ollama-webapp-v2&Date)

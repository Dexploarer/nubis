# Twitter RSS Server Configuration

## Port Configuration

The Twitter RSS Server is configured to run on **port 8080** by default, specifically chosen to avoid conflicts with ElizaOS services:

### Port Usage Map

- **3000**: ElizaOS Main Server
- **3001**: Socket.IO (if enabled)
- **3002**: WebRTC (if enabled)
- **8080**: Twitter RSS Server ✅

## Configuration

You can customize the RSS server port using the environment variable:

```bash
RSS_SERVER_PORT=8080  # Default port
```

Or set a different port:

```bash
RSS_SERVER_PORT=9090  # Custom port
```

## RSS Server Endpoints

Once the plugin is loaded, the RSS server provides:

- `GET http://localhost:8080/rss/{feedId}` - Serve RSS XML feed
- `GET http://localhost:8080/feeds` - List all available feeds (JSON)
- `GET http://localhost:8080/health` - Service health check

## Creating RSS Feeds

Use natural language to create feeds:

### Timeline Feed

```
"Create RSS feed from my timeline"
```

### User Feed

```
"Create RSS feed from user @elonmusk"
```

### List Feed

```
"Create RSS feed from list 12345"
```

### Community Feed

```
"Create RSS feed from community abc123"
```

## Managing RSS Feeds

### List All Feeds

```
"List my RSS feeds"
"Show RSS feeds"
```

### Delete Feed

```
"Delete RSS feed timeline_1234567890"
```

### Toggle Feed Status

```
"Toggle RSS feed user_elonmusk_456"
"Disable RSS feed list_789"
```

### Check Status

```
"RSS feed status"
"Status of RSS feed timeline_123"
```

## Feed URLs

All feeds are accessible at:

```
http://localhost:8080/rss/{feedId}
```

Example feed IDs:

- `timeline_1234567890` - Your timeline
- `user_elonmusk_456789` - @elonmusk tweets
- `list_12345_678901` - Twitter list tweets
- `community_abc123_456` - Community tweets

## Integration with RSS Readers

You can subscribe to these feeds in any RSS reader:

- Feedly
- Inoreader
- NewsBlur
- Apple News
- Thunderbird
- Any RSS/Atom reader

The feeds use proper RSS 2.0 XML format with rich content including:

- Tweet text
- Media attachments (images)
- Author information
- Publication dates
- Direct links to tweets

## Nubi Character Integration

The enhanced Nubi character now includes:

- ✅ Structured raid coordination templates
- ✅ Fourth wall breaking meta-commentary
- ✅ RSS feed awareness and promotion
- ✅ Consistent structured output for system processing

## Security Note

The RSS server runs locally and only serves publicly available Twitter data that would be accessible through your authenticated Twitter account. No private or sensitive data is exposed.

# Shadowhawk Discord Bot

This bot has two purposes:

1. Watch voice channel events for Connect/Move/Disconnect and send short status messages to the VOICE_MESSAGE_CHANNEL. Messages older than 6 hours are bulk deleted.
2. Watch REACTION_WATCH_CHANNELS events for Reaction Add/Remove and send messages to the REACTION_MESSAGE_CHANNEL. Messages **are not purged**.

## Requirements

Requires docker and docker-compose.

## Build the Docker container

```
docker build -f discord-shadowhawk.dockerfile -t discord-shadowhawk .
```

## Run the Docker container

Run with docker (will not auto restart):
```
docker run -t discord-shadowhawk
```

Run with docker-compose (will auto restart):
```
docker-compose -f docker-compose.yml up
```
Stop docker-compose:
```
docker-compose -f docker-compose.yml down
```

## Config file

config.json example:
```
{
    "DISCORD_TOKEN": "YOUR_TOKEN_HERE",
    "REACTION_MESSAGE_CHANNEL": "reaction-traffic",
    "REACTION_WATCH_CHANNELS": [
        "general"
    ],
    "VOICE_MESSAGE_CHANNEL": "voice-traffic"
}
```
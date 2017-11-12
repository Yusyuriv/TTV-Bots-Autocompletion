A browser extension that autocompletes bot commands in Twitch chat.

# Usage
If you don't uncheck the checkbox in options, it should just work automatically with the supported bots. If you're watching a streamer whose bots don't get automatically picked up, or if you are that streamer, you can manually tell the extension all commands on the channel.

# File format
If your bots aren't supported automatically, you might want to manually write down all your commands so that the extension would be able to know them and autocomplete them. Let's create a text file and call it `test.ttv-bots.yml`. Notice that the file name ends with `.ttv-bots.yml`. That's how the extension knows that this file contains a list of commands for one or more channels and offers the user to import them. Now open this file with a text editor and put this code into it (everything after a `#` is a comment and is ignored):

```yaml
# Twitch name of the channel you're adding commands for
Yusyuriv:
  # Your command's name
  - name: !ping
    descriptions:
      # A list that specifies user groups that can trigger this command.
      # Can be Everyone, Regulars, Subscribers, Moderators, Broadcaster.
      - groups:
          - Subscribers
          - Moderators
        text: pong
      # If a command has different responses based on user groups, add additional responses
      - groups:
          - Everyone
        text: I don't want to play right now.
  # Another command
  - name: !hello
    descriptions:
      - groups:
          - Everyone
        text: Oh, hello there!
  # Add as many commands as you want
  - name: !schedule
    descriptions:
      - groups:
          - Everyone
        text: You can see my streaming schedule at example.com
```

Now that you have this file, how do you add it in the extension? It's very simple: just drag the file into your browser (or open the link to the file if it's hosted somewhere) and press this extension's icon in your browser. If the file doesn't have errors, it will offer you to import these commands into the extension. If you're a streamer and want your viewers to be able to easily use it (assuming they have the extension installed), you can host it somewhere and give them direct link to it — result will be the same.

# Import example
[Here][Import example] you can see an example of a file that you can import into extension, and [here][My Twitch chat] you can test it.

# Supported bots
This is the list of bots that should just work without importing anything or writing any configs (provided that they're in the streamer's chat under their original username, i.e. Nightbot is under Nightbot account etc):

* [Moobot]
* [Nightbot]
* [StreamElements]

# License
[MIT](LICENSE)

[Moobot]: https://twitch.moobot.tv/
[Nightbot]: https://beta.nightbot.tv/
[StreamElements]: https://streamelements.com/
[Import example]: ../../raw/master/Command-example.ttv-bots.yml
[My Twitch chat]: https://www.twitch.tv/yusyuriv/chat
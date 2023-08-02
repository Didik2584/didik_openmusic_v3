class Listener {
  constructor(playlistsService_v2, mailSender) {
    this.playlistsService_v2 = playlistsService_v2;
    this.mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { targetEmail, playlistId } = JSON.parse(message.content.toString());

      const playlists = await this.playlistsService_v2.getSongsFromPlaylist(playlistId);
      const result = await this.mailSender.sendEmail(targetEmail, JSON.stringify(playlists));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
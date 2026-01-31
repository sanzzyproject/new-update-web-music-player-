const yts = require("yt-search");

module.exports = async (req, res) => {
  const query = req.query.q;

  try {
    // Jika tidak ada query, tampilkan rekomendasi (lagu trending)
    const searchTerm = query || "Top Hits Indonesia 2024 Music"; 
    
    const r = await yts(searchTerm);
    const videos = r.videos.slice(0, 20).map(v => ({
        id: v.videoId,
        title: v.title,
        artist: v.author.name,
        image: v.thumbnail,
        duration: v.timestamp
    }));

    res.status(200).json(videos);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = async (req, res) => {
  // Ambil query dari URL, jika kosong cari "Top Indonesia" buat halaman Home
  const query = req.query.q || "Top Hits Indonesia Music 2024";

  try {
    // Kita gunakan API Invidious (Frontend YouTube Alternatif)
    // Ini lebih stabil di Vercel daripada library scraping biasa
    const instance = "https://invidious.jing.rocks"; 
    const apiUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`External API Error: ${response.status}`);
    }

    const data = await response.json();

    // Filter hanya ambil video (bukan playlist/channel)
    const videos = data
      .filter(v => v.type === 'video')
      .map(v => ({
        id: v.videoId,
        title: v.title,
        artist: v.author,
        // Ambil thumbnail kualitas medium, fallback ke default youtube jika gagal
        image: v.videoThumbnails?.find(t => t.quality === 'medium')?.url 
               || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        duration: v.lengthSeconds
    }));

    // Header agar browser mengizinkan data dibaca
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    res.status(200).json(videos);

  } catch (e) {
    console.error("Search Error:", e);
    // Kirim JSON error agar frontend bisa menampilkan pesan
    res.status(500).json({ error: true, message: e.message });
  }
};

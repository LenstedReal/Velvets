'use client';
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Download, Trash2, X, Play, Heart, Share2, Loader2 } from 'lucide-react';
import { mediaApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ImageGallery = () => {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  const reload = () => {
    setLoading(true);
    mediaApi.list(filter === 'all' ? null : filter === 'photo' ? 'photo' : 'video')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) reload(); else setLoading(false); }, [user, filter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this media?')) {
      await mediaApi.remove(id);
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    }
  };

  const handleFavorite = async (e, id) => {
    e.stopPropagation();
    const { favorite } = await mediaApi.favorite(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, favorite } : i));
  };

  const photoCount = items.filter(i => i.type === 'photo').length;
  const videoCount = items.filter(i => i.type === 'video').length;
  const favCount = items.filter(i => i.favorite).length;

  return (
    <section className="py-8 bg-[#0a0a0c] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Media Gallery</h1>
            <p className="text-white/60">All your photos and videos from AI companions</p>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', icon: null },
              { id: 'photo', label: 'Photos', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: Video },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filter === f.id ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}>
                {f.icon && <f.icon className="w-4 h-4" />}{f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1"><ImageIcon className="w-5 h-5 text-pink-400" /><span className="text-white/60 text-sm">Photos</span></div>
            <p className="text-2xl font-bold text-white">{photoCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1"><Video className="w-5 h-5 text-purple-400" /><span className="text-white/60 text-sm">Videos</span></div>
            <p className="text-2xl font-bold text-white">{videoCount}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1"><Heart className="w-5 h-5 text-red-400" /><span className="text-white/60 text-sm">Favorites</span></div>
            <p className="text-2xl font-bold text-white">{favCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-pink-400 animate-spin" /></div>
        ) : !user ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sign in to view your gallery</h3>
            <p className="text-white/60">Your generated photos and videos will appear here</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No media yet</h3>
            <p className="text-white/60">Start chatting with AI companions to receive photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => setSelectedImage(item)}>
                <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-white/5">
                  <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-pink-500/80 transition-colors">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/60 text-xs">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleFavorite(e, item.id)} className="p-2 bg-black/50 rounded-lg hover:bg-black/70 backdrop-blur-sm">
                      <Heart className={`w-4 h-4 ${item.favorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    </button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-black/50 rounded-lg hover:bg-black/70 backdrop-blur-sm">
                      <Download className="w-4 h-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12"><p className="text-white/30 text-sm">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p></div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6 text-white" /></button>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.url} alt="" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
            <div className="mt-4 flex items-center justify-between">
              <div><p className="text-white font-medium">{new Date(selectedImage.created_at).toLocaleString()}</p></div>
              <div className="flex gap-2">
                <button onClick={(e) => handleFavorite(e, selectedImage.id)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                  <Heart className={`w-5 h-5 ${selectedImage.favorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </button>
                <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                  <Download className="w-5 h-5 text-white" />
                </a>
                <button onClick={(e) => handleDelete(e, selectedImage.id)} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;

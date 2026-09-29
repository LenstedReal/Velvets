'use client';
import React, { useState, useEffect } from 'react';
import { miscApi } from '../services/api';
import { Plus, Play } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => { miscApi.stories().then(setStories).catch(() => {}); }, []);

  return (
    <section className="py-4 bg-[#0a0a0c] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-pink-500/50 transition-colors">
              <Plus className="w-6 h-6 text-white/50 group-hover:text-pink-400 transition-colors" />
            </div>
            <span className="text-white/60 text-xs">Create</span>
          </div>

          {stories.map((s) => (
            <div key={s.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
              onClick={() => setSelectedStory(s)}>
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#0a0a0c]">
                    <img src={s.avatar} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0a0c]" />
              </div>
              <span className="text-white text-xs truncate w-16 md:w-20 text-center">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="bg-transparent border-0 max-w-md p-0 shadow-none">
          {selectedStory && (
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <img src={selectedStory.cover} alt={selectedStory.name} className="w-full aspect-[9/16] object-cover" />
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                <div className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white animate-progress" />
                </div>
              </div>
              <div className="absolute top-6 left-3 right-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <img src={selectedStory.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">{selectedStory.name}</p>
                  <p className="text-white/50 text-xs">{selectedStory.posted_at}</p>
                </div>
              </div>
              <div className="absolute bottom-6 inset-x-6">
                <button onClick={() => setSelectedStory(null)}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:from-pink-600 hover:to-purple-700 transition-all">
                  <Play className="w-5 h-5" /> Watch Full Story
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`@keyframes progress{from{width:0}to{width:100%}}.animate-progress{animation:progress 5s linear forwards}`}</style>
    </section>
  );
};

export default StoriesBar;

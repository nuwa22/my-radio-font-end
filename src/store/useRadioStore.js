import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRadioStore = create(
  persist(
    (set, get) => ({
      activeStation: null,
      isPlaying: false,
      stations: [],
      favorites: [],
      volume: 0.5, // 🔊 Default Volume (50%)

      setStations: (stations) => set({ stations }),
      playStation: (station) => set({ activeStation: station, isPlaying: true }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setIsPlaying: (status) => set({ isPlaying: status }),
      
      // Volume වෙනස් කරන Function එක
      setVolume: (vol) => set({ volume: vol }),

      playNext: () => {
        const { stations, activeStation, playStation } = get();
        if (!activeStation || stations.length === 0) return;
        const currentIndex = stations.findIndex(s => s._id === activeStation._id);
        const nextIndex = (currentIndex + 1) % stations.length;
        playStation(stations[nextIndex]);
      },

      playPrev: () => {
        const { stations, activeStation, playStation } = get();
        if (!activeStation || stations.length === 0) return;
        const currentIndex = stations.findIndex(s => s._id === activeStation._id);
        const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
        playStation(stations[prevIndex]);
      },

      toggleFavorite: (stationId) => set((state) => {
        const isFav = state.favorites.includes(stationId);
        return {
          favorites: isFav 
            ? state.favorites.filter(id => id !== stationId) 
            : [...state.favorites, stationId]
        };
      }),
    }),
    {
      name: 'radio-storage',
      partialize: (state) => ({ favorites: state.favorites, volume: state.volume }), // Volume එකත් Save වෙනවා
    }
  )
);

export default useRadioStore;
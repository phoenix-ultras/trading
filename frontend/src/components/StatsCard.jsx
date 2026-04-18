function StatsCard({ label, value, accent = 'cyan', helper }) {
  const accentColors = {
    cyan: 'border-cyan-500 text-cyan-400',
    purple: 'border-purple-500 text-purple-400',
    pink: 'border-pink-500 text-pink-400',
    green: 'border-neon-green text-neon-green'
  };

  return (
    <article className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border-l-4 ${accentColors[accent] || accentColors.cyan}`}>
      <span className="text-gray-400 text-sm block mb-2">{label}</span>
      <strong className="text-white text-2xl font-bold block mb-1">{value}</strong>
      {helper ? <span className="text-gray-500 text-xs">{helper}</span> : null}
    </article>
  );
}

export default StatsCard;

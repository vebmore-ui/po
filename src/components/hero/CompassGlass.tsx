export default function CompassGlass() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 24%, transparent 52%), radial-gradient(circle at 70% 75%, rgba(255,255,255,0.05) 0%, transparent 35%)',
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05), inset 0 0 4px rgba(255,255,255,0.08)',
        animation: 'glassShimmer 6s ease-in-out infinite',
      }}
    />
  )
}

const BellySkeleton = ({ width = "100%", height = 20, borderRadius = 8 }: { width?: string | number; height?: number; borderRadius?: number }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: "linear-gradient(90deg, #FFE8D6 25%, #FFF4EE 50%, #FFE8D6 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
    }}
  />
);

export const SkeletonPostCard = () => (
  <div className="rounded-[16px] p-4 belly-card-shadow" style={{ background: "white", border: "1px solid #FFE4D4" }}>
    <div className="flex items-center gap-2 mb-3">
      <BellySkeleton width={32} height={32} borderRadius={16} />
      <BellySkeleton width={80} height={12} />
      <div className="ml-auto"><BellySkeleton width={40} height={10} /></div>
    </div>
    <BellySkeleton width="70%" height={14} borderRadius={6} />
    <div className="mt-2"><BellySkeleton width="100%" height={10} borderRadius={6} /></div>
    <div className="mt-1"><BellySkeleton width="60%" height={10} borderRadius={6} /></div>
    <div className="flex gap-4 mt-3 pt-2" style={{ borderTop: "1px solid #FFF0E8" }}>
      <BellySkeleton width={40} height={10} />
      <BellySkeleton width={40} height={10} />
    </div>
  </div>
);

export const SkeletonCourseCard = () => (
  <div className="rounded-[18px] p-4 belly-card-shadow" style={{ background: "white", border: "1px solid #FFE4D4" }}>
    <div className="flex gap-3">
      <BellySkeleton width={52} height={52} borderRadius={14} />
      <div className="flex-1 space-y-2">
        <BellySkeleton width="40%" height={10} />
        <BellySkeleton width="80%" height={14} />
        <BellySkeleton width="50%" height={10} />
      </div>
    </div>
  </div>
);

export default BellySkeleton;

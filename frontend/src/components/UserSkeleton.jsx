const UserSkeleton = () => {
  return (
    <div className="p-1 space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-2 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSkeleton;

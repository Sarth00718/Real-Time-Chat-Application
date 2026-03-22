const MessageSkeleton = () => {
  return (
    <div className="px-2 py-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-start gap-2 max-w-[70%]">
            {i % 2 !== 0 && (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
            )}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
              <div className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} bg-white/10 rounded-lg animate-pulse`}></div>
            </div>
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
